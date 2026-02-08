const app = document.getElementById('app');

const GLYPH_BY_LATIN = {
  a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', i: 'i', j: 'j',
  k: 'k', l: 'l', m: 'm', n: 'n', o: 'o', p: 'p', q: 'q', r: 'r', s: 's', t: 't',
  u: 'u', v: 'v', w: 'w', x: 'x', z: 'z',
  ch: 'ch', ae: 'ae', eo: 'eo', kh: 'kh', ng: 'ng', oo: 'oo', sh: 'sh', th: 'th', yy: 'yy',
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9',
};

const SYMBOL_KEYS_DESC = Object.keys(GLYPH_BY_LATIN).sort((a, b) => b.length - a.length);

function getGlyphSymbol(text) {
  const source = String(text).toLowerCase();
  const glyphs = [];
  let index = 0;

  while (index < source.length) {
    let matched = null;

    for (const symbol of SYMBOL_KEYS_DESC) {
      if (source.startsWith(symbol, index)) {
        matched = symbol;
        break;
      }
    }

    if (matched) {
      glyphs.push(GLYPH_BY_LATIN[matched]);
      index += matched.length;
      continue;
    }

    glyphs.push(source[index]);
    index += 1;
  }

  return glyphs.join('');
}

const ALPHABET_LETTERS = [
  ['a', 'aurek'], ['b', 'besh'], ['c', 'cresh'], ['d', 'dorn'], ['e', 'esk'], ['f', 'forn'],
  ['g', 'grek'], ['h', 'herf'], ['i', 'isk'], ['j', 'jenth'], ['k', 'krill'], ['l', 'leth'],
  ['m', 'mern'], ['n', 'nern'], ['o', 'osk'], ['p', 'peth'], ['q', 'qek'], ['r', 'resh'],
  ['s', 'senth'], ['t', 'trill'], ['u', 'usk'], ['v', 'vev'], ['w', 'wesk'], ['x', 'xesh'],
  ['yy', 'yirt'], ['z', 'zerek'], ['ch', 'cherek'], ['ae', 'enth'], ['eo', 'onith'], ['kh', 'krenth'],
  ['ng', 'nen'], ['oo', 'orenth'], ['sh', 'shen'], ['th', 'thesh'],
].map(([latin, name], idx) => ({ id: idx + 1, latin, name, symbol: getGlyphSymbol(latin), type: 'alphabet' }));

const NUMBER_GLYPHS = Array.from({ length: 10 }, (_, n) => ({
  id: 100 + n,
  latin: String(n),
  name: `numeral ${n}`,
  symbol: getGlyphSymbol(String(n)),
  type: 'numbers',
}));

const DOUBLE_LATIN = new Set(['yy', 'ch', 'ae', 'eo', 'kh', 'ng', 'oo', 'sh', 'th']);
const PRONUNCIATION_LATIN = new Set(['ch', 'ae', 'eo', 'kh', 'ng', 'oo', 'sh', 'th']);
const DOUBLE_LETTERS = ALPHABET_LETTERS.filter((letter) => DOUBLE_LATIN.has(letter.latin));
const PRONUNCIATION_LETTERS = ALPHABET_LETTERS.filter((letter) => PRONUNCIATION_LATIN.has(letter.latin));
const ALL_LEARNING_ITEMS = [...ALPHABET_LETTERS, ...NUMBER_GLYPHS];

const SECTION_COUNT = 6;
const STUDY_SECONDS = 20;
const SKIP_SECTION_INCREMENT = 2;

const learningTracks = {
  standard: makeLearningTrack(ALPHABET_LETTERS, SECTION_COUNT, 'Aurebesh'),
  double: makeLearningTrack(DOUBLE_LETTERS, Math.min(4, DOUBLE_LETTERS.length), 'Double-Letter'),
  pronunciation: makeLearningTrack(PRONUNCIATION_LETTERS, Math.min(4, PRONUNCIATION_LETTERS.length), 'Pronunciation'),
  numbers: makeLearningTrack(NUMBER_GLYPHS, 4, 'Numbers'),
};

const state = {
  screen: 'menu',
  mode: 'learn',
  learningTrack: 'standard',
  stageIndex: 0,
  sectionSelection: learningTracks.standard.sections.map(() => false),
  quizExtras: {
    double: false,
    pronunciation: false,
    numbers: false,
  },
  includeStudyInQuizOnly: false,
  timer: STUDY_SECONDS,
  timerRef: null,
  timerStartMs: null,
  timerEndMs: null,
  quiz: null,
  result: null,
};

