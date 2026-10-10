// Flow — Tabroom, simplified.
// A small dependency-free single-page app. All Tabroom access goes through the
// backend in /tabroom (this page never talks to tabroom.com directly).

const TABROOM = "https://www.tabroom.com";
const app = document.getElementById("app");
const state = {
  session: null, // { signedIn, email }
  dashboard: null,
  dashboardAt: 0,
  tournamentsQuery: "",
  eventByTourn: {},
  tabByTourn: {},
  resultsEventByTourn: {},
  refreshTimer: null,
};

// ---------------------------------------------------------------------------
// Tiny helpers

function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "html") el.innerHTML = v; // only used with static strings
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const icon = {
  chev: () => svg('<path d="m9 6 6 6-6 6"/>', "chev"),
  back: () => svg('<path d="m15 6-6 6 6 6"/>'),
  ext: () => svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  refresh: () => svg('<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>'),
  search: () => svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  target: () => svg('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'),
};
function svg(paths, cls) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24");
  s.setAttribute("aria-hidden", "true");
  if (cls) s.setAttribute("class", cls);
  s.innerHTML = paths;
  return s;
}

/** replaceChildren that accepts nested arrays and skips null/false. */
function fill(el, ...children) {
  el.replaceChildren(...children.flat(Infinity).filter((c) => c != null && c !== false && c !== ""));
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    method: opts.method || "GET",
    credentials: "same-origin",
    headers: opts.body ? { "Content-Type": "application/json" } : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const err = new Error((data && data.message) || "Something went wrong. Please try again.");
    err.status = res.status;
    err.code = data && data.code;
    throw err;
  }
  return data;
}

function store(key, value) {
  try {
    if (value === undefined) return JSON.parse(localStorage.getItem("flow." + key) || "null");
    localStorage.setItem("flow." + key, JSON.stringify(value));
  } catch {
    return null;
  }
}

function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  return `${Math.round(m / 60)} hr ago`;
}

function sideClass(side) {
  const s = (side || "").toLowerCase();
  if (/^(aff|pro|gov|prop|og|cg|plaintiff|prosecution)/.test(s)) return "aff";
  if (/^(neg|con|opp|oo|co|defense)/.test(s)) return "neg";
  return "accent";
}

function viewLink(path, tournId) {
  const q = new URLSearchParams({ p: path });
  if (tournId) q.set("t", tournId);
  return "#/view?" + q.toString();
}

function hrefFor(path, tournId) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return { href: path, external: true };
  if (/^\/index\/tourn\/(postings|results)\/[a-z_]+\.mhtml\?/.test(path) && /tourn_id=\d+/.test(path)) {
    return { href: viewLink(path, tournId), external: false };
  }
  return { href: TABROOM + path, external: true };
}

function externalA(href, text, cls = "btn ghost small") {
  return h("a", { class: cls, href, target: "_blank", rel: "noopener" }, text, icon.ext());
}

function myCodes() {
  return (store("myCodes") || []).filter(Boolean);
}

function setLoading(kind = "list") {
  fill(app, 
    kind === "home"
      ? h("div", {}, h("div", { class: "skeleton sk-line", style: "height:40px;width:60%" }), h("div", { class: "skeleton sk-hero", style: "margin-top:20px" }), h("div", { class: "skeleton sk-line" }), h("div", { class: "skeleton sk-line" }))
      : h("div", {}, h("div", { class: "skeleton sk-line", style: "height:40px;width:50%" }), ...Array.from({ length: 5 }, () => h("div", { class: "skeleton sk-line" }))),
  );
}

function errorView(err, retry) {
  return h(
    "div",
    { class: "card empty" },
    h("div", { class: "art" }, "😕"),
    h("h2", {}, "That didn't load"),
    h("p", {}, err.message),
    retry && h("button", { class: "btn", onclick: retry }, icon.refresh(), "Try again"),
  );
}

// ---------------------------------------------------------------------------
// Router

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, qs] = raw.split("?");
  return { path, params: new URLSearchParams(qs || "") };
}

