/* BRX "Your agency. Live." — demo floor, feed, flow and reports.
   Public page: every name here is generated. No real phone number, owner or price is ever rendered.
   Optional #live mode replaces the counts with real aggregate numbers from defender.brxdxb.com (counts only). */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = false, liveMode = false;

  /* ── Dubai clock ─────────────────────────── */
  var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  function dxb(d) {
    var o = {}; fmt.formatToParts(d || new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour, m: +o.minute, s: +o.second };
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hms(sec) { sec = Math.max(0, Math.floor(sec)) % 86400; return pad(Math.floor(sec / 3600)) + ':' + pad(Math.floor(sec / 60) % 60) + ':' + pad(sec % 60); }
  function secNow() { var t = dxb(); return t.h * 3600 + t.m * 60 + t.s; }
  var T0 = dxb(), DAY = T0.y * 10000 + T0.mo * 100 + T0.d;

  /* ── Seeded random, deterministic per day ── */
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }

  var FIRST = ['Ahmed', 'Fatima', 'Rahul', 'Olga', 'James', 'Mariam', 'Hassan', 'Chen', 'Sara', 'Yusuf', 'Elena', 'Vikram', 'Noura', 'Tom', 'Aleksei', 'Leila', 'Imran', 'Sophie', 'Khalid', 'Ana', 'Bilal', 'Hiba', 'Marco', 'Dmitri', 'Reem', 'Arjun', 'Zainab', 'Lucas', 'Salma', 'Ibrahim', 'Grace', 'Faisal'];
  var INIT = 'ABDEFGHKLMNPRSTVWZ';
  var AREAS = ['Dubai Marina', 'JBR', 'Business Bay', 'Downtown', 'Palm Jumeirah', 'JVC', 'Dubai Hills', 'Creek Harbour', 'JLT', 'Arabian Ranches'];
  var TYPES = ['studio', '1-bed', '2-bed', '2-bed', '3-bed', 'townhouse', '4-bed villa'];
  var LANGS = ['English', 'English', 'Arabic', 'Arabic', 'Russian', 'Hindi', 'French', 'Urdu', 'Mandarin'];
  var WHY = ['viewing this week', 'mortgage pre-approved', 'moving in 30 days', 'cash buyer', 'relocating from London', 'second home'];
  var SRC = [['bayut', 'Bayut'], ['dubizzle', 'dubizzle'], ['web', 'Website']];

  var AGENTS = [
    { n: 'Omar', r: 'Senior sales · Marina & JBR', l: 'Arabic · English', skin: '#C99A73', hair: '#2A1E17', st: 'short', bg: '#25324A', suit: '#3A3F4A' },
    { n: 'Priya', r: 'Off-plan · Business Bay', l: 'English · Hindi', skin: '#B98462', hair: '#1E1612', st: 'long', bg: '#3A2F3F', suit: '#E9E1D2' },
    { n: 'Daniel', r: 'Leasing · Downtown', l: 'English · French', skin: '#E8C3A2', hair: '#6B4A2E', st: 'short', bg: '#21384A', suit: '#2D3340' },
    { n: 'Layla', r: 'Secondary sales · Palm Jumeirah', l: 'Arabic · English', skin: '#D6A983', hair: '#2B2019', st: 'bun', bg: '#3B3426', suit: '#F1EBDD' },
    { n: 'Sergei', r: 'Investors · Dubai Hills & JVC', l: 'Russian · English', skin: '#EBCDB2', hair: '#A88A62', st: 'short', bg: '#24392F', suit: '#30353F' },
    { n: 'Aisha', r: 'Lead desk · nights & weekends', l: 'English · Urdu', skin: '#8E5E40', hair: '#1A1210', st: 'bun', bg: '#352B3A', suit: '#3B3F4A' }
  ];
  var AREA_AGENT = { 'Dubai Marina': 0, 'JBR': 0, 'Business Bay': 1, 'Creek Harbour': 1, 'Downtown': 2, 'JLT': 2, 'Palm Jumeirah': 3, 'Arabian Ranches': 3, 'Dubai Hills': 4, 'JVC': 4 };
  var HOURW = [.3, .2, .15, .1, .1, .2, .4, .8, 1.2, 1.8, 2, 2.1, 1.9, 1.6, 1.5, 1.6, 1.8, 2, 2.1, 2, 1.7, 1.2, .8, .5];

  function makeLead(r, t) {
    var area = pick(r, AREAS), u = r(), src = u < .46 ? SRC[0] : u < .82 ? SRC[1] : SRC[2];
    var h = Math.floor(t / 3600), night = h < 8 || h >= 22;
    var o = r(), outcome = o < .34 ? 'meet' : o < .58 ? 'link' : o < .78 ? 'callback' : o < .93 ? 'sms' : 'later';
    return {
      t: t, name: pick(r, FIRST) + ' ' + INIT.charAt(Math.floor(r() * INIT.length)) + '.', src: src, area: area, type: pick(r, TYPES),
      intent: r() < .62 ? 'buy' : 'rent', lang: pick(r, LANGS), score: r() < .45 ? 5 : r() < .7 ? 4 : 3, why: pick(r, WHY),
      first: 10 + Math.floor(Math.pow(r(), 1.8) * 30), agent: night ? 5 : (r() < .75 ? AREA_AGENT[area] : Math.floor(r() * 5)),
      voice: night || r() < .3, outcome: outcome, unit: (Math.floor(r() * 52) + 3) * 100 + Math.floor(r() * 12) + 1
    };
  }

  /* The day so far: ~40 leads spread by hour weight. */
  var R = rng(DAY), LEADS = [], HW = HOURW.reduce(function (a, b) { return a + b; }, 0);
  for (var i = 0; i < 40; i++) {
    var x = R() * HW, h = 0; while (x > HOURW[h]) { x -= HOURW[h]; h++; }
    LEADS.push(makeLead(R, h * 3600 + Math.floor(R() * 3600)));
  }
  LEADS.sort(function (a, b) { return a.t - b.t; });

  var S = { leads: 0, calls: 0, msgs: 0, atlas: 0, meet: 0, deals: 0, replies: 0, firsts: [], src: { bayut: 0, dubizzle: 0, web: 0 }, perHour: [], agentCalls: [0, 0, 0, 0, 0, 0], agentMeet: [0, 0, 0, 0, 0, 0], slow: null };
  for (var k = 0; k < 24; k++) S.perHour.push(0);
  function addCalls(n, t) { S.calls += n; S.perHour[Math.floor(t / 3600) % 24] += n; }
  (function seedDay() {
    var now = secNow();
    LEADS.forEach(function (L) {
      if (L.t > now) return;
      S.leads++; S.src[L.src[0]]++; S.firsts.push(L.first); S.agentCalls[L.agent]++;
      addCalls(L.outcome === 'callback' || L.outcome === 'sms' ? 2 : 1, L.t);
      S.msgs += L.outcome === 'later' ? 1 : 2 + (L.outcome === 'link' ? 1 : 0);
      if (L.outcome === 'meet') { S.meet++; S.agentMeet[L.agent]++; }
      if (!S.slow || L.first > S.slow.first) S.slow = L;
    });
    // owner calls and Atlas lookups through working hours that have passed
    var r = rng(DAY ^ 0x9e37), hNow = Math.floor(now / 3600);
    for (var h = 8; h < 22 && h <= hNow; h++) {
      var frac = h === hNow ? (now % 3600) / 3600 : 1;
      addCalls(Math.round((4 + r() * 5) * frac), h * 3600 + 1);
      S.atlas += Math.round((3 + r() * 4) * frac); S.msgs += Math.round((3 + r() * 4) * frac); S.replies += Math.round(r() * 1.6 * frac);
    }
    S.deals = Math.min(3, Math.floor(S.meet / 4));
  })();
  function median(a) { if (!a.length) return 19; var b = a.slice().sort(function (x, y) { return x - y; }); return b[Math.floor((b.length - 1) / 2)]; }

  /* ── Count-up numbers, animated when first seen ── */
  var seen = new WeakSet(), io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { seen.add(e.target); io.unobserve(e.target); tween(e.target, 0, +e.target.dataset.v); } });
  }, { threshold: .4 }) : null;
  function tween(el, from, to) {
    if (RM || from === to) { el.textContent = to; return; }
    var t0 = performance.now(), d = from === 0 ? 1100 : 500;
    (function f(t) { var p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(from + (to - from) * e); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  function setNum(id, v) {
    var el = $(id); if (!el) return;
    var old = el.dataset.v === undefined ? null : +el.dataset.v; el.dataset.v = v;
    if (old === null) { if (io && !RM) { el.textContent = '0'; io.observe(el); } else { el.textContent = v; seen.add(el); } return; }
    if (seen.has(el)) tween(el, old, v);
  }

  function render() {
    if (liveMode) return;
    var med = median(S.firsts);
    setNum('h-first', med); setNum('h-leads', S.leads); setNum('h-wait', 0);
    setNum('c-leads', S.leads); setNum('c-calls', S.calls); setNum('c-msgs', S.msgs); setNum('c-atlas', S.atlas);
    setNum('k-first', med); setNum('k-called', S.leads); setNum('k-meet', S.meet); setNum('k-deals', S.deals);
    $('k-called-of').textContent = 'of ' + S.leads + ' in. None left waiting.';
    var m = { 'm-in': S.leads, 'm-called': S.leads, 'm-first': med, 'm-meet': S.meet, 'm-deals': S.deals };
    Object.keys(m).forEach(function (id) { setNum(id, m[id]); });
    AGENTS.forEach(function (a, i) { setNum('ac' + i, S.agentCalls[i]); setNum('am' + i, S.agentMeet[i]); });
    bars(); ceo();
  }

  /* ── Avatars and the floor ─────────────── */
  function avatar(a) {
    var hair = a.st === 'long' ? '<path d="M14 23c0-10 5-15 12-15s12 5 12 15v12c-2 0-4-2-4-5v-9c-2-3-5-5-8-5s-6 2-8 5v9c0 3-2 5-4 5z" fill="' + a.hair + '"/>'
      : '<path d="M15.5 21c0-8 4.5-12.5 10.5-12.5S36.5 13 36.5 21c-2-4-6-6.2-10.5-6.2S17.5 17 15.5 21z" fill="' + a.hair + '"/>' + (a.st === 'bun' ? '<circle cx="26" cy="8.5" r="4.2" fill="' + a.hair + '"/>' : '');
    return '<svg class="av" viewBox="0 0 52 52" aria-hidden="true"><rect width="52" height="52" fill="' + a.bg + '"/>' +
      '<path d="M5 53c2-11 10-16.5 21-16.5S45 42 47 53z" fill="' + a.suit + '"/><rect x="22" y="28" width="8" height="9" rx="3" fill="' + a.skin + '"/>' +
      '<circle cx="26" cy="21" r="10" fill="' + a.skin + '"/>' + hair + '<path d="M21.5 36.5l4.5 6 4.5-6" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.6"/></svg>';
  }
  var KIND = { call: 'On a call', msg: 'Messaging', atlas: 'Owner Atlas', meet: 'Meeting', reply: 'Reply in' };
  var TPL = {
    call: ['calling {lead} · 5-star lead', 'on a call with {lead} · {lang}', 'calling back {lead} · {area} {type}', 'owner call · unit {unit}'],
    msg: ['sent 3D link · {area} {type}', 'WhatsApp to {lead} · viewing slots', 'iMessage follow-up · {lead}', 'emailed the floor plan · {area} {type}'],
    atlas: ['atlas: who owns {unit}', 'atlas: {area}, floor {floor}', 'atlas: owner found for {unit}'],
    meet: ['meeting booked {time}', 'viewing in {area} · {time}', 'meeting booked {time} · {lead}'],
    reply: ['owner replied · unit {unit}', '{lead} replied · wants a viewing', 'owner replied · open to list']
  };
  function slot(r) {
    var t = secNow() + 3600 + Math.floor(r() * 4) * 3600, q = Math.floor(r() * 4) * 15, hh = Math.floor(t / 3600);
    if (hh >= 21 || hh < 9) return 'tomorrow ' + (10 + Math.floor(r() * 4)) + ':' + pad(q);
    return hh + ':' + pad(q);
  }
  function fill(s, r, L) {
    return s.replace('{lead}', L.name).replace('{lang}', L.lang).replace('{area}', L.area).replace('{type}', L.type)
      .replace(/\{unit\}/g, L.unit).replace('{floor}', Math.floor(L.unit / 100)).replace('{time}', slot(r));
  }
  function floor() {
    var html = AGENTS.map(function (a, i) {
      return '<article class="agent" id="ag' + i + '" data-k="call"><div class="who">' + avatar(a) + '<div><b>' + a.n + '</b><span>' + a.r + '</span></div></div>' +
        '<p class="langs">' + a.l + '</p><div class="ag-status"><p class="st"><i aria-hidden="true"></i><span>On a call</span></p><p class="now-line">…</p></div>' +
        '<p class="meta"><span><b class="num" id="ac' + i + '">0</b> calls</span><span><b class="num" id="am' + i + '">0</b> meetings</span></p></article>';
    }).join('');
    html += '<article class="agent mgr"><div class="who">' + avatar({ skin: '#C08E69', hair: '#3A2C22', st: 'short', bg: '#3B3426', suit: '#22252C' }) +
      '<div><b>Karim</b><span>Sales manager · sees it all</span></div></div><dl>' +
      '<dt>Leads in</dt><dd id="m-in">0</dd><dt>Called</dt><dd id="m-called">0</dd><dt>Median first call</dt><dd><span id="m-first">19</span> s</dd>' +
      '<dt>Meetings</dt><dd id="m-meet">0</dd><dt>Deals</dt><dd id="m-deals">0</dd><dt>Left waiting</dt><dd>0</dd></dl></article>';
    html += '<figure class="wall"><img src="/agency/img/floor.jpg" alt="The agency wall screen: every agent desk lights up as the call goes out" width="480" height="608" loading="lazy" decoding="async"><figcaption>Call · Message · Email · Log. The wall lights up desk by desk.</figcaption></figure>';
    $('agents').innerHTML = html;
  }
  var AR = rng(DAY ^ 0x51ed);
  function statusFor(i, first) {
    var keys = Object.keys(TPL), kind = first ? keys[i % keys.length] : pick(AR, keys);
    if (i === 5 && (secNow() / 3600 | 0) >= 9 && (secNow() / 3600 | 0) < 21 && AR() < .5) kind = 'msg';
    var L = makeLead(AR, secNow()), el = $('ag' + i); if (!el) return;
    el.dataset.k = kind;
    var st = el.querySelector('.st span'), line = el.querySelector('.now-line'), txt = fill(pick(AR, TPL[kind]), AR, L);
    if (liveMode) txt = txt.replace(L.name, 'a lead');
    if (RM || first) { st.textContent = KIND[kind]; line.textContent = txt; }
    else { line.classList.add('fade'); setTimeout(function () { st.textContent = KIND[kind]; line.textContent = txt; line.classList.remove('fade'); }, 300); }
    if (!first && kind === 'call') { S.agentCalls[i]++; setNum('ac' + i, S.agentCalls[i]); }
  }
  function agentLoop(i) { setTimeout(function () { if (!paused) statusFor(i, false); agentLoop(i); }, 3200 + AR() * 3600 + i * 120); }

  /* ── Live feed ─────────────────────────── */
  var log = $('log'), MAXROWS = 40;
  function row(t, cls, label, text) {
    var li = document.createElement('li');
    li.innerHTML = '<time>' + hms(t) + '</time><span class="src ' + cls + '">' + label + '</span><span class="tx"></span>';
    li.querySelector('.tx').innerHTML = text;
    log.insertBefore(li, log.firstChild);
    while (log.children.length > MAXROWS) log.removeChild(log.lastChild);
  }
  function who(L) { return liveMode ? 'a lead' : L.name; }
  function emitLeadStep(L, step, t) {
    var A = AGENTS[L.agent].n;
    if (step === 0) { row(t, L.src[0], L.src[1], 'New lead · ' + who(L) + ' · ' + L.type + ' to ' + L.intent + ' · ' + L.area); S.leads++; S.src[L.src[0]]++; hit('src-' + L.src[0]); toast(L.src[1] + ' · just now', 'New lead, ' + L.type + ' in ' + L.area + '. Calling now.'); }
    if (step === 1) { row(t, 'call', 'BRX', 'Scored ' + L.score + '/5 · ' + L.lang + ' · ' + L.why); hit('q'); }
    if (step === 2) { row(t, 'call', 'Call', 'Called ' + who(L) + ' in <b>' + L.first + ' s</b> · ' + (L.voice ? 'AI voice, then ' + A : A + "'s company phone")); S.firsts.push(L.first); addCalls(1, t); S.agentCalls[L.agent]++; hit('sw'); hit('calls'); toast('Called in ' + L.first + ' s', who(L) + ' picked up. ' + A + ' has the file.'); }
    if (step === 3) {
      var r = rng(L.unit + L.t);
      if (L.outcome === 'meet') { row(t, 'call', 'Meeting', 'Meeting booked ' + slot(r) + ' · ' + A + ' · ' + L.area); S.meet++; S.agentMeet[L.agent]++; S.deals = Math.min(3, Math.floor(S.meet / 4)); }
      else if (L.outcome === 'link') { row(t, 'msg', 'WhatsApp', '3D link sent · ' + L.area + ' ' + L.type + ' · ' + who(L)); S.msgs++; hit('msgs'); hit('links'); }
      else if (L.outcome === 'callback') { row(t, 'msg', 'iMessage', 'Callback set ' + slot(r) + ' · ' + who(L)); S.msgs++; hit('msgs'); }
      else { row(t, 'msg', 'SMS', 'No answer · SMS sent · retry in 2 h'); S.msgs++; hit('msgs'); }
    }
    if (step === 4) { row(t, 'crm', 'CRM', 'Logged · next step set for ' + A); S.msgs++; hit('crm'); }
    render();
  }
  var FR = rng(Math.floor(Date.now() / 60000));
  function filler(t) {
    var L = makeLead(FR, t), A = AGENTS[Math.floor(FR() * 6)].n, u = FR();
    if (u < .24) { row(t, 'atlas', 'Atlas', 'Who owns ' + L.unit + ' · ' + L.area + ' → owner on file · ' + A); S.atlas++; hit('atlas'); atlasCard(L); }
    else if (u < .42) { row(t, 'call', 'Call', 'Owner call · unit ' + L.unit + ' · ' + A + ' · ' + (2 + Math.floor(FR() * 6)) + ' min'); addCalls(1, t); hit('calls'); }
    else if (u < .58) { row(t, 'msg', 'Email', 'Floor plan and 3D link to ' + who(L) + ' · ' + L.area); S.msgs++; hit('msgs'); }
    else if (u < .72) { row(t, 'web', 'Link', 'Client opened 3D link · ' + L.area + ' ' + L.type + ' · ' + (1 + Math.floor(FR() * 4)) + ' min'); hit('links'); }
    else if (u < .86) { row(t, 'atlas', 'Reply', 'Owner replied · unit ' + L.unit + ' · open to list'); S.replies++; }
    else { row(t, 'msg', 'iMessage', 'Viewing reminder · ' + who(L) + ' · ' + slot(FR)); S.msgs++; hit('msgs'); }
    render();
  }
  function seedFeed() {
    var now = secNow(), past = LEADS.filter(function (L) { return L.t <= now; }).slice(-4), evs = [];
    past.forEach(function (L) { evs.push([L.t, L, 0], [L.t + 2, L, 1], [L.t + L.first, L, 2], [L.t + L.first + 70, L, 3], [L.t + L.first + 75, L, 4]); });
    evs.sort(function (a, b) { return a[0] - b[0]; });
    evs.slice(-12).forEach(function (e) {
      var L = e[1], A = AGENTS[L.agent].n;
      var txt = [ 'New lead · ' + L.name + ' · ' + L.type + ' to ' + L.intent + ' · ' + L.area, 'Scored ' + L.score + '/5 · ' + L.lang + ' · ' + L.why,
        'Called ' + L.name + ' in <b>' + L.first + ' s</b> · ' + (L.voice ? 'AI voice, then ' + A : A + "'s company phone"), L.outcome === 'meet' ? 'Meeting booked · ' + A + ' · ' + L.area : 'WhatsApp follow-up · ' + L.name, 'Logged · next step set for ' + A ][e[2]];
      var c = [[L.src[0], L.src[1]], ['call', 'BRX'], ['call', 'Call'], [L.outcome === 'meet' ? 'call' : 'msg', L.outcome === 'meet' ? 'Meeting' : 'WhatsApp'], ['crm', 'CRM']][e[2]];
      row(e[0], c[0], c[1], txt);
    });
  }

  /* Follow one lead: a fresh lead every ~40 s, real-time seconds to first call. */
  var J = { L: null, t0: 0 }, JR = rng(DAY ^ 0x77);
  function steps(n, times) { var li = $('j-steps').children; for (var i = 0; i < li.length; i++) { li[i].classList.toggle('done', i < n); li[i].querySelector('time').textContent = i < n ? hms(times[i]) : ''; } }
  function journey() {
    if (paused || liveMode) { setTimeout(journey, 1000); return; }
    var t = secNow(), L = makeLead(JR, t); L.first = 12 + Math.floor(JR() * 14); L.outcome = JR() < .5 ? 'meet' : 'link';
    var times = [t, t + 2, t + L.first, t + L.first + 8, t + L.first + 11];
    J.L = L; $('j-who').textContent = L.name + ' · ' + L.type + ' to ' + L.intent + ' · ' + L.area + ' · via ' + L.src[1];
    var start = Date.now(), done = 0; steps(0, times); emitLeadStep(L, 0, t); done = 1; steps(1, times);
    var iv = setInterval(function () {
      if (paused) return;
      var e = (Date.now() - start) / 1000, sec = Math.min(L.first, Math.floor(e));
      $('j-sec').textContent = sec;
      if (done === 1 && e >= 2) { emitLeadStep(L, 1, times[1]); done = 2; steps(2, times); }
      if (done === 2 && e >= L.first) { emitLeadStep(L, 2, times[2]); done = 3; steps(3, times); }
      if (done === 3 && e >= L.first + 8) { emitLeadStep(L, 3, times[3]); done = 4; steps(4, times); }
      if (done === 4 && e >= L.first + 11) { emitLeadStep(L, 4, times[4]); done = 5; steps(5, times); }
      if (done === 5 && e >= L.first + 28) { clearInterval(iv); journey(); }
    }, 250);
  }
  function fillerLoop() { setTimeout(function () { if (!paused && !liveMode) filler(secNow()); fillerLoop(); }, 3400 + FR() * 2800); }

  /* Hero toast */
  var toastEl = $('toast'), toastT = 0;
  function toast(a, b) {
    if (!toastEl || Date.now() - toastT < 3500) return; toastT = Date.now();
    toastEl.classList.add('out');
    setTimeout(function () { toastEl.innerHTML = '<small></small>'; toastEl.firstChild.textContent = a; toastEl.appendChild(document.createTextNode(b)); toastEl.classList.remove('out'); }, RM ? 0 : 350);
  }

  /* Owner Atlas card */
  function atlasCard(L) {
    $('a-unit').textContent = L.unit; $('a-tower').textContent = L.area + ' tower, floor ' + Math.floor(L.unit / 100);
    $('a-contact').textContent = pick(FR, ['Verified mobile', 'Verified mobile and email', 'Email on file']);
    $('a-next').textContent = pick(FR, ['WhatsApp sent by the agent', 'Call booked for tomorrow', 'Valuation link sent']);
  }

  /* ── Flow diagram ─────────────────────── */
  var NODES = {
    'src-bayut': ['Bayut', 'portal leads', 'src'], 'src-dubizzle': ['dubizzle', 'portal leads', 'src'], 'src-web': ['Website', 'your forms', 'src'],
    q: ['BRX qualifier', 'score · language', 'core'], sw: ['Switch', 'ON', 'sw'],
    calls: ['Calls', 'AI voice · company phones', 'wide'], msgs: ['Messages', 'iMessage · SMS · email · WhatsApp', 'wide'],
    atlas: ['Owner Atlas', 'digital twin · 3D', 'core'], links: ['Client links', '3D links · reports', ''],
    crm: ['CRM', 'every call logged', ''], ceo: ['CEO report', 'daily at 21:00', 'core']
  };
  var EDGES = [['src-bayut', 'q'], ['src-dubizzle', 'q'], ['src-web', 'q'], ['q', 'sw'], ['sw', 'calls'], ['sw', 'msgs'], ['calls', 'atlas'], ['msgs', 'atlas'], ['atlas', 'links'], ['links', 'crm'], ['links', 'ceo']];
  var LAY = {
    d: { w: 140, h: 58, dir: 'x', p: { 'src-bayut': [75, 70], 'src-dubizzle': [75, 180], 'src-web': [75, 290], q: [250, 180], sw: [425, 180], calls: [620, 95], msgs: [620, 265], atlas: [815, 180], links: [985, 180], crm: [1145, 95], ceo: [1145, 265] } },
    m: { w: 104, h: 58, dir: 'y', p: { 'src-bayut': [60, 40], 'src-dubizzle': [180, 40], 'src-web': [300, 40], q: [180, 150], sw: [180, 255], calls: [95, 365], msgs: [265, 365], atlas: [180, 475], links: [180, 585], crm: [95, 715], ceo: [265, 715] } }
  };
  var NS = 'http://www.w3.org/2000/svg';
  function flow(svgId, lay) {
    var svg = $(svgId); if (!svg) return; var out = '', W = lay.w, H = lay.h, wide = function (id) { if (lay.dir === 'x') return NODES[id][2] === 'wide' ? 196 : W; return lay.dir === 'y' && (id === 'q' || id === 'sw' || id === 'atlas' || id === 'links') ? 200 : (lay.dir === 'y' && (id === 'calls' || id === 'msgs' || id === 'crm' || id === 'ceo') ? 160 : W); };
    EDGES.forEach(function (e, i) {
      var a = lay.p[e[0]], b = lay.p[e[1]], d;
      if (lay.dir === 'x') { var x1 = a[0] + wide(e[0]) / 2, x2 = b[0] - wide(e[1]) / 2, mx = (x1 + x2) / 2; d = 'M' + x1 + ' ' + a[1] + ' C' + mx + ' ' + a[1] + ' ' + mx + ' ' + b[1] + ' ' + x2 + ' ' + b[1]; }
      else { var y1 = a[1] + H / 2, y2 = b[1] - H / 2, my = (y1 + y2) / 2; d = 'M' + a[0] + ' ' + y1 + ' C' + a[0] + ' ' + my + ' ' + b[0] + ' ' + my + ' ' + b[0] + ' ' + y2; }
      out += '<path class="fl-edge" d="' + d + '"/><path class="fl-run" d="' + d + '"/>';
      out += '<circle class="fl-pulse" r="3.2"><animateMotion dur="' + (2.2 + (i % 4) * .35) + 's" begin="' + (i * .37).toFixed(2) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
    });
    Object.keys(NODES).forEach(function (id) {
      var n = NODES[id], c = lay.p[id], cls = n[2] === 'wide' ? '' : n[2], w = wide(id), x = c[0] - w / 2, y = c[1] - H / 2;
      if (n[2] === 'sw') {
        out += '<g class="fl-node core" data-n="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + H + '" rx="4"/>' +
          '<text x="' + (x + 14) + '" y="' + (c[1] + 5) + '">' + n[0] + '</text>' +
          '<rect x="' + (x + w - 62) + '" y="' + (c[1] - 13) + '" width="48" height="26" rx="13" style="fill:#D9A84E;stroke:none"/><circle cx="' + (x + w - 27) + '" cy="' + c[1] + '" r="10" fill="#0B1019"/>' +
          '<text x="' + (x + w - 55) + '" y="' + (c[1] + 4) + '" style="font-size:10px;fill:#17110A;font-weight:800">ON</text></g>';
      } else {
        out += '<g class="fl-node ' + cls + '" data-n="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + H + '" rx="4"/>' +
          '<text x="' + (x + 12) + '" y="' + (y + 24) + '">' + n[0] + '</text><text class="s" x="' + (x + 12) + '" y="' + (y + 43) + '">' + (lay.dir === 'y' && n[1].length > 24 ? n[1].replace(' · email · WhatsApp', ' · more') : n[1]) + '</text></g>';
      }
    });
    svg.innerHTML = out;
  }
  function hit(id) {
    if (RM) return;
    document.querySelectorAll('.fl-node[data-n="' + id + '"]').forEach(function (g) { g.classList.add('hit'); setTimeout(function () { g.classList.remove('hit'); }, 900); });
  }

  /* ── Reports ──────────────────────────── */
  function bars() {
    var svg = $('bars'); if (!svg) return;
    var h = Math.floor(secNow() / 3600), max = Math.max.apply(null, S.perHour.concat([12])), out = '', bw = 480 / 24;
    for (var i = 0; i < 24; i++) {
      var v = S.perHour[i], fut = i > h, est = fut ? Math.round(HOURW[i] / 2.1 * max * .8) : v, bh = Math.max(fut ? 4 : 2, est / max * 180);
      out += '<rect class="bar' + (i === h ? ' now' : '') + (fut ? ' fut' : '') + '" x="' + (i * bw + 3) + '" y="' + (190 - bh) + '" width="' + (bw - 6) + '" height="' + bh + '" rx="1"><title>' + pad(i) + ':00 · ' + (fut ? 'ahead' : v + ' calls') + '</title></rect>';
      if (i % 3 === 0) out += '<text x="' + (i * bw + 3) + '" y="208">' + pad(i) + '</text>';
    }
    svg.innerHTML = out;
  }
  function ceo() {
    var t = dxb(), days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var dow = new Date(Date.UTC(t.y, t.mo - 1, t.d)).getUTCDay();
    $('ceo-date').textContent = days[dow] + ' ' + t.d + ' ' + mons[t.mo - 1] + ' · as of ' + pad(t.h) + ':' + pad(t.m);
    var top = 0; S.agentMeet.forEach(function (m, i) { if (m > S.agentMeet[top]) top = i; });
    var sl = S.slow ? S.slow.first + ' s, at ' + hms(S.slow.t).slice(0, 5) + (S.slow.voice ? ', the AI voice took it' : '') : 'none yet';
    var items = [
      S.leads + ' leads in. ' + S.leads + ' called. 0 left waiting.',
      'Median first call ' + median(S.firsts) + ' s. Slowest ' + sl + '.',
      S.meet + ' meetings booked. ' + S.deals + ' deals moved to contract.',
      'Bayut ' + S.src.bayut + ' · dubizzle ' + S.src.dubizzle + ' · website ' + S.src.web + '.',
      S.atlas + ' Owner Atlas lookups. ' + S.replies + ' owners replied.',
      S.agentMeet[top] ? 'Most meetings: ' + AGENTS[top].n + ' (' + S.agentMeet[top] + ').' : 'Meetings start after 09:00.'
    ];
    $('ceo-list').innerHTML = items.map(function (s) { return '<li></li>'; }).join('');
    var li = $('ceo-list').children; for (var i = 0; i < li.length; i++) li[i].textContent = items[i];
  }

  /* ── Live mode: #live + Defender cookie → real aggregate counts only ── */
  function getJSON(u) {
    return fetch(u, { credentials: 'include', cache: 'no-store' }).then(function (r) {
      if (!r.ok || (r.headers.get('content-type') || '').indexOf('json') < 0) throw new Error('no');
      return r.json();
    });
  }
  function goLive() {
    var B = 'https://defender.brxdxb.com/calls/';
    Promise.all([getJSON(B + 'api/index'), getJSON(B + 'now.json')]).then(function (res) {
      var idx = res[0], now = res[1], towers = 0, units = 0, owners = 0, mobiles = 0;
      if (!Array.isArray(idx)) throw new Error('shape');
      idx.forEach(function (c) { (c.buildings || []).forEach(function (b) { towers++; units += +b.units || 0; owners += +b.owners || 0; mobiles += +b.mobile || 0; }); });
      if (!towers) throw new Error('empty');
      liveMode = true;
      var tag = $('mode-tag'); tag.classList.add('is-live'); tag.lastChild.textContent = 'Live counts · BRX servers';
      var lab = function (id, v, t) { var el = $(id); el.dataset.v = v; el.textContent = v.toLocaleString('en-US'); el.nextElementSibling.textContent = t; };
      lab('c-leads', towers, 'towers mapped'); lab('c-calls', units, 'units mapped'); lab('c-msgs', owners, 'owners on file'); lab('c-atlas', mobiles, 'verified mobiles');
      var k = function (id, v, t, em) { var b = $(id), box = b.closest('.kpi'); b.innerHTML = ''; b.textContent = v; box.querySelector('span').textContent = t; box.querySelector('em').textContent = em; };
      k('k-first', towers, 'towers in the Owner Atlas', 'live count'); k('k-called', units.toLocaleString('en-US'), 'units mapped', 'live count');
      k('k-meet', owners.toLocaleString('en-US'), 'owners on file', 'names stay private'); k('k-deals', now && now.active ? (now.state === 'ringing' ? 'Ringing' : 'On a call') : 'Idle', 'dialer right now', 'live state');
      log.innerHTML = '';
      row(secNow(), 'atlas', 'Live', 'Owner Atlas · ' + towers + ' towers · ' + units.toLocaleString('en-US') + ' units mapped');
      var last = null;
      (function poll() {
        getJSON(B + 'now.json').then(function (n) {
          var s = n && n.active ? (n.state === 'ringing' ? 'Ringing' : 'On a call') : 'Idle';
          if (s !== last) { row(secNow(), 'call', 'Live', 'Dialer · ' + s.toLowerCase()); last = s; var el = $('k-deals'); if (el) el.textContent = s; }
        }).catch(function () {}).then(function () { setTimeout(poll, 10000); });
      })();
    }).catch(function () { /* stay in demo mode, silently */ });
  }

  /* ── Video and pause ──────────────────── */
  var vid = $('loop');
  if (vid) {
    if (RM) { vid.removeAttribute('autoplay'); vid.pause(); }
    else { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
  }
  var pb = $('pause');
  function setPaused(v) {
    paused = v; pb.setAttribute('aria-pressed', v ? 'true' : 'false'); pb.textContent = v ? 'Resume' : 'Pause';
    document.querySelectorAll('#flow svg').forEach(function (s) { if (s.pauseAnimations) v ? s.pauseAnimations() : s.unpauseAnimations(); });
    document.documentElement.classList.toggle('ag-paused', v);
    if (vid && !RM) { v ? vid.pause() : vid.play().catch(function () {}); }
  }
  if (pb) pb.addEventListener('click', function () { setPaused(!paused); });

  /* ── Boot ─────────────────────────────── */
  floor(); flow('flow-d', LAY.d); flow('flow-m', LAY.m);
  AGENTS.forEach(function (a, i) { statusFor(i, true); });
  seedFeed(); render();
  var c = $('clock'); setInterval(function () { c.textContent = hms(secNow()); }, 1000); c.textContent = hms(secNow());
  if (RM) setPaused(true); else { AGENTS.forEach(function (a, i) { agentLoop(i); }); fillerLoop(); }
  journey();
  setInterval(function () { if (!paused) bars(); }, 15000);
  if (location.hash === '#live') goLive();
  window.addEventListener('hashchange', function () { if (location.hash === '#live' && !liveMode) goLive(); });
})();