function makeSections(items, count) {
  const base = Math.floor(items.length / count);
  const remainder = items.length % count;
  const sizes = Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
  const out = [];
  let cursor = 0;
  for (const size of sizes) {
    out.push(items.slice(cursor, cursor + size));
    cursor += size;
  }
  return out;
}

function makeLearningTrack(letters, sectionCount, label) {
  const sections = makeSections(letters, sectionCount).filter((section) => section.length);
  const stages = [
    ...sections.map((_, i) => [i]),
    ...Array.from({ length: sections.length - 1 }, (_, i) => Array.from({ length: i + 2 }, (_, n) => n)),
  ];

  return { label, sections, stages };
}

function getLearningTrack() {
  return learningTracks[state.learningTrack] || learningTracks.standard;
}

function getSkipIncrement() {
  return Math.min(SKIP_SECTION_INCREMENT, getLearningTrack().sections.length - 1);
}

function getStageLabel(stageIndex) {
  const track = getLearningTrack();
  const stage = track.stages[stageIndex] || [];

  if (stage.length <= 1) {
    return `${track.label} Section ${stage[0] + 1} of ${track.sections.length}`;
  }

  return `${track.label} Combined Review: ${stage.length} sections`;
}

function setScreen(screen) {
  clearInterval(state.timerRef);
  state.timerRef = null;
  state.timerStartMs = null;
  state.timerEndMs = null;
  state.screen = screen;
  render();
}

function getStageLetters() {
  const track = getLearningTrack();
  const groups = track.stages[state.stageIndex] || [];
  return groups.flatMap((i) => track.sections[i]);
}

function startLearning() {
  setScreen('learn-entry');
}

function launchLearning(skipAhead = false, track = 'standard') {
  state.mode = 'learn';
  state.learningTrack = track;
  state.stageIndex = skipAhead ? getSkipIncrement() : 0;
  beginStudy(getStageLetters(), getStageLabel(state.stageIndex));
}

function beginStudy(letters, label) {
  state.timer = STUDY_SECONDS;
  state.studyLetters = letters;
  state.studyLabel = label;
  setScreen('study');

  state.timerStartMs = performance.now();
  state.timerEndMs = state.timerStartMs + STUDY_SECONDS * 1000;

  const updateTimerText = () => {
    const timerValue = document.querySelector('[data-timer-value]');
    const remainingMs = Math.max(0, state.timerEndMs - performance.now());
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    state.timer = remainingSeconds;
    if (timerValue) timerValue.textContent = `${remainingSeconds}s`;

    if (remainingMs <= 0) {
      clearInterval(state.timerRef);
      state.timerRef = null;
      startQuiz(letters, state.mode === 'learn');
    }
  };

  updateTimerText();
  state.timerRef = setInterval(updateTimerText, 100);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function makeQuiz(letters) {
  const pool = letters.length > 3 ? letters : ALL_LEARNING_ITEMS;
  const questions = shuffle(letters).map((item) => {
    const wrong = shuffle(pool.filter((l) => l.latin !== item.latin)).slice(0, 3);
    return {
      item,
      selected: null,
      options: shuffle([item, ...wrong]),
      correct: false,
    };
  });

  return {
    letters,
    idx: 0,
    questions,
    masteryRequired: state.mode === 'learn',
  };
}

function startQuiz(letters, masteryRequired = false) {
  state.quiz = makeQuiz(letters);
  state.quiz.masteryRequired = masteryRequired;
  setScreen('quiz');
}

function answer(option) {
  const q = state.quiz.questions[state.quiz.idx];
  if (!q || q.selected) return;

  q.selected = option.latin;
  q.correct = option.latin === q.item.latin;
  render();

  setTimeout(() => {
    if (state.quiz.idx < state.quiz.questions.length - 1) {
      state.quiz.idx += 1;
      render();
    } else {
      finalizeQuiz();
    }
  }, 350);
}

function finalizeQuiz() {
  const questions = state.quiz.questions;
  const correct = questions.filter((q) => q.correct).length;
  const total = questions.length;
  const pct = Math.round((correct / total) * 100);

  const wrong = questions.filter((q) => !q.correct);
  const right = questions.filter((q) => q.correct);

  state.result = {
    correct,
    total,
    pct,
    breakdown: [...wrong, ...right],
    passed: pct === 100,
    masteryRequired: state.quiz.masteryRequired,
  };

  setScreen('result');
  setTimeout(() => {
    const ring = document.querySelector('.ring');
    if (ring) ring.style.setProperty('--pct', String(pct));
  }, 50);
}

function continueFromResult() {
  if (state.mode === 'quiz-only') {
    setScreen('menu');
    return;
  }

  if (!state.result.passed) {
    beginStudy(getStageLetters(), getStageLabel(state.stageIndex));
    return;
  }

  state.stageIndex += 1;
  const track = getLearningTrack();
  if (state.stageIndex >= track.stages.length) {
    setScreen('complete');
    return;
  }

  const letters = getStageLetters();
  const label = getStageLabel(state.stageIndex);

  beginStudy(letters, label);
}

function startQuizOnly() {
  state.mode = 'quiz-only';
  setScreen('quiz-setup');
}

function uniqueByLatin(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.latin)) return false;
    seen.add(item.latin);
    return true;
  });
}

