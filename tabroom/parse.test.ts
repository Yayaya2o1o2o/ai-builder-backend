import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as parse from "./parse";
import * as client from "./client";
import { readCookie, seal, unseal } from "./session";

// Fixtures in ./fixtures are hand-built from Tabroom's Mason templates
// (github.com/speechanddebate/tabroom, web/user/student/show_entry.mas,
// web/user/judge/panels.mhtml, web/index/index.mhtml, ...). They mirror the
// markup those templates emit; refresh them from real pages if Tabroom changes.
const fixture = (name: string) => readFileSync(join(__dirname, "fixtures", name), "utf8");

describe("student dashboard", () => {
  const html = fixture("student_index.html");

  test("reads the person's name", () => {
    expect(parse.personName(html)).toBe("Jordan Rivera");
  });

  test("reads current entries with rounds", () => {
    const { current } = parse.parseStudentDashboard(html);
    expect(current).toHaveLength(1);
    const e = current[0];
    expect(e.tournament).toBe("Golden Desert Invitational");
    expect(e.tournId).toBe(30123);
    expect(e.event).toBe("Lincoln Douglas (LD)");
    expect(e.code).toBe("Westview JR");
    expect(e.entryId).toBe(4455667);
    expect(e.rounds).toHaveLength(2);

    const [r3, r2] = e.rounds;
    expect(r3.round).toBe("R3");
    expect(r3.start).toBe("Sat 10/11 · 1:30 PM PDT");
    expect(r3.room).toBe("Science 204");
    expect(r3.side).toBe("Aff");
    expect(r3.opponent).toBe("Northside KP");
    expect(r3.judges).toEqual(["Pat Lee"]);
    expect(r3.links.some((l) => l.href === "/index/paradigm.mhtml?judge_person_id=99")).toBe(true);
    expect(r2.judges.join(" ")).toContain("Sam Ortiz");
  });

  test("reads future tournaments", () => {
    const { upcoming } = parse.parseStudentDashboard(html);
    expect(upcoming).toEqual([
      expect.objectContaining({
        tournId: 30999,
        tournament: "Harvest Classic",
        location: "Fresno CA",
        event: "LD",
        status: "Confirmed",
      }),
    ]);
    expect(upcoming[0].notes.join(" ")).toContain("Prefs Due");
  });
});

describe("judge assignments", () => {
  test("reads round, room, start, entries and ballot link", () => {
    const [a] = parse.parseJudgeAssignments(fixture("judge_panels.html"));
    expect(a.kind).toBe("round");
    expect(a.panelId).toBe(8812345);
    expect(a.tournId).toBe(30123);
    expect(a.roundId).toBe(901234);
    expect(a.title).toContain("Golden Desert Invitational");
    const get = (l: string) => a.fields.find((f) => f.label === l);
    expect(get("Round")?.value).toBe("NLD R4 Flt 2");
    expect(get("Room")?.value).toBe("Library 3");
    expect(get("Start")?.value).toBe("Sat 3:15 PM PDT");
    expect(get("Entries")?.lines).toEqual(["Aff Westview AB", "Neg Central CD"]);
    expect(a.ballot).toEqual({ label: "Start Ballot", href: "/user/judge/ballot.mhtml?panel_id=8812345&judge_id=4433" });
  });
});

describe("public pages", () => {
  test("upcoming tournament list", () => {
    const list = parse.parseTournamentList(fixture("tourn_list.html"));
    expect(list).toEqual([
      expect.objectContaining({
        id: 31001,
        name: "Autumn Swing",
        dates: "Oct 17-18",
        location: "Austin, TX",
        mode: ["In person"],
        registration: "Due 10/14",
      }),
    ]);
  });

  test("tournament header and posted rounds", () => {
    const html = fixture("postings.html");
    const header = parse.parseTournamentHeader(html);
    expect(header.name).toBe("Golden Desert Invitational");
    expect(header.subtitle).toBe("2026 — Phoenix, AZ/US");
    expect(header.tabs).toEqual(["pairings", "results"]);

    const events = parse.parsePostings(html);
    expect(events.map((e) => e.name)).toEqual(["Lincoln Douglas", "Public Forum"]);
    expect(events[0].rounds.map((r) => r.id)).toEqual([900009, 900002, 900001]);
    expect(events[0].rounds[0].advancing).toBe(true);
    expect(events[1].rounds).toEqual([]);
  });

  test("pairing table", () => {
    const page = parse.parseGenericPage(fixture("round.html"), "/index/tourn/postings/round.mhtml?tourn_id=30123&round_id=900002");
    expect(page.title).toBe("LD Round 2");
    expect(page.tables).toHaveLength(1);
    const t = page.tables[0];
    expect(t.headers).toEqual(["Room", "Aff", "Neg", "Judging"]);
    expect(t.rows[0].map((c) => c.text)).toEqual(["Science 101", "Westview JR", "Eastlake SM", "Ortiz, Sam Lee, Pat"]);
    expect(t.rows[0][3].lines).toEqual(["Ortiz, Sam", "Lee, Pat"]);
    expect(t.rows[0][3].links[0].href).toBe("/index/tourn/postings/judge.mhtml?judge_id=55&tourn_id=30123");
  });
});

