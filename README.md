# Aurebesh Learning

## Run locally (Windows)

Double-click `run_app.bat`.

It will:
1. Start a local web server on `http://localhost:8000`
2. Automatically open your default browser to the app

Keep the terminal window open while using the app. Close it (or press `Ctrl+C`) to stop the server.

## Run locally (manual)

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Alphabet and tokenization

The canonical Aurebesh mapping lives in `src/aurebesh/alphabet.mjs` and includes:
- Singles: `a-z`
- Digraphs: `ch`, `ae`, `eo`, `kh`, `ng`, `oo`, `sh`, `th`
- Digits: `0-9`
- Punctuation: `. , ? ! : ; - " ' ( ) /`

Tokenization uses a **longest-match-first** strategy so digraphs are matched before single letters (for example, `th` is tokenized as `th`, not `t` + `h`). Whitespace is preserved and unknown symbols pass through unchanged.

Pronunciations in the mapping are approximate learner labels and can be edited later without affecting token behavior.

## Helper script

A helper script is available at `scripts/aurebesh-helper.ts`:

```bash
node scripts/aurebesh-helper.ts
node scripts/aurebesh-helper.ts --json
node scripts/aurebesh-helper.ts --html aurebesh.html
```

It can print a token table, emit JSON, and generate an HTML reference table.

## Tests

Run tokenizer tests with:

```bash
node --test tests/tokenizer.test.mjs
```
