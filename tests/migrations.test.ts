import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Static safety checks on the SQL migrations — validates the security
 * posture without needing a running database:
 *   1. Every table created in public has RLS enabled.
 *   2. Every RLS-enabled table has at least one policy (or is documented
 *      append-only).
 *   3. The anon role can never SELECT from leads (insert-only by design).
 *   4. No service-role key or secret material appears in client code.
 */

const MIGRATIONS_DIR = path.resolve(__dirname, "../supabase/migrations");

function allMigrationSql(): string {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(path.join(MIGRATIONS_DIR, f), "utf8"))
    .join("\n");
}

const sql = allMigrationSql().toLowerCase();

const createdTables = [...sql.matchAll(/create table (?:if not exists )?public\.([a-z_]+)/g)].map(
  (m) => m[1]
);

describe("migrations: row level security", () => {
  it("creates the expected core tables", () => {
    const expected = [
      "profiles",
      "organizations",
      "organization_members",
      "contacts",
      "leads",
      "audit_intakes",
      "discovery_notes",
      "tools_inventory",
      "workflows",
      "pain_points",
      "data_sources",
      "uploaded_documents",
      "ai_opportunities",
      "opportunity_scores",
      "roadmap_items",
      "proposals",
      "proposal_line_items",
      "deliverables",
      "tasks",
      "comments",
      "service_packages",
      "activity_events",
    ];
    for (const table of expected) {
      expect(createdTables, `missing table ${table}`).toContain(table);
    }
  });

  it("enables RLS on every created table", () => {
    for (const table of createdTables) {
      expect(
        sql.includes(`alter table public.${table} enable row level security`),
        `RLS not enabled on public.${table}`
      ).toBe(true);
    }
  });

  it("defines at least one policy for every table", () => {
    for (const table of createdTables) {
      const hasPolicy = new RegExp(`create policy "[^"]+"\\s+on public\\.${table}\\b`).test(sql);
      expect(hasPolicy, `no policy found for public.${table}`).toBe(true);
    }
  });

  it("never grants anon SELECT on leads (insert-only application inbox)", () => {
    const leadPolicies = [...sql.matchAll(/create policy "[^"]*"\s+on public\.leads[\s\S]*?;/g)].map(
      (m) => m[0]
    );
    expect(leadPolicies.length).toBeGreaterThan(0);
    for (const policy of leadPolicies) {
      if (policy.includes("for select")) {
        expect(policy.includes("anon"), "anon must not be able to read leads").toBe(false);
      }
    }
  });

  it("keeps activity_events append-only (no update/delete policies)", () => {
    const eventPolicies = [
      ...sql.matchAll(/create policy "[^"]*"\s+on public\.activity_events[\s\S]*?;/g),
    ].map((m) => m[0]);
    for (const policy of eventPolicies) {
      expect(policy.includes("for update")).toBe(false);
      expect(policy.includes("for delete")).toBe(false);
    }
  });
});

describe("client-side secret hygiene", () => {
  it("never references the service-role key outside env example/docs", () => {
    const srcDir = path.resolve(__dirname, "../src");
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(entry.name)) {
          const content = readFileSync(full, "utf8");
          if (content.includes("SUPABASE_SERVICE_ROLE_KEY")) offenders.push(full);
        }
      }
    };
    walk(srcDir);
    expect(offenders, `service-role key referenced in: ${offenders.join(", ")}`).toEqual([]);
  });
});
