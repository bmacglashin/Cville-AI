# Vendor Vetting Checklist

Run this before any tool enters the catalog at `approved` or `conditional`, and re-run on the
`next_review_at` date. Record answers on the `tool_vendors` row (`/admin/tools`); anything
unverified stays `needs_review`. Sources go in `source_links` (terms pages, DPA, trust center).

## 1. Business terms

- [ ] Is there a **business/team plan** (not consumer/personal terms)? Which tier are we
      recommending?
- [ ] Do the terms permit **commercial use** by the client's business?
- [ ] Any clauses claiming ownership of content, workflows, or "recipes" created on-platform?
- [ ] Contract or copy restrictions: can the vendor's name be used in client deliverables or
      public materials? (Feeds `public_copy_allowed`.)

## 2. Data protection

- [ ] **DPA available?** Signed/signable at the recommended tier? → `dpa_status`
- [ ] **No-training terms:** is customer content excluded from model training at this tier, in
      writing? → `no_training_status`
- [ ] Where is data stored/processed? Subprocessor list published?
- [ ] **Max data sensitivity** we will allow in this tool → `max_data_sensitivity`
      (`public` / `internal` / `confidential` / `regulated` — we never approve `regulated`;
      `prohibited` marks data classes that must never enter any tool)

## 3. Administration & control

- [ ] **Admin controls:** central user management, SSO or at least enforced 2FA, role-based
      permissions → `admin_controls_status`
- [ ] **Permissions model:** can we scope the tool to the minimum data it needs? What is the
      blast radius of a compromised account?
- [ ] **Write-permission scope:** does the tool only read, or can it act (send, post, modify,
      delete) on connected systems? Every write path needs a human checkpoint or an explicit,
      documented exception.
- [ ] **Audit logs:** does the tier include usage/audit logging an admin can review?

## 4. Ownership & exit

- [ ] **Account ownership:** can the client's business own the account outright (our default,
      `client_owned_account_required = true`)?
- [ ] **Export path:** documented, tested way to get content/configuration out →
      `export_path_status`. Exercise it once before recommending.
- [ ] **Offboarding:** what survives cancellation? What is lost? Deletion guarantees?

## 5. Operational fit

- [ ] **Support burden** for us and the client (low / medium / high) → `support_burden`.
      High-burden tools are internal-only or premium-engagement-only.
- [ ] **Vendor longevity:** funding, traction, acquisition risk, pricing volatility →
      `longevity_notes`. Would a 90-day shutdown notice strand the workflow?
- [ ] Prohibited use cases for this tool (regulated data, decisioning, customer-autonomy…)
      → `prohibited_use_cases`

## Outcome

Set `approval_status` per the tiers in `docs/TOOL_DOCTRINE.md` §3, write the conditions into
`internal_notes` (and `public_notes` only if safe to share), set `last_reviewed_at` /
`next_review_at`, and — if `conditional` — make sure every stack recommendation that uses the
tool states the conditions in its `data_boundary` field.