function setNav(name) {
  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === name));
}

async function route() {
  clearInterval(state.refreshTimer);
  const { path, params } = parseHash();
  window.scrollTo(0, 0);

  if (state.session === null) {
    try {
      state.session = await api("/api/auth/session");
    } catch {
      state.session = { signedIn: false };
    }
  }

  let m;
  if (path === "/login") return renderLogin();
  if (path === "/" || path === "") return state.session.signedIn ? renderHome() : (location.hash = "#/login");
  if (path === "/tournaments") return renderTournaments();
  if ((m = path.match(/^\/t\/(\d+)(?:\/(results))?$/))) return renderTournament(Number(m[1]), m[2] || null);
  if (path === "/view") return renderView(params.get("p"), params.get("t"));
  if (path === "/account") return renderAccount();
  location.hash = "#/";
}

window.addEventListener("hashchange", route);

// ---------------------------------------------------------------------------
// Login

function renderLogin() {
  setNav("account");
  if (state.session?.signedIn) {
    location.hash = "#/";
    return;
  }
  const err = h("div", { class: "notice bad", style: "display:none;margin-bottom:14px", role: "alert" });
  const email = h("input", { class: "input", type: "email", name: "email", autocomplete: "username", required: true, placeholder: "you@school.org", inputmode: "email" });
  const pw = h("input", { class: "input", type: "password", name: "password", autocomplete: "current-password", required: true, placeholder: "Your Tabroom password" });
  const toggle = h("button", { type: "button", class: "pw-toggle", onclick: () => {
    pw.type = pw.type === "password" ? "text" : "password";
    toggle.textContent = pw.type === "password" ? "Show" : "Hide";
  } }, "Show");
  const btn = h("button", { class: "btn block", type: "submit" }, "Sign in");

  const remembered = store("email");
  if (remembered) email.value = remembered;

  const form = h(
    "form",
    {
      onsubmit: async (e) => {
        e.preventDefault();
        err.style.display = "none";
        btn.disabled = true;
        btn.replaceChildren(h("span", { class: "spin" }), "Signing in to Tabroom…");
        try {
          const r = await api("/api/auth/login", { method: "POST", body: { email: email.value, password: pw.value } });
          state.session = { signedIn: true, email: r.email };
          state.dashboard = null;
          store("email", r.email);
          location.hash = "#/";
        } catch (e2) {
          err.textContent = e2.message;
          err.style.display = "block";
          btn.disabled = false;
          btn.replaceChildren("Sign in");
          pw.select();
        }
      },
    },
    err,
    h("label", { class: "field" }, h("span", {}, "Tabroom email"), email),
    h("label", { class: "field" }, h("span", {}, "Password"), h("div", { class: "pw-wrap" }, pw, toggle)),
    btn,
  );

  fill(app, 
    h(
      "div",
      { class: "login-wrap" },
      h(
        "div",
        { class: "login" },
        h(
          "div",
          { class: "card" },
          h("img", { class: "hero-mark", src: "/icon.svg", alt: "" }),
          h("h1", {}, "Your rounds, simplified."),
          h("p", { class: "lead" }, "Sign in with your Tabroom account to see your next room, opponent, judges and ballots — all on one screen."),
          form,
          h("p", { class: "fine" }, "Your password goes straight to tabroom.com to sign you in and is never stored. Flow is an independent project and isn't affiliated with Tabroom or the NSDA."),
        ),
        h("p", { class: "alt" }, h("a", { href: "#/tournaments" }, "Just browsing? See tournaments →")),
      ),
    ),
  );
  (remembered ? pw : email).focus();
}

// ---------------------------------------------------------------------------
// Home: my rounds

async function loadDashboard(force) {
  if (!force && state.dashboard && Date.now() - state.dashboardAt < 30_000) return state.dashboard;
  const d = await api("/api/me");
  state.dashboard = d;
  state.dashboardAt = Date.now();
  store("myCodes", d.current.map((e) => e.code).filter(Boolean));
  return d;
}