function launchQuizOnly() {
  const sections = learningTracks.standard.sections;
  let picked = state.sectionSelection
    .flatMap((checked, i) => (checked ? sections[i] : []));

  if (!picked.length) picked = ALPHABET_LETTERS;

  if (state.quizExtras.double) picked.push(...DOUBLE_LETTERS);
  if (state.quizExtras.pronunciation) picked.push(...PRONUNCIATION_LETTERS);
  if (state.quizExtras.numbers) picked.push(...NUMBER_GLYPHS);

  picked = uniqueByLatin(picked);

  if (state.includeStudyInQuizOnly) {
    beginStudy(picked, `Quiz Prep • ${picked.length} glyphs`);
  } else {
    startQuiz(picked, false);
  }
}

function renderMenu() {
  return `
    <section class="screen center-stack">
      <div>
        <h1>Aurebesh</h1>
        <p class="meta">Minimal memorization flow with mastery checkpoints.</p>
      </div>
      <div class="actions">
        <button class="primary" onclick="startLearning()">Learn Aurebesh</button>
        <button class="ghost" onclick="startQuizOnly()">Quiz Only</button>
      </div>
    </section>
  `;
}

function renderLearningEntry() {
  const skip = getSkipIncrement();
  const disableSkip = skip === 0;

  return `
    <section class="screen center-stack">
      <div>
        <h2>Start Learning Quiz</h2>
        <p class="meta">Choose a learning track, then start from section 1 or skip ahead in section-based progression.</p>
      </div>
      <div class="track-actions">
        <div class="actions">
          <button class="primary" onclick="launchLearning(false, 'standard')">Start Standard Mode</button>
          <button class="ghost" onclick="launchLearning(true, 'standard')" ${disableSkip ? 'disabled' : ''}>Skip Ahead Standard (+${skip} sections)</button>
        </div>
        <div class="actions">
          <button class="primary" onclick="launchLearning(false, 'double')">Start Double-Letter Mode</button>
          <button class="ghost" onclick="launchLearning(true, 'double')" ${disableSkip ? 'disabled' : ''}>Skip Ahead Double-Letter (+${skip} sections)</button>
        </div>
        <div class="actions">
          <button class="primary" onclick="launchLearning(false, 'pronunciation')">Start Pronunciation Mode</button>
          <button class="ghost" onclick="launchLearning(false, 'numbers')">Start Numbers Mode</button>
        </div>
        <button class="ghost" onclick="setScreen('menu')">Cancel</button>
      </div>
    </section>
  `;
}

function renderStudy() {
  return `
    <section class="screen">
      <header class="study-header">
        <div>
          <h2>${state.studyLabel}</h2>
          <p class="meta">Observe silently. Quiz starts automatically.</p>
        </div>
        <div class="countdown-wrap" aria-label="countdown">
          <div class="countdown-bar"><div class="countdown-fill" style="--study-duration:${STUDY_SECONDS}s"></div></div>
          <p class="meta countdown-time" data-timer-value>${state.timer}s</p>
        </div>
      </header>
      <div class="chart">
        ${state.studyLetters.map((l) => `
          <article class="card">
            <div class="symbol">${l.symbol}</div>
            <div class="latin">${l.latin}</div>
          </article>`).join('')}
      </div>
    </section>
  `;
}

