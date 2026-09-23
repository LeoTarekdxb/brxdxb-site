/* BRX Defender — DEMO MODE.
   Every /api/* call is answered here in the browser with made-up leads, so the app can be shown to
   anyone without exposing a single real client. Nothing leaves the phone; no CRM, no Galaxy. */
(function () {
  const FIRST = ["James","Sophie","Omar","Priya","Lukas","Aisha","Daniel","Mei","Karim","Elena","Noah","Fatima","Marco","Hannah","Yusuf","Chloe","Arjun","Leila","Tom","Sara","Viktor","Nadia","Ben","Amira","Ryan","Ines","Hassan","Grace","Felix","Maya"];
  const LAST = ["Walker","Haddad","Patel","Schmidt","Rahman","Rossi","Chen","Novak","Hughes","Khan","Silva","Morgan","Farah","Weber","Brooks","Nair","Costa","Evans","Aziz","Fischer"];
  const PLACES = [["United Kingdom","+44 7700 9"],["United States","+1 212 55"],["United Arab Emirates","+971 50 12"],["Germany","+49 151 2"],["India","+91 98 20"],["Italy","+39 347 1"],["Saudi Arabia","+966 55 3"]];
  const PROJ = ["Emaar Beachfront","Sobha Hartland II","Dubai Hills Estate","Palm Jebel Ali","Creek Harbour","Business Bay","Damac Lagoons","Meraas · Port de La Mer"];
  const STAGES = [["New Lead",60,10],["No Answer",1440,60],["Contacted",4320,120],["Qualified",5760,180],["Options Sent",7200,180],["Scheduled (Viewing/meeting)",21600,7200],["Offers / Final Negotiations",43200,14400]];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const leads = [];
  for (let i = 0; i < 64; i++) {
    const st = STAGES[Math.min(STAGES.length - 1, Math.floor(Math.pow(rnd(), 1.6) * STAGES.length))];
    const pl = pick(PLACES), left = Math.round(rnd() < .28 ? rnd() * st[2] : st[2] + rnd() * (st[1] - st[2]));
    leads.push({ id: "demo-" + i, name: pick(FIRST) + " " + pick(LAST), phone: pl[1] + String(10000 + Math.floor(rnd() * 89999)),
      email: "", stage: st[0], left_min: left, crit_min: st[2], timer_min: st[1], in_crit: left <= st[2],
      budget: [0, 900000, 1500000, 2400000, 3800000, 6500000][Math.floor(rnd() * 6)], country: pl[0],
      beds: pick(["", "1", "2", "3", "4"]), prop: pick(["Apartment", "Villa", "Townhouse", ""]), project: pick(PROJ), developer: "",
      portal_url: "#", touched: true });
  }
  leads.sort((a, b) => (b.in_crit - a.in_crit) || (a.left_min - b.left_min));
  const lost = Array.from({ length: 9 }, (_, i) => ({ id: "gone-" + i, name: pick(FIRST) + " " + pick(LAST), phone: pick(PLACES)[1] + "•••••",
    stage: pick(["Contacted", "No Answer"]), status: i === 4 ? "reassigned" : "lost", status_at: Date.now() / 1000 - i * 5400 - 1800 }));
  let crmOn = true, ownersOn = false, t0 = Date.now();
  const opener = l => `Hi ${l.name.split(" ")[0]}, it's Leo from BRX in Dubai. You asked about ${l.beds ? "a " + l.beds + " bed " + (l.prop || "home").toLowerCase() : "a home"} at ${l.project}. Have you got two minutes?`;
  // The demo always plays at 18:30 Dubai (+ real minutes since opening), when UK, Europe, the Gulf and
  // US East are all inside their calling hours — so the story on screen is always a sensible one.
  const localT = c => ({ "United Kingdom": -3, "United States": -8, "Germany": -2, "Italy": -2, "India": 1.5, "Saudi Arabia": -1 }[c] ?? 0);
  const demoMin = () => 18 * 60 + 30 + Math.floor((Date.now() - t0) / 60000);
  const hhmm = off => { const m = ((demoMin() + off * 60) % 1440 + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(Math.floor(m % 60)).padStart(2, "0"); };
  const callable = l => { const h = parseInt(hhmm(localT(l.country))); return h >= 10 && h < 19; };
  const card = (l, i) => ({ ...l, local: hhmm(localT(l.country)), left: l.left_min, crit: l.crit_min,
    want: [l.beds ? l.beds + " bed " + (l.prop || "") : l.prop, l.project, l.budget ? "AED " + l.budget.toLocaleString() : ""].filter(Boolean).join(" · "),
    opener: opener(l), calls: i % 3, talks: i % 4 === 1 ? 1 : 0,
    last_talk: i % 4 === 1 ? { ts: new Date(Date.now() - 3 * 864e5).toISOString(), dur: 184 } : null,
    notes: i % 3 === 0 ? [{ ts: new Date(Date.now() - 2 * 864e5).toISOString(), text: "Wants sea view, cash buyer, back in Dubai next month" }] : [] });
  const nowIdx = () => Math.floor((Date.now() - t0) / 20000) % 8;       // "calls" a new lead every 20s
  const galaxy = { online: true, how: "usb", battery: 86, call: "idle", say: "Galaxy on USB. Solid.", bridge_ready: true };
  const ownersNow = () => ownersOn ? { active: true, state: "call", owner: "Unit 2304 owner", phone: "+971 50 •••••", list: "business-bay/marquise-square-tower" }
                                   : { active: false, msg: "Ready — press ON to start" };
  const ctl = () => ({ galaxy, crm: { on: crmOn, dialing: crmOn, critical: leads.filter(l => l.in_crit).length, total: leads.length, last: [] },
    owners: { on: ownersOn, list: "business-bay/marquise-square-tower", now: ownersNow(),
      last: [["Unit 1802 owner", "talked", 212], ["Unit 3107 owner", "no answer", 0], ["Unit 905 owner", "talked", 95], ["Unit 4410 owner", "no answer", 0]]
        .map(([o, r, d], i) => ({ owner: o, result: r, duration: d, ts: new Date(Date.now() - (i + 1) * 1500e3).toISOString().replace("T", " ") })) } });
  const today = new Date(Date.now() + 4 * 3600e3).toISOString().slice(0, 10);
  const routes = {
    "/api/ctl": () => ctl(),
    "/api/power": () => ({ on: true }),
    "/api/board": () => ({ ts: Date.now() / 1000, age_s: 30, err: null, power: true, paused: false, total: leads.length,
      in_crit: leads.filter(l => l.in_crit).length, leads }),
    "/api/ledger": () => ({ counts: { active: leads.length, lost: 8, reassigned: 1 }, per_day: { [today]: { assigned: 11, lost: 2, reassigned: 1 } }, gone: lost }),
    "/api/prep": () => { const c = leads.filter(l => l.left_min < 4000 && callable(l)).slice(0, 9).map(card), k = nowIdx();
      return { now: crmOn ? c[k] : null, next: c.filter((_, i) => i !== k).slice(0, 6), dialer_order: true, galaxy, crm_on: crmOn }; }
  };
  const real = window.fetch.bind(window);
  window.fetch = async (url, opt = {}) => {
    const u = new URL(url, location.href);
    if (!u.pathname.startsWith("/api/")) return real(url, opt);
    if ((opt.method || "GET").toUpperCase() === "POST" && u.pathname === "/api/ctl") {
      try { const b = JSON.parse(opt.body || "{}"); b.which === "crm" ? (crmOn = !!b.on, t0 = Date.now()) : (ownersOn = !!b.on); } catch (e) {}
    }
    const f = routes[u.pathname];
    return new Response(JSON.stringify(f ? f() : { error: "demo" }), { status: f ? 200 : 404, headers: { "Content-Type": "application/json" } });
  };
  document.addEventListener("DOMContentLoaded", () => {
    const b = document.createElement("div");
    b.textContent = "DEMO · sample leads, no real clients";
    b.style.cssText = "position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 74px);left:50%;transform:translateX(-50%);z-index:2147483001;" +
      "font:700 10.5px -apple-system,system-ui;letter-spacing:.06em;color:#e0b25a;background:rgba(10,14,26,.92);border:1px solid rgba(224,178,90,.35);" +
      "padding:4px 10px;border-radius:999px;pointer-events:none;white-space:nowrap";
    document.body.appendChild(b);
  });
})();