async function renderHome() {
  setNav("home");
  if (!state.dashboard) setLoading("home");
  else drawHome(state.dashboard);
  try {
    drawHome(await loadDashboard(false));
  } catch (err) {
    if (err.status === 401) {
      state.session = { signedIn: false };
      toast(err.message);
      location.hash = "#/login";
      return;
    }
    fill(app, errorView(err, () => renderHome()));
    return;
  }
  // Keep pairings fresh while a tournament is running.
  state.refreshTimer = setInterval(async () => {
    if (document.hidden || parseHash().path !== "/") return;
    try {
      drawHome(await loadDashboard(true));
    } catch {
      /* keep showing the last good data */
    }
  }, 60_000);
}

function drawHome(d) {
  const first = (d.name || "").split(" ")[0];
  const refreshBtn = h("button", { class: "btn ghost small", onclick: async () => {
    refreshBtn.disabled = true;
    refreshBtn.replaceChildren(h("span", { class: "spin" }), "Refreshing");
    try {
      drawHome(await loadDashboard(true));
      toast("Up to date");
    } catch (e) {
      toast(e.message);
      refreshBtn.disabled = false;
      refreshBtn.replaceChildren(icon.refresh(), "Refresh");
    }
  } }, icon.refresh(), "Refresh");

  const nodes = [
    h(
      "div",
      { class: "page-head" },
      h("div", {}, h("h1", {}, first ? `Hi, ${first}` : "My rounds"), h("p", { class: "sub" }, d.current.length || d.judging.length ? "Here's what's happening right now." : "Nothing live right now.")),
      h("div", { class: "updated" }, h("span", {}, "Updated " + timeAgo(state.dashboardAt)), refreshBtn),
    ),
  ];

  for (const w of d.warnings || []) nodes.push(h("div", { class: "notice" }, w));

  if (d.current.length) {
    nodes.push(h("div", { class: "section" }, h("h2", {}, "Competing"), h("div", { class: "grid" }, d.current.map(entryCard))));
  }
  if (d.judging.length) {
    nodes.push(h("div", { class: "section" }, h("h2", {}, "Judging ", h("span", { class: "count" }, d.judging.length)), h("div", { class: "grid two" }, d.judging.map(judgeCard))));
  }
  if (d.upcoming.length) {
    nodes.push(h("div", { class: "section" }, h("h2", {}, "Coming up ", h("span", { class: "count" }, d.upcoming.length)), h("div", { class: "list" }, d.upcoming.map(upcomingItem))));
  }
  if (!d.current.length && !d.judging.length && !d.upcoming.length) {
    nodes.push(
      h(
        "div",
        { class: "card empty section" },
        h("div", { class: "art" }, "🗓️"),
        h("h2", {}, "You're all caught up"),
        h("p", {}, "When you're entered in or judging a tournament, your rooms, opponents and judges show up here automatically."),
        h("a", { class: "btn", href: "#/tournaments" }, "Browse tournaments"),
      ),
    );
  }
  nodes.push(h("p", { class: "foot" }, "Data comes live from tabroom.com. Always double-check anything critical with the tournament."));
  fill(app, ...nodes);
}

const KNOWN = /^(round|start|room|side|opp|judges?|judges & results|judging)$/i;

