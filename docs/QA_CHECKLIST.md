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
- [ ] Hero + positioning strip read tool-agnostic ("right tool, not one tool"; client-owned)
- [ ] Founding price $950 (struck $1,250) appears in hero subtext, ladder card, founding-offer band
- [ ] "We use the right tool, not one tool" section lists 7 generic categories + the
      case-by-case disclaimer; NO vendor names anywhere public
- [ ] Nav: all 6 items + "Apply for the Audit" button work; mobile menu opens/closes
- [ ] `/audit` — pricing card shows $950/$1,250, credit language, "Apply now"
- [ ] `/quickstart` — 7 example workflow cards; existing-tools-first language; demo link works
- [ ] `/design-build` — 4 scenes render; CTA works
- [ ] `/managed-workspace` — "Read this first" alert; "not a private platform" language;
      client-owned framing; custom-builds-only-post-audit paragraph; tool categories section
- [ ] `/command-center` → 308 redirect to `/managed-workspace`
- [ ] `/demo/ops-brief` — fictional-data alert at top AND human-review notice at bottom
- [ ] `/about` (7 principles incl. right-tool; risk boundaries list), `/founders-note`, `/faq`
      (accordions toggle; tools + custom-build questions present), `/privacy`, `/terms`
- [ ] Footer: "Your accounts. Your data." + regulated-data disclaimer; Managed AI Workspace link
- [ ] `/sitemap.xml` lists 12 routes (managed-workspace, no command-center); `/robots.txt`
      disallows admin/portal/start-audit
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

- [ ] "Client Delivery Room (prototype)" banner visible on every portal page, incl. the
      "does not connect to your business systems" line
- [ ] Overview: stage label, intake status, readiness number (seeded org), deliverables, tasks
- [ ] Opportunities sorted by score; score grids render
- [ ] **Your stack:** shared recommendation renders with items, data boundaries, rejected/defer
      reasons; the client's own tools listed with sensitivity badges; NO internal vendor notes
- [ ] **Audit readout:** seeded client-visible readout renders from markdown (headings, tables,
      lists); drafts/internal readouts do NOT appear
- [ ] Roadmap columns Now/Next/Later populated
- [ ] Documents page shows "upload intentionally not enabled" alert
- [ ] Messages: client can post; appears in thread (right-aligned)
- [ ] **Isolation:** client sees ONLY Blue Ridge data; `/admin` redirects them to `/portal`

## Admin (as `admin@agentally.test`)

- [ ] Pipeline board: Blue Ridge in "Audit Delivered"; counts in header chips
- [ ] Leads: status select saves; "Convert to client" creates org + contact and links lead
- [ ] Client page: stage move works and logs to activity feed; Operating stack + Audit readout
      buttons link to the builders
- [ ] Add: contact, discovery note, opportunity, score (rescore updates total), roadmap item, proposal, line item (negative $ = credit math correct), deliverable, task — each appears without refresh
- [ ] Messages from admin appear in client portal thread (left-aligned, "Ben")

## Operating layer (as admin)

- [ ] `/admin/tools`: 13 seeded vendors; category + approval filters work; internal-only /
      do-not-recommend flags visible; create + edit forms save (bad slug → error banner)
- [ ] `/admin/playbooks`: 10 seeded playbooks; active toggle + duplicate work; edit form
      round-trips; invalid steps JSON → error banner, nothing saved
- [ ] Client stack page: add tool instance (catalog-linked + free-text); create recommendation;
      add items from playbook and from catalog; remove item
- [ ] **Safety rails:** create a recommendation with regulated/prohibited sensitivity → forced
      decline-or-defer with red warning; add an item mentioning tenant screening/HR → forced
      defer with "Safety rail:" reason; internal-only vendor item → defer; rejected vendor →
      rejected
- [ ] Status flow: draft → reviewed → shared; only shared appears in `/portal/stack`
- [ ] Readout builder: "Generate readout draft" produces all 15 sections from seeded data;
      edits save; copy-markdown works; print view renders clean (admin chrome hidden when
      printing); non-public vendors appear as categories, never names
- [ ] Readout status → sent + client-visible toggle → appears in `/portal/readout`;
      activity feed logs generation/sent events
- [ ] "Generate draft proposal" on the seeded shared recommendation → Quickstart proposal with
      $3,500 line + −$500 credit line (sent readout is within 14 days in fresh seed); on a
      decline-or-defer recommendation → red error banner, no proposal

## Security spot-checks

- [ ] Browser devtools: no `SUPABASE_SERVICE_ROLE_KEY` in any response/bundle (also test-enforced)
- [ ] As client, direct-fetch another org id route `/admin/clients/<id>` → redirect (not data)
- [ ] As client: `tool_vendors` / `workflow_playbooks` queries return zero rows; draft
      recommendations and non-visible readouts invisible (RLS-tested in CI, spot-check live)
- [ ] SQL: `select * from pg_tables where schemaname='public' and rowsecurity=false;` → empty
