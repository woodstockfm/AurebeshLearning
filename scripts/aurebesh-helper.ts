#!/usr/bin/env node
/**
 * Aurebesh Codex Helper
 * - Displays all Aurebesh letters (including multi-letter digraphs like CH, AE, EO, KH, NG, OO, SH, TH)
 * - Exports JSON for use by the main encoder/decoder
 * - Optionally generates a simple HTML table for visual inspection
 *
 * Usage:
 *   node scripts/aurebesh-helper.ts
 *   node scripts/aurebesh-helper.ts --json
 *   node scripts/aurebesh-helper.ts --html aurebesh.html
 *
 * Notes:
 * - Glyph rendering depends on your project’s font strategy. If you use an Aurebesh font,
 *   you can set CSS font-family in the generated HTML.
 * - If your project uses SVGs/images per glyph, you can replace `glyph` with your asset key/path.
 */

type AurebeshEntry = {
  /** Latin token the encoder/decoder matches (lowercase). */
  token: string;
  /** Aurebesh letter name. */
  name: string;
  /** Optional: the glyph (string) if your system uses a font/unicode/private-use mapping. */
  glyph?: string;
  /** Approx pronunciation (editable; not canon-critical). */
  pronunciation: string;
  /** Category for display. */
  kind: 'single' | 'digraph' | 'digit' | 'punct';
  /** Optional note. */
  note?: string;
};

/**
 * Core mapping, based on the standard Aurebesh chart in your image:
 * Singles: a-z
 * Digraphs: ch, ae, eo, kh, ng, oo, sh, th
 * Digits: 0-9
 * Punctuation: included as tokens/labels (glyphs are project-specific)
 */
