# 產生 App 圖示：紫色漸層底 + 小暴龍的頭 + 「1+2=3」
import sys, base64, io
from PIL import Image, ImageDraw, ImageFont, ImageFilter
root, out = sys.argv[1], sys.argv[2]
N = 1024
bg = Image.new('RGBA', (N, N))
top, bot = (150, 88, 255), (38, 22, 104)
px = bg.load()
for y in range(N):
    t = y / (N - 1); c = tuple(round(top[i] + (bot[i] - top[i]) * t) for i in range(3)) + (255,)
    for x in range(N): px[x, y] = c
# 頭後面的光暈
glow = Image.new('RGBA', (N, N), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse((150, 330, 900, 1010), fill=(255, 226, 120, 150))
bg.alpha_composite(glow.filter(ImageFilter.GaussianBlur(90)))
# 小暴龍：放大到頭佔滿下半部，身體超出底邊（只看得到頭和脖子）
d = Image.open(f'{root}/img/dino0.webp').convert('RGBA')
k = 2.42
d = d.resize((round(d.width * k), round(d.height * k)), Image.LANCZOS)
ox, oy = round(N / 2 - 262 * k), 268
sh = Image.new('RGBA', (N, N), (0, 0, 0, 0)); sh.paste((20, 10, 60, 120), (ox + 8, oy + 16), d.split()[3])
bg.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)))
layer = Image.new('RGBA', (N, N), (0, 0, 0, 0)); layer.paste(d, (ox, oy), d)
bg.alpha_composite(layer)
# 1+2=3
f = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Black.ttf', 190)
dr = ImageDraw.Draw(bg)
dr.text((N / 2, 150), '1+2=3', font=f, anchor='mm', fill=(255, 212, 58), stroke_width=17, stroke_fill=(43, 33, 64))
bg = bg.convert('RGB')
bg.resize((512, 512), Image.LANCZOS).save(f'{out}/icon-512.png', optimize=True)
bg.resize((180, 180), Image.LANCZOS).save(f'{out}/icon-180.png', optimize=True)
buf = io.BytesIO(); bg.resize((192, 192), Image.LANCZOS).save(buf, 'PNG', optimize=True)
open(f'{out}/icon.svg', 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><image width="192" height="192" href="data:image/png;base64,%s"/></svg>\n' % base64.b64encode(buf.getvalue()).decode())
