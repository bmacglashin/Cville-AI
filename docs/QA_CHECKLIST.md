# Manual QA Checklist

Run before launch and after any meaningful change. ~25 minutes with the local stack
(`supabase start && supabase db reset && npm run dev`).

## Automated gates first

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

All four must pass clean.

## Marketing site (no auth)

- [ ] `/` renders; hero CTA → `/apply`; secondary CTA → `/quickstart#examples`
- [ ] Founding price $950 (struck $1,250) appears in hero subtext, ladder card, founding-offer band
- [ ] Nav: all 5 items + "Apply for the Audit" button work; mobile menu opens/closes
- [ ] `/audit` — pricing card shows $950/$1,250, credit language, "Apply now"
- [ ] `/quickstart` — 7 example workflow cards; demo link panel works
- [ ] `/design-build` — 4 scenes render; CTA works
- [ ] `/command-center` — warning alert ("Read this first") present; positioned post-audit
- [ ] `/demo/ops-brief` — fictional-data alert at top AND human-review notice at bottom
- [ ] `/about` (risk boundaries list), `/founders-note`, `/faq` (accordions toggle), `/privacy`, `/terms`
- [ ] Footer disclaimer line about regulated data present
- [ ] `/sitemap.xml` lists 12 routes; `/robots.txt` disallows admin/portal/start-audit
- [ ] 404 page renders for `/nonsense`

## Application flow

- [ ] `/apply` validation: short bottleneck rejected with friendly message
- [ ] Valid submission → success alert (+ Calendly link if env set)
- [ ] Lead appears in `/admin/leads` with bottleneck text; admin email logged/sent
- [ ] With Supabase env REMOVED: form returns the graceful "email us" error (no crash)

## Auth

- [ ] `/signup` → account + org created → lands in `/portal`
- [ ] `/login` wrong password → friendly error; correct → `/portal` (client) or `/admin` (admin)
- [ ] Signed-out visit to `/portal` → redirected to `/login?next=/portal`
- [ ] Sign out from portal and admin both land on `/`

## Intake wizard (client account)

- [ ] All 7 steps advance; progress bar updates
- [ ] Step validation: empty workflows (step 4) and pains (step 5) blocked with message
- [ ] Refresh mid-wizard → draft restored from localStorage
- [ ] Both acknowledgments required at review step
- [ ] Submit → confirmation screen; revisiting `/start-audit` shows "already in"
- [ ] Org pipeline stage advanced to `intake_submitted` (check `/admin`)
- [ ] Intake + children visible in `/portal/intake` and in admin client page

## Portal (as `client@agentally.test`)

- [ ] Prototype banner visible on every portal page
- [ ] Overview: stage label, intake status, readiness number (seeded org), deliverables, tasks
- [ ] Opportunities sorted by score; score grids render
- [ ] Roadmap columns Now/Next/Later populated
- [ ] Documents page shows "upload intentionally not enabled" alert
- [ ] Messages: client can post; appears in thread (right-aligned)
- [ ] **Isolation:** client sees ONLY Blue Ridge data; `/admin` redirects them to `/portal`

## Admin (as `admin@agentally.test`)

- [ ] Pipeline board: Blue Ridge in "Audit Delivered"; counts in header chips
- [ ] Leads: status select saves; "Convert to client" creates org + contact and links lead
- [ ] Client page: stage move works and logs to activity feed
- [ ] Add: contact, discovery note, opportunity, score (rescore updates total), roadmap item, proposal, line item (negative $ = credit math correct), deliverable, task — each appears without refresh
- [ ] "Generate audit summary (stub)" returns the not-implemented message
- [ ] Messages from admin appear in client portal thread (left-aligned, "Ben")

## Security spot-checks

- [ ] Browser devtools: no `SUPABASE_SERVICE_ROLE_KEY` in any response/bundle (also test-enforced)
- [ ] As client, direct-fetch another org id route `/admin/clients/<id>` → redirect (not data)
- [ ] SQL: `select * from pg_tables where schemaname='public' and rowsecurity=false;` → empty