function entryCard(e) {
  const [latest, ...earlier] = e.rounds;
  const head = [
    h("div", { class: "eyebrow" }, e.event || "Entry"),
    h("div", { class: "tourn" }, e.tournament),
  ];
  if (!latest) {
    return h(
      "div",
      { class: "card next" },
      head,
      h("div", { class: "big" }, "Pairings not out yet"),
      h("p", { style: "opacity:.85" }, "This page refreshes every minute — your room and opponent will appear here as soon as they're posted."),
      e.code && h("span", { class: "code" }, "Your code: " + e.code),
      e.notes.map((n) => h("div", { class: "code", style: "margin-left:6px" }, n)),
      e.tournId && h("div", { class: "row-actions" }, h("a", { class: "btn ghost small", href: `#/t/${e.tournId}` }, "Tournament", icon.chev())),
    );
  }
  const facts = [];
  const fact = (label, value, wide) => value && facts.push(h("div", { class: wide ? "wide" : "" }, h("dt", {}, label), h("dd", {}, value)));
  fact("Start", latest.start);
  fact("Room", latest.room);
  if (latest.side) fact(sideLabel(latest), latest.side);
  fact("Opponent", latest.opponent);
  for (const f of latest.fields) if (f.label && !KNOWN.test(f.label) && f.value) fact(f.label, f.value);
  if (latest.judges.length) fact("Judges", h("div", {}, latest.judges.map((j) => h("div", {}, j))), true);

  return h(
    "div",
    { class: "card next" },
    head,
    h("div", { class: "big" }, latest.round ? roundTitle(latest.round) : "Latest round"),
    h("dl", { class: "facts" }, facts),
    e.code && h("span", { class: "code" }, "Your code: " + e.code),
    h(
      "div",
      { class: "row-actions" },
      e.tournId && h("a", { class: "btn ghost small", href: `#/t/${e.tournId}` }, "All pairings", icon.chev()),
      latest.links
        .filter((l) => /paradigm/.test(l.href))
        .slice(0, 3)
        .map((l, i) => externalA(TABROOM + l.href, latest.judges.length > 1 ? `Paradigm ${i + 1}` : "Judge paradigm", "btn ghost small")),
    ),
    earlier.length &&
      h(
        "details",
        { class: "history" },
        h("summary", { style: "color:rgba(255,255,255,.85)" }, `Earlier rounds (${earlier.length})`),
        h("div", { class: "past" }, earlier.map(pastRow)),
      ),
  );
}

function sideLabel(r) {
  const f = r.fields.find((x) => /^(side|position|chamber|section)$/i.test(x.label));
  return f ? f.label : "Side";
}

function roundTitle(r) {
  const m = r.match(/^R(\d+)$/i);
  return m ? `Round ${m[1]}` : r;
}

function pastRow(r) {
  const results = r.fields.find((f) => /judg/i.test(f.label));
  return h(
    "div",
    { class: "past-row", style: "background:rgba(255,255,255,.12);color:#fff" },
    h("div", { class: "rnd" }, r.round),
    h(
      "div",
      { class: "meta", style: "color:rgba(255,255,255,.85)" },
      h("div", {}, [r.side && h("b", { style: "color:#fff" }, r.side + " "), r.opponent && `vs ${r.opponent}`, r.room && ` · ${r.room}`]),
      results && results.lines.length ? h("div", {}, results.lines.join(" · ")) : null,
    ),
  );
}

function judgeCard(a) {
  const get = (l) => a.fields.find((f) => f.label.toLowerCase() === l);
  const round = get("round");
  const kv = a.fields
    .filter((f) => f.label && f.label.toLowerCase() !== "round")
    .map((f) => [h("dt", {}, f.label), h("dd", {}, f.lines.length > 1 ? f.lines.map((l) => h("div", {}, l)) : f.value)]);
  const extras = a.fields.filter((f) => !f.label && f.value);
  return h(
    "div",
    { class: "card assign" },
    h("div", { class: "label" }, a.kind === "standby" ? "Standby" : "Judging"),
    h("h3", { style: "font-size:1.35rem;margin-top:4px" }, round ? round.value : a.title),
    a.title && round && h("p", { class: "muted small", style: "margin-top:4px" }, a.title.replace(/^Round at /, "")),
    h("dl", { class: "kv" }, kv),
    extras.map((f) => h("p", { class: "muted small", style: "margin-top:10px" }, f.value)),
    h(
      "div",
      { class: "row-actions" },
      a.ballot && externalA(TABROOM + a.ballot.href, a.ballot.label || "Open ballot", "btn"),
      a.tournId && a.roundId && h("a", { class: "btn ghost small", href: viewLink(`/index/tourn/postings/round.mhtml?tourn_id=${a.tournId}&round_id=${a.roundId}`, a.tournId) }, "Full pairing", icon.chev()),
    ),
    a.ballot && h("p", { class: "faint tiny", style: "margin-top:10px" }, "Ballots open on tabroom.com so nothing gets lost — sign in there if it asks."),
  );
}

