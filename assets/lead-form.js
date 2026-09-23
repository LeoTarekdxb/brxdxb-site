/* BRX free-month lead form. Shared by every page that includes _partials/leadform.html.
   One endpoint, one WhatsApp fallback, one Stripe link. No dependencies, no cookies, no tracking. */
(function () {
  var LEAD_ENDPOINT = 'https://defender.brxdxb.com/api/lead';
  // Stripe Payment Link for the AED 50,000 set-up. Empty = the pay button stays hidden on every page.
  var STRIPE_SETUP_URL = '';
  var FALLBACK_WA = 'https://wa.me/971558917770?text=';

  var form = document.getElementById('leadForm');
  if (!form) return;
  var done = document.getElementById('leadDone');
  var err = document.getElementById('lf-err');
  var btn = document.getElementById('lf-submit');
  var payBtn = document.getElementById('payBtn');
  var payRow = document.getElementById('payRow');

  if (STRIPE_SETUP_URL && payBtn && payRow) {
    payBtn.href = STRIPE_SETUP_URL;
    payRow.hidden = false;
    payBtn.addEventListener('click', function () { emit('pay'); });
  }
  window.BRX_PAY_READY = !!STRIPE_SETUP_URL;

  function ar() { return document.documentElement.lang === 'ar'; }
  function v(id) { return (document.getElementById(id).value || '').trim(); }
  function emit(step) { document.dispatchEvent(new CustomEvent('brx:lead', { detail: { step: step } })); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    var payload = {
      first: v('lf-first'), last: v('lf-last'), phone: v('lf-phone'), email: v('lf-email'),
      role: v('lf-role'), agency: v('lf-agency'), agents: v('lf-agents'), source: v('lf-source'), why: v('lf-why'),
      page: location.pathname, lang: document.documentElement.lang
    };
    if (!payload.first || !payload.phone || !payload.email || !payload.role || !payload.why) {
      err.textContent = ar() ? 'الاسم، الهاتف، البريد، دورك وما تريد حلّه — مطلوبة.' : 'Name, phone, email, your role and what to fix are required.';
      err.hidden = false;
      return;
    }
    btn.disabled = true;
    var label = btn.textContent;
    btn.textContent = ar() ? 'جارٍ الإرسال…' : 'Sending…';
    fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.message) || 'failed');
        form.hidden = true;
        done.hidden = false;
        done.focus({ preventScroll: true });
        done.scrollIntoView({ behavior: 'smooth', block: 'center' });
        emit('sent');
      })
      .catch(function () {
        var wa = FALLBACK_WA + encodeURIComponent(
          'Free month request — ' + payload.first + ' ' + payload.last + ', ' + payload.role + (payload.agency ? ' at ' + payload.agency : '') +
          (payload.agents ? ' (' + payload.agents + ' agents)' : '') + '. Phone ' + payload.phone + ', email ' + payload.email + '. Fix: ' + payload.why);
        err.textContent = ar() ? 'تعذّر الإرسال. ' : 'Could not send. ';
        var a = document.createElement('a');
        a.className = 'link'; a.target = '_blank'; a.rel = 'noopener'; a.href = wa;
        a.textContent = ar() ? 'أرسلها عبر واتساب بدلاً من ذلك' : 'Send it on WhatsApp instead';
        err.appendChild(a); err.appendChild(document.createTextNode('.'));
        err.hidden = false; btn.disabled = false; btn.textContent = label;
      });
  });
})();
