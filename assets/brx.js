/* BRX·DXB shared behaviour: language toggle, mobile sheet, active nav, reveal. No dependencies. */
(function () {
  var root = document.documentElement;

  // ── Language (same data-en / data-ar mechanism as the original homepage) ──
  window.setLang = function (lang) {
    if (lang !== 'ar') lang = 'en';
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('data-lang', lang);
    var en = document.getElementById('btn-en'), ar = document.getElementById('btn-ar');
    if (en) { en.classList.toggle('active', lang === 'en'); en.setAttribute('aria-pressed', lang === 'en'); }
    if (ar) { ar.classList.toggle('active', lang === 'ar'); ar.setAttribute('aria-pressed', lang === 'ar'); }
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      var v = el.getAttribute('data-' + lang);
      if (v == null || v === '') return;
      if (v.indexOf('<') > -1) el.innerHTML = v; else el.textContent = v;
    });
    document.querySelectorAll('[data-' + lang + '-aria]').forEach(function (el) {
      el.setAttribute('aria-label', el.getAttribute('data-' + lang + '-aria'));
    });
    try { localStorage.setItem('brx-lang', lang); } catch (e) {}
    if (typeof window.onLangChange === 'function') window.onLangChange(lang);
  };

  // ── Mobile sheet ──
  var burger = document.getElementById('burger');
  var sheet = document.getElementById('sheet');
  function closeSheet() {
    root.classList.remove('nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (sheet) sheet.setAttribute('aria-hidden', 'true');
  }
  if (burger && sheet) {
    burger.addEventListener('click', function () {
      var open = !root.classList.contains('nav-open');
      root.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', String(open));
      sheet.setAttribute('aria-hidden', String(!open));
      if (open) { var f = sheet.querySelector('a'); if (f) f.focus(); }
    });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) closeSheet(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeSheet(); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) closeSheet(); });
  }

  // ── Active link: page-level (body[data-page]) or scroll-spy on the homepage ──
  function mark(key) {
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      var on = a.getAttribute('data-nav') === key;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  var page = document.body.getAttribute('data-page');
  if (page && page !== 'home') mark(page);
  if (page === 'home' && 'IntersectionObserver' in window) {
    var spy = { lab: 'lab', terminal: 'terminal', cta: 'contact', industries: 'industries' };
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
      var hit = null;
      ['cta', 'industries', 'terminal', 'lab'].some(function (id) { if (seen[id]) { hit = spy[id]; return true; } });
      mark(hit);
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(spy).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  // ── Reveal on scroll ──
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { ro.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // ── Cursor dot + magnetic buttons (fine pointers, motion allowed) ──
  var fine = window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine) {
    var dot = document.createElement('div'); dot.className = 'cursor'; dot.setAttribute('aria-hidden', 'true');
    dot.innerHTML = '<span></span>'; document.body.appendChild(dot);
    var lbl = dot.firstChild, mx = -100, my = -100, dx = -100, dy = -100, moving = false;
    document.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY; dot.classList.add('is-live');
      if (!moving) { moving = true; requestAnimationFrame(follow); }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { dot.classList.remove('is-live'); });
    function follow() {
      dx += (mx - dx) * 0.28; dy += (my - dy) * 0.28;
      dot.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
      if (Math.abs(mx - dx) + Math.abs(my - dy) > 0.3) requestAnimationFrame(follow); else moving = false;
    }
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest && e.target.closest('[data-cursor]');
      if (!t) return;
      var on = t.getAttribute('aria-checked') === 'true';
      lbl.textContent = t.getAttribute('data-cursor') === 'switch' ? (on ? 'OFF' : 'ON') : t.getAttribute('data-cursor');
      dot.classList.add('is-big');
    });
    document.addEventListener('pointerout', function (e) {
      var t = e.target.closest && e.target.closest('[data-cursor]');
      if (t && !t.contains(e.relatedTarget)) dot.classList.remove('is-big');
    });
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cursor="switch"]');
      if (t) setTimeout(function () { lbl.textContent = t.getAttribute('aria-checked') === 'true' ? 'OFF' : 'ON'; }, 0);
    });
    document.querySelectorAll('[data-magnetic]').forEach(function (b) {
      b.style.transition = 'transform .45s cubic-bezier(.2,.9,.3,1.3)';
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.28, y = (e.clientY - r.top - r.height / 2) * 0.35;
        b.style.transition = 'transform .12s ease-out';
        b.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      b.addEventListener('pointerleave', function () {
        b.style.transition = 'transform .45s cubic-bezier(.2,.9,.3,1.3)'; b.style.transform = '';
      });
    });
  }

  // ── Init language ──
  var saved = 'en';
  try { saved = localStorage.getItem('brx-lang') || 'en'; } catch (e) {}
  if (/[?&]lang=ar\b/.test(location.search)) saved = 'ar';
  if (/[?&]lang=en\b/.test(location.search)) saved = 'en';
  if (saved !== 'en') window.setLang(saved);
  else if (typeof window.onLangChange === 'function') window.onLangChange('en');
})();