function statusChip(status) {
  if (!status) return null;
  const cls = /confirm|re-registered/i.test(status) ? "good" : /wait|approval|dropped|not/i.test(status) ? "warn" : "";
  return h("span", { class: "chip " + cls }, status);
}

function upcomingItem(u) {
  const inner = [
    dateBox(u.dates),
    h(
      "div",
      { class: "main-col" },
      h("div", { class: "title" }, u.tournament),
      h("div", { class: "meta" }, [u.event && h("span", { class: "chip accent" }, u.event), statusChip(u.status), h("span", {}, [u.dates, u.location].filter(Boolean).join(" · "))]),
      u.notes.length ? h("div", { class: "meta" }, u.notes.join(" · ")) : null,
    ),
    u.tournId && icon.chev(),
  ];
  return u.tournId ? h("a", { class: "item", href: `#/t/${u.tournId}` }, inner) : h("div", { class: "item" }, inner);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function dateBox(text) {
  if (!text) return null;
  let mon, day;
  let m = text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})/i);
  if (m) {
    mon = m[1];
    day = m[2];
  } else if ((m = text.match(/\b(\d{4})-(\d{2})-(\d{2})/))) {
    mon = MONTHS[Number(m[2]) - 1];
    day = String(Number(m[3]));
  } else if ((m = text.match(/\b(\d{1,2})\/(\d{1,2})/))) {
    mon = MONTHS[Number(m[1]) - 1];
    day = m[2];
  }
  if (!mon) return null;
  return h("div", { class: "datebox", "aria-hidden": "true" }, h("div", { class: "m" }, mon), h("div", { class: "d" }, day));
}

// ---------------------------------------------------------------------------
// Tournaments

async function renderTournaments() {
  setNav("tournaments");
  const input = h("input", {
    class: "input",
    type: "search",
    placeholder: "Search tournaments by name",
    "aria-label": "Search tournaments",
    value: state.tournamentsQuery,
    enterkeyhint: "search",
  });
  const listEl = h("div", { class: "list" });
  const heading = h("h2", {});
  fill(app, 
    h("div", { class: "page-head" }, h("div", {}, h("h1", {}, "Tournaments"), h("p", { class: "sub" }, "Find any tournament on Tabroom and see its pairings and results."))),
    h("div", { class: "search" }, icon.search(), input),
    h("div", { class: "section" }, heading, listEl),
  );

  let seq = 0;
  const load = async () => {
    const q = input.value.trim();
    state.tournamentsQuery = q;
    const my = ++seq;
    heading.textContent = q ? `Results for “${q}”` : "Upcoming";
    fill(listEl, ...Array.from({ length: 6 }, () => h("div", { class: "skeleton sk-line" })));
    try {
      const r = await api("/api/tournaments" + (q ? "?search=" + encodeURIComponent(q) : ""));
      if (my !== seq) return;
      if (!r.tournaments.length) {
        fill(listEl, h("div", { class: "card empty" }, h("h2", {}, "No tournaments found"), h("p", {}, q ? "Try fewer or different words — e.g. just the city or a key word from the name." : "Tabroom didn't list any upcoming tournaments.")));
        return;
      }
      fill(listEl, ...r.tournaments.map(tournItem));
    } catch (err) {
      if (my === seq) fill(listEl, errorView(err, load));
    }
  };

  let t;
  input.addEventListener("input", () => {
    clearTimeout(t);
    const q = input.value.trim();
    if (q.length === 0 || q.length >= 3) t = setTimeout(load, 450);
  });
  input.addEventListener("keydown", (e) => e.key === "Enter" && (clearTimeout(t), load()));
  load();
}

