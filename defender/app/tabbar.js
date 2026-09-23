/* Bottom tab bar for the installed Defender app — injected into pages that don't carry their own
   (the light Board/Leads/Pool pages and the owner call desk at /calls/). In standalone mode there is
   no browser back button, so every page needs a way home. Self-contained styles, prefixed brxt-. */
(function () {
  if (document.querySelector('nav.tabbar, nav.brxt')) return;
  const P = location.pathname.replace(/^.*\//,'/');
  const on = h => { if (h.includes('tab=owners')) return false; const f = P.split('/').pop() || 'index.html'; return f === h; };
  const I = {
    sw: '<rect x="2.5" y="7" width="19" height="10" rx="5"/><circle cx="16.5" cy="12" r="3"/>',
    ca: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    ow: '<path d="M4 21V6l8-3 8 3v15M9 21v-4h6v4M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01"/>',
    bo: '<path d="M4 5h16M4 12h16M4 19h10"/>'
  };
  const T = [['index.html', 'Switch', I.sw], ['call.html', 'Calls', I.ca], ['index.html?tab=owners', 'Owners', I.ow], ['board.html', 'Board', I.bo]];
  const st = document.createElement('style');
  st.textContent = `nav.brxt{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:grid;grid-template-columns:repeat(4,1fr);
    padding:7px 10px calc(env(safe-area-inset-bottom,0px) + 7px);background:rgba(10,14,26,.9);backdrop-filter:blur(18px);
    -webkit-backdrop-filter:blur(18px);border-top:1px solid #1e2740;font-family:-apple-system,system-ui,sans-serif}
    nav.brxt a{display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 0;color:#5c6889;text-decoration:none;font-size:10.5px;font-weight:700}
    nav.brxt a svg{width:23px;height:23px}nav.brxt a.on{color:#22c55e}
    body{padding-bottom:calc(env(safe-area-inset-bottom,0px) + 78px)!important}
    @media (max-width:760px){.app{grid-template-columns:1fr!important}.app>.side{display:none!important}}@media (min-width:761px){body:has(.app>.side) nav.brxt{display:none}body:has(.app>.side){padding-bottom:0!important}}`;
  const n = document.createElement('nav'); n.className = 'brxt'; n.setAttribute('aria-label', 'Sections');
  n.innerHTML = T.map(([h, l, i]) => `<a href="${h}"${on(h) ? ' class="on"' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">${i}</svg>${l}</a>`).join('');
  const go = () => { document.head.appendChild(st); document.body.appendChild(n); };
  document.body ? go() : document.addEventListener('DOMContentLoaded', go);
})();
