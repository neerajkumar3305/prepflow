"use strict";

/* ================= utilities ================= */
const KEY = "prepflow.v2";
const HOUR = 3600000;
const TOTAL_DAYS = Math.round((new Date(PLAN_END + "T00:00:00") - new Date(PLAN_START + "T00:00:00")) / 86400000) + 1;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const lk = v => esc(v).replace(/(https?:\/\/[^\s&]+)/g, '<br><a class="rlink" href="$1" target="_blank" rel="noopener">Open source ↗</a>');
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = () => iso(new Date());
const clampedToday = () => (today() < PLAN_START ? PLAN_START : today() > PLAN_END ? PLAN_END : today());
const MONTH = () => today().slice(0, 7);
const addDays = (s, n) => { const d = new Date(s + "T00:00:00"); d.setDate(d.getDate() + n); return iso(d); };
const pretty = (s, o) => new Date(s + "T00:00:00").toLocaleDateString("en-IN", o || { weekday: "short", day: "numeric", month: "short" });
const pct = (a, b) => (b ? Math.min(100, Math.round((a / b) * 100)) : 0);
const uid = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const money = n => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const dayIndex = s => { const d = Math.round((new Date(s + "T00:00:00") - new Date(PLAN_START + "T00:00:00")) / 86400000) + 1; return d >= 1 && d <= TOTAL_DAYS ? d : 0; };
const daysInMonth = m => { const [y, mo] = m.split("-").map(Number); return new Date(y, mo, 0).getDate(); };
const daysLeftInMonth = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate() - n.getDate() + 1; };
const monthLabel = m => new Date(m + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const prevMonth = m => { const [y, mo] = m.split("-").map(Number); return iso(new Date(y, mo - 2, 1)).slice(0, 7); };
const cleanLine = l => l.replace(/^\s*(?:[-*\u2022\u2610\u2611\u2713\u2714]|\d+[.)]|\[[ xX]?\])\s*/, "").trim();

/* ================= state ================= */
function defaultState() {
  return {
    tasks: [], topicDone: {}, projStatus: {}, exercises: [], exDone: {}, resDone: {}, syllabus: null, goals: null, fitness: {}, meals: [], budgets: {}, expenses: [], noSpend: {},
    timetable: null, fired: {},
    competitions: [{ id: "c-axis", name: "Axis Bank MOVES 2026 (Axis Udyam)", date: "", status: "In progress", notes: "Core project: case, financial analysis and submission" }],
    settings: { gymTime: "18:00", cardioTime: "19:30", expenseTime: "21:00", hourly: false, lastHourly: 0, mealAlerts: true }
  };
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "{}");
    const d = defaultState();
    return Object.assign(d, s, { settings: Object.assign(d.settings, s.settings || {}) });
  } catch (e) { return defaultState(); }
}
let S = load();
let uiState = {
  fDomain: "All", fStatus: "all", ocrText: "", ocrStatus: "", preview: "", ocrDomain: TASK_DOMAINS[0],
  domDate: clampedToday(), synDate: clampedToday(), showAll: false, editingBudget: false, checkDate: clampedToday(), showTT: false, resTrack: "ai", resType: "all", planSearch: ""
};
function save() {
  S.updatedAt = Date.now();
  S.pendingSync = true;
  persist();
  autoSaveDrive();
  updateChrome();
}
const syllabus = () => {
  if (S.syllabus && ((S.syllabus[0] || {}).date !== PLAN_START || S.syllabusVersion !== SYLLABUS_VERSION)) { S.syllabus = null; S.syllabusVersion = SYLLABUS_VERSION; }
  return S.syllabus || (S.syllabus = buildDefaultSyllabus());
};
const goals = () => S.goals || (S.goals = buildDefaultGoals());
const dayRow = d => syllabus().find(r => r.date === d);
const getFit = d => S.fitness[d] || {};
function setFit(d, patch) { S.fitness[d] = Object.assign({}, S.fitness[d] || {}, patch); save(); }

