# Row Level Security Policies

Source of truth: `supabase/migrations/20260610120100_rls.sql`.
Static tests in `tests/migrations.test.ts` verify: RLS enabled on every table, every table has
policies, anon can never read `leads`, `activity_events` is append-only, and no service-role
key appears in `src/`.

## Principles

1. **RLS on every table in `public`.** No exceptions.
2. **Org scoping:** clients only reach rows where `is_org_member(organization_id)`.
3. **Admin is explicit:** `is_admin()` (security-definer lookup of `profiles.role`) — never
   inferred from email or metadata.
4. **Anon gets two capabilities total:** INSERT into `leads` (the application form) and SELECT
   active `service_packages`. Nothing else.
5. **The service-role key bypasses RLS** and therefore lives only in server env vars; app code
   doesn't use it today (test-enforced).
6. **Defense in depth:** admin server actions verify the role in code, then RLS enforces it
   again in the database; sensitive column transitions (role, pipeline_stage) are additionally
   trigger-guarded so a compromised-but-authenticated session still can't escalate.

## Matrix

| Table | anon | client (member) | admin |
| --- | --- | --- | --- |
| `profiles` | — | read/update own (role change trigger-blocked) | all |
| `organizations` | — | read own; insert (as creator); update own profile fields (stage trigger-blocked) | all |
| `organization_members` | — | read own; insert self into org they created | all |
| `contacts` | — | — | all |
| `leads` | **insert only** | insert | all |
| `audit_intakes` | — | read own org; insert own org (as submitter) | all |
| `discovery_notes` | — | — | all |
| `tools_inventory` | — | read + insert own org | all |
| `workflows` | — | read + insert own org | all |
| `pain_points` | — | read + insert own org | all |
| `data_sources` | — | read + insert own org | all |
| `uploaded_documents` | — | read own org; insert own org (as uploader) | all |
| `ai_opportunities` | — | read own org | all (writes) |
| `opportunity_scores` | — | read own org | all (writes) |
| `roadmap_items` | — | read own org | all (writes) |
| `proposals` | — | read own org | all (writes) |
| `proposal_line_items` | — | read via parent proposal's org | all (writes) |
| `deliverables` | — | read own org | all (writes) |
| `tasks` | — | read own org | all (writes) |
| `comments` | — | read own org; insert as self in own org; delete own | all |
| `service_packages` | read active | read active | all |
| `activity_events` | — | insert as self (no read) | read + insert; **no update/delete for anyone** |

## Notable design choices

- **`leads` is an inbox, not a mailbox:** applicants can write but never read back — so the
  public form can't be used to enumerate other applicants.
- **`discovery_notes` and `contacts` are admin-only** even for members of the org they
  reference: raw call notes are the advisor's working material, not a client deliverable.
- **Intake children are insert-only for clients** (no update/delete): submissions are a record.
  Corrections flow through messages → admin edits.
- **`comments` insert requires `author_id = auth.uid()`** — no impersonation even within an org.
- **Helper functions are `security definer` + `stable`** with pinned `search_path = public` to
  avoid both RLS recursion and search-path hijacking.

## Verifying against a live database

```sql
-- Tables without RLS (should return zero rows):
select tablename from pg_tables
where schemaname = 'public'
  and rowsecurity = false;

-- Policies per table:
select tablename, count(*) from pg_policies
where schemaname = 'public'
group by tablename order by tablename;
```

Also recommended once hosted: Supabase Dashboard → Advisors → Security Advisor (catches
missing-RLS and definer-view issues automatically).