function renderQuiz() {
  const q = state.quiz.questions[state.quiz.idx];
  return `
    <section class="screen">
      <header class="quiz-header">
        <h2>Quiz</h2>
        <p class="meta">Question ${state.quiz.idx + 1} / ${state.quiz.questions.length}</p>
      </header>
      <div class="quiz-body">
        <article class="prompt">
          <div class="symbol">${q.item.symbol}</div>
          <p class="meta">Select the matching Latin form</p>
        </article>
        <div class="options">
          ${q.options.map((o) => {
            const selected = q.selected === o.latin;
            const classes = selected ? (q.correct ? 'good' : 'bad') : '';
            return `<button class="${classes}" onclick="answer({latin:'${o.latin}'})">${o.latin.toUpperCase()}</button>`;
          }).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderResult() {
  return `
    <section class="screen">
      <header class="result-header">
        <div>
          <h2>Results</h2>
          <p class="meta">${state.result.passed ? 'Perfect score.' : 'Review the missed letters and retry.'}</p>
        </div>
        <button class="primary" onclick="continueFromResult()">${state.mode === 'quiz-only' ? 'Back to menu' : state.result.passed ? 'Continue' : 'Restudy section'}</button>
      </header>
      <div class="result-layout">
        <div class="ring-wrap">
          <div class="ring" style="--pct:0">
            <div>
              <strong>${state.result.pct}%</strong>
              <p class="meta">${state.result.correct} / ${state.result.total}</p>
            </div>
          </div>
        </div>
        <div class="breakdown">
          ${state.result.breakdown.map((q, i) => `
            <article class="item ${q.correct ? 'right' : 'wrong'}" style="animation-delay:${i * 45}ms">
              <span class="symbol">${q.item.symbol}</span>
              <span>${q.correct ? `✓ ${q.item.latin.toUpperCase()}` : `${(q.selected || '?').toUpperCase()} → ${q.item.latin.toUpperCase()}`}</span>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderQuizSetup() {
  const sections = learningTracks.standard.sections;
  return `
    <section class="screen">
      <h2 style="margin-bottom:10px;">Quiz Setup</h2>
      <p class="meta" style="margin-bottom:16px;">Choose core sections and extra quiz check marks for double letters, pronunciation, and numbers.</p>
      <h3 style="margin-bottom:8px;">Core Alphabet Sections</h3>
      <div class="pills" style="margin-bottom:14px;">
        ${sections.map((section, i) => `
          <label class="pill">
            <input type="checkbox" ${state.sectionSelection[i] ? 'checked' : ''}
              onchange="state.sectionSelection[${i}] = this.checked" />
            Section ${i + 1} (${section.length})
          </label>
        `).join('')}
      </div>
      <h3 style="margin-bottom:8px;">Extra Sets</h3>
      <div class="pills" style="margin-bottom:14px;">
        <label class="pill">
          <input type="checkbox" ${state.quizExtras.double ? 'checked' : ''}
            onchange="state.quizExtras.double = this.checked" />
          Double Letters (${DOUBLE_LETTERS.length})
        </label>
        <label class="pill">
          <input type="checkbox" ${state.quizExtras.pronunciation ? 'checked' : ''}
            onchange="state.quizExtras.pronunciation = this.checked" />
          Pronunciation (${PRONUNCIATION_LETTERS.length})
        </label>
        <label class="pill">
          <input type="checkbox" ${state.quizExtras.numbers ? 'checked' : ''}
            onchange="state.quizExtras.numbers = this.checked" />
          Numbers (${NUMBER_GLYPHS.length})
        </label>
      </div>
      <label class="pill" style="margin-bottom:18px;display:inline-flex;">
        <input type="checkbox" ${state.includeStudyInQuizOnly ? 'checked' : ''}
          onchange="state.includeStudyInQuizOnly = this.checked" />
        Include 20s study preview
      </label>
      <div class="actions" style="justify-content:flex-start;">
        <button class="primary" onclick="launchQuizOnly()">Start Quiz</button>
        <button class="ghost" onclick="setScreen('menu')">Cancel</button>
      </div>
    </section>
  `;
}

function renderComplete() {
  return `
    <section class="screen center-stack">
      <div>
        <h2>Mastery achieved</h2>
        <p class="meta">You cleared all progressive reinforcement stages at 100%.</p>
      </div>
      <button class="primary" onclick="setScreen('menu')">Return to menu</button>
    </section>
  `;
}

function render() {
  const views = {
    menu: renderMenu,
    'learn-entry': renderLearningEntry,
    study: renderStudy,
    quiz: renderQuiz,
    result: renderResult,
    complete: renderComplete,
    'quiz-setup': renderQuizSetup,
  };

  app.innerHTML = (views[state.screen] || renderMenu)();
}

Object.assign(window, {
  state,
  startLearning,
  launchLearning,
  startQuizOnly,
  launchQuizOnly,
  setScreen,
  answer,
  continueFromResult,
});

render();
