import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Positioning guardrail: scans src/ ONLY (docs/ and seed internal notes are
 * exempt — internal doctrine may discuss vendors and anti-patterns by name)
 * for language that would overclaim a platform, imply vendor affiliation or
 * white-labeling, weaken the human-review stance, or name vendors that must
 * never appear in public copy.
 */

const SRC_DIR = path.resolve(__dirname, "../src");

const BANNED: { label: string; pattern: RegExp }[] = [
  { label: "proprietary AI platform", pattern: /proprietary ai platform/i },
  { label: "white-label", pattern: /white[\s-]?label/i },
  { label: "connect all your business data", pattern: /connect all your business data/i },
  { label: "command center for every business", pattern: /command center for every business/i },
  { label: "replace your staff", pattern: /replace your staff/i },
  { label: "no human review", pattern: /no human review/i },
  { label: "autonomous", pattern: /\bautonomous\b/i },
  { label: "Poke (vendor name)", pattern: /\bpoke\b/i },
  { label: "Hermes (vendor name)", pattern: /\bhermes\b/i },
];

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

describe("banned language in src/", () => {
  const files = walk(SRC_DIR);

  it("scans a non-trivial source tree", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const { label, pattern } of BANNED) {
    it(`never contains "${label}"`, () => {
      const offenders = files.filter((f) => pattern.test(readFileSync(f, "utf8")));
      expect(
        offenders.map((f) => path.relative(SRC_DIR, f)),
        `banned term "${label}" found`
      ).toEqual([]);
    });
  }
});