/* ================= activity and streaks ================= */
function loggedDays() {
  const s = new Set(S.expenses.map(e => e.date));
  Object.keys(S.noSpend).forEach(d => { if (S.noSpend[d]) s.add(d); });
  return s;
}
function activityDays() {
  const s = new Set();
  S.tasks.forEach(t => { if (t.done && t.doneDate) s.add(t.doneDate); });
  Object.keys(S.fitness).forEach(d => { const f = S.fitness[d]; if (f.gym || f.cardio) s.add(d); });
  loggedDays().forEach(d => s.add(d));
  return s;
}
function setOf(k) {
  const s = new Set();
  Object.keys(S.fitness).forEach(d => { const f = S.fitness[d]; if (k === "diet" ? f.diet === "yes" : !!f[k]) s.add(d); });
  return s;
}
function streakFrom(set) {
  let n = 0; const d = new Date();
  if (!set.has(iso(d))) d.setDate(d.getDate() - 1);
  while (set.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function bestStreak(set) {
  const days = [...set].sort(); let best = 0, cur = 0, prev = null;
  days.forEach(d => { cur = prev && addDays(prev, 1) === d ? cur + 1 : 1; best = Math.max(best, cur); prev = d; });
  return best;
}
function autoValue(k) {
  const days = Object.keys(S.fitness);
  if (k === "gym") return days.filter(d => S.fitness[d].gym).length;
  if (k === "cardio") return days.filter(d => S.fitness[d].cardio).length;
  if (k === "diet") return days.filter(d => S.fitness[d].diet === "yes").length;
  if (k === "logdays") return loggedDays().size;
  return 0;
}
const goalValue = g => (g.auto ? autoValue(g.auto) : Number(g.value) || 0);
const goalDone = g => (g.type === "check" ? goalValue(g) >= 1 : goalValue(g) >= g.target);

/* ================= tasks ================= */
function addTask(text, domain, due, source) {
  const t = String(text || "").trim();
  if (!t) return false;
  if (S.tasks.some(x => x.text.toLowerCase() === t.toLowerCase() && x.due === (due || ""))) return false;
  S.tasks.push({ id: uid(), text: t, domain: domain || "Other", due: due || "", done: false, doneDate: "", source: source || "manual" });
  return true;
}
const pendingTasks = () => S.tasks.filter(t => !t.done);
const isOverdue = t => !t.done && !!t.due && t.due < today();
const sortTasks = list => list.slice().sort((a, b) => (a.done - b.done) || (isOverdue(b) - isOverdue(a)) || ((a.due || "9999") < (b.due || "9999") ? -1 : 1));

/* ================= reminders ================= */
function notify(title, body) {
  try { if ("Notification" in window && Notification.permission === "granted") new Notification(title, { body }); } catch (e) {}
}
let toastTimer = null;
function toast(msg, sticky) {
  const el = $("#toast");
  el.innerHTML = `<span>${esc(msg)}</span><button class="icon" aria-label="Dismiss">&times;</button>`;
  el.hidden = false;
  el.querySelector("button").onclick = () => { el.hidden = true; };
  clearTimeout(toastTimer);
  if (!sticky) toastTimer = setTimeout(() => { el.hidden = true; }, 8000);
}
function hourlyTick() {
  if (!S.settings.hourly) return;
  const now = Date.now();
  if (!S.settings.lastHourly || now < S.settings.lastHourly) { S.settings.lastHourly = now; save(); return; }
  if (now - S.settings.lastHourly >= HOUR) {
    S.settings.lastHourly = now; save();
    const p = sortTasks(pendingTasks());
    if (p.length) {
      const body = p.slice(0, 5).map(t => `• ${t.text}`).join("\n") + (p.length > 5 ? `\n…and ${p.length - 5} more` : "");
      toast(`Hourly reminder: ${p.length} pending task(s). Next: ${p[0].text}`, true);
      notify(`${p.length} pending task(s)`, body);
    }
  }
}
function dailyTick() {
  const now = new Date();
  const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const t = today(), f = getFit(t);
  const jobs = [
    { key: "gym", at: S.settings.gymTime, need: !f.gym, title: "Gym: 1 hour session", body: "Your 1 hour gym session is not marked for today yet." },
    { key: "cardio", at: S.settings.cardioTime, need: !f.cardio, title: "Walk: 1 hour", body: "Your 1 hour walk (dinner, calls, messages) is not marked for today yet." },
    { key: "expense", at: S.settings.expenseTime, need: !loggedDays().has(t), title: "Log today's expenses", body: "No expense or no-spend entry for today yet." }
  ];
  if (S.settings.mealAlerts) S.meals.forEach(m => jobs.push({ key: "meal:" + m.id, at: m.time, need: true, title: `Meal: ${m.name}`, body: `Planned for ${m.time}. Stick to your planned diet.` }));
  let changed = false;
  jobs.forEach(j => {
    if (!j.at || !j.need || S.fired[j.key] === t) return;
    if (hm >= j.at) {
      S.fired[j.key] = t; changed = true;
      toast(`${j.title}. ${j.body}`, true);
      notify(j.title, j.body);
    }
  });
  if (changed) save();
}
function tick() { hourlyTick(); dailyTick(); updateChrome(); }

/* ================= icons, routes and chrome ================= */
const ICON = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  check: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'
};
const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ""}</svg>`;

const ROUTES = [
  { id: "home", label: "Home", icon: "home" },
  { id: "checklist", label: "Checklist", icon: "check" },
  { id: "plan", label: "Plan", icon: "layers", to: "syllabus" }, { id: "resources", label: "Resources", icon: "chart" },
  { id: "fitness", label: "Fitness", icon: "activity" },
  { id: "projects", label: "Projects", icon: "layers" },
  { id: "budget", label: "Budget", icon: "wallet" }
];
const TITLES = { resources: "Resources", day: "Day checklist", home: "Home", checklist: "Checklist", syllabus: "Plan", goals: "Goals", progress: "Progress", fitness: "Fitness", projects: "Projects", budget: "Budget" };
const SUBS = {
  home: () => `${pretty(today(), { weekday: "long", day: "numeric", month: "long" })}${dayIndex(today()) ? ` · Day ${dayIndex(today())} of ${TOTAL_DAYS}` : ""}`,
  checklist: () => "Pending tasks, suggested checklist and each day's checklist",
  syllabus: () => "Daily topics for every domain. Edit any day.",
  goals: () => "Projects, practice targets, competitions and fitness",
  progress: () => "How you are doing overall, by domain and by streak",
  fitness: () => "Gym, 1 hour walk, planned diet and reasons for missed days",
  resources: () => "Resources by track: what to read, watch and practise, with links",
  day: () => "Domain-wise checklist for the selected day",
  projects: () => "Status of every project across all domains",
  budget: () => "Monthly budget by category, with daily expense logging"
};
const VIEWS = { resources: renderResources, day: renderDay, home: renderHome, checklist: renderChecklist, syllabus: renderSyllabus, progress: renderProgress, fitness: renderFitness, projects: renderProjects, budget: renderBudget };
const PLAN_MONTHS = [["2026-11", "Nov 2026"], ["2026-12", "Dec 2026"], ["2027-01", "Jan 2027"], ["2027-02", "Feb 2027"]];
const currentId = () => (location.hash || "#home").slice(1) || "home";

const NAV = { stack: [] };
function goBack() {
  NAV.stack.pop();
  const prev = NAV.stack.pop();
  location.hash = "#" + (prev || "home");
}
function render() {
  const id = currentId();
  const valid = VIEWS[id] ? id : "home";
  if (NAV.stack[NAV.stack.length - 1] !== valid) NAV.stack.push(valid);
  $("#backBtn").hidden = NAV.stack.length < 2;
  const group = (valid.indexOf("plan-") === 0 || ["syllabus", "progress", "day"].includes(valid)) ? "plan" : valid;
  $("#pageTitle").textContent = TITLES[valid];
  $("#pageSub").textContent = SUBS[valid]();
  const link = (href, label, ic, on) => `<a href="#${href}" class="${on ? "on" : ""}">${ic ? icon(ic) : ""}<span>${label}</span></a>`;
  $("#nav").innerHTML = ROUTES.map(r =>
    link(r.to || r.id, r.label, r.icon, group === r.id) +
    (r.children && group === r.id ? `<div class="sub">${r.children.map(([c, l]) => link(c, l, "", valid === c)).join("")}</div>` : "")
  ).join("");
  $("#bottomNav").innerHTML = ROUTES.map(r => link(r.to || r.id, r.label, r.icon, group === r.id)).join("");
  $("#subnav").hidden = true;
  $("#subnav").innerHTML = "";
  $("#view").innerHTML = VIEWS[valid]();
  updateChrome();
}
function updateChrome() {
  const p = pendingTasks().length;
  $("#pendingPill").textContent = `${p} pending`;
  $("#sbPending").textContent = p;
  $("#streakPill").textContent = `${streakFrom(activityDays())}-day streak`;
}

/* ================= modal ================= */
function openModal(title, html) { $("#modalTitle").textContent = title; $("#modalBody").innerHTML = html; $("#modal").hidden = false; }
function closeModal() { $("#modal").hidden = true; }

/* ================= shared html helpers ================= */
const emptyHTML = m => `<div class="empty">${m}</div>`;
const domainOptions = sel => TASK_DOMAINS.map(d => `<option ${d === sel ? "selected" : ""}>${esc(d)}</option>`).join("");
const filterDomainOptions = sel => ["All", ...TASK_DOMAINS].map(d => `<option value="${esc(d)}" ${d === sel ? "selected" : ""}>${d === "All" ? "All domains" : esc(d)}</option>`).join("");
const statusOptions = sel => [["all", "All tasks"], ["pending", "Pending"], ["overdue", "Overdue"], ["done", "Done"]].map(([v, l]) => `<option value="${v}" ${v === sel ? "selected" : ""}>${l}</option>`).join("");
const barRow = (name, done, total) => `<div class="barRow"><div class="between"><span>${esc(name)}</span><span class="muted small">${done}/${total} · ${pct(done, total)}%</span></div><div class="bar"><div style="width:${pct(done, total)}%"></div></div></div>`;
function taskRow(t) {
  const late = isOverdue(t);
  return `<div class="task ${t.done ? "done" : ""}">
    <input type="checkbox" data-chg="task" data-id="${esc(t.id)}" ${t.done ? "checked" : ""} aria-label="Mark as done">
    <div class="taskText"><span>${esc(t.text)}</span>
      <div class="meta"><span class="tag">${esc(t.domain)}</span>${t.due ? `<span class="${late ? "late" : "muted"}">${late ? "Overdue · " : ""}${esc(pretty(t.due))}</span>` : ""}</div>
    </div>
    <button class="icon" data-act="delTask" data-id="${esc(t.id)}" aria-label="Delete">${icon("trash")}</button>
  </div>`;
}
function calendarHTML() {
  const act = activityDays(), t = today(), cells = [];
  for (let d = PLAN_START; d <= PLAN_END; d = addDays(d, 1)) {
    let cls;
    if (d > t) cls = "future";
    else if (d === t) cls = act.has(d) ? "hit today" : "today";
    else cls = act.has(d) ? "hit" : "miss";
    cells.push(`<i class="${cls}" data-act="openDay" data-date="${d}" title="${esc(pretty(d, { day: "numeric", month: "short" }))}"></i>`);
  }
  return `<div class="cal">${cells.join("")}</div>`;
}
const legendHTML = () => `<div class="legend"><span><i class="hit"></i>Active day</span><span><i class="miss"></i>Missed</span><span><i class="today"></i>Today</span><span><i class="future"></i>Upcoming</span></div>`;
function streakTiles() {
  const list = [["Gym streak", streakFrom(setOf("gym")) + " d"], ["Walk streak", streakFrom(setOf("cardio")) + " d"], ["Diet streak", streakFrom(setOf("diet")) + " d"], ["Gym days", setOf("gym").size], ["Walk days", setOf("cardio").size]];
  return `<div class="tiles">${list.map(([k, v]) => `<div class="tile"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>`;
}

/* ================= home ================= */
/* ================= home (dashboard) ================= */
function donutHTML(pct, color, label, value) {
  const r = 24, c = 2 * Math.PI * r, off = c * (1 - Math.min(100, pct) / 100);
  return `<div class="donutBox"><svg viewBox="0 0 64 64" class="donut" aria-hidden="true"><circle cx="32" cy="32" r="${r}" class="dTrack"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><b>${value}</b><span>${label}</span></div>`;
}
function miniCalHTML() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate();
  const todayI = today(), planSet = new Set(planDates());
  const dues = new Set(pendingTasks().map(t => t.due).filter(Boolean));
  let cells = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(x => `<span class="cHead">${x}</span>`).join("");
  for (let i = 0; i < first; i++) cells += `<span></span>`;
  for (let d = 1; d <= n; d++) {
    const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const cls = [key === todayI ? "now" : "", planSet.has(key) ? "plan" : "", dues.has(key) ? "due" : ""].join(" ").trim();
    cells += planSet.has(key)
      ? `<button class="${cls}" data-act="openDay" data-date="${key}">${d}</button>`
      : `<span class="${cls}">${d}</span>`;
  }
  return `<div class="miniCal">${cells}</div>`;
}
function renderHome() {
  const t = today(), act = activityDays();
  const streak = streakFrom(act), best = bestStreak(act);
  const p = sortTasks(pendingTasks());
  const carried = p.filter(isOverdue).length;
  const f = getFit(t), logged = loggedDays().has(t);
  const row = dayRow(t), di = dayIndex(t);
  const items = row ? DOMAINS.filter(d => row[d.key]) : [];
  const doneItems = items.filter(d => topicDone(t, d.key)).length;
  const h = new Date().getHours();
  const hello = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const dueSoon = p.filter(x => x.due && x.due <= addDays(t, 7)).slice(0, 3);
  const recent = S.tasks.filter(x => x.done && x.doneDate).sort((a, b) => (a.doneDate < b.doneDate ? 1 : -1)).slice(0, 5);
  const st = S.projStatus || {};
  const done = PROJECTS.filter(([d, n]) => st[n] === "Done").length;
  const prog = PROJECTS.filter(([d, n]) => st[n] === "In progress").length;
  const todo = PROJECTS.length - done - prog;
  const initials = s => String(s).split(/[\s&()]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase();
  const ttCard = S.timetable && uiState.showTT
    ? `<img class="ttImg" src="${S.timetable}" alt="My timetable">`
    : `<div class="ttPlaceholder"><span>${S.timetable ? "Your timetable is saved" : "Upload your timetable"}</span></div>`;

  return `
  <section class="dash">
    <div class="dashHead">
      <div>
        <h2 class="dashTitle">Dashboard</h2>
        <p class="muted">${hello}, Neeraj. Here is a snapshot of your plan${di ? ` · Day ${di} of ${TOTAL_DAYS}` : ""}.</p>
      </div>
      <div class="statRow">
        <button class="statCard" data-act="goTo" data-to="checklist"><b>${p.length}</b><span>Pending tasks</span></button>
        <button class="statCard" data-act="streakInfo"><b>${streak}</b><span>Day streak · best ${best}</span></button>
        <button class="statCard" data-act="openToday"><b>${items.length - doneItems}</b><span>Topics left today</span></button>
      </div>
    </div>

    <div class="dashGrid">
      <div class="dashMain">
        <div class="dashRow2">
          <section class="glass">
            <div class="cardHead"><div><p class="kicker">Today</p><h3>Plan progress</h3></div>
              <button class="btn small ghost" data-act="openToday">Open day</button></div>
            ${items.length ? items.map(d => {
              const ok = topicDone(t, d.key) ? 1 : 0;
              return `<div class="progRow"><div class="progTop"><span>${esc(d.label)}</span><span class="muted small">${ok ? "Done" : "Open"}</span></div>
                <div class="bar grad"><div style="width:${ok ? 100 : 0}%"></div></div></div>`;
            }).join("") : emptyHTML("Nothing scheduled today.")}
          </section>
          <section class="glass ttCard">${ttCard}
            <div class="ttActions"><button class="btn small ghost" data-act="toggleTT">${uiState.showTT ? "Hide" : "Show"} timetable</button>
              <label class="btn small ghost">${S.timetable ? "Change" : "Upload"}<input class="sr" type="file" accept="image/*" data-chg="timetable"></label></div>
          </section>
        </div>

        <div class="dashRow3">
          <section class="glass">
            <div class="cardHead"><div><p class="kicker">Projects</p><h3>Project overview</h3></div>
              <button class="btn small ghost" data-act="goTo" data-to="projects">View all</button></div>
            <div class="donutRow">
              ${donutHTML(100, "#3F51B5", "Total", PROJECTS.length)}
              ${donutHTML(PROJECTS.length ? (prog / PROJECTS.length) * 100 : 0, "#FF4081", "In progress", prog)}
              ${donutHTML(PROJECTS.length ? (done / PROJECTS.length) * 100 : 0, "#3F51B5", "Done", done)}
            </div>
            <p class="muted small mt">${todo} not started.</p>
          </section>
          <section class="glass">
            <div class="cardHead"><div><p class="kicker">Habits</p><h3>Today's habits</h3></div></div>
            <div class="habit ${f.gym ? "on" : ""}" data-act="toggleFit" data-f="gym"><span class="hDot"></span><div><b>Gym</b><small>1 hour</small></div><span class="hState">${f.gym ? "Done" : "Tap to tick"}</span></div>
            <div class="habit ${f.cardio ? "on" : ""}" data-act="toggleFit" data-f="cardio"><span class="hDot"></span><div><b>Walk</b><small>1 hour</small></div><span class="hState">${f.cardio ? "Done" : "Tap to tick"}</span></div>
            <div class="habit ${logged ? "on" : ""}" data-act="goTo" data-to="budget"><span class="hDot"></span><div><b>Expenses</b><small>Log today</small></div><span class="hState">${logged ? "Logged" : "Not logged"}</span></div>
          </section>
        </div>

        <div class="dashRow2">
          <section class="glass">
            <div class="cardHead"><div><p class="kicker">Activity</p><h3>Recently completed</h3></div></div>
            <div class="stack">${recent.map(x => `<div class="actItem"><span class="avatar">${esc(initials(x.domain))}</span><div class="grow"><b>${esc(x.text)}</b><small class="muted">${esc(x.domain)} · ${esc(pretty(x.doneDate, { day: "numeric", month: "short" }))}</small></div></div>`).join("") || emptyHTML("No completed tasks yet. Tick one to see it here.")}</div>
          </section>
          <section class="glass">
            <div class="cardHead"><div><p class="kicker">Deadlines</p><h3>Due in the next 7 days</h3></div></div>
            <div class="stack">${dueSoon.map(x => `<div class="evCard ${isOverdue(x) ? "late" : ""}"><b>${esc(x.text)}</b><small class="muted">${esc(x.domain)} · ${esc(pretty(x.due, { weekday: "short", day: "numeric", month: "short" }))}</small></div>`).join("") || emptyHTML("No deadlines this week.")}</div>
          </section>
        </div>

        <section class="glass">
          <div class="cardHead"><div><p class="kicker">Pending</p><h3>Pending tasks</h3></div>
            <button class="btn small primary" data-act="goTo" data-to="checklist">Open checklist</button></div>
          <div class="list">${p.slice(0, 6).map(taskRow).join("") || emptyHTML("All clear. No pending tasks.")}</div>
        </section>
      </div>

      <aside class="dashSide">
        <section class="glass">
          <div class="cardHead"><div><p class="kicker">${esc(new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }))}</p><h3>Calendar</h3></div></div>
          ${miniCalHTML()}
          <div class="legend mt"><span><i class="plan"></i>Plan day</span><span><i class="due"></i>Deadline</span></div>
        </section>
        <section class="glass">
          <div class="cardHead"><div><p class="kicker">Timeline</p><h3>Today's topics</h3></div></div>
          <div class="timeline">${items.length ? items.map(d => `<div class="tlItem ${topicDone(t, d.key) ? "done" : ""}"><span class="tlDot"></span><div><b>${esc(d.label)}</b><small>${esc(String(row[d.key]).split(":")[0]).slice(0, 80)}</small></div></div>`).join("") : emptyHTML("Nothing planned today.")}</div>
          <div class="row mt"><button class="btn small primary" data-act="addAllToday">Add all to checklist</button></div>
        </section>
      </aside>
    </div>

    <section class="glass">
      <div class="cardHead"><div><p class="kicker">Settings</p><h3>Google Drive and backup</h3><p class="muted small">${driveSignedIn ? "Signed in as " + esc(driveEmail) + ". " + (S.pendingSync ? "Saving…" : "Last saved to Drive: " + (S.lastSynced ? new Date(S.lastSynced).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "not yet")) : "Not signed in. Sign in with Google to keep your progress in Drive and open it on any device."}</p></div></div>
      <div class="row">${driveSignedIn
        ? `<button class="btn ghost" data-act="driveSave">Save now</button><button class="btn ghost" data-act="driveLoad">Load from Drive</button><button class="btn ghost" data-act="driveLogout">Sign out</button>`
        : `<button class="btn primary" data-act="driveConnect">Sign in with Google</button>`}
        <button class="btn ghost" data-act="exportData">Download backup file</button>
        <label class="btn ghost">Restore from file<input class="sr" type="file" accept="application/json" data-chg="importData"></label>
      </div>
    </section>
  </section>`;
}

/* ================= checklist ================= */
function topicDone(d, k) { return !!S.topicDone[d + "|" + k]; }
function planDates() { const out = []; let d = PLAN_START; while (d <= PLAN_END) { out.push(d); d = addDays(d, 1); } return out; }
function openCountFor(d) {
  const row = dayRow(d);
  const tasks = S.tasks.filter(x => x.due === d && !x.done).length;
  const topics = row ? DOMAINS.filter(x => row[x.key] && !topicDone(d, x.key)).length : 0;
  return tasks + topics;
}
/* Domain-wise checklist for one date: plan topics, tasks, and fitness, one tile per domain */
function domainChecklistHTML(sel) {
  const row = dayRow(sel);
  const tiles = DOMAINS.map(x => {
    const txt = row ? row[x.key] : "";
    const tasks = sortTasks(S.tasks.filter(t => t.due === sel && t.domain === x.label));
    const items = [];
    if (txt) items.push(`<label class="checkRow"><input type="checkbox" data-chg="topic" data-date="${sel}" data-k="${x.key}" ${topicDone(sel, x.key) ? "checked" : ""}><div><p class="small">${lk(txt)}</p></div></label>`);
    tasks.forEach(t => items.push(`<label class="checkRow ${t.done ? "done" : ""}"><input type="checkbox" data-chg="taskDone" data-id="${esc(t.id)}" ${t.done ? "checked" : ""}><div class="grow">${esc(t.text)}</div><button class="icon" data-act="delTask" data-id="${esc(t.id)}" aria-label="Delete task">&times;</button></label>`));
    const total = (txt ? 1 : 0) + tasks.length;
    const done = (txt && topicDone(sel, x.key) ? 1 : 0) + tasks.filter(t => t.done).length;
    return `<div class="domTile">
      <div class="tileHead"><span class="tag">${esc(x.label)}</span><span class="muted small">${done}/${total}</span></div>
      ${items.join("") || `<p class="muted small">Nothing planned</p>`}
      <div class="row mt"><input class="domIn" data-dom="${x.key}" placeholder="Add a ${esc(x.label)} task"><button class="btn small ghost" data-act="addDomTask" data-dom="${x.key}" data-date="${sel}">Add</button></div>
    </div>`;
  }).join("");
  const f = getFit(sel);
  const fitTile = `<div class="domTile">
      <div class="tileHead"><span class="tag">Fitness</span><span class="muted small">${[f.gym, f.cardio].filter(Boolean).length}/2</span></div>
      <label class="checkRow"><input type="checkbox" data-chg="fitDay" data-date="${sel}" data-f="gym" ${f.gym ? "checked" : ""}><div>Gym: 1 hour</div></label>
      <label class="checkRow"><input type="checkbox" data-chg="fitDay" data-date="${sel}" data-f="cardio" ${f.cardio ? "checked" : ""}><div>Walk: 1 hour</div></label>
    </div>`;
  return `<div class="tileGrid">${tiles}${fitTile}</div>`;
}

function renderChecklist() {
  const sel = uiState.checkDate, row = dayRow(sel), idx = dayIndex(sel);
  const suggested = row ? DOMAINS.filter(x => row[x.key] && !S.tasks.some(t => t.text === row[x.key] && t.due === sel)) : [];
  const pending = sortTasks(pendingTasks());
  const strip = planDates().map(d => {
    const dt = new Date(d + "T00:00:00");
    const cls = [d === sel ? "sel" : "", d === today() ? "now" : "", openCountFor(d) ? "due" : ""].join(" ").trim();
    return `<button class="dateChip ${cls}" data-act="chkPick" data-date="${d}"><span>${esc(dt.toLocaleDateString("en-IN", { weekday: "short" }))}</span><b>${dt.getDate()}</b><i></i></button>`;
  }).join("");
  const nav = `<section class="card dayNav">
    <div class="row between"><div class="row">
      <button class="btn ghost" data-act="chkStep" data-step="-1">‹ Prev</button>
      <button class="btn ghost" data-act="chkStep" data-step="1">Next ›</button>
      <button class="btn ghost" data-act="chkToday">Today</button>
    </div>
    <div class="row"><input type="date" value="${sel}" data-chg="checkDate" style="width:auto">
      <span class="muted small">${idx ? `Day ${idx} of ${TOTAL_DAYS}` : ""}</span></div></div>
    <div class="dateStrip mt">${strip}</div>
  </section>`;
  const pendingCard = `<section class="card">
    <div class="cardHead"><div><p class="kicker">Pending</p><h3>Pending checklists</h3></div><span class="tag">${pending.length} open</span></div>
    <div class="list">${pending.map(taskRow).join("") || emptyHTML("Nothing pending. Well done.")}</div>
  </section>`;
  const suggestTiles = suggested.map(x => `<div class="domTile hTile">
      <div class="tileHead"><span class="tag">${esc(x.label)}</span></div>
      <p class="small">${lk(row[x.key])}</p>
      <button class="btn small ghost" data-act="addDomain" data-d="${x.key}" data-date="${sel}">Add to checklist</button>
    </div>`).join("");
  const suggestCard = `<section class="card">
    <div class="cardHead"><div><h3>Suggested checklist</h3></div>
      ${suggested.length ? `<button class="btn primary" data-act="addAllSuggested" data-date="${sel}">Add all ${suggested.length}</button>` : ""}</div>
    ${suggested.length ? `<div class="hScroll">${suggestTiles}</div>` : emptyHTML(row ? "All of this day's topics are already in your checklist." : "Nothing planned for this day.")}
  </section>`;
  const addCard = `<section class="card">
    <div class="cardHead"><div><h3>Add a task</h3></div></div>
    <div class="row">
      <input id="dayTaskText" placeholder="Type a task">
      <select id="dayTaskDomain">${domainOptions("Other")}</select>
      <input id="dayTaskDue" type="date" value="${sel}">
      <button class="btn primary" data-act="addDayTask">Add task</button>
    </div>
  </section>`;
  return nav + addCard + pendingCard + suggestCard;
}

/* ================= syllabus ================= */
const TYPE_LABEL = { video: "VIDEO", course: "COURSE", book: "BOOK", guide: "GUIDE", paper: "PAPER", blog: "ESSAY", slides: "SLIDES", folder: "FOLDER" };
function resourcesSectionHTML() {
  const open = uiState.openTracks || {};
  const intro = `<section class="card"><h3>Resources</h3><p class="muted small">Open a track to see its resources. Tick each one when you finish it. Links open the source; "Search for this" opens a search for the exact title.</p></section>`;
  const tracks = RESOURCE_TRACKS.map(t => {
    const done = t.items.filter(it => S.resDone[t.id + ":" + it.t]).length;
    return `<details class="resDetails" data-track="${t.id}" ${open[t.id] ? "open" : ""}><summary><b>${esc(t.title)}</b> <span class="muted small">${esc(t.weeks)} · ${done}/${t.items.length} done</span></summary>${trackHTML(t)}</details>`;
  }).join("");
  return intro + tracks + `<section class="card"><p class="muted small">Descriptions are short summaries written from the titles and your Drive folder notes. Resources belong to their authors and publishers; open each source to read or watch it there.</p></section>`;
}
const RES_TYPES = [["all", "All"], ["video", "Video"], ["course", "Course"], ["book", "Book"], ["guide", "Guide"], ["folder", "Folder"]];
const TYPE_COLOR = { video: "#3F51B5", course: "#7A8BEA", book: "#FF4081", guide: "#3F51B5", paper: "#FF4081", blog: "#7A8BEA", slides: "#3F51B5", folder: "#7A8BEA" };
function renderResources() {
  const type = uiState.resType || "all";
  const track = RESOURCE_TRACKS.find(t => t.id === uiState.resTrack) || RESOURCE_TRACKS[0];
  const doneOf = t => t.items.filter(it => S.resDone[t.id + ":" + it.t]).length;
  const total = RESOURCE_TRACKS.reduce((a, t) => a + t.items.length, 0);
  const done = RESOURCE_TRACKS.reduce((a, t) => a + doneOf(t), 0);
  const pctAll = total ? Math.round((done / total) * 100) : 0;
  const stats = [["Resources", total], ["Completed", done], ["Remaining", total - done], ["Domains", RESOURCE_TRACKS.length]];
  const statHTML = stats.map(([k, v]) => `<div class="resStat"><span>${esc(k)}</span><b>${v}</b></div>`).join("");
  const seg = RES_TYPES.map(([k, l]) => {
    const n = k === "all" ? track.items.length : track.items.filter(it => it.type === k).length;
    return `<button class="${k === type ? "on" : ""}" data-act="resType" data-type="${k}">${l}<em>${n}</em></button>`;
  }).join("");
  const side = RESOURCE_TRACKS.map(t => {
    const d = doneOf(t), p = t.items.length ? Math.round((d / t.items.length) * 100) : 0;
    return `<button class="resTrackCard ${t.id === track.id ? "on" : ""}" data-act="resTrack" data-track="${t.id}">
      <div class="rtTop"><b>${esc(t.title)}</b><span>${p}%</span></div>
      <div class="rtBar"><div style="width:${p}%"></div></div>
      <small>${d} of ${t.items.length} done · ${esc(t.weeks)}</small></button>`;
  }).join("");
  const items = track.items.filter(it => type === "all" || it.type === type);
  const rows = items.map((it, i) => {
    const key = track.id + ":" + it.t, ck = !!S.resDone[key];
    return `<div class="resRow ${ck ? "done" : ""}">
      <span class="rIdx">${String(i + 1).padStart(2, "0")}</span>
      <div class="rMain"><span class="rName">${esc(it.t)}</span><span class="rSrc">${esc(it.src)}</span></div>
      <span><span class="badge b-${esc(it.type)}">${TYPE_LABEL[it.type] || "LINK"}</span></span>
      <a class="rOpen" href="${esc(it.url)}" target="_blank" rel="noopener">Open ↗</a>
      <label class="rCheck"><input type="checkbox" data-chg="resDone" data-id="${esc(key)}" ${ck ? "checked" : ""} aria-label="Mark done"></label>
    </div>`;
  }).join("") || emptyHTML("No resources of this type in this track.");
  const pct = track.items.length ? Math.round((doneOf(track) / track.items.length) * 100) : 0;
  const cards = items.map(it => {
    const key = track.id + ":" + it.t, ck = !!S.resDone[key];
    const isSearch = (it.url || "").indexOf("google.com/search") > -1;
    return `<article class="resTask ${ck ? "done" : ""}" style="--tc:${TYPE_COLOR[it.type] || "#3F51B5"}">
      <div class="rtHead"><span class="badge b-${esc(it.type)}">${TYPE_LABEL[it.type] || "LINK"}</span>
        <label class="rCheck small"><input type="checkbox" data-chg="resDone" data-id="${esc(key)}" ${ck ? "checked" : ""}> Done</label></div>
      <h4>${esc(it.t)}</h4>
      <p class="muted small">${esc(it.desc)}</p>
      ${it.why ? `<p class="why small">${esc(it.why)}</p>` : ""}
      <a class="rlink" href="${esc(it.url)}" target="_blank" rel="noopener">${isSearch ? "Search for this" : "Open source"} ↗</a>
    </article>`;
  }).join("");
  return `<section class="resPage">
    <header class="resHeader">
      <div><p class="kicker">Library</p><h2 class="dashTitle">Resources</h2>
        <p class="muted">${total} resources across ${RESOURCE_TRACKS.length} domains · ${pctAll}% complete</p></div>
      <div class="segCtl" role="tablist" aria-label="Filter by type">${seg}</div>
    </header>
    <div class="resStats">${statHTML}</div>
    <div class="resGrid2">
      <aside class="resSide">${side}</aside>
      <section class="resTable">
        <div class="resTableHead"><div><p class="kicker">${esc(track.verb)} · ${esc(track.weeks)}</p><h3>${esc(track.title)}</h3></div>
          <span class="tag">${doneOf(track)} / ${track.items.length} done</span></div>
        <div class="resHead"><span></span><span>Name</span><span>Type</span><span></span><span>Done</span></div>
        <div class="resBody">${rows}</div>
      </section>
    </div>
    <section class="resOverview">
      <div class="rovText"><p class="kicker">Track overview</p><h3>${esc(track.title)}</h3>
        <p class="muted">${esc(track.premise)}</p>
        <div class="rovMeta"><div><b>Outcome</b><p>${esc(track.outcome)}</p></div><div><b>Ship</b><p>${esc(track.ship)}</p></div></div></div>
      <div class="rovBar"><div class="bar grad"><div style="width:${pct}%"></div></div><span class="small muted">${pct}% complete</span></div>
    </section>
    <div class="resTaskGrid">${cards || emptyHTML("No resources of this type in this track.")}</div>
    <p class="muted small">Descriptions are short summaries written from the titles and your Drive folder notes.</p>
  </section>`;
}
function trackHTML(t) {
  const done = t.items.filter(it => S.resDone[t.id + ":" + it.t]).length;
  return `<section class="card">
    <div class="cardHead"><div><p class="muted small">${esc(t.verb)} · ${esc(t.weeks)}</p><h3>${esc(t.title)}</h3></div><span class="tag">${done}/${t.items.length} done</span></div>
    <p>${esc(t.premise)}</p>
    <div class="resMeta"><div><b>Outcome</b><p>${esc(t.outcome)}</p></div><div><b>Ship</b><p>${esc(t.ship)}</p></div></div>
    <div class="resGrid">${t.items.map(it => resCardHTML(t, it)).join("")}</div>
  </section>`;
}
function resCardHTML(t, it) {
  const key = t.id + ":" + it.t;
  const checked = !!S.resDone[key];
  const isSearch = (it.url || "").indexOf("google.com/search") > -1;
  return `<article class="resCard ${checked ? "done" : ""}">
    <div class="resTop"><span class="badge b-${esc(it.type)}">${TYPE_LABEL[it.type] || "LINK"}</span>${it.core ? `<span class="badge b-core">START HERE</span>` : ""}
      <label class="resTick"><input type="checkbox" data-chg="resDone" data-id="${esc(key)}" ${checked ? "checked" : ""}> Done</label></div>
    <h4>${esc(it.t)}</h4>
    <p class="resSrc">${esc(it.src)}</p>
    <p>${esc(it.desc)}</p>
    ${it.learn ? `<ul class="learn">${it.learn.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    ${it.why ? `<p class="why"><b>Why:</b> ${esc(it.why)}</p>` : ""}
    <a class="rlink" href="${esc(it.url)}" target="_blank" rel="noopener">${isSearch ? "Search for this" : "Open source"} ↗</a>
  </article>`;
}

function timetableHTML(sel) {
  const row = dayRow(sel) || {};
  const content = {
    routine: "Review today's checklist below", core: row.core || "", web: row.web || "", ai: row.ai || "",
    maths: row.maths || "", fin: row.fin || row.sc || "", case: row.case || "",
    gym: "Tick the exercise checklist on the Fitness page", walk: "", buffer: "", break: "", sleep: ""
  };
  const rowsHTML = WEEKDAY_TIMETABLE.map(([s, e, k, label]) => `<div class="ttRow ${k === "break" || k === "sleep" ? "brk" : ""}">
      <span class="ttTime">${s} – ${e}</span>
      <div class="grow"><b>${esc(label)}</b>${content[k] ? `<div class="small">${lk(content[k])}</div>` : ""}</div>
    </div>`).join("");
  return `<section class="card">${rowsHTML}</section>`;
}
function renderDay() {
  const sel = uiState.synDate, idx = dayIndex(sel);
  return `<section class="card dayNav">
      <button class="btn ghost" data-act="synStep" data-step="-1">‹ Prev day</button>
      <button class="btn ghost" data-act="synStep" data-step="1">Next day ›</button>
      <a class="btn ghost" href="#syllabus">Back to plan calendar</a>
      <div class="grow"></div><span class="muted small">${idx ? `Day ${idx} of ${TOTAL_DAYS}` : ""}</span>
    </section>
    <section class="card">
      <div class="cardHead"><div><h3>Domain-wise checklist</h3><p class="muted small">Tick topics, add tasks, and track gym and walk</p></div></div>
      ${domainChecklistHTML(sel)}
    </section>`;
}
function monthGroupsHTML(sel, only) {
  const all = planDates();
  const groups = {};
  all.forEach((d, i) => { const k = d.slice(0, 7); if (only && k !== only) return; (groups[k] = groups[k] || []).push({ d, i: i + 1 }); });
  const q = (uiState.planSearch || "").trim().toLowerCase();
  return Object.keys(groups).map(k => {
    const label = new Date(k + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const items = groups[k];
    const doneDays = items.filter(({ d }) => openCountFor(d) === 0).length;
    const pct = items.length ? Math.round((doneDays / items.length) * 100) : 0;
    const shown = items.filter(({ d }) => {
      if (!q) return true;
      const row = dayRow(d) || {};
      return (row.core || "").toLowerCase().includes(q) || pretty(d).toLowerCase().includes(q);
    });
    const cards = shown.map(({ d, i }) => {
      const row = dayRow(d) || {};
      const n = openCountFor(d);
      const cm = (row.core || "").match(/^(.*?) \(.*day (\d+) of (\d+)/);
      const core = cm ? `Core day ${cm[2]} of ${cm[3]}` : "Buffer day";
      const cls = [d === sel ? "sel" : "", d === today() ? "today" : ""].join(" ").trim();
      return `<button class="planCard ${cls}" data-act="pickSynDate" data-date="${d}">
        <div class="pcTop"><span class="pcDay">Day ${i}</span><span class="pcDots" aria-hidden="true">•••</span></div>
        <b class="pcTitle">${esc(pretty(d, { weekday: "short", day: "numeric", month: "short" }))}</b>
        <p class="pcDesc">${esc(core)}</p>
        <div class="pcMeta"><span><em>Open</em> ${n ? n + " topics" : "all done"}</span><span><em>Status</em> ${n ? "In progress" : "Done"}</span></div>
      </button>`;
    }).join("") || emptyHTML("No days match this search.");
    return `<section class="planPanel">
      <div class="ppHead"><div><p class="kicker">Plan</p><h3>${esc(label)}</h3></div>
        <input class="ppSearch" type="search" placeholder="Search topic or date" value="${esc(uiState.planSearch || "")}" data-chg="planSearch"></div>
      <div class="ppBar"><span class="ppLabel">All</span><div class="bar grad"><div style="width:${pct}%"></div></div><span class="small muted">${pct}% complete</span></div>
      <div class="planGrid">${cards}</div>
    </section>`;
  }).join("");
}
function renderSyllabus() {
  const u = uiState, sel = u.synDate, row = dayRow(sel), idx = dayIndex(sel);
  const cal = planDates().map((d, i) => {
    const n = openCountFor(d);
    const cls = [d === sel ? "sel" : "", d === today() ? "today" : ""].join(" ").trim();
    return `<button class="${cls}" data-act="pickSynDate" data-date="${d}"><span class="dd">${i + 1}</span><span class="dm">${esc(pretty(d, { day: "numeric", month: "short" }))}</span><span class="dn">${n ? n + " open" : "all done"}</span></button>`;
  }).join("");
  const tiles = DOMAINS.map(x => {
    const txt = row ? row[x.key] : "";
    if (!txt) return `<div class="topicTile muted"><div class="tileHead"><span class="tag">${esc(x.label)}</span></div><p class="small">Nothing scheduled</p></div>`;
    const done = topicDone(sel, x.key);
    return `<div class="topicTile ${done ? "done" : ""}">
      <div class="tileHead"><span class="tag">${esc(x.label)}</span><input type="checkbox" data-chg="topic" data-date="${sel}" data-k="${x.key}" ${done ? "checked" : ""} aria-label="Topic done"></div>
      <p>${lk(txt)}</p>
      <button class="btn small ghost" data-act="addDomain" data-d="${x.key}" data-date="${sel}">Add to checklist</button>
    </div>`;
  }).join("");
  return `
  <section class="card">
    <h3>Plan calendar</h3>
    <p class="muted small">Tap a date to see the domains and topics planned for that day.</p>
    <div class="monthSel">${PLAN_MONTHS.map(([k, l]) => `<button class="${k === (u.planMonth || "2026-11") ? "on" : ""}" data-act="setPlanMonth" data-m="${k}">${l}</button>`).join("")}</div>
    <div class="mt">${monthGroupsHTML(sel, u.planMonth || "2026-11")}</div>
  </section>
  <section class="card">
    <div class="cardHead"><div><h3>${esc(pretty(sel, { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</h3><p class="muted small">${idx ? `Day ${idx} of ${TOTAL_DAYS}` : "Outside the plan window"}</p></div>
      <div class="row">
        <button class="btn ghost" data-act="synStep" data-step="-1">‹ Prev</button>
        <button class="btn ghost" data-act="synStep" data-step="1">Next ›</button>
        <button class="btn primary" data-act="editDay" data-date="${sel}">${icon("edit")} Edit this day</button>
      </div></div>
    ${row ? `<div class="row"><button class="btn primary" data-act="openDay" data-date="${sel}">Open checklist for ${esc(pretty(sel, { day: "numeric", month: "short" }))}</button></div>` : emptyHTML("No syllabus for this date.")}
  </section>
  <div class="row end"><button class="btn ghost" data-act="toggleAll">${u.showAll ? "Hide full table" : "Show full table"}</button><button class="btn ghost" data-act="resetSyllabus">Reset to original plan</button></div>` +
    (u.showAll ? syllabusTable() : "");
}
function syllabusTable() {
  const head = `<tr><th>Date</th>${DOMAINS.map(d => `<th>${esc(d.label)}</th>`).join("")}<th></th></tr>`;
  const rows = syllabus().map(r => `<tr class="${r.date === today() ? "today" : ""}">
    <td class="nowrap">${esc(pretty(r.date))}</td>
    ${DOMAINS.map(d => `<td>${r[d.key] ? esc(r[d.key]) : '<span class="muted">-</span>'}</td>`).join("")}
    <td><button class="icon" data-act="editDay" data-date="${r.date}" aria-label="Edit day">${icon("edit")}</button></td></tr>`).join("");
  return `<section class="card"><div class="tableWrap"><table><thead>${head}</thead><tbody>${rows}</tbody></table></div></section>`;
}
function openDayEditor(date) {
  const row = dayRow(date) || { date };
  openModal(`Edit · ${pretty(date, { day: "numeric", month: "short", year: "numeric" })}`,
    `<input type="hidden" id="editDate" value="${date}">
     <p class="muted small">Leave a field empty for a day with nothing scheduled in that domain.</p>
     <div class="formGrid">${DOMAINS.map(d => `<label class="field"><span>${esc(d.label)}</span><textarea class="dayField" data-f="${d.key}" rows="2">${esc(row[d.key] || "")}</textarea></label>`).join("")}</div>
     <div class="row end"><button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn primary" data-act="saveDay">Save day</button></div>`);
}

/* ================= goals ================= */
function renderGoals() {
  const G = goals();
  const total = G.length || 1;
  const overall = Math.round(G.reduce((a, g) => a + (g.type === "check" ? (goalDone(g) ? 100 : 0) : pct(goalValue(g), g.target)), 0) / total);
  const checks = G.filter(g => g.type === "check"), counts = G.filter(g => g.type === "count");
  const cats = GOAL_CATEGORIES.filter(c => c !== "Competitions" && G.some(g => g.cat === c));
  return `
  <section class="card hero">
    <div><span class="muted">Overall goal progress</span><b class="big">${overall}%</b>
      <p class="muted small">${checks.filter(goalDone).length} of ${checks.length} milestones and ${counts.filter(goalDone).length} of ${counts.length} targets reached.</p></div>
    <div class="grow"></div>
    <button class="btn primary" data-act="addGoal">${icon("plus")} Add goal</button>
  </section>
  ${cats.map(c => goalCategoryHTML(c, G.filter(g => g.cat === c))).join("")}
  ${competitionsHTML()}`;
}
function goalCategoryHTML(cat, items) {
  return `<section class="card"><div class="cardHead"><h3>${esc(cat)}</h3><span class="muted small">${items.filter(goalDone).length} of ${items.length} done</span></div>
    <div class="list">${items.map(goalRow).join("")}</div></section>`;
}
function goalRow(g) {
  const done = goalDone(g);
  const meta = (g.domain ? `<span class="tag">${esc(g.domain)}</span>` : "") + (g.auto ? `<span class="tag soft">Auto-tracked</span>` : "");
  const actions = `<button class="icon" data-act="editGoal" data-id="${g.id}" aria-label="Edit goal">${icon("edit")}</button><button class="icon" data-act="delGoal" data-id="${g.id}" aria-label="Delete goal">${icon("trash")}</button>`;
  if (g.type === "check") {
    return `<div class="goalRow ${done ? "done" : ""}"><input type="checkbox" data-chg="goalCheck" data-id="${g.id}" ${done ? "checked" : ""} aria-label="Done"><div class="grow"><b>${esc(g.name)}</b><div class="meta">${meta}</div></div>${actions}</div>`;
  }
  const v = goalValue(g);
  return `<div class="goalRow"><div class="grow">
      <div class="between"><b>${esc(g.name)}</b><span class="muted small">${v} / ${g.target}${g.unit ? " " + esc(g.unit) : ""}</span></div>
      <div class="bar goal"><div style="width:${pct(v, g.target)}%"></div></div>
      <div class="meta">${meta}</div></div>
    <input class="numIn" type="number" min="0" value="${v}" ${g.auto ? "disabled" : ""} data-chg="goalCount" data-id="${g.id}" aria-label="Current value">${actions}</div>`;
}
function competitionsHTML() {
  const statuses = ["Planned", "In progress", "Submitted", "Done", "Missed"];
  const rows = S.competitions.map(c => `<div class="goalRow">
      <div class="grow"><b>${esc(c.name)}</b><div class="meta"><span class="muted small">${c.date ? esc(pretty(c.date, { day: "numeric", month: "short", year: "numeric" })) : "No date set"}</span>${c.notes ? `<span class="muted small">· ${esc(c.notes)}</span>` : ""}</div></div>
      <select data-chg="compStatus" data-id="${c.id}" aria-label="Status">${statuses.map(s => `<option ${s === c.status ? "selected" : ""}>${s}</option>`).join("")}</select>
      <button class="icon" data-act="editComp" data-id="${c.id}" aria-label="Edit">${icon("edit")}</button>
      <button class="icon" data-act="delComp" data-id="${c.id}" aria-label="Delete">${icon("trash")}</button></div>`).join("");
  return `<section class="card"><div class="cardHead"><h3>Competitions</h3><button class="btn small primary" data-act="addComp">${icon("plus")} Add competition</button></div>
    <div class="list">${rows || emptyHTML("No competitions yet. Add the ones you are preparing for.")}</div></section>`;
}
function goalForm(g) {
  g = g || { cat: "Other", type: "count", target: 1, unit: "", auto: "", domain: "", name: "" };
  const cats = GOAL_CATEGORIES.filter(c => c !== "Competitions");
  return `<input type="hidden" id="gId" value="${g.id || ""}">
  <div class="formGrid">
    <label class="field"><span>Name</span><input id="gName" value="${esc(g.name)}"></label>
    <label class="field"><span>Category</span><select id="gCat">${cats.map(c => `<option ${c === g.cat ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></label>
    <label class="field"><span>Type</span><select id="gType"><option value="count" ${g.type === "count" ? "selected" : ""}>Count (a number)</option><option value="check" ${g.type === "check" ? "selected" : ""}>Checkbox (done or not)</option></select></label>
    <label class="field"><span>Target</span><input id="gTarget" type="number" min="1" value="${g.target}"></label>
    <label class="field"><span>Unit (optional)</span><input id="gUnit" value="${esc(g.unit)}" placeholder="hrs, problems, days"></label>
    <label class="field"><span>Auto-track from</span><select id="gAuto">${[["", "Manual entry"], ["gym", "Gym sessions"], ["cardio", "Walk sessions"], ["diet", "Diet followed days"], ["logdays", "Expense logging days"]].map(([v, l]) => `<option value="${v}" ${v === (g.auto || "") ? "selected" : ""}>${l}</option>`).join("")}</select></label>
    <label class="field"><span>Domain (optional)</span><select id="gDomain"><option value="">None</option>${TASK_DOMAINS.map(d => `<option ${d === g.domain ? "selected" : ""}>${esc(d)}</option>`).join("")}</select></label>
  </div>
  <div class="row end"><button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn primary" data-act="saveGoal">Save goal</button></div>`;
}
function compForm(c) {
  c = c || { name: "", date: "", status: "Planned", notes: "" };
  return `<input type="hidden" id="cId" value="${c.id || ""}">
  <div class="formGrid">
    <label class="field"><span>Competition name</span><input id="cName" value="${esc(c.name)}" placeholder="e.g. Axis Bank MOVES 2026"></label>
    <label class="field"><span>Date</span><input id="cDate" type="date" value="${c.date || ""}"></label>
    <label class="field"><span>Status</span><select id="cStatus">${["Planned", "In progress", "Submitted", "Done", "Missed"].map(s => `<option ${s === c.status ? "selected" : ""}>${s}</option>`).join("")}</select></label>
    <label class="field"><span>Notes</span><input id="cNotes" value="${esc(c.notes)}" placeholder="Team, theme, deadline"></label>
  </div>
  <div class="row end"><button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn primary" data-act="saveComp">Save</button></div>`;
}

/* ================= progress ================= */
function computeStats() {
  const t = today();
  const total = S.tasks.length, done = S.tasks.filter(x => x.done).length;
  const overdue = S.tasks.filter(isOverdue).length;
  const act = activityDays();
  const streak = streakFrom(act), best = bestStreak(act);
  const cutoff = addDays(t, -6);
  const last7 = S.tasks.filter(x => x.done && x.doneDate >= cutoff && x.doneDate <= t).length;
  const pace = last7 / 7;
  const byDomain = TASK_DOMAINS.map(name => {
    const ts = S.tasks.filter(x => x.domain === name);
    return { name, total: ts.length, done: ts.filter(x => x.done).length };
  }).filter(x => x.total);
  const pending = total - done;
  const notes = [];
  if (!total) notes.push("No tasks yet. Add tasks from a photo or by typing them on the Checklist page.");
  else {
    notes.push(`You have completed ${done} of ${total} tasks (${pct(done, total)}%).`);
    if (overdue) notes.push(`${overdue} task(s) are overdue. Clear them first. They stay on your Home screen until done.`);
    const worked = byDomain.filter(d => d.total >= 2).sort((a, b) => pct(a.done, a.total) - pct(b.done, b.total));
    if (worked.length) notes.push(`Lowest progress is in ${worked[0].name} (${pct(worked[0].done, worked[0].total)}%). Give it a focused block tomorrow.`);
    const daysLeft = Math.max(0, Math.round((new Date(PLAN_END + "T00:00:00") - new Date(t + "T00:00:00")) / 86400000));
    if (pending && pace > 0) notes.push(`At last week's pace (${pace.toFixed(1)} tasks a day) the ${pending} pending tasks take about ${Math.ceil(pending / pace)} days. ${daysLeft} days are left in the plan.`);
    else if (pending) notes.push("No tasks completed in the last 7 days. Start with one small task today to restart momentum.");
  }
  const gymS = streakFrom(setOf("gym")), gymDays = setOf("gym").size;
  notes.push(`Gym: ${gymDays} session(s) logged, current streak ${gymS} day(s).`);
  const dietDays = setOf("diet").size;
  notes.push(`Diet followed on ${dietDays} day(s). Missed-day reasons are on the Fitness analytics page.`);
  notes.push(`Expenses logged on ${loggedDays().size} day(s). Log every day to keep the budget honest.`);
  return { total, done, pending, overdue, streak, best, last7, pace, pct: pct(done, total), byDomain, notes };
}
function renderProgress() {
  const s = computeStats();
  const tiles = [["Overall", `${s.pct}%`], ["Completed", `${s.done}/${s.total}`], ["Pending", s.pending], ["Overdue", s.overdue], ["Current streak", `${s.streak} d`], ["Best streak", `${s.best} d`], ["Done, last 7 days", s.last7], ["Pace per day", s.pace.toFixed(1)]];
  return `
  <div class="tiles">${tiles.map(([k, v]) => `<div class="tile"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>
  <div class="split">
    <section class="card"><h3>Completion by domain</h3>${s.byDomain.length ? s.byDomain.map(d => barRow(d.name, d.done, d.total)).join("") : emptyHTML("Add tasks to see domain progress.")}</section>
    <section class="card"><h3>Analysis</h3><ul class="insights">${s.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul></section>
  </div>
  <section class="card"><div class="cardHead"><h3>Streak calendar · 26 Nov to 15 Feb</h3></div>${calendarHTML()}${legendHTML()}</section>`;
}

/* ================= fitness ================= */
function fitStripHTML(d) {
  return planDates().map(x => {
    const dt = new Date(x + "T00:00:00"), ff = getFit(x);
    const cls = [x === d ? "sel" : "", x === today() ? "now" : "", (ff.gym && ff.cardio) ? "done" : ""].join(" ").trim();
    return `<button class="dateChip ${cls}" data-act="fitPick" data-date="${x}"><span>${esc(dt.toLocaleDateString("en-IN", { weekday: "short" }))}</span><b>${dt.getDate()}</b><i></i></button>`;
  }).join("");
}
function renderFitness() {
  const d = uiState.fitDate || today(), f = getFit(d);
  const w = EXERCISE_WEEK[new Date(d + "T00:00:00").getDay()];
  const done = (S.exDone && S.exDone[d]) || {};
  const count = w.items.filter((_, i) => done[i]).length;
  const pct = w.items.length ? Math.round((count / w.items.length) * 100) : 0;
  const gs = streakFrom(setOf("gym")), cs = streakFrom(setOf("cardio")), ds = streakFrom(setOf("diet"));
  const dow = new Date(d + "T00:00:00").getDay();
  const exRows = w.items.map((it, i) => {
    const img = EX_IMG[dow + "|" + it[0]];
    return `<label class="exRow ${done[i] ? "done" : ""}">
      <input type="checkbox" data-chg="exercise" data-date="${d}" data-i="${i}" ${done[i] ? "checked" : ""}>
      ${img ? `<img class="exThumb" alt="" src="${img}">` : `<span class="exNoImg">${String(i + 1).padStart(2, "0")}</span>`}
      <div class="grow"><b>${esc(it[0])}</b>${it[1] ? `<span class="muted small"> · ${esc(it[1])}</span>` : ""}</div>
    </label>`;
  }).join("");
  const meals = S.meals.map(m => `<div class="goalRow"><span class="timeBadge">${esc(m.time)}</span><div class="grow">${esc(m.name)}</div><button class="icon" data-act="delMeal" data-id="${m.id}" aria-label="Delete meal">${icon("trash")}</button></div>`).join("");
  return `
  <section class="dash">
    <div class="dashHead">
      <div>
        <h2 class="dashTitle">Fitness</h2>
        <p class="muted">${esc(pretty(d, { weekday: "long", day: "numeric", month: "long" }))} · ${esc(w.tag)} · ${esc(w.title)}</p>
      </div>
      <div class="statRow">
        <div class="statCard"><b>${gs}</b><span>Gym streak</span></div>
        <div class="statCard"><b>${cs}</b><span>Walk streak</span></div>
        <div class="statCard"><b>${ds}</b><span>Diet streak</span></div>
        <div class="statCard"><b>${count}/${w.items.length}</b><span>Exercises today</span></div>
      </div>
    </div>

    <section class="glass dayNav">
      <div class="row between"><div class="row">
        <button class="btn ghost" data-act="fitStep" data-step="-1">‹ Prev</button>
        <button class="btn ghost" data-act="fitStep" data-step="1">Next ›</button>
        <button class="btn ghost" data-act="fitToday">Today</button>
      </div><div class="row"><input type="date" value="${d}" data-chg="fitDate" style="width:auto"></div></div>
      <div class="dateStrip mt">${fitStripHTML(d)}</div>
    </section>

    <div class="dashGrid">
      <div class="dashMain">
        <section class="glass">
          <div class="cardHead"><div><p class="kicker">${esc(w.tag)}</p><h3>${esc(w.title)}</h3></div>
            <span class="tag">${count}/${w.items.length} done</span></div>
          <div class="bar grad"><div style="width:${pct}%"></div></div>
          <div class="exList mt">${exRows}</div>
        </section>
        <details class="glass posterCard">
          <summary><b>Weekly workout poster</b> <span class="muted small">Photos with sets and reps for every day</span></summary>
          <img class="poster" src="${POSTER_SRC}" alt="Weekly workout plan with photos">
        </details>
      </div>

      <aside class="dashSide">
        <section class="glass">
          <div class="cardHead"><div><p class="kicker">Habits</p><h3>Today's habits</h3></div>
            <button class="btn small ghost" data-act="openAnalytics">${icon("chart")} Analytics</button></div>
          <div class="habit ${f.gym ? "on" : ""}" data-act="fitToggle" data-f="gym"><span class="hDot"></span><div><b>Gym</b><small>1 hour session</small></div><span class="hState">${f.gym ? "Done" : "Tap to tick"}</span></div>
          <div class="habit ${f.cardio ? "on" : ""}" data-act="fitToggle" data-f="cardio"><span class="hDot"></span><div><b>Walk</b><small>1 hour: dinner, calls and messages</small></div><span class="hState">${f.cardio ? "Done" : "Tap to tick"}</span></div>
          <div class="dietBox">
            <div class="between"><b>Following my diet?</b>
              <div class="seg"><button class="${f.diet === "yes" ? "on" : ""}" data-act="setDiet" data-v="yes">Yes</button><button class="${f.diet === "no" ? "on" : ""}" data-act="setDiet" data-v="no">No</button></div></div>
            ${f.diet === "no" ? `<textarea rows="2" placeholder="Optional note: what did you eat differently?" data-chg="fit" data-date="${d}" data-field="dietNote">${esc(f.dietNote || "")}</textarea>` : ""}
          </div>
        </section>

        <section class="glass">
          <div class="cardHead"><div><p class="kicker">Meals</p><h3>Planned meals</h3></div>
            <label class="switch"><input type="checkbox" data-chg="setting" data-k="mealAlerts" ${S.settings.mealAlerts ? "checked" : ""}> Reminders</label></div>
          <div class="list">${meals || emptyHTML("No meals planned yet.")}</div>
          <div class="row mt"><input id="mealName" placeholder="e.g. Oats with fruit"><input id="mealTime" type="time" value="08:00" style="width:auto"><button class="btn primary" data-act="addMeal">Add</button></div>
        </section>

        <section class="glass">
          <p class="kicker">Reminders</p><h3>Daily reminder times</h3>
          <div class="stack mt">
            <label class="field"><span>Gym (1 hr)</span><input type="time" value="${S.settings.gymTime}" data-chg="setting" data-k="gymTime"></label>
            <label class="field"><span>Walk (1 hr)</span><input type="time" value="${S.settings.cardioTime}" data-chg="setting" data-k="cardioTime"></label>
          </div>
        </section>
      </aside>
    </div>
  </section>`;
}
function analyticsHTML() {
  const days = []; let d = today();
  for (let i = 0; i < 14; i++) { days.push(d); d = addDays(d, -1); }
  const counts = {};
  Object.keys(S.fitness).forEach(k => { const r = S.fitness[k].reason; if (r) counts[r] = (counts[r] || 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const rows = days.map(day => {
    const f = getFit(day), missed = !f.gym || !f.cardio;
    return `<tr><td class="nowrap">${esc(pretty(day))}</td><td>${f.gym ? "Done" : "Missed"}</td><td>${f.cardio ? "Done" : "Missed"}</td>
      <td>${f.diet ? (f.diet === "yes" ? "Followed" : "Not followed") : "-"}</td>
      <td>${missed ? `<select data-chg="reason" data-date="${day}">${REASONS.map(r => `<option value="${esc(r)}" ${r === (f.reason || "") ? "selected" : ""}>${r || "Select a reason"}</option>`).join("")}</select>` : `<span class="muted">-</span>`}</td></tr>`;
  }).join("");
  return `${streakTiles()}
    <p class="muted small mt">${top ? `Most common reason for missed sessions: <b>${esc(top[0])}</b> (${top[1]} day${top[1] === 1 ? "" : "s"}).` : "Pick a reason on any missed day to see your patterns here."}</p>
    <div class="tableWrap mt"><table><thead><tr><th>Date</th><th>Gym</th><th>Walk</th><th>Diet</th><th>Reason if missed</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* ================= budget ================= */
function spentIn(m, cat) {
  return S.expenses.filter(e => e.date.slice(0, 7) === m && (!cat || e.category === cat)).reduce((a, e) => a + (Number(e.amount) || 0), 0);
}
function budgetSetup(m, b) {
  const prev = S.budgets[prevMonth(m)];
  const src = b || (prev ? { total: prev.total, categories: prev.categories } : { total: 0, categories: DEFAULT_CATEGORIES.map(n => ({ name: n, limit: 0 })) });
  return `<section class="card">
    <h3>${b ? "Edit" : "Set up"} the budget for ${esc(monthLabel(m))}</h3>
    <p class="muted small">Set your monthly total and category limits at the start of the month. ${prev && !b ? "Last month's limits are pre-filled." : ""}</p>
    <div class="stack mt">
      <label class="field"><span>Total monthly budget (₹)</span><input id="budTotal" type="number" min="0" value="${src.total || ""}"></label>
      <div class="formGrid">${src.categories.map(c => `<label class="field"><span>${esc(c.name)} (₹)</span><input type="number" min="0" data-budcat="${esc(c.name)}" value="${c.limit || ""}"></label>`).join("")}</div>
      <div class="row"><input id="budNewCat" placeholder="Add another category (optional)"></div>
      <div class="row end">
        ${b ? `<button class="btn ghost" data-act="cancelBudget">Cancel</button>` : ""}
        <button class="btn primary" data-act="saveBudget">Save budget</button>
      </div>
    </div></section>`;
}
function renderBudget() {
  const m = MONTH(), b = S.budgets[m];
  if (!b || uiState.editingBudget) return budgetSetup(m, b);
  const t = today();
  const spent = spentIn(m), remaining = b.total - spent;
  const safe = remaining > 0 ? remaining / daysLeftInMonth() : 0;
  const allocated = b.categories.reduce((a, c) => a + (Number(c.limit) || 0), 0);
  const todaySpend = S.expenses.filter(e => e.date === t).reduce((a, e) => a + (Number(e.amount) || 0), 0);
  const logged = loggedDays().has(t);
  const mExp = S.expenses.filter(e => e.date.slice(0, 7) === m).sort((x, y) => (x.date < y.date ? 1 : -1));
  const cats = b.categories.map(c => {
    const sp = spentIn(m, c.name), lim = Number(c.limit) || 0, rem = lim - sp, p = pct(sp, lim);
    const cls = !lim ? "" : sp > lim ? "bad" : p >= 80 ? "warn" : "";
    return `<div class="tile"><span>${esc(c.name)}</span><b class="${rem < 0 ? "late" : ""}">${money(rem)}</b><small>left of ${money(lim)} · spent ${money(sp)}</small><div class="bar ${cls}"><div style="width:${p}%"></div></div></div>`;
  }).join("");
  const ed = loggedDays(), cells = [];
  for (let i = 1; i <= daysInMonth(m); i++) {
    const day = `${m}-${String(i).padStart(2, "0")}`;
    const cls = day > t ? "future" : ed.has(day) ? "hit" : "miss";
    cells.push(`<i class="${cls}${day === t ? " today" : ""}" title="${esc(pretty(day))}">${i}</i>`);
  }
  return `
  <section class="card">
    <div class="cardHead"><div><h3>${esc(monthLabel(m))}</h3><p class="muted small">Budget ${money(b.total)} · ${allocated !== b.total ? `${money(b.total - allocated)} not assigned to a category` : "fully assigned to categories"}</p></div>
      <button class="btn ghost" data-act="editBudget">${icon("edit")} Edit budget</button></div>
    <div class="tiles">
      <div class="tile"><span>Remaining</span><b class="${remaining < 0 ? "late" : ""}">${money(remaining)}</b><small>of ${money(b.total)}</small></div>
      <div class="tile"><span>Spent this month</span><b>${money(spent)}</b><small>${mExp.length} entries</small></div>
      <div class="tile"><span>Safe spend per day</span><b>${money(safe)}</b><small>${daysLeftInMonth()} days left</small></div>
      <div class="tile ${logged ? "ok" : ""}"><span>Logged today</span><b>${logged ? "Yes" : "Not yet"}</b><small>Spent today ${money(todaySpend)}</small></div>
    </div>
  </section>
  <section class="card"><h3>Category budgets</h3><div class="tiles">${cats || emptyHTML("No categories yet. Edit the budget to add some.")}</div></section>
  <section class="card">
    <h3>Log an expense</h3>
    <div class="row">
      <input id="expDate" type="date" value="${t}">
      <input id="expAmt" type="number" min="0" step="1" placeholder="Amount (₹)">
      <select id="expCat">${b.categories.map(c => `<option>${esc(c.name)}</option>`).join("")}</select>
      <input id="expNote" placeholder="Note (optional)">
      <button class="btn primary" data-act="addExp">Add</button>
    </div>
    <div class="row mt">
      <button class="btn ghost" data-act="noSpend">${S.noSpend[t] ? "Undo no-spend day" : "Mark today as no-spend day"}</button>
      <label class="switch">Daily log reminder at <input type="time" value="${S.settings.expenseTime}" data-chg="setting" data-k="expenseTime"></label>
    </div>
  </section>
  <section class="card"><h3>This month's entries</h3><div class="list">${mExp.map(e => `<div class="task">
      <div class="taskText"><span>${money(e.amount)} · ${esc(e.category)}</span><div class="meta"><span class="muted">${esc(pretty(e.date))}</span>${e.note ? `<span class="muted">· ${esc(e.note)}</span>` : ""}</div></div>
      <button class="icon" data-act="delExp" data-id="${e.id}" aria-label="Delete entry">${icon("trash")}</button></div>`).join("") || emptyHTML("No expenses logged this month yet.")}</div></section>
  <section class="card"><h3>Daily log · ${esc(monthLabel(m))}</h3>
    <p class="muted small">Green means logged, red means missing. Log every day, even if you spent nothing.</p>
    <div class="cal mt">${cells.join("")}</div></section>`;
}

/* ================= photo import and timetable ================= */
async function startOCR(file) {
  uiState.preview = URL.createObjectURL(file);
  uiState.ocrStatus = "Reading the image on your device...";
  render();
  if (typeof Tesseract === "undefined") {
    uiState.ocrStatus = "The text reader could not load (it needs internet). Type the tasks instead.";
    render(); return;
  }
  try {
    const worker = await Tesseract.createWorker("eng", 1, {
      logger: m => {
        if (m.status === "recognizing text") {
          uiState.ocrStatus = `Reading the image... ${Math.round(m.progress * 100)}%`;
          const el = $("#ocrStatus"); if (el) el.textContent = uiState.ocrStatus;
        }
      }
    });
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    const lines = text.split("\n").map(cleanLine).filter(l => l.length >= 3);
    uiState.ocrText = lines.join("\n");
    uiState.ocrStatus = lines.length ? `Found ${lines.length} possible task(s). Review them, then add.` : "No text found. Try a clearer photo.";
  } catch (err) {
    uiState.ocrStatus = "Could not read that image. Try again, or type the tasks.";
  }
  render();
}
function compressImage(file, maxW = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(src);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error("bad image")); };
    img.src = src;
  });
}

/* ================= actions (clicks) ================= */
const ACT = {
  driveLogout() { driveLogout(); },
  fitToggle(el) { const d = uiState.fitDate || today(), f = el.dataset.f; setFit(d, { [f]: !getFit(d)[f] }); render(); },
  fitPick(el) { uiState.fitDate = el.dataset.date; render(); },
  chkPick(el) { uiState.checkDate = el.dataset.date; render(); },
  resTrack(el) { uiState.resTrack = el.dataset.track; render(); },
  resType(el) { uiState.resType = el.dataset.type; render(); },
  goTo(el) { location.hash = "#" + el.dataset.to; },
  openToday() { uiState.synDate = clampedToday(); uiState.checkDate = uiState.synDate; uiState.planMonth = uiState.synDate.slice(0, 7); location.hash = "#day"; },
  streakInfo() { toast("A day counts when you finish a task, do gym or walk, or log expenses."); },
  toggleFit(el) { const t = today(), f = el.dataset.f; setFit(t, { [f]: !getFit(t)[f] }); render(); },
  setPlanMonth(el) { uiState.planMonth = el.dataset.m; render(); },
  fitStep(el) { uiState.fitDate = addDays(uiState.fitDate || today(), Number(el.dataset.step)); render(); },
  fitToday() { uiState.fitDate = today(); render(); },
  addDomTask(el) {
    const dom = DOMAINS.find(x => x.key === el.dataset.dom);
    const input = document.querySelector('.domIn[data-dom="' + el.dataset.dom + '"]');
    const text = input ? input.value.trim() : "";
    if (!dom || !text) { toast("Type the task in that domain first."); return; }
    addTask(text, dom.label, el.dataset.date, "manual");
    save(); render();
  },
  chkStep(el) { uiState.checkDate = addDays(uiState.checkDate, Number(el.dataset.step)); render(); },
  chkToday() { uiState.checkDate = today(); render(); },
  addAllSuggested(el) {
    const date = el.dataset.date, row = dayRow(date);
    let n = 0;
    if (row) DOMAINS.forEach(d => { if (row[d.key] && addTask(row[d.key], d.label, date, "syllabus")) n++; });
    save(); render();
    toast(n ? `${n} topic(s) added to your checklist.` : "Already in your checklist.");
  },
  pickSynDate(el) { uiState.synDate = el.dataset.date; uiState.checkDate = el.dataset.date; uiState.planMonth = el.dataset.date.slice(0, 7); location.hash = "#day"; },
  openDay(el) { uiState.synDate = el.dataset.date; uiState.checkDate = el.dataset.date; uiState.planMonth = el.dataset.date.slice(0, 7); location.hash = "#day"; },
  toggleTT() { uiState.showTT = !uiState.showTT; render(); },
  pickCheckDate(el) { uiState.checkDate = el.dataset.date; render(); },
  addDayTask() {
    const text = ($("#dayTaskText").value || "").trim();
    const dom = $("#dayTaskDomain").value;
    const due = $("#dayTaskDue").value || uiState.checkDate;
    if (!text) { toast("Type a task first."); return; }
    if (addTask(text, dom, due, "manual")) { save(); render(); toast("Task added with its deadline."); }
    else toast("That task is already on this day.");
  },
  addExercise() {
    const v = ($("#exName").value || "").trim();
    if (!v) return;
    S.exercises = S.exercises || []; S.exercises.push(v); save(); render();
  },
  delExercise(el) { S.exercises.splice(Number(el.dataset.i), 1); save(); render(); },
  driveConnect() { driveLogin(); },
  driveSave() {
    if (!driveSignedIn) { toast("Sign in with Google first."); return; }
    S.pendingSync = true; pushDrive().then(() => toast("Saved to Google Drive."));
  },
  driveLoad() { loadFromDrive().catch(() => toast("Could not load from Google Drive.")); },
  closeModal() { closeModal(); },

  toggleHourly() {
    S.settings.hourly = !S.settings.hourly;
    if (S.settings.hourly) {
      S.settings.lastHourly = Date.now();
      if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => {});
      toast("Hourly reminders are on. You will be reminded about pending tasks every hour.");
    } else toast("Hourly reminders are off.");
    save(); render();
  },

  addDomain(el) {
    const d = DOMAINS.find(x => x.key === el.dataset.d);
    const date = el.dataset.date || today();
    const row = dayRow(date);
    if (!d || !row || !row[d.key]) return;
    const ok = addTask(row[d.key], d.label, date, "syllabus");
    save(); render();
    toast(ok ? `Added the ${d.label} topic to your checklist.` : "That topic is already in your checklist.");
  },

  addAllToday() {
    const t = today(), row = dayRow(t);
    if (!row) return;
    let n = 0;
    DOMAINS.forEach(d => { if (row[d.key] && addTask(row[d.key], d.label, t, "syllabus")) n++; });
    save(); render();
    toast(n ? `${n} topic(s) added to your checklist.` : "All of today's topics are already in your checklist.");
  },

  manualAdd() {
    const parts = $("#manualText").value.split(";").map(s => s.trim()).filter(Boolean);
    const dom = $("#manualDomain").value, due = $("#manualDue").value || "";
    let n = 0;
    parts.forEach(p => { if (addTask(p, dom, due, "manual")) n++; });
    save(); render();
    toast(n ? `${n} task(s) added.` : "Nothing new to add.");
  },

  ocrAdd() {
    const text = ($("#ocrText") || {}).value || "";
    const dom = $("#ocrDomain").value, due = $("#ocrDue").value || "";
    const lines = text.split("\n").map(s => s.trim()).filter(Boolean);
    let n = 0;
    lines.forEach(l => { if (addTask(l, dom, due, "photo")) n++; });
    uiState.ocrDomain = dom;
    uiState.ocrText = "";
    uiState.ocrStatus = n ? `${n} task(s) added to your checklist.` : "Nothing new to add.";
    save(); render();
  },

  delTask(el) { S.tasks = S.tasks.filter(x => x.id !== el.dataset.id); save(); render(); },

  synStep(el) { uiState.synDate = clamp(addDays(uiState.synDate, Number(el.dataset.step)), PLAN_START, PLAN_END); render(); },
  synToday() { uiState.synDate = clampedToday(); render(); },
  toggleAll() { uiState.showAll = !uiState.showAll; render(); },
  editDay(el) { openDayEditor(el.dataset.date || uiState.synDate); },

  saveDay() {
    const date = $("#editDate").value;
    let row = dayRow(date);
    if (!row) {
      row = { date };
      DOMAINS.forEach(d => { row[d.key] = ""; });
      syllabus().push(row);
      syllabus().sort((a, b) => (a.date < b.date ? -1 : 1));
    }
    $$(".dayField").forEach(el => { row[el.dataset.f] = el.value.trim(); });
    save(); closeModal(); render();
    toast("Day updated.");
  },

  resetSyllabus() {
    if (!confirm("Reset the syllabus to the original plan? Your edits will be lost.")) return;
    S.syllabus = buildDefaultSyllabus(); save(); render(); toast("Syllabus reset to the original plan.");
  },

  addGoal() { openModal("Add goal", goalForm(null)); },
  editGoal(el) { openModal("Edit goal", goalForm(goals().find(x => x.id === el.dataset.id))); },
  saveGoal() {
    const id = $("#gId").value, name = $("#gName").value.trim();
    if (!name) { toast("Give the goal a name."); return; }
    const data = {
      name, cat: $("#gCat").value, type: $("#gType").value,
      target: Math.max(1, Number($("#gTarget").value) || 1),
      unit: $("#gUnit").value.trim(), auto: $("#gAuto").value || null, domain: $("#gDomain").value
    };
    if (id) { const g = goals().find(x => x.id === id); if (g) Object.assign(g, data); }
    else goals().push(Object.assign({ id: uid(), value: 0, due: "" }, data));
    save(); closeModal(); render(); toast("Goal saved.");
  },
  delGoal(el) {
    if (!confirm("Delete this goal?")) return;
    S.goals = goals().filter(g => g.id !== el.dataset.id); save(); render();
  },

  addComp() { openModal("Add competition", compForm(null)); },
  editComp(el) { openModal("Edit competition", compForm(S.competitions.find(c => c.id === el.dataset.id))); },
  saveComp() {
    const id = $("#cId").value, name = $("#cName").value.trim();
    if (!name) { toast("Give the competition a name."); return; }
    const data = { name, date: $("#cDate").value, status: $("#cStatus").value, notes: $("#cNotes").value.trim() };
    if (id) Object.assign(S.competitions.find(c => c.id === id) || {}, data);
    else S.competitions.push(Object.assign({ id: uid() }, data));
    save(); closeModal(); render();
  },
  delComp(el) {
    if (!confirm("Delete this competition?")) return;
    S.competitions = S.competitions.filter(c => c.id !== el.dataset.id); save(); render();
  },

  addMeal() {
    const name = $("#mealName").value.trim(), time = $("#mealTime").value;
    if (!name || !time) { toast("Add a meal name and a time."); return; }
    S.meals.push({ id: uid(), name, time });
    S.meals.sort((a, b) => (a.time < b.time ? -1 : 1));
    save(); render();
  },
  delMeal(el) { S.meals = S.meals.filter(m => m.id !== el.dataset.id); save(); render(); },

  setDiet(el) {
    const t = uiState.fitDate || today(), cur = getFit(t).diet;
    setFit(t, { diet: cur === el.dataset.v ? "" : el.dataset.v });
    render();
  },
  openAnalytics() { openModal("Fitness analytics", analyticsHTML()); },

  editBudget() { uiState.editingBudget = true; render(); },
  cancelBudget() { uiState.editingBudget = false; render(); },
  saveBudget() {
    const m = MONTH();
    const total = Math.max(0, Number($("#budTotal").value) || 0);
    if (!total) { toast("Enter your total monthly budget."); return; }
    const categories = $$("[data-budcat]").map(el => ({ name: el.dataset.budcat, limit: Math.max(0, Number(el.value) || 0) }));
    const extra = (($("#budNewCat") || {}).value || "").trim();
    if (extra && !categories.some(c => c.name === extra)) categories.push({ name: extra, limit: 0 });
    S.budgets[m] = { total, categories };
    uiState.editingBudget = false;
    save(); render(); toast("Budget saved for " + monthLabel(m) + ".");
  },
  addExp() {
    const amt = Number($("#expAmt").value);
    if (!(amt > 0)) { toast("Enter an amount greater than 0."); return; }
    S.expenses.push({ id: uid(), date: $("#expDate").value || today(), amount: amt, category: $("#expCat").value, note: $("#expNote").value.trim() });
    save(); render(); toast(`Logged ${money(amt)}.`);
  },
  delExp(el) { S.expenses = S.expenses.filter(e => e.id !== el.dataset.id); save(); render(); },
  noSpend() {
    const t = today();
    if (S.noSpend[t]) delete S.noSpend[t]; else S.noSpend[t] = true;
    save(); render();
  },

  removeTT() { S.timetable = null; save(); render(); toast("Timetable removed."); },
  exportData() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `prepflow-backup-${today()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
  }
};

/* ================= changes (inputs) ================= */
const CHG = {
  planSearch(el) { uiState.planSearch = el.value; render(); },
  fitDate(el) { uiState.fitDate = el.value || today(); render(); },
  resDone(el) { S.resDone[el.dataset.id] = el.checked; save(); render(); },
  taskDone(el) {
    const t = S.tasks.find(x => String(x.id) === String(el.dataset.id));
    if (t) { t.done = el.checked; t.doneDate = el.checked ? today() : ""; save(); render(); }
  },
  fitDay(el) { setFit(el.dataset.date, { [el.dataset.f]: el.checked }); render(); },
  checkDate(el) { uiState.checkDate = el.value || today(); render(); },
  topic(el) { S.topicDone[el.dataset.date + "|" + el.dataset.k] = el.checked; save(); render(); },
  exercise(el) {
    const t = el.dataset.date; S.exDone = S.exDone || {};
    S.exDone[t] = Object.assign({}, S.exDone[t] || {}, { [el.dataset.i]: el.checked });
    save(); render();
  },
  projStatus(el) { S.projStatus[el.dataset.name] = el.value; save(); render(); },
  photo(el) { const f = el.files && el.files[0]; if (f) startOCR(f); },
  timetable(el) {
    const f = el.files && el.files[0]; if (!f) return;
    compressImage(f).then(url => { S.timetable = url; save(); render(); toast("Timetable saved on Home."); })
      .catch(() => toast("Could not read that image. Try a different photo."));
  },
  importData(el) {
    const f = el.files && el.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        S = Object.assign(defaultState(), d, { settings: Object.assign(defaultState().settings, d.settings || {}) });
        save(); render(); toast("Backup restored.");
      } catch (e) { toast("That file is not a PrepFlow backup."); }
    };
    r.readAsText(f);
  },
  ocrText(el) { uiState.ocrText = el.value; },
  task(el) {
    const t = S.tasks.find(x => x.id === el.dataset.id);
    if (t) { t.done = el.checked; t.doneDate = el.checked ? today() : ""; save(); render(); }
  },
  filter(el) { uiState[el.dataset.ui] = el.value; render(); },
  domDate(el) { uiState.domDate = el.value || today(); render(); },
  synDate(el) { uiState.synDate = clamp(el.value || PLAN_START, PLAN_START, PLAN_END); render(); },
  goalCount(el) {
    const g = goals().find(x => x.id === el.dataset.id);
    if (g) { g.value = Math.max(0, Number(el.value) || 0); save(); render(); }
  },
  goalCheck(el) {
    const g = goals().find(x => x.id === el.dataset.id);
    if (g) { g.value = el.checked ? 1 : 0; save(); render(); }
  },
  compStatus(el) {
    const c = S.competitions.find(x => x.id === el.dataset.id);
    if (c) { c.status = el.value; save(); }
  },
  fit(el) {
    const d = el.dataset.date || today();
    const val = el.type === "checkbox" ? el.checked : el.value;
    setFit(d, { [el.dataset.field]: val });
    render();
  },
  reason(el) { setFit(el.dataset.date, { reason: el.value }); },
  setting(el) {
    const k = el.dataset.k;
    S.settings[k] = el.type === "checkbox" ? el.checked : el.value;
    save();
  }
};

function dispatchClick(e) {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const fn = ACT[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el); }
}
function dispatchChange(e) {
  const el = e.target.closest("[data-chg]");
  if (!el) return;
  const fn = CHG[el.dataset.chg];
  if (fn) fn(el);
}
$("#view").addEventListener("click", dispatchClick);
$("#view").addEventListener("change", dispatchChange);
$("#modal").addEventListener("click", e => {
  if (e.target.id === "modal") { closeModal(); return; }
  dispatchClick(e);
});
$("#modal").addEventListener("change", dispatchChange);
$("#modal").addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ================= projects ================= */
function renderProjects() {
  const st = S.projStatus || {};
  const done = PROJECTS.filter(([d, n]) => st[n] === "Done").length;
  const rows = PROJECTS.map(([d, n], i) => {
    const target = addDays(PLAN_START, Math.floor((i * PLAN_DAYS) / PROJECTS.length));
    return `<tr><td>${esc(d)}</td><td>${esc(n)}</td><td class="nowrap">${esc(pretty(target, { day: "numeric", month: "short" }))}</td><td><select data-chg="projStatus" data-name="${esc(n)}">${["Not started", "In progress", "Done"].map(o => `<option ${(st[n] || "Not started") === o ? "selected" : ""}>${o}</option>`).join("")}</select></td></tr>`;
  }).join("");
  return `<section class="card">
    <div class="cardHead"><div><p class="kicker">Projects</p><h3>Project status</h3><p class="muted small">${done} of ${PROJECTS.length} done. Target dates are spread across the 82 days.</p></div></div>
    <div class="tableWrap"><table><thead><tr><th>Domain</th><th>Project</th><th>Target</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
  </section>`;
}

/* ================= Google Drive sync (server session, any device) ================= */
let driveSignedIn = null, driveEmail = "", driveTimer = null, driveBusyPush = false;
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast("Storage is full. Download a backup, then clear old items.", true); }
}
async function checkSession() {
  try {
    const j = await (await fetch("/api/me", { cache: "no-store" })).json();
    driveSignedIn = !!j.signedIn; driveEmail = j.email || "";
  } catch (e) { driveSignedIn = false; }
  return driveSignedIn;
}
function driveLogin() { location.href = "/api/auth/login"; }
function driveLogout() { location.href = "/api/auth/logout"; }
async function driveRequest(method, body) {
  const r = await fetch("/api/drive", { method, cache: "no-store", headers: body ? { "Content-Type": "text/plain" } : {}, body: body || undefined });
  if (r.status === 401) { driveSignedIn = false; throw new Error("signed out"); }
  if (!r.ok) throw new Error("drive error");
  return r.json();
}
async function pushDrive() {
  if (!S.pendingSync || !driveSignedIn || driveBusyPush) return;
  driveBusyPush = true;
  try {
    await driveRequest("POST", JSON.stringify(S));
    S.pendingSync = false; S.lastSynced = new Date().toISOString(); persist(); updateChrome(); render();
  } catch (e) {
    toast("Could not save to Google Drive. Your changes are kept and will retry.", true);
  } finally { driveBusyPush = false; }
}
function autoSaveDrive() { clearTimeout(driveTimer); driveTimer = setTimeout(pushDrive, 1500); }
async function pullDrive() {
  const j = await driveRequest("GET");
  if (!j.found) return false;
  const remote = j.data || {};
  if ((remote.updatedAt || 0) > (S.updatedAt || 0) + 2000) {
    restoreState(remote);
    toast("Loaded your latest progress from Google Drive.");
    return true;
  }
  return false;
}
async function startDrive() {
  if (!(await checkSession())) { render(); return; }
  try { await pullDrive(); } catch (e) {}
  if (S.pendingSync) await pushDrive();
  render();
}
function restoreState(data) {
  const d = defaultState();
  S = Object.assign(d, data, { settings: Object.assign(d.settings, data.settings || {}) });
  S.pendingSync = false;
  persist();
  render();
}
async function loadFromDrive() {
  if (!driveSignedIn) { toast("Sign in with Google first."); return; }
  const found = await pullDrive();
  if (!found) toast("Nothing newer in your Google Drive.");
}

/* ================= init ================= */
window.addEventListener("hashchange", render);
render();
tick();
setInterval(tick, 60 * 1000);
startDrive();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
