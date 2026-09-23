#!/bin/zsh
# BRX site driver: serve, check every page, screenshot desktop + phone, grep for leaks.
# Usage:  .claude/skills/run-brxdxb-site/smoke.sh [local|live]      (default local)
set -u
MODE=${1:-local}; PORT=8811; OUT=.qa/smoke; mkdir -p $OUT
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PAGES=(index.html agent.html calculator.html console.html get-whitepaper.html flow/index.html flow/real-estate.html flow/legal.html flow/hospitality.html flow/healthcare.html)
if [ "$MODE" = live ]; then BASE="https://www.brxdxb.com"; else
  lsof -i :$PORT >/dev/null 2>&1 || (python3 -m http.server $PORT >/dev/null 2>&1 &); sleep 1; BASE="http://localhost:$PORT"; fi
fail=0
echo "== pages ($BASE)"
for p in $PAGES; do c=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$p?x=$RANDOM"); printf "%-26s %s\n" $p $c; [ "$c" = 200 ] || fail=1; done
echo "== leaks (must be empty)"
grep -rnE "C9A84C|00D4FF|#08090D|Syne|Cairo|566030347|PIN [0-9]{4}|defender\.brxdxb\.com/calls|localhost:87|Provident|Bitrix" --include="*.html" . 2>/dev/null | grep -v "^./\.qa\|^./v2\|^./v3\|^./defender\|console.html" && fail=1 || echo "clean"
echo "== internal links"
broken=0
for p in $PAGES; do d=$(dirname $p); for h in $(grep -oE 'href="[^"#?:]+\.html[^"]*"' $p | cut -d'"' -f2 | cut -d'#' -f1 | cut -d'?' -f1 | sort -u); do case $h in /*) f=".$h";; *) f="$d/$h";; esac; f=${f//\/.\//\/}; [ -f "$f" ] || { echo "BROKEN in $p -> $h"; broken=1; }; done; done
[ $broken = 1 ] && fail=1; echo "links checked"
echo "== screenshots -> $OUT"
for p in index.html flow/real-estate.html; do n=${p//\//_}; "$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,3600 --virtual-time-budget=6000 --screenshot=$OUT/${n%.html}-desktop.png "$BASE/$p" >/dev/null 2>&1
  # headless chrome clamps windows under ~500px: emulate a phone with device scale instead
  "$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=500,2600 --virtual-time-budget=6000 --screenshot=$OUT/${n%.html}-phone.png "$BASE/$p" >/dev/null 2>&1; done
ls -1 $OUT | sed 's/^/  /'
echo "== result: $([ $fail = 0 ] && echo PASS || echo FAIL)"; exit $fail
