#!/bin/bash
# 更新版本號：讓瀏覽器重新整理後一定載入新版程式（GitHub Pages 會快取 10 分鐘）
# 用法：./bump.sh        （自動 +1）
cd "$(dirname "$0")"
cur=$(grep -o 'main.js?v=[0-9]*' index.html | grep -o '[0-9]*$'); cur=${cur:-0}; new=$((cur + 1))
# 所有模組匯入都帶同一個版本號（必須一致，否則同一個模組會被載入兩份）
perl -pi -e "s/(from '\.{1,2}\/[a-z0-9_\/-]+\.js)(\?v=\d+)?'/\$1?v=$new'/g" js/*.js js/q/*.js samples.html
perl -pi -e "s/(js\/main\.js|css\/style\.css|css\/q\.css)(\?v=\d+)?\"/\$1?v=$new\"/g" index.html
perl -pi -e "s/(css\/style\.css)(\?v=\d+)?\"/\$1?v=$new\"/g" samples.html
echo "version $cur -> $new"
