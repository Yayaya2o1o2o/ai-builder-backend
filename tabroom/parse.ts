import * as cheerio from "cheerio";
import type { CheerioAPI, Cheerio } from "cheerio";
import type { AnyNode, Element } from "domhandler";

// Parsers that turn Tabroom's HTML pages into plain data.
//
// Tabroom's markup changes from time to time, so these lean on things that are
// stable (table headers, link query strings, element ids) and keep the raw
// label/value pairs around so the UI still shows something useful if a column
// is added or renamed.

// ---------------------------------------------------------------------------
// Shared types

export interface Link {
  text: string;
  href: string; // absolute path on tabroom.com, e.g. "/index/tourn/index.mhtml?tourn_id=1"
}

export interface Cell {
  text: string; // whole cell on one line
  lines: string[]; // cell split on block elements (div, p, br)
  links: Link[];
}

export interface Table {
  headers: string[];
  rows: Cell[][];
}

export interface Field {
  label: string;
  value: string;
  lines: string[];
}

export interface Round {
  round: string;
  start: string;
  room: string;
  side: string;
  opponent: string;
  judges: string[];
  fields: Field[]; // every column, in Tabroom's order
  links: Link[];
}

export interface CurrentEntry {
  entryId?: number;
  tournId?: number;
  tournament: string;
  event: string;
  code: string;
  notes: string[];
  rounds: Round[];
}

export interface UpcomingEntry {
  tournId?: number;
  tournament: string;
  location: string;
  dates: string;
  event: string;
  status: string;
  notes: string[];
}

export interface JudgeAssignment {
  kind: "round" | "standby";
  panelId?: number;
  tournId?: number;
  roundId?: number;
  title: string;
  fields: Field[];
  ballot?: { label: string; href: string };
}

export interface TournamentSummary {
  id: number;
  name: string;
  dates: string;
  location: string;
  mode: string[];
  registration: string;
  events: string[];
}

export interface PostedRound {
  id: number;
  label: string;
  advancing: boolean; // "advancing entries" list rather than a full pairing
}

export interface PostedEvent {
  id: number;
  name: string;
  rounds: PostedRound[];
  bracketResultId?: number;
}

export interface ResultsMenu {
  events: { id: number; name: string }[];
  selectedEventId?: number;
  links: Link[];
  files: Link[];
}

export interface GenericPage {
  title: string;
  subtitle: string;
  notes: string[];
  tables: Table[];
}

// ---------------------------------------------------------------------------
// Helpers

const BLOCK_TAGS = new Set([
  "div", "p", "br", "tr", "li", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "table", "label",
]);