describe("login", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("echoes hidden fields from the login form", () => {
    expect(client.parseLoginForm(fixture("login.html"))).toEqual({
      tourn_id: "",
      key: "",
      salt: "AbCdEf123",
      sha: "$6$AbCdEf123$xyz/abc.",
      return: "",
      username: "",
      password: "",
    });
  });

  test("logs in and returns the TabroomToken", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      if (url.endsWith("/user/login/login.mhtml")) return new Response(fixture("login.html"), { status: 200 });
      return new Response(null, {
        status: 302,
        headers: [
          ["Location", "/user/home.mhtml"],
          ["Set-Cookie", "TabroomToken=%246%24abc%24def; path=/; HttpOnly"],
        ],
      });
    });
    const res = await client.login(" Me@Example.com ", "hunter2");
    expect(res.token).toBe("%246%24abc%24def");
    const body = new URLSearchParams(String(calls[1].init.body));
    expect(body.get("username")).toBe("Me@Example.com");
    expect(body.get("password")).toBe("hunter2");
    expect(body.get("sha")).toBe("$6$AbCdEf123$xyz/abc.");
    expect(calls[1].init.redirect).toBe("manual");
  });

  test("reports Tabroom's error message on bad credentials", async () => {
    vi.stubGlobal("fetch", async (url: string) => {
      if (url.endsWith("/user/login/login.mhtml")) return new Response(fixture("login.html"), { status: 200 });
      return new Response(null, {
        status: 302,
        headers: { Location: "/user/login/login.mhtml?err=Your%20login%20and/or%20password%20was%20not%20correct." },
      });
    });
    await expect(client.login("a@b.c", "nope")).rejects.toMatchObject({
      kind: "credentials",
      message: "Your login and/or password was not correct.",
    });
  });

  test("treats a bounce to the login page as an expired session", async () => {
    vi.stubGlobal("fetch", async () => {
      const r = new Response("<html></html>", { status: 200 });
      Object.defineProperty(r, "url", { value: "https://www.tabroom.com/user/login/login.mhtml" });
      return r;
    });
    await expect(client.getPage("/user/student/index.mhtml", "tok")).rejects.toMatchObject({ kind: "auth" });
  });
});

describe("session cookie", () => {
  test("round-trips and rejects tampering", () => {
    const data = { token: "tok", email: "a@b.c", iat: Math.floor(Date.now() / 1000) };
    const sealed = seal(data, "k1");
    expect(unseal(sealed, "k1")).toEqual(data);
    expect(unseal(sealed, "k2")).toBeUndefined();
    expect(unseal(sealed.slice(0, -2) + "xx", "k1")).toBeUndefined();
    expect(readCookie(`a=1; tr_session=${sealed}; b=2`, "tr_session")).toBe(sealed);
  });
});

describe("safeViewPath", () => {
  test("allows pairing/results pages and strips unknown params", () => {
    expect(client.safeViewPath("/index/tourn/postings/round.mhtml?tourn_id=1&round_id=2&evil=x")).toBe(
      "/index/tourn/postings/round.mhtml?tourn_id=1&round_id=2",
    );
  });
  test("rejects everything else", () => {
    expect(client.safeViewPath("/user/judge/ballot.mhtml?tourn_id=1")).toBeUndefined();
    expect(client.safeViewPath("https://evil.com/index/tourn/postings/round.mhtml?tourn_id=1")).toBeUndefined();
    expect(client.safeViewPath("/index/tourn/postings/round.mhtml?round_id=2")).toBeUndefined();
    expect(client.safeViewPath("/index/tourn/postings/../../user/x.mhtml?tourn_id=1")).toBeUndefined();
  });
});