export const AUREBESH: AurebeshEntry[] = [
  // Singles
  { token: 'a', name: 'Aurek', pronunciation: 'OR-ek', kind: 'single' },
  { token: 'b', name: 'Besh', pronunciation: 'besh', kind: 'single' },
  { token: 'c', name: 'Cresh', pronunciation: 'kresh', kind: 'single' },
  { token: 'd', name: 'Dorn', pronunciation: 'dorn', kind: 'single' },
  { token: 'e', name: 'Esk', pronunciation: 'esk', kind: 'single' },
  { token: 'f', name: 'Forn', pronunciation: 'forn', kind: 'single' },
  { token: 'g', name: 'Grek', pronunciation: 'grek', kind: 'single' },
  { token: 'h', name: 'Herf', pronunciation: 'herf', kind: 'single' },
  { token: 'i', name: 'Isk', pronunciation: 'isk', kind: 'single' },
  { token: 'j', name: 'Jenth', pronunciation: 'jentth', kind: 'single' },
  { token: 'k', name: 'Krill', pronunciation: 'krill', kind: 'single' },
  { token: 'l', name: 'Leth', pronunciation: 'leth', kind: 'single' },
  { token: 'm', name: 'Mern', pronunciation: 'mern', kind: 'single' },
  { token: 'n', name: 'Nern', pronunciation: 'nern', kind: 'single' },
  { token: 'o', name: 'Osk', pronunciation: 'osk', kind: 'single' },
  { token: 'p', name: 'Peth', pronunciation: 'peth', kind: 'single' },
  { token: 'q', name: 'Qek', pronunciation: 'kek', kind: 'single' },
  { token: 'r', name: 'Resh', pronunciation: 'resh', kind: 'single' },
  { token: 's', name: 'Senth', pronunciation: 'senth', kind: 'single' },
  { token: 't', name: 'Trill', pronunciation: 'trill', kind: 'single' },
  { token: 'u', name: 'Usk', pronunciation: 'usk', kind: 'single' },
  { token: 'v', name: 'Vev', pronunciation: 'vev', kind: 'single' },
  { token: 'w', name: 'Wesk', pronunciation: 'wesk', kind: 'single' },
  { token: 'x', name: 'Xesh', pronunciation: 'zesh / kesh', kind: 'single' },
  { token: 'y', name: 'Yirt', pronunciation: 'yirt', kind: 'single' },
  { token: 'z', name: 'Zerek', pronunciation: 'ZEH-rek', kind: 'single' },

  // Digraphs (double-letter tokens)
  { token: 'ch', name: 'Cherek', pronunciation: 'CHER-ek', kind: 'digraph' },
  { token: 'ae', name: 'Enth', pronunciation: "enth (as 'ae')", kind: 'digraph' },
  { token: 'eo', name: 'Onith', pronunciation: 'OH-nith', kind: 'digraph' },
  { token: 'kh', name: 'Krenth', pronunciation: 'kren-th (kh)', kind: 'digraph' },
  { token: 'ng', name: 'Nen', pronunciation: 'nen (ng)', kind: 'digraph' },
  { token: 'oo', name: 'Orenth', pronunciation: 'OR-enth (oo)', kind: 'digraph' },
  { token: 'sh', name: 'Shen', pronunciation: 'shen (sh)', kind: 'digraph' },
  { token: 'th', name: 'Thesh', pronunciation: 'thesh (th)', kind: 'digraph' },

  // Digits
  { token: '0', name: 'Digit 0', pronunciation: 'zero', kind: 'digit' },
  { token: '1', name: 'Digit 1', pronunciation: 'one', kind: 'digit' },
  { token: '2', name: 'Digit 2', pronunciation: 'two', kind: 'digit' },
  { token: '3', name: 'Digit 3', pronunciation: 'three', kind: 'digit' },
  { token: '4', name: 'Digit 4', pronunciation: 'four', kind: 'digit' },
  { token: '5', name: 'Digit 5', pronunciation: 'five', kind: 'digit' },
  { token: '6', name: 'Digit 6', pronunciation: 'six', kind: 'digit' },
  { token: '7', name: 'Digit 7', pronunciation: 'seven', kind: 'digit' },
  { token: '8', name: 'Digit 8', pronunciation: 'eight', kind: 'digit' },
  { token: '9', name: 'Digit 9', pronunciation: 'nine', kind: 'digit' },

  // Punctuation (project-specific glyph mapping; keep tokens so encoder/decoder can preserve punctuation)
  { token: '.', name: 'Period', pronunciation: 'period', kind: 'punct' },
  { token: ',', name: 'Comma', pronunciation: 'comma', kind: 'punct' },
  { token: '?', name: 'Question mark', pronunciation: 'question mark', kind: 'punct' },
  { token: '!', name: 'Exclamation', pronunciation: 'exclamation', kind: 'punct' },
  { token: ':', name: 'Colon', pronunciation: 'colon', kind: 'punct' },
  { token: ';', name: 'Semicolon', pronunciation: 'semicolon', kind: 'punct' },
  { token: '-', name: 'Hyphen', pronunciation: 'hyphen', kind: 'punct' },
  { token: '"', name: 'Quote', pronunciation: 'quote', kind: 'punct' },
  { token: "'", name: 'Apostrophe', pronunciation: 'apostrophe', kind: 'punct' },
  { token: '(', name: 'Left parenthesis', pronunciation: 'left paren', kind: 'punct' },
  { token: ')', name: 'Right parenthesis', pronunciation: 'right paren', kind: 'punct' },
  { token: '/', name: 'Slash', pronunciation: 'slash', kind: 'punct' },
];

/** Longest-first token list for correct parsing (so "th" wins over "t"+"h"). */
export const TOKENS_LONGEST_FIRST = [...new Set(AUREBESH.map(e => e.token))]
  .sort((a, b) => b.length - a.length);

/**
 * Tokenize a latin string into Aurebesh tokens.
 * - Case-insensitive
 * - Preserves whitespace as-is
 * - Prefers longest match (digraphs before singles)
 */
