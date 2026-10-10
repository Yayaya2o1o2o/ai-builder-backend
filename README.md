# Flow — Tabroom, simplified

A clean, phone- and laptop-friendly front end for [tabroom.com](https://www.tabroom.com).
Sign in with your normal Tabroom account and see, on one screen:

- **Your next round**: round, start time, room, side, opponent, judges (with paradigm links), plus earlier rounds and results
- **Your judging assignments**: room, start, entries, and a one-tap button to the ballot
- **Coming up**: tournaments you're entered in, with status (confirmed, waitlisted, prefs due, …)
- **Any tournament's pairings and results**, with search and a "Find me" button that jumps to your code

The home screen refreshes itself every minute during a tournament.

Flow is an independent project and isn't affiliated with Tabroom or the NSDA.

## How it works

Tabroom has no public API for regular users, so the backend signs in to Tabroom
for you the same way a browser does, then reads the pages and turns them into JSON:

```
browser ──► web/   (static single-page app, no build step)
        └─► /api/* tabroom/  ──► www.tabroom.com
```

- `tabroom/client.ts`: signs in (loads the login form, echoes its hidden `salt`/`sha` fields, posts your email + password, keeps the `TabroomToken` cookie) and fetches pages.
- `tabroom/parse.ts`: turns Tabroom's HTML into data. It relies on table headers, element ids and link query strings so small layout changes don't break it.
- `tabroom/session.ts`: stores the Tabroom token in an encrypted (AES-256-GCM), HttpOnly cookie. There's no database. **Your password is never stored**; it only goes to Tabroom.
- `tabroom/api.ts`: the endpoints (`/api/auth/*`, `/api/me`, `/api/tournaments`, `/api/tournaments/:id`, `/api/tournaments/:id/results`, `/api/view`).
- `web/public/`: the UI (`index.html`, `app.js`, `styles.css`). Light and dark mode, and it can be installed to a phone's home screen.

Ballots, registration and prefs still happen on tabroom.com. Flow links you straight to the right page.

## Run it

Install [Encore](https://encore.dev/docs/ts/install), then:

```bash
npm install
encore secret set --type dev,local,prod TabroomSessionKey   # any long random string
encore run
```

Open http://localhost:4000. If you skip the secret, a random key is used and everyone is signed out whenever the server restarts.

Set `TABROOM_BASE_URL` to point at a different Tabroom host (for example a staging server).

## Tests

```bash
encore test              # everything (needs the Encore runtime)
npx vitest run tabroom   # just the Tabroom login/parser tests, no Encore needed
```

The parser tests use HTML fixtures in `tabroom/fixtures/`, rebuilt by hand from Tabroom's open-source templates
([speechanddebate/tabroom](https://github.com/speechanddebate/tabroom)). If Tabroom changes a page, save a real copy over the matching fixture and update the parser.

## Deploy

**Vercel**: this repo deploys as-is. `vercel.json` serves `web/public` as the site and runs
`api/router.ts` as one serverless function for every `/api/*` request, using the same handlers as Encore.
In the Vercel project, set the environment variable `TABROOM_SESSION_KEY` to a long random string.
Without it, a key is derived from the project id, which works but isn't secret.

**Encore**:

```bash
git push encore
```

See [Encore's deploy docs](https://encore.dev/docs/platform/deploy/deploying). Each server signs in from its own IP, which is what Tabroom's login check expects.
