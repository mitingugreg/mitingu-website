# Mitingu leads service

Stores demo requests from www.mitingu.com (the /personality quiz and the main
Book a Demo form), emails the visitor a confirmation and Greg a notification, and serves an admin area at `/admin`
(status, internal note, resend confirmation, CSV export).

Signing in: go to `/admin`, enter an allowed email address, and type in the
6-digit code that arrives by email (valid for 10 minutes, one use, 5 tries).
Sessions last 12 hours, or 30 days with "Keep me signed in on this device".
"Sign out" (top right) ends the session straight away.

Runs on Render as the `mitingu-leads` web service (Frankfurt), with its own
Postgres database `mitingu-leads-db`. The table is created on start-up.

## Settings (Render > mitingu-leads > Environment)

| Key | What it is |
| --- | --- |
| `DATABASE_URL` | Internal Database URL of `mitingu-leads-db` |
| `SENDGRID_API_KEY` | SendGrid API key with Mail Send permission |
| `ADMIN_EMAILS` | Optional. Who can sign in, comma-separated (default `greg@mitingu.com,greg.wood@mitingu.com`) |
| `SESSION_SECRET` | Optional extra secret used when storing sign-in codes |
| `FROM_EMAIL` | Optional, default `greg.wood@mitingu.com` |
| `NOTIFY_EMAIL` | Optional, default `greg@mitingu.com` |

## The website side

`content/site-content.json` > `site.leadsEndpoint` holds the service's
`/api/demo-requests` address. Both forms post there.

- The personality quiz sends `source: "personality-quiz ..."`.
- The Book a Demo form (src/site.mjs, `demoForm`) sends `source: "book-a-demo <page>"`
  with name, email, company, event scale and message. No website is asked for, so
  the email domain is stored as the website. It gets its own confirmation and
  notification wording. If the service can't be reached (network error, 5xx,
  rate limit) the form falls back to Web3Forms, which emails Greg directly.

## Tests

    TEST_DATABASE_URL=postgres://... npm test

Uses a throwaway database and fakes SendGrid, so nothing is sent.