export function clean(s: string | undefined | null): string {
  return (s ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

function removeNoise($: CheerioAPI, root: Cheerio<AnyNode>) {
  root.find("script, style, noscript, .hiddencsv, .hidden, .smallshow, input, select, button").remove();
}

/** Text of an element split on block-level boundaries. */
export function textLines($: CheerioAPI, el: Cheerio<AnyNode>): string[] {
  const out: string[] = [];
  let buf = "";
  const flush = () => {
    const t = clean(buf);
    if (t) out.push(t);
    buf = "";
  };
  const walk = (node: AnyNode) => {
    if (node.type === "text") {
      buf += (node as unknown as { data: string }).data + " ";
      return;
    }
    if (node.type !== "tag") return;
    const tag = (node as Element).tagName.toLowerCase();
    if (tag === "script" || tag === "style") return;
    // Tabroom lays rows out with <span class="full ...">, which render as blocks.
    const block = BLOCK_TAGS.has(tag) || (tag === "span" && /\bfull\b/.test((node as Element).attribs?.class ?? ""));
    if (block) flush();
    for (const child of (node as Element).children) walk(child);
    if (block) flush();
  };
  el.each((_, n) => {
    for (const child of (n as Element).children ?? []) walk(child);
  });
  flush();
  // Drop consecutive duplicates (Tabroom sometimes repeats text in title spans).
  return out.filter((l, i) => l !== out[i - 1]);
}

export function toPath(href: string | undefined, basePath = "/"): string {
  if (!href) return "";
  try {
    const u = new URL(href, "https://www.tabroom.com" + basePath);
    if (!/(^|\.)tabroom\.com$/.test(u.hostname)) return u.toString();
    return u.pathname + u.search;
  } catch {
    return href;
  }
}

export function queryInt(href: string | undefined, key: string): number | undefined {
  if (!href) return undefined;
  const m = href.match(new RegExp(`[?&]${key}=(\\d+)`));
  return m ? Number(m[1]) : undefined;
}

function links($: CheerioAPI, el: Cheerio<AnyNode>, basePath: string): Link[] {
  const out: Link[] = [];
  el.find("a[href]").each((_, a) => {
    const href = toPath($(a).attr("href"), basePath);
    if (!href || href.startsWith("javascript:") || href === "#") return;
    out.push({ text: clean($(a).text()) || clean($(a).attr("title")), href });
  });
  return out;
}

export function parseTable($: CheerioAPI, table: Cheerio<Element>, basePath = "/"): Table {
  removeNoise($, table);
  let headerCells = table.find("thead tr").first().find("th, td");
  let bodyRows = table.find("tbody tr");
  if (!headerCells.length) {
    const first = table.find("tr").first();
    if (first.find("th").length) {
      headerCells = first.find("th, td");
      bodyRows = table.find("tr").slice(1);
    } else {
      bodyRows = table.find("tr");
    }
  }
  if (!bodyRows.length) bodyRows = table.find("tr").not(table.find("thead tr"));
  const headers = headerCells.toArray().map((th) => clean($(th).text()));
  const rows: Cell[][] = [];
  bodyRows.each((_, tr) => {
    const cells = $(tr)
      .children("td, th")
      .toArray()
      .map((td) => {
        const c = $(td);
        const lines = textLines($, c);
        return { text: lines.join(" "), lines, links: links($, c, basePath) };
      });
    if (cells.some((c) => c.text || c.links.length)) rows.push(cells);
  });
  return { headers, rows };
}

function fieldsFromRow(headers: string[], cells: Cell[]): Field[] {
  return cells.map((c, i) => ({ label: headers[i] ?? "", value: c.text, lines: c.lines }));
}

function pick(fields: Field[], ...patterns: RegExp[]): Field | undefined {
  for (const p of patterns) {
    const f = fields.find((x) => p.test(x.label));
    if (f) return f;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Signed-in pages

/** Name shown at the top of the competitor / judge pages. */
export function personName(html: string): string {
  const $ = cheerio.load(html);
  const h = clean($(".main h3").first().text()) || clean($(".main h4").first().text());
  return h.replace(/'s Judging$/i, "");
}

export function roundsFromTable(table: Table): Round[] {
  return table.rows.map((cells) => {
    const fields = fieldsFromRow(table.headers, cells);
    const judgesField = pick(fields, /judg/i);
    return {
      round: pick(fields, /^round/i)?.value ?? "",
      start: pick(fields, /^start/i)?.lines.join(" · ") ?? "",
      room: pick(fields, /^room/i)?.value ?? "",
      side: pick(fields, /^side$/i, /^position$/i, /^chamber$/i, /^section$/i)?.value ?? "",
      opponent: pick(fields, /^opp/i)?.value ?? "",
      judges: judgesField?.lines ?? [],
      fields,
      links: cells.flatMap((c) => c.links),
    };
  });
}

/** Parses /user/student/index.mhtml — the competitor dashboard. */
export function parseStudentDashboard(html: string): { current: CurrentEntry[]; upcoming: UpcomingEntry[] } {
  const $ = cheerio.load(html);
  const base = "/user/student/index.mhtml";

  const current: CurrentEntry[] = [];
  let tournament = "";
  let tournId: number | undefined;
  const scope = $("div.screens.current").length ? $("div.screens.current") : $(".main");

  scope.find("h6, span, div, table, a").each((_, node) => {
    const el = $(node);
    const tag = (node as Element).tagName.toLowerCase();
    if (el.parents("table").length) return; // handled by the table parser
    if (tag === "h6") {
      tournament = clean(el.text());
      tournId = undefined;
      return;
    }
    if (tag === "a") {
      const href = el.attr("href");
      if (!tournId && href && /\/index\/tourn\/index\.mhtml/.test(href)) tournId = queryInt(href, "tourn_id");
      if (current.length && !current[current.length - 1].tournId && tournId) {
        current[current.length - 1].tournId = tournId;
      }
      return;
    }
    if (tag === "table") {
      const t = parseTable($, el as Cheerio<Element>, base);
      if (!t.headers.some((h) => /round/i.test(h))) return;
      let entry = current[current.length - 1];
      if (!entry || entry.rounds.length) {
        entry = { tournament, tournId, event: "", code: "", notes: [], rounds: [] };
        current.push(entry);
      }
      const id = Number(el.attr("id"));
      if (id) entry.entryId = id;
      entry.rounds = roundsFromTable(t);
      return;
    }
    // Event header: <span class="half graytext semibold bigger">Policy Debate (CX)</span>
    const cls = el.attr("class") ?? "";
    if (tag === "span" && /graytext/.test(cls) && /semibold/.test(cls) && /bigger/.test(cls)) {
      const text = clean(el.text());
      if (text) current.push({ tournament, tournId, event: text, code: "", notes: [], rounds: [] });
      return;
    }
    if (tag === "span" && el.children().length === 0) {
      const text = clean(el.text());
      const code = text.match(/^Your Code:\s*(.+)$/i);
      if (code && current.length) current[current.length - 1].code = code[1];
      return;
    }
    if (tag === "div" && el.children().length === 0 && current.length) {
      const text = clean(el.text());
      if (/^(Not Re-Registered|Waitlisted|Re-Registered)$/i.test(text)) current[current.length - 1].notes.push(text);
    }
  });

  const upcoming: UpcomingEntry[] = [];
  const up = $("table#upcoming");
  if (up.length) {
    const t = parseTable($, up as Cheerio<Element>, base);
    for (const cells of t.rows) {
      const f = fieldsFromRow(t.headers, cells);
      const tournCell = cells[0];
      const link = tournCell?.links.find((l) => /tourn_id=/.test(l.href));
      upcoming.push({
        tournId: queryInt(link?.href, "tourn_id"),
        tournament: tournCell?.lines[0] ?? "",
        location: tournCell?.lines.slice(1).join(" ") ?? "",
        dates: pick(f, /^dates?/i)?.value ?? "",
        event: pick(f, /^event/i)?.value ?? "",
        status: pick(f, /^status/i)?.lines[0] ?? "",
        notes: [
          ...(pick(f, /^info/i)?.lines ?? []),
          ...(pick(f, /^status/i)?.lines.slice(1) ?? []),
          ...cells.slice(5).flatMap((c) => c.lines),
        ].filter(Boolean),
      });
    }
  }

  return { current, upcoming };
}

/** Parses /user/judge/panels.mhtml — current judging assignments. */
export function parseJudgeAssignments(html: string): JudgeAssignment[] {
  const $ = cheerio.load(html);
  const out: JudgeAssignment[] = [];
  const scope = $("div.screens.current_ballots").length ? $("div.screens.current_ballots") : $(".main");

  scope.find("div.bluebordertop[id]").each((_, node) => {
    const box = $(node);
    removeNoise($, box);
    const title = clean(box.attr("title"));
    const fields: Field[] = [];
    let ballot: JudgeAssignment["ballot"];

    box.children("div").each((_, row) => {
      const r = $(row);
      const label = clean(r.children("span").first().text());
      const valueEl = r.children("span").slice(1);
      const lines = textLines($, valueEl);
      const ballotA = r.find('a[href*="ballot"], a[href*="confirm"]').first();
      if (ballotA.length) {
        ballot = { label: clean(ballotA.text()) || "Open ballot", href: toPath(ballotA.attr("href"), "/user/judge/") };
      }
      if (label && label.length < 30) {
        fields.push({ label, value: lines.join(" "), lines });
      } else {
        const extra = textLines($, r).filter((l) => l !== ballot?.label);
        if (extra.length) fields.push({ label: "", value: extra.join(" "), lines: extra });
      }
    });

    const schematic = box.find('a[href*="postings/round.mhtml"]').attr("href");
    const isRound = /^Round at/i.test(title) || !!schematic || !!ballot;
    out.push({
      kind: isRound ? "round" : "standby",
      panelId: isRound ? Number(box.attr("id")) || undefined : undefined,
      tournId: queryInt(schematic, "tourn_id"),
      roundId: queryInt(schematic, "round_id"),
      title: title || (isRound ? "Judging assignment" : "Standby"),
      fields: fields.filter((f) => f.label || f.value),
      ballot,
    });
  });
  return out;
}

// ---------------------------------------------------------------------------
// Public pages

/** /index/index.mhtml — upcoming tournaments. */
export function parseTournamentList(html: string): TournamentSummary[] {
  const $ = cheerio.load(html);
  const table = $("table#tournlist");
  if (!table.length) return [];
  const t = parseTable($, table as Cheerio<Element>, "/index/index.mhtml");
  const out: TournamentSummary[] = [];
  for (const cells of t.rows) {
    const link = cells.flatMap((c) => c.links).find((l) => /tourn\/index\.mhtml\?tourn_id=/.test(l.href));
    const id = queryInt(link?.href, "tourn_id");
    if (!id) continue;
    const modeCell = table.find(`a[href*="tourn_id=${id}"]`).first().closest("tr").children("td").eq(4);
    const mode = modeCell
      .find("[title]")
      .toArray()
      .map((e) => clean($(e).attr("title")))
      .map((t) => (/online/i.test(t) ? "Online" : /in-person/i.test(t) ? "In person" : /hybrid/i.test(t) ? "Hybrid" : ""))
      .filter(Boolean);
    out.push({
      id,
      name: cells[1]?.lines.join(" — ") ?? "",
      dates: cells[0]?.text ?? "",
      location: [cells[2]?.text, cells[3]?.text].filter(Boolean).join(", "),
      mode,
      registration: cells[5]?.text ?? "",
      events: [],
    });
  }
  return out;
}

/** /index/search.mhtml?search=… — tournament search results. */
export function parseSearchResults(html: string): TournamentSummary[] {
  const $ = cheerio.load(html);
  const table = $("table#search_results");
  if (!table.length) return [];
  const t = parseTable($, table as Cheerio<Element>, "/index/search.mhtml");
  const out: TournamentSummary[] = [];
  for (const cells of t.rows) {
    const link = cells[0]?.links.find((l) => /tourn_id=/.test(l.href));
    const id = queryInt(link?.href, "tourn_id");
    if (!id) continue;
    out.push({
      id,
      name: cells[0].text,
      location: cells[1]?.text.replace(/,\s*$/, "") ?? "",
      dates: cells[2]?.text ?? "",
      events: cells[3]?.lines ?? [],
      mode: [],
      registration: "",
    });
  }
  return out;
}

/** Name + location line from any /index/tourn/* page. */
export function parseTournamentHeader(html: string): { name: string; subtitle: string; tabs: string[] } {
  const $ = cheerio.load(html);
  const name = clean($("h2").first().text());
  const subtitle = clean($("h2").first().nextAll("h5").first().text()) || clean($("h5").first().text());
  const tabs: string[] = [];
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href") ?? "";
    if (/\/index\/tourn\/postings\/index\.mhtml/.test(href)) tabs.push("pairings");
    if (/\/index\/tourn\/results\/index\.mhtml/.test(href)) tabs.push("results");
    if (/\/index\/tourn\/fields\.mhtml/.test(href)) tabs.push("entries");
    if (/\/index\/tourn\/judges\.mhtml/.test(href)) tabs.push("judges");
  });
  return { name, subtitle: subtitle.replace(/\s*—\s*/g, " — "), tabs: [...new Set(tabs)] };
}

/** /index/tourn/postings/index.mhtml — which rounds have been published. */
export function parsePostings(html: string): PostedEvent[] {
  const $ = cheerio.load(html);
  const names = new Map<number, string>();
  $("select#eventSelector option, select[name=eventSelector] option").each((_, o) => {
    const id = Number($(o).attr("value"));
    if (id) names.set(id, clean($(o).text()));
  });
  const out: PostedEvent[] = [];
  $("div.eventListing[id]").each((_, d) => {
    const div = $(d);
    const id = Number(div.attr("id"));
    if (!id) return;
    const ev: PostedEvent = { id, name: names.get(id) ?? "", rounds: [] };
    div.find("a[href]").each((_, a) => {
      const href = $(a).attr("href") ?? "";
      const label = clean($(a).text());
      if (/results\/bracket\.mhtml/.test(href)) {
        ev.bracketResultId = queryInt(href, "result_id");
        return;
      }
      const roundId = queryInt(href, "round_id");
      if (!roundId) return;
      ev.rounds.push({ id: roundId, label, advancing: /cleared\.mhtml/.test(href) });
    });
    if (!ev.name && ev.rounds[0]) ev.name = ev.rounds[0].label.split(" ")[0];
    out.push(ev);
  });
  for (const [id, name] of names) {
    if (!out.some((e) => e.id === id)) out.push({ id, name, rounds: [] });
  }
  // Show newest rounds first; that's what people look for during a tournament.
  for (const e of out) e.rounds.reverse();
  return out;
}

/** /index/tourn/results/index.mhtml — event picker + list of published results. */
export function parseResultsMenu(html: string): ResultsMenu {
  const $ = cheerio.load(html);
  const events: ResultsMenu["events"] = [];
  let selectedEventId: number | undefined;
  $('select[name="event_id"] option').each((_, o) => {
    const id = Number($(o).attr("value"));
    if (!id) return;
    events.push({ id, name: clean($(o).text()) });
    if ($(o).attr("selected") !== undefined) selectedEventId = id;
  });
  if (!selectedEventId && events[0]) selectedEventId = events[0].id;
  const seen = new Set<string>();
  const out: Link[] = [];
  const files: Link[] = [];
  $(".menu a[href], .sidenote a[href]").each((_, a) => {
    const raw = $(a).attr("href") ?? "";
    const href = toPath(raw, "/index/tourn/results/");
    const text = clean($(a).text());
    if (!text || seen.has(href)) return;
    seen.add(href);
    if (/\/index\/tourn\/results\/(?!index\.mhtml)[a-z_]+\.mhtml/.test(href)) out.push({ text, href });
    else if (/^https?:\/\//.test(href) && !/tabroom\.com\/index/.test(href)) files.push({ text, href });
  });
  return { events, selectedEventId, links: out, files };
}

/** Any public pairing/results page: title + every data table. */
export function parseGenericPage(html: string, basePath: string): GenericPage {
  const $ = cheerio.load(html);
  const main = $(".main").first().length ? $(".main").first() : $("body");
  removeNoise($, main);
  const heads = main.find("h1, h2, h3, h4, h5").toArray().map((h) => clean($(h).text())).filter(Boolean);
  const tables: Table[] = [];
  main.find("table").each((_, t) => {
    if ($(t).parents("table").length) return;
    const table = parseTable($, $(t) as Cheerio<Element>, basePath);
    if (table.rows.length) tables.push(table);
  });
  const notes: string[] = [];
  main.find("p, .explain, .warning").each((_, p) => {
    if ($(p).closest("table").length) return;
    const t = clean($(p).text());
    if (t && t.length < 500) notes.push(t);
  });
  return { title: heads[0] ?? "", subtitle: heads.slice(1, 3).join(" · "), notes: notes.slice(0, 5), tables };
}
