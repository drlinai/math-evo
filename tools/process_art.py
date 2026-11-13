#!/usr/bin/env python3
"""把 art_src/ 的原圖（白底 JPEG 圖集、背景）處理成遊戲用的去背 WebP。

用法（在專案根目錄）：
  tools/.venv/bin/python tools/process_art.py scan    # 產生除錯圖：標出「被圖形包住的白色區塊」供人工判斷是否為背景破洞
  tools/.venv/bin/python tools/process_art.py build   # 去背、切圖、輸出 img/*.webp 與 js/art-meta.js

去背方法：把每個像素視為「前景色疊在白底上」，alpha = 1 - min(R,G,B)/255。
只有「從圖片邊緣能經由亮像素連過去」的區域才套用這個 alpha（背景、光暈、邊緣反鋸齒），
被深色描邊包住的內部（肚子、牙齒、眼白）一律保留不透明。
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

SRC, OUT, DBG = 'art_src', 'img', 'tools/debug'
TAU = 0.5  # alpha 低於這個值的像素算「亮」，背景可以滲透過去
EIGHT = np.ones((3, 3), dtype=bool)

ITEM_NAMES = ['apple', 'pig', 'duck', 'bird', 'fish', 'chick', 'frog', 'butterfly', 'dinoegg', 'cookie',
              'balloon', 'car', 'candy', 'lollipop', 'juice', 'icecream', 'teddy', 'banana', 'pencil', 'star',
              'cupcake', 'egg', 'piggybank', 'gift', 'basket']
SHEETS = {
    'dino123': dict(file='01a_dino.jpeg', mode='row', names=['dino0', 'dino1', 'dino2'], maxh=760),
    'dino4': dict(file='01b_dino.jpeg', mode='row', names=['dino3'], maxh=900),
    'sea': dict(file='02_sea.jpeg', mode='row', names=['sea0', 'sea1', 'sea2', 'sea3'], maxh=800),
    'boy': dict(file='03_boy.jpeg', mode='row', names=['boy0', 'boy1', 'boy2', 'boy3'], maxh=860),
    'monsters': dict(file='04_monsters.jpeg', mode='grid', cols=4, rows=2, maxh=640,
                     names=['m_slime', 'm_bat', 'm_imp', 'm_golem', 'm_ghost', 'm_shroom', 'm_king', 'm_dragon']),
    'gear': dict(file='05_gear.jpeg', mode='grid', cols=4, rows=3, maxh=440,
                 names=['crown1_old', 'crown2_old', 'crown3_old', 'aura', 'wings1', 'wings2', 'wings3', 'ic_strong',
                        'cape1', 'cape2', 'cape3', 'ic_tall']),
    'powers': dict(file='06_powers.jpeg', mode='grid', cols=4, rows=4, maxh=380,
                   names=['claw1', 'claw2', 'claw3', 'shield1', 'fang1', 'fang2', 'fang3', 'shield2',
                          'sword1', 'sword2', 'sword3', 'shield3', 'fire', 'ice', 'thunder', 'pets3']),
    'items': dict(file='07_items.jpeg', mode='grid', cols=5, rows=5, maxh=220, names=ITEM_NAMES),
    # 夥伴：上排 3 個骷髏兵、下排 3 個樹精（這張圖還沒放進 art_src 時會自動跳過）
    'buddies': dict(file='13_buddies.jpeg', mode='rows', rows=[3, 4], maxh=300,
                    names=['skel1', 'skel2', 'skel3', 'tree1', 'tree_plain', 'tree2', 'tree3']),
    # 重畫的皇冠：三頂都是「由上往下看」的角度（戴在頭上才不會看到內側）；05_gear 裡舊的三頂不用了
    'crowns': dict(file='14_crowns.jpeg', mode='row', names=['crown1', 'crown2', 'crown3'], maxh=440),
}
# 圖集裡有、但遊戲已經不用的圖形（盾牌與武器升級卡已取消）
SKIP = {'crown1_old', 'crown2_old', 'crown3_old', 'tree_plain', 'claw1', 'claw2', 'claw3', 'fang1', 'fang2', 'fang3', 'sword1', 'sword2', 'sword3', 'shield1', 'shield2', 'shield3'}
BACKGROUNDS = {'bg_dino': '08_bg_dino.jpeg', 'bg_sea': '09_bg_sea.jpeg', 'bg_boy': '10_bg_boy.jpeg',
               'bg_battle': '11_bg_battle.jpeg', 'bg_title': '12_bg_title.jpeg'}

# 人工確認過的「背景破洞」：被圖形包住、但其實是白色背景的區塊（原圖像素座標的種子點）。
# 由 scan 模式的除錯圖判斷後填入。
HOLES_FILE = 'tools/holes.json'
# 描邊太淺、背景會滲進去的圖形：改用較嚴格的門檻（數字越小越不容易滲透）
STRICT = {'wings1': 0.13, 'wings2': 0.13, 'ic_strong': 0.13}
# 純光暈的圖形：整體偏淡，把透明度拉高一點
BOOST = {'aura': 0.55}
# 只留主體、丟掉周圍零星亮點的圖形（隔壁的星芒會被分進來，讓圖形偏離中心）：值=保留的最小面積
TRIM = {'wings1': 3000, 'wings2': 3000, 'wings3': 3000}


def load(name):
    return np.asarray(Image.open(os.path.join(SRC, name)).convert('RGB')).astype(np.float32)


def analyse(rgb, tau=TAU):
    """回傳 (aw, lab, exposed)：aw=白底換算的 alpha；lab=亮像素的連通區編號；exposed=與邊緣相連的亮區"""
    aw = 1.0 - rgb.min(axis=2) / 255.0
    lab, _ = ndi.label(aw < tau, structure=EIGHT)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    exposed = np.isin(lab, border[border > 0])
    return aw, lab, exposed


def candidates(rgb, aw, lab, exposed, min_area=700):
    """被包住的「純白」區塊：可能是背景破洞，也可能是圖形本身的白色（牙齒、眼白、白翅膀）"""
    pure = (rgb.min(axis=2) >= 249) & ~exposed
    cl, n = ndi.label(pure, structure=EIGHT)
    out = []
    if n == 0:
        return out
    idx = np.arange(1, n + 1)
    areas = ndi.sum(pure, cl, idx)
    coms = ndi.center_of_mass(pure, cl, idx)
    boxes = ndi.find_objects(cl)
    for i in range(n):
        if areas[i] < min_area:
            continue
        ys, xs = np.nonzero(cl[boxes[i]] == i + 1)
        k = len(ys) // 2  # 取區塊內確定存在的一個點當種子（質心可能落在區塊外）
        out.append(dict(area=int(areas[i]), cx=float(coms[i][1]), cy=float(coms[i][0]),
                        seed=[int(xs[k] + boxes[i][1].start), int(ys[k] + boxes[i][0].start)],
                        box=[boxes[i][1].start, boxes[i][0].start, boxes[i][1].stop, boxes[i][0].stop],
                        mask_label=i + 1))
    out.sort(key=lambda c: (round(c['cy'] / 60), c['cx']))
    return out, cl


def scan(only=None):
    os.makedirs(DBG, exist_ok=True)
    report = {}
    for key, cfg in SHEETS.items():
        if only and key not in only:
            continue
        if not os.path.exists(os.path.join(SRC, cfg['file'])):
            continue
        rgb = load(cfg['file'])
        aw, lab, exposed = analyse(rgb)
        res = candidates(rgb, aw, lab, exposed)
        cands, cl = res if res else ([], None)
        vis = rgb.copy()
        vis[exposed & (aw < 0.04)] = (60, 60, 70)  # 確定的背景塗深灰，方便看出破洞
        for c in cands:
            vis[cl == c['mask_label']] = (255, 0, 255)
        im = Image.fromarray(vis.astype(np.uint8))
        d = ImageDraw.Draw(im)
        for i, c in enumerate(cands):
            x, y = c['seed']
            d.rectangle([x - 26, y - 20, x + 26, y + 20], fill=(0, 0, 0))
            d.text((x - 20, y - 16), str(i), fill=(255, 255, 0), font_size=30)
        im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
        im.save(os.path.join(DBG, f'scan_{key}.jpg'), quality=85)
        report[key] = [dict(id=i, area=c['area'], seed=c['seed']) for i, c in enumerate(cands)]
        print(key, len(cands), 'candidates')
    json.dump(report, open(os.path.join(DBG, 'scan.json'), 'w'), indent=1)


def cutout(rgb, hole_seeds=(), tau=TAU):
    aw, lab, exposed = analyse(rgb, tau)
    for (x, y) in hole_seeds:
        l = lab[int(y), int(x)]
        if l > 0:
            exposed |= lab == l
    alpha = np.where(exposed, np.clip((aw - 0.04) / 0.96, 0, 1), 1.0)
    a = np.maximum(alpha, 1e-3)[..., None]
    fg = np.clip((rgb - 255.0 * (1 - a)) / a, 0, 255)  # 把混進去的白色還原掉
    col = np.where(exposed[..., None], fg, rgb)
    return col, alpha


def split(alpha, cfg):
    """把圖集拆成各個圖形：回傳 owner（每個像素屬於第幾個圖形，-1=無）"""
    h, w = alpha.shape
    strong = alpha > 0.35
    lab, n = ndi.label(strong, structure=EIGHT)
    idx = np.arange(1, n + 1)
    areas = ndi.sum(strong, lab, idx)
    coms = np.array(ndi.center_of_mass(strong, lab, idx))
    comp_owner = np.full(n + 1, -1, dtype=np.int32)
    if cfg['mode'] == 'grid':
        col = np.clip((coms[:, 1] / (w / cfg['cols'])).astype(int), 0, cfg['cols'] - 1)
        row = np.clip((coms[:, 0] / (h / cfg['rows'])).astype(int), 0, cfg['rows'] - 1)
        comp_owner[1:] = row * cfg['cols'] + col
        # 很小的碎片（火星、星芒）改歸給「最近的大圖形」，避免飛到隔壁格被分錯
        boxes = ndi.find_objects(lab)
        mains = {}
        for i in range(n):
            c = comp_owner[i + 1]
            if c not in mains or areas[i] > areas[mains[c]]:
                mains[c] = i
        for i in range(n):
            if areas[i] >= 1500 or mains.get(comp_owner[i + 1]) == i:
                continue
            cy, cx = coms[i]
            best, bd = comp_owner[i + 1], 1e18
            for c, m in mains.items():
                b = boxes[m]
                dx = max(b[1].start - cx, 0, cx - b[1].stop)
                dy = max(b[0].start - cy, 0, cy - b[0].stop)
                if dx * dx + dy * dy < bd:
                    best, bd = c, dx * dx + dy * dy
            comp_owner[i + 1] = best
    else:
        k = len(cfg['names'])
        mains = np.argsort(-areas)[:k]
        if cfg['mode'] == 'rows':  # 每列數量不同的圖集：先依上下分列，每列再由左到右
            mains = mains[np.argsort(coms[mains, 0])]
            out, at = [], 0
            for cnt in cfg['rows']:
                part = mains[at:at + cnt]
                out.extend(part[np.argsort(coms[part, 1])])
                at += cnt
            mains = np.array(out)
        else:
            mains = mains[np.argsort(coms[mains, 1])]  # 由左到右
        boxes = ndi.find_objects(lab)
        for rank, m in enumerate(mains):
            comp_owner[m + 1] = rank
        for i in range(n):
            if comp_owner[i + 1] >= 0:
                continue
            best, bd = 0, 1e18
            cy, cx = coms[i]
            for rank, m in enumerate(mains):
                b = boxes[m]
                dx = max(b[1].start - cx, 0, cx - b[1].stop)
                dy = max(b[0].start - cy, 0, cy - b[0].stop)
                dd = dx * dx + dy * dy
                if dd < bd:
                    best, bd = rank, dd
            comp_owner[i + 1] = best
    owner_strong = comp_owner[lab]  # -1 表示不是強像素
    # 淡的像素（光暈、邊緣）歸給最近的圖形
    _, (iy, ix) = ndi.distance_transform_edt(owner_strong < 0, return_indices=True)
    owner = owner_strong[iy, ix]
    dist = np.hypot(iy - np.arange(h)[:, None], ix - np.arange(w)[None, :])
    owner = np.where((alpha > 0.02) & (dist <= 90), owner, -1)
    return owner


def save_sprite(col, alpha, mask, name, maxh, meta):
    if name in TRIM:
        l, n = ndi.label(mask & (alpha > 0.35), structure=EIGHT)
        keep = np.isin(l, 1 + np.nonzero(ndi.sum(mask, l, np.arange(1, n + 1)) >= TRIM[name])[0])
        mask = mask & ndi.binary_dilation(keep, iterations=10)
    ys, xs = np.nonzero(mask)
    if len(ys) == 0:
        print('  !! empty sprite', name)
        return
    y0, y1, x0, x1 = max(ys.min() - 3, 0), ys.max() + 4, max(xs.min() - 3, 0), xs.max() + 4
    a = (alpha[y0:y1, x0:x1] * mask[y0:y1, x0:x1])
    if name in BOOST:
        a = a ** BOOST[name]
    rgba = np.dstack([col[y0:y1, x0:x1], a * 255]).astype(np.uint8)
    im = Image.fromarray(rgba)
    if im.height > maxh:
        im = im.resize((round(im.width * maxh / im.height), maxh), Image.LANCZOS)
    im.save(os.path.join(OUT, name + '.webp'), quality=90, method=6)
    meta[name] = [im.width, im.height]


def hue_mask(col, lo, hi, smin=0.25, vmin=0.35):
    r, g, b = [col[..., i] / 255.0 for i in range(3)]
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    d = mx - mn + 1e-6
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    sat = d / (mx + 1e-6)
    inr = (hue >= lo) & (hue <= hi) if lo <= hi else (hue >= lo) | (hue <= hi)
    return inr & (sat >= smin) & (mx >= vmin)


def build(only=None):
    """only=圖集名稱清單時只重做那幾張（其餘沿用 js/art-meta.js 裡現有的紀錄）"""
    os.makedirs(OUT, exist_ok=True)
    holes = json.load(open(HOLES_FILE)) if os.path.exists(HOLES_FILE) else {}
    meta = {}
    if only:
        meta = json.loads(open('js/art-meta.js').read().split('export const ART = ')[1].rstrip().rstrip(';'))
    for key, cfg in SHEETS.items():
        if only and key not in only:
            continue
        if not os.path.exists(os.path.join(SRC, cfg['file'])):
            print(key, 'skipped (no source image)')
            continue
        rgb = load(cfg['file'])
        col, alpha = cutout(rgb, holes.get(key, []))
        owner = split(alpha, cfg)
        for i, name in enumerate(cfg['names']):
            if name in SKIP:
                continue
            mask = owner == i
            if name in STRICT:
                # 描邊很淺的白色圖形：用更嚴格的門檻重新去背，避免背景滲進圖形內部
                c2, a2 = cutout(rgb, holes.get(key, []), STRICT[name])
                save_sprite(c2, a2, split(a2, cfg) == i, name, cfg['maxh'], meta)
                continue
            if name == 'pets3':
                # 三隻史萊姆疊在一起：依顏色分出粉紅與綠色，做出 1 隻（黃）/ 2 隻（黃+粉紅）/ 3 隻 三個版本
                def region(lo, hi):
                    m = hue_mask(col, lo, hi) & mask
                    l, n = ndi.label(m)
                    if n == 0:
                        return np.zeros_like(m)
                    big = 1 + int(np.argmax(ndi.sum(m, l, np.arange(1, n + 1))))
                    return ndi.binary_dilation(ndi.binary_fill_holes(l == big), iterations=9)
                yellow, pink, green = region(38, 62), region(320, 358), region(110, 170)
                def clean(m):  # 去掉切除後殘留的細碎描邊
                    l, n = ndi.label(m & (alpha > 0.35), structure=EIGHT)
                    keep = np.isin(l, 1 + np.nonzero(ndi.sum(m, l, np.arange(1, n + 1)) >= 400)[0])
                    return m & ndi.binary_dilation(keep, iterations=4)
                save_sprite(col, alpha, clean(mask & ~((pink | green) & ~yellow)), 'pets1', cfg['maxh'], meta)
                save_sprite(col, alpha, clean(mask & ~(green & ~yellow)), 'pets2', cfg['maxh'], meta)
            save_sprite(col, alpha, mask, name, cfg['maxh'], meta)
        print(key, 'done')
    for name, f in ({} if only else BACKGROUNDS).items():
        im = Image.open(os.path.join(SRC, f)).convert('RGB')
        w = round(im.height * 4 / 3)  # 遊戲畫面是 4:3，取中間
        x0 = (im.width - w) // 2
        im = im.crop((x0, 0, x0 + w, im.height)).resize((1600, 1200), Image.LANCZOS)
        im.save(os.path.join(OUT, name + '.webp'), quality=82, method=6)
        meta[name] = [1600, 1200]
    with open('js/art-meta.js', 'w') as fh:
        fh.write('// 由 tools/process_art.py 產生：每張圖的像素尺寸 [寬, 高]\nexport const ART = ' + json.dumps(meta, indent=1) + ';\n')
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(len(meta), 'images,', round(total / 1e6, 2), 'MB')


def sheet():
    """把輸出的去背圖排在深色與亮色底上，檢查邊緣與破洞"""
    os.makedirs(DBG, exist_ok=True)
    names = sorted(f[:-5] for f in os.listdir(OUT) if f.endswith('.webp') and not f.startswith('bg_'))
    groups = {'chars': [n for n in names if n[:-1] in ('dino', 'sea', 'boy')], 'monsters': [n for n in names if n.startswith('m_')],
              'gear': [n for n in names if n[:-1] in ('crown', 'wings', 'cape', 'pets', 'skel', 'tree') or n in ('aura', 'fire', 'ice', 'thunder', 'ic_strong', 'ic_tall')]}
    groups['items'] = [n for n in names if n not in sum(groups.values(), [])]
    for g, lst in groups.items():
        cell = 300 if g in ('chars', 'monsters') else 190
        cols = 6 if g != 'items' else 9
        rows = (len(lst) + cols - 1) // cols
        im = Image.new('RGB', (cols * cell, rows * cell), (40, 110, 120))
        d = ImageDraw.Draw(im)
        for k, n in enumerate(lst):
            x, y = (k % cols) * cell, (k // cols) * cell
            if (k % cols + k // cols) % 2:
                d.rectangle([x, y, x + cell, y + cell], fill=(235, 200, 120))
            sp = Image.open(os.path.join(OUT, n + '.webp')).convert('RGBA')
            sp.thumbnail((cell - 16, cell - 30), Image.LANCZOS)
            im.paste(sp, (x + (cell - sp.width) // 2, y + cell - 22 - sp.height), sp)
            d.text((x + 6, y + cell - 20), n, fill=(255, 255, 255), font_size=16)
        im.save(os.path.join(DBG, f'sheet_{g}.jpg'), quality=88)
        print(g, len(lst))


if __name__ == '__main__':
    cmd, only = (sys.argv[1] if len(sys.argv) > 1 else 'build'), sys.argv[2:] or None
    sheet() if cmd == 'sheet' else {'scan': scan, 'build': build}[cmd](only)
