export const AUREBESH = [
  { token: 'a', name: 'Aurek', pronunciation: 'OR-ek', kind: 'single' },
  { token: 'b', name: 'Besh', pronunciation: 'besh', kind: 'single' },
  { token: 'c', name: 'Cresh', pronunciation: 'kresh', kind: 'single' },
  { token: 'd', name: 'Dorn', pronunciation: 'dorn', kind: 'single' },
  { token: 'e', name: 'Esk', pronunciation: 'esk', kind: 'single' },
  { token: 'f', name: 'Forn', pronunciation: 'forn', kind: 'single' },
  { token: 'g', name: 'Grek', pronunciation: 'grek', kind: 'single' },
  { token: 'h', name: 'Herf', pronunciation: 'herf', kind: 'single' },
  { token: 'i', name: 'Isk', pronunciation: 'isk', kind: 'single' },
  { token: 'j', name: 'Jenth', pronunciation: 'jenth', kind: 'single' },
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
  { token: 'ch', name: 'Cherek', pronunciation: 'CHER-ek', kind: 'digraph' },
  { token: 'ae', name: 'Enth', pronunciation: "enth (as 'ae')", kind: 'digraph' },
  { token: 'eo', name: 'Onith', pronunciation: 'OH-nith', kind: 'digraph' },
  { token: 'kh', name: 'Krenth', pronunciation: 'kren-th (kh)', kind: 'digraph' },
  { token: 'ng', name: 'Nen', pronunciation: 'nen (ng)', kind: 'digraph' },
  { token: 'oo', name: 'Orenth', pronunciation: 'OR-enth (oo)', kind: 'digraph' },
  { token: 'sh', name: 'Shen', pronunciation: 'shen (sh)', kind: 'digraph' },
  { token: 'th', name: 'Thesh', pronunciation: 'thesh (th)', kind: 'digraph' },
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

export const tokensLongestFirst = [...new Set(AUREBESH.map((entry) => entry.token))].sort(
  (a, b) => b.length - a.length,
);

export const AUREBESH_BY_TOKEN = Object.fromEntries(AUREBESH.map((entry) => [entry.token, entry]));

export function tokenizeLatin(input) {
  const source = String(input);
  const out = [];
  let index = 0;

  while (index < source.length) {
    const ch = source[index];

    if (/\s/.test(ch)) {
      out.push(ch);
      index += 1;
      continue;
    }

    const lower = source.slice(index).toLowerCase();
    let matched = null;

    for (const token of tokensLongestFirst) {
      if (lower.startsWith(token)) {
        matched = token;
        break;
      }
    }

    if (matched) {
      out.push(matched);
      index += matched.length;
      continue;
    }

    out.push(ch);
    index += 1;
  }

  return out;
}

export function encodeLatinToAurebesh(input) {
  return tokenizeLatin(input)
    .map((token) => {
      if (/\s/.test(token)) return token;
      return AUREBESH_BY_TOKEN[token.toLowerCase()]?.glyph ?? token.toLowerCase();
    })
    .join('');
}

export function decodeAurebeshToLatin(input) {
  return tokenizeLatin(input)
    .map((token) => (/\s/.test(token) ? token : token.toLowerCase()))
    .join('');
}
