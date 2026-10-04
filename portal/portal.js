/* BRX Portal — static shell. Holds no data: everything comes from the API after sign-in. */
(() => {
"use strict";
const API = /(^|\.)brxdxb\.com$/.test(location.hostname) ? "https://defender.brxdxb.com/api/portal" : "/api/portal";
const $ = (s, el = document) => el.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = n => (n == null || n === "") ? "—" : Number(n).toLocaleString("en-US");
const num = n => fmt(n == null || n === "" ? 0 : n);  // home counts: nothing yet reads 0, not a dash
const day = ts => ts ? new Date(ts * 1000).toLocaleDateString(L() === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const store = { get(k) { try { return sessionStorage.getItem(k) || localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v, keep) { try { (keep ? localStorage : sessionStorage).setItem(k, v); } catch (e) {} },
  del(k) { try { sessionStorage.removeItem(k); localStorage.removeItem(k); } catch (e) {} } };
let lang = (() => { try { return localStorage.getItem("brxp_lang") || "en"; } catch (e) { return "en"; } })();
const L = () => lang;
let token = store.get("brxp_t"), me = null;

/* ── words ─────────────────────────────────────────────────────────── */
const W = {
  en: { signin: "Sign in", email: "Email", password: "Password", keep: "Keep me signed in on this device", code: "6-digit code",
    tag: "Your AI sales desk.", tagp: "Leads, owners, calls, outreach and every CRM you ever used, in one private place.",
    home: "Home", leads: "Leads", unassigned: "Unassigned / New", calendar: "Calendar", developers: "Developer contacts",
    email_: "Email engine", requests: "Requests", marketing: "Marketing", plug: "Plug your CRM", accounts: "Accounts", team: "Team",
    settings: "Settings", more: "More", signout: "Sign out", work: "Work", reach: "Reach", business: "Business", open: "Open",
    search: "Search name, phone or project", all: "All", none: "Nothing here yet.", loading: "Loading…", offline: "Server offline. Try again in a minute.",
    setup_t: "Choose your password", setup_p: "This link works once. Nobody at BRX will ever know this password.", repeat: "Repeat it",
    save: "Save and sign in", mismatch: "The two passwords are not the same.", copy: "Copy", copied: "Copied",
    lists_empty: "No lists yet.", lists_empty_p: "Plug your CRM and your lists show up here, with owners counted.", lists_go: "Plug your CRM", pipe_empty: "No one in the pipeline yet.",
    desk: "The desk", desk_p: "These pages stay on the call desk and ask for its PIN.", next: "Next", back: "Back", hi: "Good to see you, Leo.", hi_p: "Your desk, your owners, your outreach and your licensees. Numbers are live from the mini.", k_people: "People in your CRM", k_worked: "Being worked (not Prospect)", k_due: "Follow-ups due in 24 h", k_new: "New, never touched", k_req: "Requests waiting", k_lic: "Licensee accounts", pipeline: "Pipeline", lists: "Lists in your CRM", recent: "Recent imports", plug_p: "Bring every record out of your old CRM into BRX. Each one is kept exactly as it came, then matched, de-duplicated and checked against Dubai owner records. Run it again any time: nothing doubles.", drop: "Drop your CRM export here", drop_p: "CSV, Excel, JSON or XML, up to 60 MB. Or tap to pick the file.", direct: "Or connect the CRM directly", direct_p: "Paste your own key. We only read. We never write to your old CRM.", history: "History", t_leads: "Leads", t_new: "New" },
  ar: { signin: "تسجيل الدخول", email: "البريد الإلكتروني", password: "كلمة المرور", keep: "إبقني مسجلاً على هذا الجهاز", code: "رمز من 6 أرقام",
    tag: "مكتب مبيعاتك الذكي.", tagp: "العملاء والملاك والمكالمات والتواصل وكل نظام CRM استخدمته، في مكان خاص واحد.",
    home: "الرئيسية", leads: "العملاء", unassigned: "غير مسند / جديد", calendar: "التقويم", developers: "جهات المطورين",
    email_: "محرك البريد", requests: "الطلبات", marketing: "التسويق", plug: "اربط نظامك", accounts: "الحسابات", team: "الفريق",
    settings: "الإعدادات", more: "المزيد", signout: "تسجيل الخروج", work: "العمل", reach: "التواصل", business: "الأعمال", open: "فتح",
    search: "ابحث بالاسم أو الهاتف أو المشروع", all: "الكل", none: "لا شيء هنا بعد.", loading: "جارٍ التحميل…", offline: "الخادم غير متاح. حاول بعد دقيقة.",
    setup_t: "اختر كلمة المرور", setup_p: "يعمل هذا الرابط مرة واحدة. لن يعرف أحد في BRX كلمة المرور.", repeat: "أعدها",
    save: "احفظ وادخل", mismatch: "كلمتا المرور غير متطابقتين.", copy: "نسخ", copied: "تم النسخ",
    lists_empty: "لا توجد قوائم بعد.", lists_empty_p: "اربط نظامك وستظهر قوائمك هنا مع عدد الملّاك.", lists_go: "اربط نظامك", pipe_empty: "لا أحد في المسار بعد.",
    desk: "المكتب", desk_p: "هذه الصفحات على مكتب الاتصال وتطلب الرمز.", next: "التالي", back: "رجوع" } };
const t = k => (W[lang] && W[lang][k]) || W.en[k] || k;

/* ── icons ─────────────────────────────────────────────────────────── */
const P = { home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z", leads: "M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0M12 7a3 3 0 1 0 0 .01",
  unassigned: "M12 5v14M5 12h14", calendar: "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4", developers: "M4 21V7l8-4 8 4v14M9 21v-6h6v6",
  email_: "M3 6h18v12H3zM3 7l9 7 9-7", requests: "M5 4h14v16l-7-4-7 4z", marketing: "M4 10v4l12 5V5zM16 9a3 3 0 0 1 0 6",
  plug: "M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4", accounts: "M3 21h18M5 21V10l7-5 7 5v11M10 21v-5h4v5", team: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M21 20a6 6 0 0 0-4-5.6",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
  more: "M5 12h.01M12 12h.01M19 12h.01", out: "M15 12H3M11 8l-4 4 4 4M15 4h5v16h-5" };
const ico = k => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[k] || P.more}"/></svg>`;
const MARK = `<svg viewBox="12 10 108 70" aria-hidden="true"><path d="M28 12 H92 a26 26 0 0 1 0 52 H40 a26 26 0 0 1 -26 -26 v0 a26 26 0 0 1 26 -26 Z" fill="#86BC25"/><path d="M30 64 L30 78 L44 64 Z" fill="#86BC25"/><circle cx="86" cy="38" r="17" fill="#FFFFFF"/></svg>`;
const OK_MARK = `<svg viewBox="12 10 108 70" aria-hidden="true"><path d="M28 12 H92 a26 26 0 0 1 0 52 H40 a26 26 0 0 1 -26 -26 v0 a26 26 0 0 1 26 -26 Z" fill="#43B02A"/><path d="M30 64 L30 78 L44 64 Z" fill="#43B02A"/><circle cx="86" cy="38" r="17" fill="#FFFFFF"/></svg>`;

/* ── api ───────────────────────────────────────────────────────────── */
async function api(path, opt = {}) {
  const h = { ...(opt.headers || {}) };
  if (token) h.Authorization = "Bearer " + token;
  let body = opt.body;
  if (body && !(body instanceof Blob) && !(body instanceof ArrayBuffer)) { h["Content-Type"] = "application/json"; body = JSON.stringify(body); }
  let r;
  try { r = await fetch(API + path, { method: opt.method || (body ? "POST" : "GET"), headers: h, body, cache: "no-store" }); }
  catch (e) { throw new Error(t("offline")); }
  if (opt.blob) { if (!r.ok) throw new Error("HTTP " + r.status); return r; }
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (r.status === 401 && token && !path.startsWith("/auth/")) { signout(true); throw new Error("Sign in again."); }
  if (r.status === 502) throw new Error(t("offline"));
  j._status = r.status;
  return j;
}
function toast(msg) { const d = document.createElement("div"); d.className = "toast"; d.textContent = msg; document.body.append(d); setTimeout(() => d.remove(), 2600); }
async function copy(text) { try { await navigator.clipboard.writeText(text); toast(t("copied")); } catch (e) { prompt(t("copy"), text); } }
function setLang(l) {
  lang = l; try { localStorage.setItem("brxp_lang", l); } catch (e) {}
  document.documentElement.lang = l; document.documentElement.dir = l === "ar" ? "rtl" : "ltr"; route();
}
const langBtns = () => `<div class="lang" role="group" aria-label="Language"><button type="button" data-lang="en" aria-pressed="${lang === "en"}">EN</button><button type="button" data-lang="ar" lang="ar" aria-pressed="${lang === "ar"}">AR</button></div>`;
document.addEventListener("click", e => { const b = e.target.closest("[data-lang]"); if (b) setLang(b.dataset.lang); const c = e.target.closest("[data-copy]"); if (c) copy(c.dataset.copy); });

/* ── auth screens ──────────────────────────────────────────────────── */
function authFrame(form) {
  $("#app").innerHTML = `<div class="auth"><section class="art"><div class="row" style="justify-content:space-between"><a class="brand" href="/">${MARK}<b>BRX</b></a>${langBtns()}</div>
    <div><svg class="bigswitch" viewBox="12 10 108 70" aria-hidden="true"><path class="pill-bg" d="M28 12 H92 a26 26 0 0 1 0 52 H40 a26 26 0 0 1 -26 -26 v0 a26 26 0 0 1 26 -26 Z" fill="#86BC25"/><path d="M30 64 L30 78 L44 64 Z" fill="#86BC25" class="pill-bg"/><circle class="knob" cx="86" cy="38" r="17" fill="#FFFFFF"/></svg>
    <h1>${t("tag")}</h1><p>${t("tagp")}</p></div><p class="small muted foot">Dubai · ${new Date().getFullYear()}</p></section>${form}</div>`;
}
function login(msg = "") {
  authFrame(`<form id="lf" autocomplete="on" novalidate><h2>${t("signin")}</h2><p class="err" id="le">${esc(msg)}</p>
    <label class="f"><span>${t("email")}</span><input class="i" name="email" type="email" autocomplete="username" required dir="ltr"></label>
    <label class="f"><span>${t("password")}</span><input class="i" name="password" type="password" autocomplete="current-password" required dir="ltr"></label>
    <label class="f" id="codebox" hidden><span>${t("code")}</span><input class="i" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" dir="ltr"></label>
    <label class="row small" style="margin:6px 0 18px"><input type="checkbox" name="keep"> ${t("keep")}</label>
    <button class="btn g" style="width:100%">${t("signin")}</button></form>`);
  const f = $("#lf");
  f.addEventListener("submit", async e => {
    e.preventDefault(); const b = f.querySelector("button"); b.disabled = true; $("#le").textContent = "";
    try {
      const j = await api("/auth/login", { body: { email: f.email.value, password: f.password.value, code: f.code.value, keep: f.keep.checked } });
      if (j.ok) { token = j.token; store.set("brxp_t", token, f.keep.checked); me = null; location.hash = "#/home"; return boot(); }
      if (j.needs_totp) { $("#codebox").hidden = false; f.code.focus(); }
      $("#le").textContent = j.error || "Could not sign in.";
    } catch (err) { $("#le").textContent = err.message; }
    b.disabled = false;
  });
  setTimeout(() => { const s = $(".bigswitch"); if (s) { s.classList.add("off"); setTimeout(() => s.classList.remove("off"), 700); } }, 400);
}
async function setup(tok) {
  authFrame(`<form id="sf" novalidate><p class="eyebrow">BRX Portal</p><h2>${t("setup_t")}</h2><p class="muted small" id="se">${t("loading")}</p></form>`);
  let info; try { info = await api("/auth/setup?t=" + encodeURIComponent(tok)); } catch (e) { info = { ok: false, error: e.message }; }
  const f = $("#sf");
  if (!info.ok) { f.innerHTML = `<h2>${t("setup_t")}</h2><p class="note bad">${esc(info.error)}</p><p style="margin-top:16px"><a class="btn ghost" href="#/">${t("signin")}</a></p>`; return; }
  f.innerHTML = `<p class="eyebrow">BRX Portal</p><h2>${t("setup_t")}</h2><p class="muted small">${t("setup_p")}</p>
    <p style="margin:14px 0"><span class="pill ok" dir="ltr">${esc(info.email)}</span></p><p class="err" id="se"></p>
    <input type="email" name="u" value="${esc(info.email)}" autocomplete="username" hidden>
    <label class="f"><span>${t("password")} · 12+</span><input class="i" name="p1" type="password" autocomplete="new-password" minlength="12" dir="ltr"></label>
    <label class="f"><span>${t("repeat")}</span><input class="i" name="p2" type="password" autocomplete="new-password" dir="ltr"></label>
    <button class="btn g" style="width:100%">${t("save")}</button>`;
  f.addEventListener("submit", async e => {
    e.preventDefault();
    if (f.p1.value !== f.p2.value) { $("#se").textContent = t("mismatch"); return; }
    const j = await api("/auth/setup", { body: { token: tok, password: f.p1.value } });
    if (!j.ok) { $("#se").textContent = j.error; return; }
    token = j.token; store.set("brxp_t", token, false); history.replaceState(null, "", location.pathname + "#/settings"); boot();
  });
}
async function signout(expired) {
  if (!expired && token) { try { await api("/auth/logout", { method: "POST", body: {} }); } catch (e) {} }
  token = null; me = null; store.del("brxp_t"); history.replaceState(null, "", location.pathname + "#/"); login(expired ? "Your session ended. Sign in again." : "");
}

/* ── shell ─────────────────────────────────────────────────────────── */
const GROUPS = [["work", ["home", "leads", "unassigned", "calendar"]], ["reach", ["developers", "email_", "requests", "marketing"]],
                ["business", ["plug", "accounts", "team", "settings"]]];
const modKey = m => m === "email" ? "email_" : m;
const routeOf = k => k === "email_" ? "email" : k;
function shell(active, body) {
  const mods = (me.modules || []).map(modKey);
  const side = GROUPS.map(([g, ks]) => { const ok = ks.filter(k => mods.includes(k)); return ok.length ? `<h6>${t(g)}</h6>` +
    ok.map(k => `<a href="#/${routeOf(k)}" ${active === k ? 'aria-current="page"' : ""}>${ico(k)}<span>${t(k)}</span></a>`).join("") : ""; }).join("");
  const tabs = ["home", "leads", "plug", mods.includes("accounts") ? "accounts" : "team", "more"];
  $("#app").innerHTML = `<header class="top"><a class="brand" href="#/home">${MARK}<b>BRX</b><span>Portal</span></a><div class="grow"></div>
    <span class="who">${esc(me.tenant.name)} · ${esc(me.user ? me.user.email : "")}</span>${langBtns()}
    <button class="btn ghost sm" id="so" title="${t("signout")}">${ico("out")}<span class="sr">${t("signout")}</span></button></header>
    <div class="shell"><nav class="side" aria-label="Portal">${side}</nav><main id="main" tabindex="-1">${body}</main></div>
    <nav class="tabbar" aria-label="Portal">${tabs.map(k => `<a href="#/${routeOf(k)}" ${active === k || (k === "more" && !tabs.includes(active)) ? 'aria-current="page"' : ""}>${ico(k)}<span>${t(k)}</span></a>`).join("")}</nav>`;
  $("#so").onclick = () => signout(false);
}
const loadingView = () => `<p class="muted">${t("loading")}</p>`;
function fail(e) { const m = $("#main"); if (m) m.innerHTML = `<div class="note bad">${esc(e.message || e)}</div>`; }

/* ── views ─────────────────────────────────────────────────────────── */
const STAGE_COL = { Prospect: "#DDE3D3", New: "#86BC25", "No answer": "#C9D7A8", Contacted: "#43B02A", "Options sent": "#6FA31F", Viewing: "#3F6E0E",
  Negotiating: "#254A05", Won: "#111111", "On hold": "#B9B9B9", Lost: "#E3E3E3" };
const V = {};

V.home = async () => {
  const d = await api("/home"); const own = me.tenant.kind === "owner";
  let h = `<p class="eyebrow">${esc(me.tenant.name)}</p><h1>${own ? t("hi") : esc(me.tenant.name)}</h1>
    <p class="lede">${own ? t("hi_p") : "Your leads, your pipeline, your team."}</p>`;
  if (own) {
    const st = d.stages || {}; const work = Object.entries(st).filter(([s]) => s !== "Prospect");
    const tot = work.reduce((a, [, n]) => a + n, 0) || 1;
    h += `<div class="kpis">
      <a class="kpi" href="#/leads"><div class="num">${num(d.people)}</div><div class="l">${t("k_people")}</div></a>
      <a class="kpi" href="#/leads?stage=New"><div class="num">${num(tot === 1 ? 0 : tot)}</div><div class="l">${t("k_worked")}</div></a>
      <a class="kpi" href="#/calendar"><div class="num">${num(d.due)}</div><div class="l">${t("k_due")}</div></a>
      <a class="kpi" href="#/unassigned"><div class="num">${num(d.untouched_new)}</div><div class="l">${t("k_new")}</div></a>
      <a class="kpi" href="#/requests"><div class="num">${num(d.requests)}</div><div class="l">${t("k_req")}</div></a>
      <a class="kpi" href="#/accounts"><div class="num">${num(d.tenants)}</div><div class="l">${t("k_lic")}</div></a></div>
      <h2>${t("pipeline")}</h2>${work.length ? `<div class="bar">${work.map(([s, n]) => `<i style="width:${100 * n / tot}%;background:${STAGE_COL[s] || "#ccc"}" title="${esc(s)} ${n}"></i>`).join("")}</div>
      <div class="legend">${work.map(([s, n]) => `<span><b style="background:${STAGE_COL[s] || "#ccc"}"></b>${esc(s)} ${num(n)}</span>`).join("")}</div>` : `<p class="muted">${t("pipe_empty")}</p>`}
      <h2>${t("desk")}</h2><p class="muted small" style="margin:-4px 0 12px">${t("desk_p")}</p>
      <div class="cards">${(d.links || []).map(l => `<a class="card" href="${esc(l.url)}" target="_blank" rel="noopener"><h3>${esc(lang === "ar" ? l.ar : l.en)}</h3><p>${esc(lang === "ar" && l.what_ar ? l.what_ar : l.what)}</p></a>`).join("")}</div>
      <h2>${t("lists")}</h2>${(d.crm_tabs || []).length ? `<div class="list">${d.crm_tabs.map(x => `<div class="li"><span class="t">${esc(x.label)}</span><span class="s">${num(x.owners)} owners · ${num(x.sharks)} big owners</span><span class="r">${num(x.n)}</span></div>`).join("")}</div>`
        : `<div class="note"><b>${t("lists_empty")}</b> ${t("lists_empty_p")} <a href="#/plug">${t("lists_go")}</a></div>`}`;
  } else {
    h += `<div class="kpis"><a class="kpi" href="#/leads"><div class="num">${num(d.leads)}</div><div class="l">${t("t_leads")}</div></a>
      <a class="kpi" href="#/unassigned"><div class="num">${num(d.new)}</div><div class="l">${t("t_new")}</div></a></div>
      ${d.leads ? "" : `<div class="note" style="margin-top:18px"><b>Start here.</b> Bring your leads in with <a href="#/plug">Plug your CRM</a>. Nothing is lost: every record is kept as it came.</div>`}`;
  }
  if ((d.migrations || []).length) h += `<h2>${t("recent")}</h2>${migList(d.migrations)}`;
  return h;
};

function leadRow(r, own) {
  const right = own ? `<span class="pill ${r.stage === "Won" ? "ok" : r.stage === "Lost" ? "bad" : ""}">${esc(r.stage || "")}</span><br><span class="muted">${r.tier ? "Tier " + esc(r.tier) : ""}</span>`
    : `<span class="pill">${esc(r.stage || "")}</span>`;
  const sub = [r.phone, r.project, r.ownership && r.ownership !== "No DLD record" ? r.ownership : "", r.owner_line, r.call_window].filter(Boolean).map(esc).join(" · ");
  return `<button class="li" type="button" data-lead="${esc(r.key || r.id)}"><span class="t">${esc(r.name || "No name")}</span><span class="s" dir="auto">${sub || "&nbsp;"}</span><span class="r">${right}</span></button>`;
}
V.leads = async (q) => {
  const own = me.tenant.kind === "owner"; const src = q.src || (own ? "desk" : "imported");
  const d = await api(`/leads?q=${encodeURIComponent(q.q || "")}&stage=${encodeURIComponent(q.stage || "")}&offset=${+q.offset || 0}&src=${src}`);
  const stages = own && src === "desk" ? (d.stages || []) : Object.keys(d.stages || {});
  const off = +q.offset || 0;
  return `<h1>${t("leads")}</h1><p class="lede">${fmt(d.total)} ${own && src === "desk" ? "people in your desk. Tap one for the full card." : "records."}</p>
    ${own ? `<div class="chips"><button class="chip" data-q="src=desk" aria-pressed="${src === "desk"}">Your desk</button><button class="chip" data-q="src=imported" aria-pressed="${src === "imported"}">Imported with Plug your CRM</button></div>` : ""}
    <form class="row" id="sq"><input class="i search" name="q" value="${esc(q.q || "")}" placeholder="${t("search")}" dir="auto"><button class="btn ghost">${t("open")}</button></form>
    <div class="chips"><button class="chip" data-q="stage=" aria-pressed="${!q.stage}">${t("all")}</button>${stages.map(s => `<button class="chip" data-q="stage=${esc(s)}" aria-pressed="${q.stage === s}">${esc(s)}</button>`).join("")}</div>
    <div class="list">${d.rows.length ? d.rows.map(r => leadRow(r, own && src === "desk")).join("") : `<div class="empty">${t("none")}</div>`}</div>
    <div class="row" style="margin-top:14px">${off ? `<button class="btn ghost sm" data-q="offset=${Math.max(0, off - 50)}">${t("back")}</button>` : ""}${off + d.rows.length < d.total ? `<button class="btn ghost sm" data-q="offset=${off + 50}">${t("next")}</button>` : ""}<span class="muted small">${fmt(off + 1)}–${fmt(off + d.rows.length)} / ${fmt(d.total)}</span></div>`;
};
async function openLead(id) {
  const own = me.tenant.kind === "owner" && /^crm\|/.test(id);
  const d = await api(own ? "/lead?key=" + encodeURIComponent(id) : "/lead?id=" + encodeURIComponent(id));
  const w = document.createElement("div"); w.className = "drawer";
  let body = "";
  if (!d.ok) body = `<p class="note bad">${esc(d.error)}</p>`;
  else if (own) {
    const l = d.lead || {}; const rs = d.research || {};
    body = `<p class="eyebrow">${esc(l.stage || rs._tab || "")}</p><h1 dir="auto">${esc(l.name || "Lead")}</h1>
      <div class="row" style="margin:14px 0">${l.phone ? `<a class="btn g" href="tel:${esc(l.phone)}">Call</a>` : ""}<a class="btn ghost" target="_blank" rel="noopener" href="${esc(d.desk_url)}">Open in the desk</a></div>
      <dl class="kv">${[["Phone", l.phone], ["Email", l.email], ["Project", l.project], ["Budget", l.budget], ["Source", l.source], ["Country", l.country], ["Score", l.score]].filter(x => x[1]).map(([k, v]) => `<dt>${k}</dt><dd dir="auto">${esc(v)}</dd>`).join("")}
      ${Object.entries(rs).filter(([k]) => k !== "_tab").map(([k, v]) => `<dt>${esc(k)}</dt><dd dir="auto">${esc(v)}</dd>`).join("")}</dl>
      <h2>Timeline</h2><div class="timeline">${(d.notes || []).map(n => `<div><small>${day(n.ts)} · ${esc(n.kind)}</small><span dir="auto">${esc(n.text)}</span></div>`).join("") || `<p class="muted">${t("none")}</p>`}</div>`;
  } else {
    const l = d.lead; const om = l.owner_match || {};
    body = `<p class="eyebrow">${esc(l.stage)}</p><h1 dir="auto">${esc(l.name || "Lead")}</h1>
      <div class="row" style="margin:14px 0">${l.phone ? `<a class="btn g" href="tel:${esc(l.phone)}">Call</a>` : ""}${l.email ? `<a class="btn ghost" href="mailto:${esc(l.email)}">Email</a>` : ""}</div>
      ${om.line ? `<p class="note">${esc(om.line)}</p>` : ""}
      <dl class="kv" style="margin-top:14px">${[["Phones", (l.phones || []).join(", ")], ["Emails", (l.emails || []).join(", ")], ["Project", l.project], ["Budget", l.budget], ["Source", l.source], ["Country", l.country], ["Language", l.language], ["Best call window", l.call_window], ["Notes", l.notes]].filter(x => x[1]).map(([k, v]) => `<dt>${k}</dt><dd dir="auto">${esc(v)}</dd>`).join("")}</dl>
      <h2>Original records (${(l.raw || []).length})</h2><p class="muted small">Exactly as they came from the old CRM. Nothing was dropped.</p>
      ${(l.raw || []).map(r => `<details style="margin-top:8px"><summary class="small"><b>${esc(r.source)}</b> · ${esc(r.id)}</summary><div class="scroll" style="margin-top:6px"><table class="t"><tbody>${Object.entries(r.raw).filter(([, v]) => v !== null && v !== "").map(([k, v]) => `<tr><td class="muted">${esc(k)}</td><td dir="auto">${esc(typeof v === "object" ? JSON.stringify(v) : v)}</td></tr>`).join("")}</tbody></table></div></details>`).join("")}`;
  }
  w.innerHTML = `<div class="panel" role="dialog" aria-modal="true"><div class="row" style="justify-content:flex-end"><button class="btn ghost sm" data-close>✕</button></div>${body}</div>`;
  w.addEventListener("click", e => { if (e.target === w || e.target.closest("[data-close]")) w.remove(); });
  document.addEventListener("keydown", function k(e) { if (e.key === "Escape") { w.remove(); document.removeEventListener("keydown", k); } });
  document.body.append(w);
}

V.unassigned = async () => {
  const d = await api("/unassigned"); const own = me.tenant.kind === "owner";
  return `<h1>${t("unassigned")}</h1><p class="lede">New people nobody has called, texted or moved yet. Oldest risk first: work these before anything else.</p>
    <div class="list">${d.rows.length ? d.rows.map(r => leadRow(r, own)).join("") : `<div class="empty">Nothing unassigned. Good.</div>`}</div>
    ${own && d.imported && d.imported.length ? `<h2>Imported, still New</h2><div class="list">${d.imported.map(r => leadRow(r, false)).join("")}</div>` : ""}`;
};

V.calendar = async () => {
  const d = await api("/calendar"); const ev = d.events || [];
  const groups = {}; ev.forEach(e => { const k = e.at ? new Date(e.at * 1000).toDateString() : "Call-backs to book"; (groups[k] = groups[k] || []).push(e); });
  return `<h1>${t("calendar")}</h1><p class="lede">Follow-ups set on your leads, and everyone who asked for a call back. Source: ${esc(d.source)}. No outside calendar is connected.</p>
    ${Object.keys(groups).length ? Object.entries(groups).map(([g, es]) => `<h2>${esc(g)}</h2><div class="list">${es.map(e => `<button class="li" type="button" data-lead="${esc(e.key || e.id)}"><span class="t">${esc(e.name || "Lead")}</span><span class="s">${esc(e.kind)}${e.when ? " · " + esc(e.when) : ""}</span><span class="r">${esc(e.stage || "")}</span></button>`).join("")}</div>`).join("")
      : `<div class="empty">No follow-ups are set yet. When a call result sets a follow-up date, it lands here.</div>`}`;
};

V.developers = async (q) => {
  const d = await api("/developers?q=" + encodeURIComponent(q.q || ""));
  return `<h1>${t("developers")}</h1><p class="lede">${fmt(d.total)} sales contacts across ${fmt(d.developers)} developers. For launches, allocations and EOIs.</p>
    <form class="row" id="sq"><input class="i search" name="q" value="${esc(q.q || "")}" placeholder="Developer, name or language" dir="auto"><button class="btn ghost">${t("open")}</button></form>
    <div class="list" style="margin-top:12px">${d.rows.map(r => `<div class="li"><span class="t" dir="auto">${esc(r.Name)} <span class="muted small">· ${esc(r.Designation || "")}</span></span>
      <span class="s">${esc(r.DEVELOPER || "")} · ${esc((r.Languages || "").replace(/\n/g, ", "))}</span>
      <span class="r">${r["Mobile No."] ? `<a href="tel:${esc(String(r["Mobile No."]).replace(/\s/g, ""))}" dir="ltr">${esc(r["Mobile No."])}</a>` : ""}${r.Email && r.Email.includes("@") ? `<br><a href="mailto:${esc(r.Email)}">email</a>` : ""}</span></div>`).join("") || `<div class="empty">${t("none")}</div>`}</div>`;
};

V.email = async () => {
  const d = await api("/email"); const td = d.today || {};
  return `<h1>${t("email_")}</h1><p class="lede">${esc(d.rules)}</p>
    <div class="kpis"><div class="kpi"><div class="num">${fmt(td.texts || 0)}</div><div class="l">Texts ${esc(td.day || "")}</div></div>
    <div class="kpi"><div class="num">${fmt(td.emails || 0)}</div><div class="l">Emails ${esc(td.day || "")}</div></div>
    <div class="kpi"><div class="num">${fmt(d.opens)}</div><div class="l">Tracked opens</div></div>
    <div class="kpi"><div class="num">${fmt(d.clicks)}</div><div class="l">Tracked clicks</div></div>
    <div class="kpi"><div class="num">${fmt(d.failed_recent)}</div><div class="l">Failed sends (recent)</div></div></div>
    <h2>Senders</h2><div class="list">${d.senders.map(s => `<div class="li"><span class="t">${esc(s.name)}</span><span class="s">${esc(s.note)}</span><span class="r"><span class="pill ${s.ready ? "ok" : "warn"}">${s.ready ? "ready" : "blocked"}</span></span></div>`).join("")}</div>
    <h2>Last lines of the engine log</h2><div class="scroll"><table class="t"><tbody>${d.last_lines.map(l => `<tr><td class="mono">${esc(l)}</td></tr>`).join("")}</tbody></table></div>`;
};

V.requests = async () => {
  const d = await api("/requests");
  const block = (title, rows, what) => `<h2>${title} (${rows.length})</h2>${rows.length ? `<div class="list">${rows.map(r => `<div class="li"><span class="t" dir="auto">${esc(r.name || r.full_name || r.company || "Request")}</span>
    <span class="s">${esc([r.phone, r.email, r.building || r.buildings || r.what || r.message || r.company].filter(Boolean).join(" · "))}</span><span class="r muted">${esc(r.ts || r.at || r.time || "")}</span></div>`).join("")}</div>` : `<div class="empty">${what}</div>`}`;
  return `<h1>${t("requests")}</h1><p class="lede">Everything people asked for through brxdxb.com: Owner Atlas access, the free-month form and office visits.</p>
    ${block("Owner Atlas access", d.atlas, "No Atlas requests yet.")}${block("Website forms", d.forms, "No form leads yet.")}${block("Visit requests", d.visits, "No visit requests yet.")}`;
};

V.marketing = async () => {
  const [d, s] = await Promise.all([api("/marketing"), api("/stripe")]);
  const groups = {}; (d.files || []).forEach(f => (groups[f.group] = groups[f.group] || []).push(f));
  return `<h1>${t("marketing")}</h1><p class="lede">Proposals, decks, the brand kit, the films and the payment links. Files download straight from the mini.</p>
    <div class="row"><a class="btn g" href="${esc(d.all_pdf)}" target="_blank" rel="noopener">All proposals (PDF)</a><span class="muted small">${fmt(d.proposals.length)} one-pagers · ${fmt(d.sent)} sent</span></div>
    <h2>Proposals</h2><div class="scroll"><table class="t"><thead><tr><th>Business</th><th>Industry</th><th>Area</th><th>Set-up</th><th>Monthly</th></tr></thead><tbody>
    ${d.proposals.map(p => `<tr><td><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.business)}</a></td><td>${esc(p.industry)}</td><td>${esc(p.area)}</td><td>${fmt(p.setup)}</td><td>${fmt(p.monthly)}</td></tr>`).join("")}</tbody></table></div>
    <h2>Payment links</h2><p class="muted small" style="margin:-4px 0 10px">${esc(s.note)}</p><div class="list">${s.links.map(l => `<div class="li"><span class="t">${esc(l.name)}</span><span class="s">AED ${fmt(l.aed)}${l.monthly === "yes" ? " a month" : " once"}</span><span class="r"><button class="btn ghost sm" data-copy="${esc(l.url)}">${t("copy")}</button></span></div>`).join("")}</div>
    ${Object.entries(groups).map(([g, fs]) => `<h2>${esc(g)}</h2><div class="list">${fs.map(f => `<div class="li"><span class="t">${esc(f.name)}</span><span class="s">${fmt(Math.round(f.bytes / 1024))} KB</span><span class="r"><button class="btn ghost sm" data-file="${esc(f.id)}" data-name="${esc(f.name)}">Download</button></span></div>`).join("")}</div>`).join("")}`;
};
async function download(id, name) {
  toast(t("loading"));
  const r = await api("/file?id=" + encodeURIComponent(id), { blob: true }); const b = await r.blob();
  const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* ── Plug your CRM ─────────────────────────────────────────────────── */
let wiz = { step: 1 };
function migList(ms) {
  return `<div class="list">${ms.map(m => `<a class="li" href="#/plug?m=${m.id}"><span class="t">${m.dry_run ? "Dry run" : "Import"} · ${esc(m.kind)} ${m.sheet ? "· " + esc(m.sheet) : ""}</span>
    <span class="s">${fmt((m.summary || {}).read)} read · ${fmt((m.summary || {}).leads_created)} new leads · ${fmt(((m.summary || {}).merged_existing || 0) + ((m.summary || {}).merged_in_batch || 0))} merged · ${day(m.started)}</span>
    <span class="r"><span class="pill ${m.status === "done" ? "ok" : m.status === "running" ? "" : "bad"}">${esc(m.status)}</span></span></a>`).join("")}</div>`;
}
function stepsBar(n) { return `<ol class="steps">${["Source", "Match columns", "Dry run", "Import + verify"].map((s, i) => `<li class="${i + 1 === n ? "on" : i + 1 < n ? "done" : ""}">${s}</li>`).join("")}</ol>`; }
function reportView(rep, dry) {
  if (rep.error) return `<div class="note bad">${esc(rep.error)}</div>`;
  const v = rep.verify || {}; const merged = (rep.merged_existing || 0) + (rep.merged_in_batch || 0);
  const unm = Object.entries(rep.unmapped_fields || {});
  return `<div class="verify ${v.ok ? "" : "bad"}">${v.ok ? OK_MARK : MARK}<div><h3>${v.ok ? (dry ? "Dry run clean. Nothing was saved yet." : "Every record is in. Nothing lost.") : "Check needed"}</h3>
      <p class="small">Read ${fmt(v.read)} · stored ${fmt(v.stored_this_run)} · already here ${fmt(v.unchanged)} · lost <b>${fmt(v.lost)}</b> · source recount ${fmt(v.source_count)} (${esc(v.source_how || "")})</p></div></div>
    <div class="report">
      <div class="kpi"><div class="num">${fmt(rep.read)}</div><div class="l">Records read</div></div>
      <div class="kpi"><div class="num">${fmt(rep.leads_created)}</div><div class="l">New leads</div></div>
      <div class="kpi"><div class="num">${fmt(merged)}</div><div class="l">Duplicates merged (phone last 9, then email)</div></div>
      <div class="kpi"><div class="num">${fmt(rep.raw_unchanged)}</div><div class="l">Already imported, unchanged</div></div>
      <div class="kpi"><div class="num">${fmt(rep.no_ident)}</div><div class="l">No phone or email (kept as own lead)</div></div>
      <div class="kpi"><div class="num">${fmt(rep.owners_matched)}</div><div class="l">Dubai property owners found</div></div>
      ${rep.already_in_your_crm != null ? `<div class="kpi"><div class="num">${fmt(rep.already_in_your_crm)}</div><div class="l">Already in your desk CRM</div></div>` : ""}
      ${rep.blank_rows ? `<div class="kpi"><div class="num">${fmt(rep.blank_rows)}</div><div class="l">Blank rows skipped</div></div>` : ""}
      ${rep.dup_ids_in_source ? `<div class="kpi"><div class="num">${fmt(rep.dup_ids_in_source)}</div><div class="l">Same ID twice in source (both kept)</div></div>` : ""}</div>
    ${unm.length ? `<h2>Columns not matched (${unm.length})</h2><p class="muted small" style="margin:-4px 0 10px">Still saved: every original record is stored word for word and shows on the lead card.</p>
      <div class="chips">${unm.slice(0, 40).map(([k, n]) => `<span class="pill">${esc(k)} · ${fmt(n)}</span>`).join("")}</div>` : ""}
    <p class="muted small" style="margin-top:12px">${fmt(rep.seconds)} s · ${rep.enriched ? "owner match, language and call window added" : "owner match not available on this run"}</p>`;
}
V.plug = async (q) => {
  if (q.m) return migrationView(+q.m);
  const d = await api("/plug");
  const files = d.catalogue.filter(c => c.mode === "file"), apis = d.catalogue.filter(c => c.mode === "api");
  let body = "";
  if (wiz.step === 1) {
    body = `${stepsBar(1)}<label class="drop" id="drop"><input type="file" id="fi" hidden accept=".csv,.tsv,.txt,.xlsx,.xlsm,.xls,.json,.xml,.html">
        ${MARK.replace("<svg", '<svg style="width:64px;margin:0 auto"')}<strong>${t("drop")}</strong><span class="muted small">${t("drop_p")}</span></label>
      <div class="row" style="margin-top:12px"><span class="small muted">Export format:</span>${files.map(c => `<button class="chip" data-kind="${c.kind}" aria-pressed="${(wiz.kind || "file") === c.kind}">${esc(c.label)}</button>`).join("")}</div>
      <p class="muted small" style="margin-top:6px">${esc((files.find(c => c.kind === (wiz.kind || "file")) || files[0]).help)}</p>
      <h2>${t("direct")}</h2><p class="muted small" style="margin:-4px 0 12px">${t("direct_p")}</p>
      <div class="cards">${apis.map(c => `<button class="card" type="button" data-api="${c.kind}" style="text-align:start;cursor:pointer"><h3>${esc(c.label)}</h3><p>${esc(c.help)}</p></button>`).join("")}</div>
      ${d.connectors.length ? `<h2>Your connections</h2><div class="list">${d.connectors.map(c => `<div class="li"><span class="t">${esc(c.label)}</span><span class="s">key ${esc(c.secret_hint)} · last run ${day(c.last_run)}</span>
        <span class="r row"><button class="btn ghost sm" data-ctest="${c.id}">Test</button><button class="btn sm" data-crun="${c.id}">Dry run</button><button class="btn ghost sm" data-cdel="${c.id}">✕</button></span></div>`).join("")}</div>` : ""}
      <div id="apiform"></div>`;
  } else if (wiz.step === 2) {
    const p = wiz.preview;
    body = `${stepsBar(2)}<p class="lede"><b>${esc(p.filename)}</b>${wiz.sheets.length > 1 ? "" : " · " + esc(p.sheet)}. We guessed the matches. Fix any that are wrong. Unmatched columns are still kept.</p>
      ${wiz.sheets.length > 1 ? `<label class="f" style="max-width:420px"><span>Sheet</span><select class="i" id="sheet">${wiz.sheets.map(s => `<option ${s.sheet === p.sheet ? "selected" : ""} value="${esc(s.sheet)}">${esc(s.sheet)} · ${fmt(s.rows)} rows</option>`).join("")}</select></label>` : ""}
      <div class="map">${p.canon.map(k => `<span class="k">${esc(p.labels[k])}</span><select class="i" data-map="${k}"><option value="">—</option>${p.headers.map(h => `<option ${wiz.mapping[k] === h ? "selected" : ""}>${esc(h)}</option>`).join("")}</select>`).join("")}</div>
      <h2>First rows</h2><div class="scroll"><table class="t"><thead><tr>${p.headers.slice(0, 12).map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${p.sample.map(r => `<tr>${p.headers.slice(0, 12).map(h => `<td dir="auto">${esc(r[h])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <div class="row" style="margin-top:18px"><button class="btn ghost" data-wiz="1">${t("back")}</button><button class="btn g" id="dry">Run the dry run</button></div>`;
  } else if (wiz.step === 3 || wiz.step === 4) {
    body = `${stepsBar(wiz.step)}<div id="runbox">${loadingView()}</div>`;
  }
  return `<h1>${t("plug")}</h1><p class="lede">${t("plug_p")}</p>
    ${body}${d.migrations.length && wiz.step === 1 ? `<h2>${t("history")}</h2>${migList(d.migrations.slice(0, 12))}` : ""}`;
};
async function migrationView(id) {
  const d = await api("/plug/migration?id=" + id); if (!d.ok) return `<div class="note bad">${esc(d.error)}</div>`;
  const m = d.migration;
  return `<p><a href="#/plug">← ${t("plug")}</a></p><h1>${m.dry_run ? "Dry run" : "Import"} #${m.id}</h1><p class="lede">${esc(m.kind)} ${m.sheet ? "· " + esc(m.sheet) : ""} · ${day(m.started)} · <span class="pill">${esc(m.status)}</span></p>
    ${m.status === "running" ? `<p>Reading… ${fmt((m.progress || {}).read)} records</p><div class="progress"><i></i></div>` : reportView(m.report, m.dry_run)}`;
}
async function poll(id, dry) {
  const box = () => $("#runbox");
  for (;;) {
    const d = await api("/plug/migration?id=" + id); if (!box()) return;
    const m = d.migration;
    if (m.status === "running") { box().innerHTML = `<p>${dry ? "Dry run" : "Importing"}… ${fmt((m.progress || {}).read)} records · ${esc((m.progress || {}).phase || "")}</p><div class="progress"><i></i></div>`; await new Promise(r => setTimeout(r, 900)); continue; }
    box().innerHTML = reportView(m.report, dry) + `<div class="row" style="margin-top:18px">${dry && m.status === "done" ? `<button class="btn ghost" data-wiz="${wiz.upload ? 2 : 1}">${t("back")}</button><button class="btn g" id="go">Import for real</button>` : `<a class="btn" href="#/leads?src=imported">See the leads</a><button class="btn ghost" data-wiz="1">Import another</button>`}</div>`;
    const go = $("#go"); if (go) go.onclick = () => runMigration(false);
    return;
  }
}
async function runMigration(dry) {
  wiz.step = dry ? 3 : 4; await render();
  const body = wiz.connector ? { connector: wiz.connector, dry_run: dry } : { upload: wiz.upload, sheet: wiz.preview.sheet, kind: wiz.kind || "file", mapping: wiz.mapping, dry_run: dry };
  const r = await api("/plug/run", { body });
  if (!r.ok) { $("#runbox").innerHTML = `<div class="note bad">${esc(r.error)}</div><button class="btn ghost" style="margin-top:12px" data-wiz="${wiz.upload ? 2 : 1}">${t("back")}</button>`; return; }
  poll(r.migration, dry);
}
async function uploadFile(f) {
  const drop = $("#drop"); if (drop) drop.innerHTML = `<strong>Reading ${esc(f.name)}…</strong><div class="progress"><i></i></div>`;
  const r = await api("/plug/upload", { method: "POST", body: f, headers: { "X-Filename": f.name } });
  if (!r.ok) { toast(r.error || "Upload failed"); wiz = { step: 1 }; return render(); }
  wiz = { step: 2, upload: r.upload, sheets: r.sheets, kind: wiz.kind || "file" };
  await loadPreview(r.sheets.sort((a, b) => b.rows - a.rows)[0].sheet);
}
async function loadPreview(sheet) {
  const p = await api(`/plug/preview?upload=${wiz.upload}&sheet=${encodeURIComponent(sheet)}&kind=${wiz.kind || "file"}`);
  if (!p.ok) { toast(p.error); return; }
  wiz.preview = p; wiz.mapping = { ...p.suggested }; wiz.step = 2; render();
}
function apiForm(kind) {
  const c = { hubspot: ["token"], salesforce: ["instance_url", "token"], zoho: ["token", "region"], pipedrive: ["domain", "token"], b24: ["webhook"] }[kind] || ["token"];
  const lab = { token: "Access token / API key", instance_url: "Instance address (https://…my.salesforce.com)", region: "Region (com, eu, in, com.au…)", domain: "Company address (yourco.pipedrive.com)", webhook: "Inbound webhook address" };
  $("#apiform").innerHTML = `<div class="card" style="margin-top:16px"><h3>Connect</h3><form id="af" style="margin-top:12px">${c.map(f => `<label class="f"><span>${lab[f]}</span><input class="i" name="${f}" autocomplete="off" dir="ltr" ${f === "token" ? 'type="password"' : ""}></label>`).join("")}
    <p class="muted small">Stored on our server only, readable by nobody but this import. Shown back to you as the last 4 characters.</p><button class="btn g" style="margin-top:10px">Save and test</button></form></div>`;
  $("#af").onsubmit = async e => {
    e.preventDefault(); const fields = Object.fromEntries(new FormData(e.target));
    const r = await api("/plug/connector", { body: { kind, fields } }); if (!r.ok) return toast(r.error);
    const tst = await api("/plug/connector/test", { body: { id: r.id } });
    toast(tst.ok ? `Connected. ${fmt(tst.total)} records at the source.` : tst.error); render();
  };
  $("#apiform").scrollIntoView({ behavior: "smooth" });
}

/* ── accounts, team, settings ──────────────────────────────────────── */
V.accounts = async () => {
  const d = await api("/accounts"); const ts = d.tenants.filter(x => x.kind !== "owner");
  return `<h1>${t("accounts")}</h1><p class="lede">Agents and agencies on the BRX licence. The switch turns an account off at once: their portal, their API key and their agent node stop.</p>
    <button class="btn g" id="newacc">Create account</button><button class="btn" id="atlasall" title="Owner Atlas upload link">Atlas upload link</button><div id="accform"></div>
    <h2>Licensees (${ts.length})</h2>${ts.length ? `<div class="list">${ts.map(x => `<div class="li"><span class="t">${esc(x.name)} <span class="muted small">· ${esc(x.kind)} · ${esc(x.slug)}</span></span>
      <span class="s">${fmt(x.users)} logins · ${fmt(x.leads)} leads · ${fmt(x.seats)} seats · ${x.stripe_subscription_id ? esc(x.stripe_subscription_id) : "no subscription id yet"} · licence ${esc(x.license)}${x.node ? ` · agent node ${x.node.online ? "online" : "last seen " + day(x.node.last_seen)}` : ""}</span>
      <span class="r"><button class="switch" role="switch" aria-checked="${x.live}" data-tenant="${x.id}" aria-label="${esc(x.name)} on or off"></button></span></div>`).join("")}</div>` : `<div class="empty">No licensees yet.</div>`}
    <p class="muted small" style="margin-top:14px">Plan on new accounts: ${esc(d.price)}. Nothing is charged from here.</p>`;
};
function accountForm() {
  $("#accform").innerHTML = `<form class="card" id="cf" style="margin-top:16px;max-width:620px"><h3>New licensee</h3><p class="muted small" style="margin:4px 0 14px">Creates the account, a login for their admin (they choose their own password from a one-time link), an API key and their licence.</p>
    <label class="f"><span>Agency or agent name</span><input class="i" name="name" required></label>
    <div class="row" style="align-items:flex-start"><label class="f" style="flex:1;min-width:200px"><span>Type</span><select class="i" name="kind"><option value="agency">Agency</option><option value="agent">Agent</option><option value="developer">Developer</option></select></label>
    <label class="f" style="width:120px"><span>Seats</span><input class="i" name="seats" type="number" min="1" value="1"></label></div>
    <label class="f"><span>Admin email</span><input class="i" name="email" type="email" required dir="ltr"></label>
    <label class="f"><span>Admin name</span><input class="i" name="admin_name"></label>
    <div class="row" style="align-items:flex-start"><label class="f" style="flex:1;min-width:200px"><span>Stripe customer id (optional)</span><input class="i" name="stripe_customer_id" placeholder="cus_…" dir="ltr"></label>
    <label class="f" style="flex:1;min-width:200px"><span>Stripe subscription id (optional)</span><input class="i" name="stripe_subscription_id" placeholder="sub_…" dir="ltr"></label></div>
    <p class="err" id="ce"></p><button class="btn g">Create account</button></form>`;
  $("#cf").onsubmit = async e => {
    e.preventDefault(); const r = await api("/accounts/create", { body: Object.fromEntries(new FormData(e.target)) });
    if (!r.ok) { $("#ce").textContent = r.error; return; }
    $("#accform").innerHTML = `<div class="card" style="margin-top:16px;max-width:720px"><h3>${esc(r.tenant.name)} is live</h3><p class="note warn" style="margin:10px 0">${esc(r.note)}</p>
      <p class="small"><b>One-time setup link for the admin</b></p><div class="secret"><code>${esc(r.setup_link)}</code><button class="btn ghost sm" data-copy="${esc(r.setup_link)}">${t("copy")}</button></div>
      <p class="small" style="margin-top:12px"><b>API key</b></p><div class="secret"><code>${esc(r.api_key)}</code><button class="btn ghost sm" data-copy="${esc(r.api_key)}">${t("copy")}</button></div>
      <p style="margin-top:14px"><a class="btn ghost" href="#/accounts" onclick="setTimeout(()=>location.reload(),50)">Done</a></p></div>`;
  };
}
V.team = async () => {
  const d = await api("/team"); const own = me.tenant.kind === "owner";
  return `<h1>${t("team")}</h1><p class="lede">${own ? "Everyone with a login, across BRX and every licensee." : "The people in your agency who can sign in."}</p>
    <div class="list">${d.users.map(u => `<div class="li"><span class="t">${esc(u.name || u.email)} <span class="muted small">· ${esc(u.role)}${own ? " · " + esc(u.tenant) : ""}</span></span>
      <span class="s" dir="ltr">${esc(u.email)} · ${u.has_pw ? "password set" : "invite not used yet"} · ${u.totp_on ? "2-step on" : "2-step off"} · last in ${day(u.last_login)}</span>
      <span class="r">${u.role === "owner" || u.email === (me.user || {}).email ? "" : `<button class="switch" role="switch" aria-checked="${!!u.active}" data-user="${u.id}" aria-label="Login on or off"></button>`}</span></div>`).join("")}</div>
    ${me.user && ["owner", "admin"].includes(me.user.role) ? `<form class="card" id="inv" style="margin-top:20px;max-width:560px"><h3>Add a person</h3>
      <label class="f" style="margin-top:12px"><span>Email</span><input class="i" name="email" type="email" required dir="ltr"></label><label class="f"><span>Name</span><input class="i" name="name"></label>
      <label class="f"><span>Role</span><select class="i" name="role"><option value="agent">Agent</option><option value="admin">Admin</option></select></label><p class="err" id="ie"></p><button class="btn g">Create invite link</button><div id="invout"></div></form>` : ""}`;
};
V.settings = async () => {
  const k = await api("/keys"); const u = me.user || {};
  return `<h1>${t("settings")}</h1><p class="lede">${esc(u.email || "")} · ${esc(me.tenant.name)}</p>
    <h2>Two-step sign-in</h2><div class="card" style="max-width:620px">${u.totp_on ? `<p><span class="pill ok">On</span> Your authenticator app asks for a code at every sign-in.</p>
      <form id="toff" class="row" style="margin-top:12px"><input class="i" name="code" placeholder="${t("code")}" inputmode="numeric" style="max-width:180px" dir="ltr"><button class="btn ghost">Turn off</button></form>`
      : `<p>Add a second lock: a 6-digit code from an authenticator app (Apple Passwords, Google Authenticator, 1Password).</p><button class="btn g" id="ton" style="margin-top:12px">Turn on</button><div id="totpbox"></div>`}</div>
    ${u.role !== "agent" ? `<h2>API keys</h2><p class="muted small" style="margin:-4px 0 10px">For your own tools: <span class="mono">GET /api/portal/v1/leads</span> with the key as a Bearer token.</p>
      <div class="list">${k.keys.map(x => `<div class="li"><span class="t mono">${esc(x.hint)}</span><span class="s">${esc(x.label || "")} · made ${day(x.created)} · used ${day(x.last_used)}</span><span class="r">${x.active ? `<button class="btn ghost sm" data-krev="${x.id}">Revoke</button>` : '<span class="pill bad">revoked</span>'}</span></div>`).join("") || `<div class="empty">${t("none")}</div>`}</div>
      <button class="btn ghost" id="knew" style="margin-top:12px">New key</button><div id="keyout"></div>` : ""}
    <h2>${t("signout")}</h2><button class="btn ghost" id="so2">${t("signout")}</button>`;
};

V.more = async () => {
  const mods = (me.modules || []).map(modKey);
  return `<h1>${t("more")}</h1><div class="list" style="margin-top:16px">${GROUPS.flatMap(([, ks]) => ks).filter(k => mods.includes(k)).map(k =>
    `<a class="li" href="#/${routeOf(k)}"><span class="t">${t(k)}</span><span class="r">${ico(k)}</span></a>`).join("")}</div>
    <button class="btn ghost" style="margin-top:18px" id="so2">${t("signout")}</button>`;
};

/* ── router ────────────────────────────────────────────────────────── */
function parse() {
  const h = location.hash.replace(/^#\/?/, ""); const [path, qs] = h.split("?");
  return { mod: path || "home", q: Object.fromEntries(new URLSearchParams(qs || "")) };
}
async function render() {
  const { mod, q } = parse(); const key = modKey(mod);
  if (mod !== "more" && !(me.modules || []).includes(mod)) { location.hash = "#/home"; return; }
  shell(key, loadingView());
  try {
    $("#main").innerHTML = await V[mod](q);
    after(mod, q);
    document.title = t(key) + " · BRX Portal";
  } catch (e) { fail(e); }
}
function setQ(kv) {
  const { mod, q } = parse(); const [k, v] = kv.split("="); const n = { ...q, [k]: v };
  if (k !== "offset") delete n.offset; if (!v) delete n[k];
  location.hash = "#/" + mod + (Object.keys(n).length ? "?" + new URLSearchParams(n) : "");
}
function after(mod, q) {
  const m = $("#main");
  m.onclick = async e => {
    const x = e.target.closest("[data-q],[data-lead],[data-file],[data-kind],[data-api],[data-wiz],[data-ctest],[data-crun],[data-cdel],[data-tenant],[data-user],[data-krev]");
    if (!x) return;
    if (x.dataset.q !== undefined) return setQ(x.dataset.q);
    if (x.dataset.lead) return openLead(x.dataset.lead);
    if (x.dataset.file) return download(x.dataset.file, x.dataset.name).catch(err => toast(err.message));
    if (x.dataset.kind) { wiz.kind = x.dataset.kind; return render(); }
    if (x.dataset.api) return apiForm(x.dataset.api);
    if (x.dataset.wiz) { wiz.step = +x.dataset.wiz; if (wiz.step === 1) wiz = { step: 1 }; return render(); }
    if (x.dataset.ctest) { const r = await api("/plug/connector/test", { body: { id: +x.dataset.ctest } }); return toast(r.ok ? `Connected. ${fmt(r.total)} records at the source.` : r.error); }
    if (x.dataset.crun) { wiz = { step: 3, connector: +x.dataset.crun }; return runMigration(true); }
    if (x.dataset.cdel) { if (confirm("Remove this connection? Imported records stay.")) { await api("/plug/connector/delete", { body: { id: +x.dataset.cdel } }); render(); } return; }
    if (x.dataset.tenant) {
      const on = x.getAttribute("aria-checked") !== "true";
      if (!on && !confirm("Switch this account off now? Their portal, API key and agent node stop.")) return;
      const r = await api("/accounts/status", { body: { id: +x.dataset.tenant, on } }); if (!r.ok) return toast(r.error);
      x.setAttribute("aria-checked", String(r.tenant.live)); return toast(r.tenant.live ? "Switched on" : "Switched off");
    }
    if (x.dataset.user) { const on = x.getAttribute("aria-checked") !== "true"; const r = await api("/team/active", { body: { id: +x.dataset.user, on } }); if (r.ok) x.setAttribute("aria-checked", String(on)); else toast(r.error); return; }
    if (x.dataset.krev) { if (confirm("Revoke this key? Anything using it stops.")) { await api("/keys/revoke", { body: { id: +x.dataset.krev } }); render(); } }
  };
  const sq = $("#sq"); if (sq) sq.onsubmit = e => { e.preventDefault(); setQ("q=" + encodeURIComponent(sq.q.value.trim())); };
  if (mod === "plug") {
    const fi = $("#fi"), drop = $("#drop");
    if (fi) fi.onchange = () => fi.files[0] && uploadFile(fi.files[0]);
    if (drop) {
      ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
      ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
      drop.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if (f) uploadFile(f); });
    }
    m.querySelectorAll("[data-map]").forEach(s => s.onchange = () => { wiz.mapping[s.dataset.map] = s.value; });
    const sh = $("#sheet"); if (sh) sh.onchange = () => loadPreview(sh.value);
    const dry = $("#dry"); if (dry) dry.onclick = () => runMigration(true);
  }
  if (mod === "accounts") { const b = $("#newacc"); if (b) b.onclick = accountForm; }
  if (mod === "team") {
    const f = $("#inv"); if (f) f.onsubmit = async e => { e.preventDefault(); const r = await api("/team/invite", { body: Object.fromEntries(new FormData(f)) });
      if (!r.ok) { $("#ie").textContent = r.error; return; }
      $("#invout").innerHTML = `<p class="small" style="margin-top:12px"><b>Send this one-time link. They choose their own password.</b></p><div class="secret"><code>${esc(r.setup_link)}</code><button type="button" class="btn ghost sm" data-copy="${esc(r.setup_link)}">${t("copy")}</button></div>`; };
  }
  if (mod === "more") { const so = $("#so2"); if (so) so.onclick = () => signout(false); }
  if (mod === "settings") {
    const so = $("#so2"); if (so) so.onclick = () => signout(false);
    const on = $("#ton"); if (on) on.onclick = async () => {
      const r = await api("/auth/totp/begin", { method: "POST", body: {} });
      $("#totpbox").innerHTML = `<p class="small" style="margin-top:14px">Scan the code, or add this key by hand in your authenticator app:</p><div id="qr" style="margin:12px 0;width:180px"></div>
        <div class="secret"><code>${esc(r.secret)}</code><button class="btn ghost sm" data-copy="${esc(r.secret)}">${t("copy")}</button></div>
        <form id="tconf" class="row" style="margin-top:12px"><input class="i" name="code" placeholder="${t("code")}" inputmode="numeric" style="max-width:180px" dir="ltr"><button class="btn g">Confirm</button></form>`;
      loadQR(r.uri);
      $("#tconf").onsubmit = async e => { e.preventDefault(); const c = await api("/auth/totp/confirm", { body: { code: e.target.code.value } }); if (!c.ok) return toast(c.error); me = null; await boot(); toast("Two-step sign-in is on"); };
    };
    const off = $("#toff"); if (off) off.onsubmit = async e => { e.preventDefault(); const c = await api("/auth/totp/off", { body: { code: e.target.code.value } }); if (!c.ok) return toast(c.error); me = null; boot(); };
    const kn = $("#knew"); if (kn) kn.onclick = async () => { const r = await api("/keys/new", { body: { label: "made in settings" } }); if (!r.ok) return toast(r.error);
      $("#keyout").innerHTML = `<p class="note warn" style="margin-top:12px">Shown once. Copy it now.</p><div class="secret" style="margin-top:8px"><code>${esc(r.key)}</code><button class="btn ghost sm" data-copy="${esc(r.key)}">${t("copy")}</button></div>`; };
  }
}
function loadQR(uri) {
  const draw = () => { try { new window.QRCode($("#qr"), { text: uri, width: 180, height: 180 }); } catch (e) {} };
  if (window.QRCode) return draw();
  const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
  s.integrity = "sha512-CNgIRecGo7nphbeZ04Sc13ka07paqdeTu0WR1IM4kNcpmBAUSHSQX0FslNhTDadL4O5SAGapGt4FodqL8My0mA=="; s.crossOrigin = "anonymous";
  s.onload = draw; document.head.append(s);
}

async function boot() {
  document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  const setupTok = (location.hash.match(/^#setup=([\w-]+)/) || [])[1];
  if (setupTok) return setup(setupTok);
  if (!token) return login();
  if (!me) {
    try { const j = await api("/me"); if (!j.ok) return signout(true); me = j; }
    catch (e) { return login(e.message); }
  }
  return render();
}
function route() { if (/^#setup=/.test(location.hash)) return boot(); if (!token) return login(); if (!me) return boot(); render(); }
window.addEventListener("hashchange", route);
boot();
})();


/* Owner Atlas upload link — an account here, a write-only key there, one button.
   Prompts for the account name so it works from the accounts list without
   restructuring the row template. */
document.addEventListener("click", async (e) => {
  if (!e.target || e.target.id !== "atlasall") return;
  const name = prompt("Which account? Type the agency or agent name exactly as it appears above.");
  if (!name) return;
  const r = await api("/accounts/atlas-link", { body: { name } });
  if (!r.ok) return toast(r.error || "Could not make the link");
  try { await navigator.clipboard.writeText(r.link); } catch (_) {}
  toast((r.new ? "Link created and copied" : "Existing link copied") + " — send it to " + name);
});
