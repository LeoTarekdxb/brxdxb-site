/* BRX Defender — the ON/OFF switch + install-as-app glue, shared by every page.
   Injects a fixed power pill top-right. ON  = live monitoring (the cockpit
   reads your board every 60s). OFF = dormant, reads nothing. It only ever
   toggles READING — it never writes to the CRM. Persisted server-side. */
(function () {
  // ---- register the service worker so the app is installable ----
  if ('serviceWorker' in navigator) {
    /* demo: no service worker */
  }

  // ---- build the switch ----
  const pill = document.createElement('button');
  pill.id = 'pwr';
  pill.className = 'pwr';
  pill.setAttribute('aria-label', 'Toggle live monitoring');
  pill.innerHTML = '<span class="dot"></span><span class="lbl">…</span>';
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(pill));
  if (document.body) document.body.appendChild(pill);

  let on = true, busy = false;
  function paint() {
    pill.classList.toggle('off', !on);
    pill.querySelector('.lbl').textContent = on ? 'LIVE' : 'OFF';
  }
  async function read() {
    try { on = (await fetch('/api/power', { cache: 'no-store' }).then(r => r.json())).on; }
    catch (e) {} paint();
  }
  async function toggle() {
    if (busy) return; busy = true;
    const want = on ? 0 : 1;
    try {
      on = (await fetch('/api/power', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'on=' + want
      }).then(r => r.json())).on;
    } catch (e) {}
    busy = false; paint();
    if (window.__brxReload) window.__brxReload();   // let the page refresh its board at once
  }
  pill.addEventListener('click', toggle);
  read();
  window.__brxPower = () => on;

  // ---- native "Install app" prompt (Android/desktop Chrome) ----
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferred = e;
    const b = document.createElement('button');
    b.className = 'install'; b.textContent = 'Install app';
    b.onclick = async () => { b.remove(); deferred.prompt(); deferred = null; };
    document.body.appendChild(b);
  });
})();