function tournItem(t) {
  return h(
    "a",
    { class: "item", href: `#/t/${t.id}` },
    dateBox(t.dates),
    h(
      "div",
      { class: "main-col" },
      h("div", { class: "title" }, t.name),
      h("div", { class: "meta" }, [h("span", {}, [t.dates, t.location].filter(Boolean).join(" · ")), t.mode.map((m) => h("span", { class: "chip" }, m))]),
      t.registration ? h("div", { class: "meta" }, "Registration: " + t.registration) : null,
    ),
    icon.chev(),
  );
}

async function renderTournament(id, tab) {
  setNav("tournaments");
  setLoading();
  let t;
  try {
    t = await api(`/api/tournaments/${id}`);
  } catch (err) {
    fill(app, h("a", { class: "back", href: "#/tournaments" }, icon.back(), "Tournaments"), errorView(err, () => renderTournament(id, tab)));
    return;
  }
  tab = tab || state.tabByTourn[id] || "pairings";
  state.tabByTourn[id] = tab;

  const body = h("div", { class: "section" });
  const seg = h(
    "div",
    { class: "seg", role: "tablist" },
    ["pairings", "results"].map((k) =>
      h("button", { role: "tab", class: tab === k ? "on" : "", "aria-selected": String(tab === k), onclick: () => (location.hash = k === "results" ? `#/t/${id}/results` : `#/t/${id}`) }, k === "pairings" ? "Pairings" : "Results"),
    ),
  );

  fill(app, 
    h("a", { class: "back", href: "#/tournaments" }, icon.back(), "Tournaments"),
    h("div", { class: "page-head" }, h("div", {}, h("h1", {}, t.name), t.subtitle && h("p", { class: "sub" }, t.subtitle)), externalA(t.tabroomUrl, "Tabroom page")),
    seg,
    body,
  );

  if (tab === "results") return drawResults(id, body);
  drawPairings(t, body);
}

function drawPairings(t, body) {
  const events = t.events.filter((e) => e.rounds.length);
  if (!events.length) {
    fill(body, h("div", { class: "card empty" }, h("div", { class: "art" }, "⏳"), h("h2", {}, "No pairings posted yet"), h("p", {}, "Rounds appear here the moment the tab room publishes them. Pull down or come back in a bit.")));
    return;
  }
  let sel = state.eventByTourn[t.id];
  if (!events.some((e) => e.id === sel)) sel = events[0].id;
  const chips = h("div", { class: "chips", role: "tablist", "aria-label": "Events" });
  const list = h("div", { class: "list", style: "margin-top:8px" });
  const draw = () => {
    state.eventByTourn[t.id] = sel;
    fill(chips, ...events.map((e) => h("button", { class: e.id === sel ? "on" : "", onclick: () => ((sel = e.id), draw()) }, e.name)));
    const ev = events.find((e) => e.id === sel);
    fill(list, 
      ...ev.rounds.map((r, i) =>
        h(
          "a",
          { class: "item round-link", href: viewLink(`/index/tourn/postings/${r.advancing ? "cleared" : "round"}.mhtml?tourn_id=${t.id}&round_id=${r.id}`, t.id) },
          h("div", { class: "main-col" }, h("div", { class: "title" }, r.label), h("div", { class: "meta" }, i === 0 && h("span", { class: "chip good" }, "Latest"), r.advancing && h("span", { class: "chip accent" }, "Advancing entries"))),
          icon.chev(),
        ),
      ),
      ev.bracketResultId ? h("a", { class: "item", href: TABROOM + `/index/tourn/results/bracket.mhtml?tourn_id=${t.id}&result_id=${ev.bracketResultId}`, target: "_blank", rel: "noopener" }, h("div", { class: "main-col" }, h("div", { class: "title" }, "Bracket"), h("div", { class: "meta" }, "Opens on Tabroom")), icon.ext()) : null,
    );
  };
  draw();
  fill(body, chips, list);
}

