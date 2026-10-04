#!/bin/zsh
# BRX site driver: serve, check every page, screenshot desktop + phone, grep for leaks.
# Usage:  .claude/skills/run-brxdxb-site/smoke.sh [local|live]      (default local)
set -u
MODE=${1:-local}; PORT=8811; OUT=.qa/smoke; mkdir -p $OUT
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PAGES=(index.html flow/index.html products/index.html launch/index.html industries/index.html terminal/index.html atlas/index.html savings/index.html defender/index.html agents/lawyer.html agents/advisor.html agents/wealth-manager.html agents/broker.html agents/clinic.html agents/hospitality.html flow/private-sector.html flow/public-sector.html calculator.html console.html portal/index.html solutions/index.html ai-first/index.html get-whitepaper.html agent.html agents/index.html flow/legal.html flow/hospitality.html flow/healthcare.html flow/real-estate.html sitemap.xml)
if [ "$MODE" = live ]; then BASE="https://www.brxdxb.com"; else
  lsof -i :$PORT >/dev/null 2>&1 || (python3 -m http.server $PORT >/dev/null 2>&1 &); sleep 1; BASE="http://localhost:$PORT"; fi
fail=0
echo "== pages ($BASE)"
for p in $PAGES; do c=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$p?x=$RANDOM"); printf "%-26s %s\n" $p $c; [ "$c" = 200 ] || fail=1; done
echo "== leaks (must be empty)"
grep -rnE "C9A84C|00D4FF|#08090D|Syne|Cairo|566030347|PIN [0-9]{4}|defender\.brxdxb\.com/calls|localhost:87|Provident|Bitrix|DIFC[- ,]+(licen|regist|Dubai)|L\.L\.C|[Rr]egulated|owner-atlas-dubai\.netlify|مركز دبي المالي" --include="*.html" . 2>/dev/null | grep -v "^./\.qa\|^./v2\|^./v3\|^./defender/app\|console.html" && fail=1 || echo "clean"
echo "== old company names (must be empty): the company is BRXDXB"
grep -rnE "BRX Technologies|BRX·DXB|BRX&middot;DXB" --include="*.html" --include="*.xml" --include="*.js" . 2>/dev/null | grep -v "^./\.qa\|^./v2\|^./v3\|^./card/\|^./defender/app\|^./portal/" && fail=1 || echo "clean"
echo "== portal shell leaks (js/css too, must be empty)"
grep -nE "C9A84C|00D4FF|566030347|PIN [0-9]{4}|defender\.brxdxb\.com/calls|localhost:87|Provident|Bitrix|DIFC|L\.L\.C|brx_live_[A-Za-z0-9_-]{20}|bps_[A-Za-z0-9_-]{20}|\+971 ?5[0-9] ?[0-9]{3} ?[0-9]{4}" portal/ -r 2>/dev/null && fail=1 || echo "clean"
echo "== markup leaks in visible text, EN and AR (must be 0)"
python3 .claude/skills/run-brxdxb-site/check_text.py | tail -15; [ ${pipestatus[1]} = 0 ] || fail=1
echo "== internal links"
broken=0
for p in $PAGES; do d=$(dirname $p); for h in $(grep -oE 'href="(/[^"#?:]*|[^"#?:/][^"#?:]*\.html)[#?"]' $p | cut -d'"' -f2 | cut -d'#' -f1 | cut -d'?' -f1 | sort -u); do case $h in /*) f=".$h";; *) f="$d/$h";; esac; f=${f//\/.\//\/}; case $f in */) f="${f}index.html";; esac; [ -f "$f" ] || { echo "BROKEN in $p -> $h"; broken=1; }; done; done
[ $broken = 1 ] && fail=1; echo "links checked"
echo "== screenshots -> $OUT"
for p in index.html defender/index.html; do n=${p//\//_}; "$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,3600 --virtual-time-budget=6000 --screenshot=$OUT/${n%.html}-desktop.png "$BASE/$p" >/dev/null 2>&1
  # headless chrome clamps windows under ~500px: emulate a phone with device scale instead
  "$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=500,2600 --virtual-time-budget=6000 --screenshot=$OUT/${n%.html}-phone.png "$BASE/$p" >/dev/null 2>&1; done
ls -1 $OUT | sed 's/^/  /'
echo "== result: $([ $fail = 0 ] && echo PASS || echo FAIL)"; exit $fail