export function tokenizeLatin(input: string): string[] {
  const out: string[] = [];
  let i = 0;
  const s = input;

  while (i < s.length) {
    const ch = s[i];

    // Preserve whitespace 1:1
    if (/\s/.test(ch)) {
      out.push(ch);
      i++;
      continue;
    }

    const lower = s.slice(i).toLowerCase();

    let matched: string | null = null;
    for (const tok of TOKENS_LONGEST_FIRST) {
      if (lower.startsWith(tok)) {
        matched = s.slice(i, i + tok.length); // preserve original casing in output token if you want
        break;
      }
    }

    if (matched) {
      out.push(matched);
      i += matched.length;
    } else {
      // Unknown symbol: pass through
      out.push(ch);
      i++;
    }
  }

  return out;
}

function pad(str: string, len: number) {
  return (str + ' '.repeat(len)).slice(0, len);
}

function printAll() {
  const groups: Array<{ title: string; kind: AurebeshEntry['kind'] }> = [
    { title: 'Digraphs (double-letter tokens)', kind: 'digraph' },
    { title: 'Singles (a-z)', kind: 'single' },
    { title: 'Digits (0-9)', kind: 'digit' },
    { title: 'Punctuation', kind: 'punct' },
  ];

  for (const g of groups) {
    console.log(`\n=== ${g.title} ===`);
    const rows = AUREBESH.filter(e => e.kind === g.kind);
    for (const e of rows) {
      console.log(
        `${pad(e.token, 4)}  ${pad(e.name, 10)}  ${e.pronunciation}`
      );
    }
  }

  console.log('\nTokenizer demo:');
  const demo = 'thesh shen cherek ae eo kh ng oo';
  console.log(`  input : ${demo}`);
  console.log(`  tokens: ${JSON.stringify(tokenizeLatin(demo))}`);
}

function toJSON() {
  // Make a compact map that is convenient for codex usage
  const byToken: Record<string, Omit<AurebeshEntry, 'token'>> = {};
  for (const e of AUREBESH) {
    byToken[e.token] = {
      name: e.name,
      glyph: e.glyph,
      pronunciation: e.pronunciation,
      kind: e.kind,
      note: e.note,
    };
  }
  return JSON.stringify(
    {
      version: 1,
      tokensLongestFirst: TOKENS_LONGEST_FIRST,
      byToken,
    },
    null,
    2
  );
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toHTML() {
  const rows = AUREBESH
    .slice()
    .sort((a, b) => {
      const order = (k: AurebeshEntry['kind']) =>
        k === 'digraph' ? 0 : k === 'single' ? 1 : k === 'digit' ? 2 : 3;
      return order(a.kind) - order(b.kind) || a.token.localeCompare(b.token);
    })
    .map(e => {
      return `<tr>
  <td class="mono">${escapeHtml(e.token)}</td>
  <td>${escapeHtml(e.name)}</td>
  <td>${escapeHtml(e.pronunciation)}</td>
  <td>${escapeHtml(e.kind)}</td>
  <td class="glyph">${escapeHtml(e.glyph ?? '')}</td>
</tr>`;
    })
    .join('\n');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Aurebesh Codex Helper</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
    th { text-align: left; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    /* If you have an Aurebesh font in your project, set it here */
    .glyph { font-family: inherit; font-size: 20px; }
  </style>
</head>
<body>
  <h1>Aurebesh Codex Helper</h1>
  <p>Includes digraphs: ch, ae, eo, kh, ng, oo, sh, th.</p>
  <table>
    <thead>
      <tr>
        <th>Token</th>
        <th>Name</th>
        <th>Pronunciation</th>
        <th>Kind</th>
        <th>Glyph (optional)</th>
      </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const wantJSON = args.includes('--json');
  const htmlIdx = args.indexOf('--html');

  if (wantJSON) {
    process.stdout.write(toJSON() + '\n');
    return;
  }

  if (htmlIdx !== -1) {
    const outPath = args[htmlIdx + 1];
    if (!outPath) {
      console.error('Missing output path after --html');
      process.exit(1);
    }
    const fs = await import('node:fs/promises');
    await fs.writeFile(outPath, toHTML(), 'utf8');
    console.log(`Wrote ${outPath}`);
    return;
  }

  printAll();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