async function drawResults(id, body, eventId) {
  eventId = eventId || state.resultsEventByTourn[id];
  fill(body, ...Array.from({ length: 4 }, () => h("div", { class: "skeleton sk-line" })));
  let r;
  try {
    r = await api(`/api/tournaments/${id}/results` + (eventId ? `?event=${eventId}` : ""));
  } catch (err) {
    fill(body, errorView(err, () => drawResults(id, body, eventId)));
    return;
  }
  state.resultsEventByTourn[id] = r.selectedEventId;
  const chips = h(
    "div",
    { class: "chips" },
    r.events.map((e) => h("button", { class: e.id === r.selectedEventId ? "on" : "", onclick: () => drawResults(id, body, e.id) }, e.name)),
  );
  const items = r.links.map((l) =>
    h("a", { class: "item", href: viewLink(l.href, id) }, h("div", { class: "main-col" }, h("div", { class: "title" }, l.text)), icon.chev()),
  );
  const files = r.files.map((f) => h("a", { class: "item", href: f.href, target: "_blank", rel: "noopener" }, h("div", { class: "main-col" }, h("div", { class: "title" }, f.text), h("div", { class: "meta" }, "File")), icon.ext()));
  fill(body, 
    r.events.length ? chips : "",
    items.length || files.length
      ? h("div", { class: "list", style: "margin-top:8px" }, items, files)
      : h("div", { class: "card empty" }, h("div", { class: "art" }, "🏆"), h("h2", {}, "No results published yet"), h("p", {}, "Results show up here once the tournament releases them.")),
  );
}

// ---------------------------------------------------------------------------
// Pairing / results table viewer

async function renderView(path, tournId) {
  setNav("tournaments");
  if (!path) return (location.hash = "#/tournaments");
  setLoading();
  const back = h("a", { class: "back", href: tournId ? `#/t/${tournId}` : "#/tournaments" }, icon.back(), "Back");
  let page;
  try {
    page = await api("/api/view?path=" + encodeURIComponent(path));
  } catch (err) {
    fill(app, back, errorView(err, () => renderView(path, tournId)));
    return;
  }

  const codes = myCodes();
  const input = h("input", { class: "input", type: "search", placeholder: "Find a code, school, judge or room", "aria-label": "Find in this page" });
  const jump = codes.length ? h("button", { class: "btn ghost", onclick: () => {
    const hit = [...document.querySelectorAll(".hit")].find((el) => el.offsetParent !== null);
    if (hit) hit.scrollIntoView({ behavior: "smooth", block: "center" });
    else toast("Your code isn't on this page");
  } }, icon.target(), "Find me") : null;

  const tablesEl = h("div", {});
  const draw = () => {
    const q = input.value.trim().toLowerCase();
    fill(tablesEl, 
      ...page.tables.map((t, i) => tableBlock(t, q, codes, tournId, page.tables.length > 1 ? i : -1)),
      page.tables.length ? "" : h("div", { class: "card empty" }, h("h2", {}, "Nothing to show here yet"), h("p", {}, "This page doesn't have a table we can display. You can open it on Tabroom instead."), externalA(page.tabroomUrl, "Open on Tabroom", "btn")),
    );
  };
  input.addEventListener("input", draw);

  fill(app, 
    back,
    h("div", { class: "page-head" }, h("div", {}, h("h1", {}, page.title || "Tabroom"), page.subtitle && h("p", { class: "sub" }, page.subtitle)), externalA(page.tabroomUrl, "Tabroom")),
    page.notes.map((n) => h("div", { class: "notice info", style: "margin-bottom:10px" }, n)),
    h("div", { class: "toolbar" }, h("div", { class: "search" }, icon.search(), input), jump),
    tablesEl,
  );
  draw();
}

