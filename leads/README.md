# Mitingu leads service

Stores demo requests from www.mitingu.com/personality, emails the visitor a
confirmation and Greg a notification, and serves a password-protected admin
area at `/admin` (status, internal note, resend confirmation, CSV export).

Runs on Render as the `mitingu-leads` web service (Frankfurt), with its own
Postgres database `mitingu-leads-db`. The table is created on start-up.

## Settings (Render > mitingu-leads > Environment)

| Key | What it is |
| --- | --- |
| `DATABASE_URL` | Internal Database URL of `mitingu-leads-db` |
| `SENDGRID_API_KEY` | SendGrid API key with Mail Send permission |
| `ADMIN_PASSWORD` | Password for `/admin` (username `greg`) |
| `FROM_EMAIL` | Optional, default `greg.wood@mitingu.com` |
| `NOTIFY_EMAIL` | Optional, default `greg@mitingu.com` |

## The website side

`content/site-content.json` > `site.leadsEndpoint` holds the service's
`/api/demo-requests` address. The form posts there first; if the service
can't be reached it falls back to Web3Forms (which still emails Greg).

## Tests

    TEST_DATABASE_URL=postgres://... npm test

Uses a throwaway database and fakes SendGrid, so nothing is sent.
