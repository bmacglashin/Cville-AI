# Launch Checklist

Work top to bottom. Items marked ⛔ block public launch; ✋ block the first *paid* engagement
(but not the website going live).

## 1. Infrastructure ⛔

- [ ] Create hosted Supabase project (closest region; note the project ref)
- [ ] `supabase link --project-ref <ref>` then `supabase db push`
- [ ] Seed ONLY the `service_packages` block from `supabase/seed.sql` (never the demo users)
- [ ] Verify in SQL editor: `select tablename from pg_tables where schemaname='public' and rowsecurity=false;` → zero rows
- [ ] Run Supabase Security Advisor; resolve anything red
- [ ] Buy domain (agentally.co or similar); set up Vercel project from this repo
- [ ] Vercel env vars: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Supabase Auth → URL configuration: Site URL = production domain; add `https://<domain>/auth/callback`
- [ ] Sign up your real account on production → promote: `update public.profiles set role='admin' where email='…';`
- [ ] Confirm `/admin` works for you and `/portal` correctly walls off a second test account

## 2. Conversion path ⛔

- [ ] Set `NEXT_PUBLIC_CALENDLY_URL` (create a 20-min "Fit Call" event type)
- [ ] Resend: verify domain, set `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`
- [ ] Submit a real test application on production → confirm lead appears in `/admin/leads` + email arrives
- [ ] Create Stripe Payment Link for $950 audit → put in `NEXT_PUBLIC_STRIPE_AUDIT_PAYMENT_LINK` (sent manually after fit calls for now)
- [ ] Replace placeholder email `ben@agentally.co` in `src/lib/content.ts`, `/apply`, `/privacy`, `/terms` with the live address
- [ ] Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (or remove analytics placeholder consciously)

## 3. Content pass ⛔

- [ ] Read every page aloud once on production (run `docs/QA_CHECKLIST.md`)
- [ ] Check OG image renders: share homepage URL in a Slack/iMessage preview
- [ ] Confirm founding-cohort count (5) and prices ($950/$1,250 · $3,500 · $8,500/$1,500mo) everywhere match
- [ ] Verify the demo page disclaimer ("fictional, no live systems") is intact
- [ ] `robots.txt` blocks /admin, /portal, /start-audit; sitemap lists 12 public pages

## 4. Business formation ✋ (before first PAID engagement — from the risk plan)

- [ ] Form LLC (VA SCC) or confirm appropriate entity; business bank account
- [ ] MSA + SOW templates (attorney-reviewed)
- [ ] NDA / confidentiality terms
- [ ] Data Processing Addendum (where appropriate)
- [ ] AI-output disclaimer + limitation of liability + IP ownership terms in the MSA
- [ ] Data deletion/export process written down (privacy page already promises 30 days)
- [ ] Security exhibit (what tools/providers touch client data, with no-training API terms)
- [ ] Upfront payment terms (audit: 100% before Week 1)
- [ ] E&O / tech E&O / cyber insurance quotes requested
- [ ] Counsel review of `/privacy` and `/terms` drafts

## 5. Sales engine (week 1 after launch)

- [ ] Build 50-prospect list (design/build, remodeling, premium home services — Cville/Albemarle)
- [ ] Send first 10 outreaches from `docs/sales/OUTREACH_EMAILS.md`
- [ ] Ask 5 warm contacts for referrals using `docs/sales/REFERRAL_SCRIPT.md`
- [ ] Print/PDF `docs/sales/ONE_PAGE_OFFER.md` for coffee meetings
- [ ] Rehearse `docs/sales/DISCOVERY_SCRIPT.md` once end-to-end
- [ ] Set weekly review: pipeline stages vs. 30-day targets (3 audits, $2,850+)

## 6. Delivery readiness (before audit #1)

- [ ] Walk `docs/sales/FOUNDER_LED_DELIVERY_PLAYBOOK.md` once
- [ ] Copy `docs/sales/AI_OPERATING_AUDIT_DELIVERABLE_TEMPLATE.md` into your doc tool
- [ ] Copy `docs/sales/AUDIT_SCORECARD_TEMPLATE.md` likewise
- [ ] Review `docs/sales/CLIENT_RED_FLAGS.md` the night before every fit call

## Post-launch (defer until ≥1 paid audit)

- [ ] Stripe programmatic checkout + webhook → auto-advance `audit_paid`
- [ ] Storage bucket + real document upload (per `docs/NEXT_STEPS.md`)
- [ ] Weekly ops-brief generation pipeline (prompts already in `src/lib/prompts/`)