function tableBlock(t, q, codes, tournId, index) {
  const headers = t.headers.length ? t.headers : (t.rows[0] || []).map((_, i) => `Column ${i + 1}`);
  const rows = t.rows.filter((cells) => !q || cells.some((c) => c.text.toLowerCase().includes(q)));
  const isMine = (cells) => codes.some((code) => cells.some((c) => c.lines.some((l) => l === code || l.startsWith(code + " "))));

  const cards = h(
    "div",
    { class: "rows desktop-table" },
    rows.map((cells) =>
      h(
        "div",
        { class: "rowcard" + (isMine(cells) ? " hit" : "") },
        h(
          "dl",
          {},
          cells.map((c, i) => (c.text || c.links.length ? [h("dt", {}, headers[i] || ""), h("dd", {}, cellContent(c, q, tournId))] : null)),
        ),
      ),
    ),
  );
  const table = h(
    "div",
    { class: "tablewrap desktop-table" },
    h(
      "table",
      { class: "data" },
      h("thead", {}, h("tr", {}, headers.map((x) => h("th", {}, x)))),
      h("tbody", {}, rows.map((cells) => h("tr", { class: isMine(cells) ? "hit" : "" }, cells.map((c) => h("td", {}, cellContent(c, q, tournId)))))),
    ),
  );
  return h(
    "div",
    { class: "section", style: index > 0 ? "" : "margin-top:0" },
    index >= 0 && h("h2", {}, `Table ${index + 1}`),
    q && h("p", { class: "muted small", style: "margin-bottom:10px" }, `${rows.length} of ${t.rows.length} rows match`),
    rows.length ? [cards, table] : h("div", { class: "card empty" }, h("p", {}, "No rows match your search.")),
  );
}

function cellContent(c, q, tournId) {
  const lines = c.lines.length ? c.lines : [c.text];
  return lines.map((line) => {
    const link = c.links.find((l) => l.text && l.text === line);
    const content = highlight(line, q);
    if (!link) return h("div", {}, content);
    const target = hrefFor(link.href, tournId);
    return h("div", {}, h("a", target.external ? { href: target.href, target: "_blank", rel: "noopener" } : { href: target.href }, content));
  });
}

function highlight(text, q) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return text;
  return [text.slice(0, i), h("mark", {}, text.slice(i, i + q.length)), text.slice(i + q.length)];
}

// ---------------------------------------------------------------------------
// Account

function renderAccount() {
  setNav("account");
  const theme = store("theme") || "auto";
  const seg = h(
    "div",
    { class: "seg", role: "radiogroup", "aria-label": "Theme" },
    ["auto", "light", "dark"].map((k) =>
      h("button", { class: theme === k ? "on" : "", role: "radio", "aria-checked": String(theme === k), onclick: () => (applyTheme(k), renderAccount()) }, k[0].toUpperCase() + k.slice(1)),
    ),
  );
  const signedIn = state.session?.signedIn;
  fill(app, 
    h("div", { class: "page-head" }, h("h1", {}, "Account")),
    h(
      "div",
      { class: "card" },
      signedIn
        ? [
            h("div", { class: "muted small" }, "Signed in to Tabroom as"),
            h("div", { style: "font-weight:700;font-size:1.1rem;margin:2px 0 14px;word-break:break-all" }, state.session.email),
            h("button", { class: "btn ghost", onclick: signOut }, "Sign out"),
          ]
        : [h("p", { class: "muted", style: "margin-bottom:14px" }, "You're browsing without signing in."), h("a", { class: "btn", href: "#/login" }, "Sign in with Tabroom")],
    ),
    h("div", { class: "card" }, h("h3", { style: "margin-bottom:10px" }, "Appearance"), seg),
    h(
      "div",
      { class: "card" },
      h("h3", { style: "margin-bottom:6px" }, "About Flow"),
      h("p", { class: "muted small" }, "Flow is a simpler front end for tabroom.com. It signs in to Tabroom for you and shows the same information in a cleaner way. Your password is sent to Tabroom only and never saved."),
      h("p", { class: "muted small", style: "margin-top:8px" }, "Registration, prefs, and ballots still happen on tabroom.com — Flow links you straight to the right page."),
      h("div", { class: "row-actions" }, externalA(TABROOM, "Open tabroom.com")),
    ),
  );
}

async function signOut() {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {
    /* clear locally anyway */
  }
  state.session = { signedIn: false };
  state.dashboard = null;
  store("myCodes", []);
  toast("Signed out");
  location.hash = "#/login";
}

function applyTheme(t) {
  store("theme", t);
  if (t === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", t);
}

applyTheme(store("theme") || "auto");
route();
