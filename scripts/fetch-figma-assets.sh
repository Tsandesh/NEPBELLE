#!/usr/bin/env bash
# Downloads Figma assets referenced by Home / Desktop (7:946) and the UI states board (9:30269).
# NOTE: these MCP asset URLs are temporary (expire ~7 days after generation). If they 404,
# re-run get_design_context for the node and update the prefixes below.
set -euo pipefail
OUT="$(dirname "$0")/../client/public/assets/figma"
mkdir -p "$OUT"
HOME_P="https://www.figma.com/api/mcp/asset/4fa93501-fd65-45c4-bea8-3c529e1a8b54"
BOARD_P="https://www.figma.com/api/mcp/asset/bd4949f9-87d6-4875-9b2a-e7a99ab57946"
get() { curl -fL --retry 2 -o "$OUT/$2" "$1" && echo "ok  $2" || echo "FAIL $2"; }

# products (card image 0..7)
i=0; for f in eaf36 6f131 ae638 cef41 38ec3 d11f3 a72ee 792a1; do get "$HOME_P/$f.png" "product-$i.png"; i=$((i+1)); done
# categories 1..6
i=1; for f in c5e19 3676a 7e58a b97a9 cf6e6 60b51; do get "$HOME_P/$f.png" "category-$i.png"; i=$((i+1)); done
# colour cards 1..4
i=1; for f in 39223 a7393 7acfe c2bd3; do get "$HOME_P/$f.png" "color-$i.png"; i=$((i+1)); done
get "$HOME_P/84a36.png" hero-banner-01.png
get "$HOME_P/125c0.png" banner-editorial.png
# icons
for pair in 6efbf:facebook 520a2:instagram 5affc:twitter 27371:youtube 5e1f2:pinterest b6d01:shield 51444:search ea07c:heart 14eef:shopping-bag 36d1f:user 460d4:chevron-right; do
  get "$HOME_P/${pair%%:*}.svg" "icon-${pair##*:}.svg"
done
get "$BOARD_P/60289.svg" icon-check.svg
get "$BOARD_P/cae7c.svg" swatch-blue-default.svg
get "$BOARD_P/31cc6.svg" swatch-blue-selected.svg
echo "Done -> $OUT"
