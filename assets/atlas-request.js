/* Owner Atlas: open the request dialog, post the 4 fields, fall back to WhatsApp. No cookies, no trackers. */
(function () {
  var ENDPOINT = 'https://defender.brxdxb.com/api/atlas-request';
  var dlg = document.getElementById('atlasDlg'), open = document.getElementById('atlasOpen');
  if (!dlg || !open) return;
  var form = document.getElementById('atlasForm'), done = document.getElementById('atlasDone');
  var err = document.getElementById('ar-err'), btn = document.getElementById('ar-submit');
  var ar = function () { return document.documentElement.lang === 'ar'; };
  var v = function (id) { return (document.getElementById(id).value || '').trim(); };

  function show() {
    err.hidden = true;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    setTimeout(function () { (form.hidden ? done.querySelector('.x') : document.getElementById('ar-first')).focus(); }, 30);
  }
  function hide() { if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open'); open.focus(); }
  open.addEventListener('click', show);
  dlg.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', hide); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) hide(); });

  // Subtle parallax on the preview: fine pointers only, never with reduced motion.
  var shot = document.getElementById('atlasShot');
  if (shot && matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shot.addEventListener('pointermove', function (e) {
      var r = shot.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      shot.style.setProperty('--px', (-x * 14).toFixed(1) + 'px');
      shot.style.setProperty('--py', (-y * 10).toFixed(1) + 'px');
    });
    shot.addEventListener('pointerleave', function () { shot.style.setProperty('--px', '0px'); shot.style.setProperty('--py', '0px'); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault(); err.hidden = true;
    var p = { first: v('ar-first'), last: v('ar-last'), email: v('ar-email'), phone: v('ar-phone'),
              seller: document.getElementById('ar-seller').checked, page: location.pathname, lang: document.documentElement.lang };
    var digits = p.phone.replace(/\D/g, '');
    if (!p.first || !p.last || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email) || digits.length < 9 || digits === '971') {
      err.textContent = ar() ? 'نحتاج الاسم الأول واسم العائلة وبريداً صحيحاً ورقم هاتف.' : 'We need your first name, surname, a valid email and a phone number.';
      err.hidden = false; return;
    }
    btn.disabled = true; var label = btn.textContent; btn.textContent = ar() ? 'جارٍ الإرسال…' : 'Sending…';
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.message) || 'failed');
        form.hidden = true; done.hidden = false; done.querySelector('.x').focus();
      })
      .catch(function () {
        var wa = 'https://wa.me/971558917770?text=' + encodeURIComponent('Owner Atlas access request: ' + p.first + ' ' + p.last +
          ', ' + p.phone + ', ' + p.email + (p.seller ? '. I sell property in Dubai.' : '.'));
        err.innerHTML = (ar() ? 'تعذّر الإرسال. ' : 'Could not send. ') + '<a class="link" target="_blank" rel="noopener" href="' + wa + '">' +
          (ar() ? 'أرسله عبر واتساب بدلاً من ذلك' : 'Send it on WhatsApp instead') + '</a>.';
        err.hidden = false; btn.disabled = false; btn.textContent = label;
      });
  });
})();
