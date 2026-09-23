/* Homepage choreography: switch wake, film, pinned beats, count-ups, name ticker, lazy 3D, Lenis. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 961px)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var navH = function () { var n = document.getElementById('nav'); return n ? n.offsetHeight : 64; };
  var hasGsap = window.gsap && window.ScrollTrigger;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  var lang = function () { return root.lang === 'ar' ? 'ar' : 'en'; };

  /* ── 1. The switch wakes the hero ── */
  var hero = document.getElementById('hero');
  var wake = new BRXWake(hero, { seed: 20260923, alpha: 0.95, mortar: 0.08, duration: desktop ? 2600 : 2000, cols: function (w) { return w < 700 ? 22 : 40; } });
  var offScr = hero.querySelector('[data-hero="off"]'), onScr = hero.querySelector('[data-hero="on"]');
  var timerEl = document.getElementById('heroTimer'), countEl = document.getElementById('heroCount'), tick = null;
  function countTo(el, to, ms) {
    if (reduce) { el.textContent = to.toLocaleString('en-US'); return; }
    var t0 = performance.now();
    (function f(now) {
      var k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(2, -10 * k);
      el.textContent = Math.round(to * (k === 1 ? 1 : e)).toLocaleString('en-US');
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }
  hero.addEventListener('brx:switch', function (e) {
    var on = e.detail.on;
    offScr.classList.toggle('on', !on); onScr.classList.toggle('on', on);
    clearInterval(tick);
    if (on) {
      var s = 0; timerEl.textContent = '00:00';
      tick = setInterval(function () { s++; timerEl.textContent = '00:' + (s < 10 ? '0' : '') + (s % 60); if (s >= 59) s = 0; }, 1000);
      countTo(countEl, 37, 2600);
    } else countEl.textContent = '0';
  });

  /* ── 2. Film: desktop only, never on reduced motion or save-data, paused off-screen ── */
  if (!reduce && !saveData && window.matchMedia('(min-width: 961px)').matches) {
    var addFilm = function () {
      var v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.preload = 'auto';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
      v.poster = '/assets/brx-film-poster.jpg'; v.src = '/assets/brx-film.mp4';
      v.style.position = 'absolute'; v.style.inset = '0';
      hero.querySelector('.hero-film').appendChild(v);
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) v.play().catch(function () {}); else v.pause(); }); }).observe(hero);
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'film-toggle'; btn.setAttribute('aria-label', 'Pause background film');
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
      btn.addEventListener('click', function () {
        if (v.paused) { v.play(); btn.setAttribute('aria-label', 'Pause background film'); btn.classList.remove('paused'); }
        else { v.pause(); btn.setAttribute('aria-label', 'Play background film'); btn.classList.add('paused'); }
      });
      hero.appendChild(btn);
    };
    if ('requestIdleCallback' in window) requestIdleCallback(addFilm, { timeout: 1500 }); else setTimeout(addFilm, 600);
  }

  /* ── 3. Beats ── */
  var beats = [].slice.call(document.querySelectorAll('.beat'));
  var bScr = [].slice.call(document.querySelectorAll('#beatPhone .scr'));
  var rail = document.getElementById('rail');
  // Mobile, reduced motion, or no GSAP: every beat gets its own phone snapshot
  var pinBeats = desktop && !reduce && hasGsap;
  if (!pinBeats) {
    root.classList.add('beats-static');
    beats.forEach(function (b, i) {
      var slot = b.querySelector('.beat-phone'); if (!slot || !bScr[i]) return;
      var ph = document.createElement('div'); ph.className = 'phone';
      var sc = document.createElement('div'); sc.className = 'screen'; sc.innerHTML = '<div class="island"></div>';
      var c = bScr[i].cloneNode(true); c.classList.add('on'); sc.appendChild(c); ph.appendChild(sc); slot.appendChild(ph);
    });
  }
  var cur = -1;
  function setBeat(i) {
    if (i === cur) return; cur = i;
    beats.forEach(function (b, j) { b.classList.toggle('on', j === i); b.classList.toggle('past', j < i); });
    bScr.forEach(function (s, j) { s.classList.toggle('on', j === i); });
  }

  /* ── 4. Scroll: Lenis (fine pointers) + ScrollTrigger ── */
  function wireScroll(lenis) {
    if (!hasGsap) return;
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"], a[href^="/#"]');
        if (!a) return;
        var href = a.getAttribute('href'), onHome = location.pathname === '/' || location.pathname === '/index.html';
        if (href[0] === '/' && !onHome) return;
        var id = href.replace(/^\//, ''); if (id.length < 2) return;
        var el = document.querySelector(id); if (!el) return;
        e.preventDefault(); lenis.scrollTo(el, { offset: -navH() });
        history.replaceState(null, '', id);
      });
    }
    // Hero: pinned briefly on desktop so the wake plays in view; any scroll flips it on
    if (desktop && !reduce) {
      ScrollTrigger.create({ trigger: hero, start: function () { return 'top top+=' + navH(); }, end: '+=45%', pin: true, pinSpacing: true,
        onUpdate: function (s) { if (s.progress > 0.02) wake.set(true, 'scroll'); } });
    } else {
      ScrollTrigger.create({ trigger: hero, start: function () { return 'top+=24 top+=' + navH(); }, onEnter: function () { wake.set(true, 'scroll'); } });
    }
    if (pinBeats) {
      setBeat(0);
      ScrollTrigger.create({ trigger: '#how', start: function () { return 'top top+=' + navH(); }, end: '+=300%', pin: true, pinSpacing: true,
        onUpdate: function (s) { setBeat(Math.min(3, Math.floor(s.progress * 4))); gsap.set(rail, { scaleY: 0.25 + s.progress * 0.75 }); } });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  if (hasGsap && fine && !reduce) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
    s.onload = function () { wireScroll(new Lenis({ lerp: 0.11, wheelMultiplier: 1 })); };
    s.onerror = function () { wireScroll(null); };
    document.head.appendChild(s);
  } else wireScroll(null);

  /* ── 5. Owner numbers count up once, when they are read ── */
  var dds = [].slice.call(document.querySelectorAll('.ledger dd[data-count]'));
  if (!reduce && 'IntersectionObserver' in window) {
    dds.forEach(function (d) { if (d.getBoundingClientRect().top > window.innerHeight) d.textContent = '0'; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (!x.isIntersecting) return; io.unobserve(x.target);
        countTo(x.target, parseInt(x.target.getAttribute('data-count'), 10), 1800);
      });
    }, { threshold: 0.3 });
    dds.forEach(function (d) { io.observe(d); });
  }

  /* ── 6. Masked-name ticker (sample) ── */
  var N = {
    en: [['A••••a K.', 'owns 2 units in JVC'], ['D••••i V.', 'asked about off-plan, owns in Marina'], ['M•••d S.', 'owns a villa in Arabian Ranches'], ['W•i L.', 'asked about off-plan, owns in Downtown'], ['P•••a R.', 'owns in Business Bay'], ['O•••r H.', 'owns in Dubai Hills'], ['E•••a P.', 'asked about off-plan, owns in JLT'], ['Y••f A.', 'owns on Palm Jumeirah']],
    ar: [['A••••a K.', 'يملك وحدتين في JVC'], ['D••••i V.', 'سأل عن مشروع على الخارطة، يملك في مارينا'], ['M•••d S.', 'يملك فيلا في المرابع العربية'], ['W•i L.', 'سأل عن مشروع على الخارطة، يملك في وسط المدينة'], ['P•••a R.', 'يملك في الخليج التجاري'], ['O•••r H.', 'يملك في دبي هيلز'], ['E•••a P.', 'سأل عن مشروع على الخارطة، يملك في JLT'], ['Y••f A.', 'يملك في نخلة جميرا']]
  };
  var track = document.getElementById('namesTrack');
  function buildNames(l) {
    var items = N[l] || N.en, html = items.concat(items).map(function (n) { return '<span><b dir="ltr">' + n[0] + '</b>' + n[1] + '</span>'; }).join('');
    track.innerHTML = html;
  }
  buildNames(lang());
  window.onLangChange = function (l) { buildNames(l); };

  /* ── 7. 3D logo: load model-viewer only when the lab is near ── */
  var lab = document.getElementById('lab3d');
  if (lab && !saveData && 'IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; lio.disconnect();
      var m = document.createElement('script'); m.type = 'module';
      m.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
      document.head.appendChild(m);
      var mv = document.createElement('model-viewer');
      var attrs = { src: '/assets/brx-logo.glb', poster: '/assets/brx-logo-poster.png', alt: 'The BRX brick mark in green glass, drag to turn', 'camera-controls': '', 'disable-zoom': '', 'disable-pan': '', 'interaction-prompt': 'none', 'shadow-intensity': '1.1', exposure: '1.05', 'environment-image': 'neutral', 'camera-orbit': '30deg 78deg 105%', 'touch-action': 'pan-y' };
      if (!reduce) { attrs['auto-rotate'] = ''; attrs['auto-rotate-delay'] = '0'; attrs['rotation-per-second'] = '16deg'; }
      Object.keys(attrs).forEach(function (k) { mv.setAttribute(k, attrs[k]); });
      lab.innerHTML = ''; lab.appendChild(mv);
    }, { rootMargin: '600px 0px' });
    lio.observe(lab);
  }
})();
