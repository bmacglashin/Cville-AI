import type { ReactNode } from "react";

/**
 * Minimal, dependency-free renderer for the markdown subset the readout
 * generator emits: #/##/### headings, paragraphs, "- " bullet lists,
 * "1. " ordered lists, | tables |, **bold**, and _italic_. Anything else
 * renders as a plain paragraph. Deliberately not a general-purpose
 * markdown engine — it renders our own deterministic output.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on **bold** first, then _italic_ inside the remaining segments.
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  boldParts.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`}>{part.slice(2, -2)}</strong>);
      return;
    }
    const italicParts = part.split(/(_[^_]+_)/g);
    italicParts.forEach((seg, j) => {
      if (seg.startsWith("_") && seg.endsWith("_") && seg.length > 2) {
        nodes.push(<em key={`${keyPrefix}-i${i}-${j}`}>{seg.slice(1, -1)}</em>);
      } else if (seg) {
        nodes.push(seg);
      }
    });
  });
  return nodes;
}

function tableCells(row: string): string[] {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function MarkdownView({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="mt-6 font-display text-lg text-ink">
          {renderInline(trimmed.slice(4), `h3-${key}`)}
        </h3>
      );
      i++;
    } else if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="mt-8 border-b border-border pb-1 font-display text-xl text-ink">
          {renderInline(trimmed.slice(3), `h2-${key}`)}
        </h2>
      );
      i++;
    } else if (trimmed.startsWith("# ")) {
      blocks.push(
        <h1 key={key++} className="font-display text-2xl text-ink">
          {renderInline(trimmed.slice(2), `h1-${key}`)}
        </h1>
      );
      i++;
    } else if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const header = tableCells(tableLines[0] ?? "");
      const body = tableLines
        .slice(1)
        .filter((row) => !/^\|[\s\-|]+\|$/.test(row))
        .map(tableCells);
      blocks.push(
        <div key={key++} className="mt-3 overflow-x-auto">
          <table className="w-full border border-border text-sm">
            <thead>
              <tr className="bg-muted/60 text-left">
                {header.map((cell, c) => (
                  <th key={c} className="border-b border-border px-3 py-2 font-semibold text-ink">
                    {renderInline(cell, `th-${key}-${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, r) => (
                <tr key={r} className="border-b border-border/60 last:border-0">
                  {row.map((cell, c) => (
                    <td key={c} className="px-3 py-2 align-top">
                      {renderInline(cell, `td-${key}-${r}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (/^- /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i].trim())) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
          {items.map((item, n) => (
            <li key={n}>{renderInline(item, `li-${key}-${n}`)}</li>
          ))}
        </ul>
      );
    } else if (/^\d+\. /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\. /, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
          {items.map((item, n) => (
            <li key={n}>{renderInline(item, `ol-${key}-${n}`)}</li>
          ))}
        </ol>
      );
    } else {
      blocks.push(
        <p key={key++} className="mt-3 text-sm leading-relaxed">
          {renderInline(trimmed, `p-${key}`)}
        </p>
      );
      i++;
    }
  }

  return <div>{blocks}</div>;
}
