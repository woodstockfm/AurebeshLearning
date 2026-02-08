const app = document.getElementById('app');

const LETTERS = [
  ['a', 'aurek'], ['b', 'besh'], ['c', 'cresh'], ['d', 'dorn'], ['e', 'esk'], ['f', 'forn'],
  ['g', 'grek'], ['h', 'herf'], ['i', 'isk'], ['j', 'jenth'], ['k', 'krill'], ['l', 'leth'],
  ['m', 'mern'], ['n', 'nern'], ['o', 'osk'], ['p', 'peth'], ['q', 'qek'], ['r', 'resh'],
  ['s', 'senth'], ['t', 'trill'], ['u', 'usk'], ['v', 'vev'], ['w', 'wesk'], ['x', 'xesh'],
  ['y', 'yirt'], ['z', 'zerek'], ['ch', 'cherek'], ['ae', 'enth'], ['eo', 'onith'], ['kh', 'krenth'],
  ['ng', 'nen'], ['oo', 'orenth'], ['sh', 'shen'], ['th', 'thesh']
].map(([latin, name], idx) => ({ id: idx + 1, latin, name, symbol: latin.toUpperCase() }));

const SECTION_COUNT = 6;
const STUDY_SECONDS = 20;
const sections = makeSections(LETTERS, SECTION_COUNT);
const learningStages = [
  ...sections.map((_, i) => [i]),
  ...Array.from({ length: sections.length - 1 }, (_, i) => Array.from({ length: i + 2 }, (_, n) => n)),
];

const state = {
  screen: 'menu',
  mode: 'learn',
  stageIndex: 0,
  sectionSelection: sections.map(() => false),
  includeStudyInQuizOnly: false,
  timer: STUDY_SECONDS,
  timerRef: null,
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

function setScreen(screen) {
  clearInterval(state.timerRef);
  state.timerRef = null;
  state.screen = screen;
  render();
}

function getStageLetters() {
  const groups = learningStages[state.stageIndex] || [];
  return groups.flatMap((i) => sections[i]);
}

function startLearning() {
  state.mode = 'learn';
  state.stageIndex = 0;
  beginStudy(getStageLetters(), `Section ${state.stageIndex + 1} of ${sections.length}`);
}

function beginStudy(letters, label) {
  state.timer = STUDY_SECONDS;
  state.studyLetters = letters;
  state.studyLabel = label;
  setScreen('study');
  state.timerRef = setInterval(() => {
    state.timer -= 1;
    render();
    if (state.timer <= 0) {
      clearInterval(state.timerRef);
      state.timerRef = null;
      startQuiz(letters, state.mode === 'learn');
    }
  }, 1000);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function makeQuiz(letters) {
  const questions = shuffle(letters).map((item) => {
    const wrong = shuffle(LETTERS.filter((l) => l.latin !== item.latin)).slice(0, 3);
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

  setTimeout(() => {
    if (state.quiz.idx < state.quiz.questions.length - 1) {
      state.quiz.idx += 1;
      render();
      return;
    }
    finishQuiz();
  }, 220);

  render();
}

function finishQuiz() {
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
    beginStudy(getStageLetters(), `Section ${state.stageIndex + 1} of ${sections.length}`);
    return;
  }

  state.stageIndex += 1;
  if (state.stageIndex >= learningStages.length) {
    setScreen('complete');
    return;
  }

  const letters = getStageLetters();
  const stage = learningStages[state.stageIndex];
  const label = stage.length === 1
    ? `Section ${stage[0] + 1} of ${sections.length}`
    : `Combined Review: ${stage.length} sections`;

  beginStudy(letters, label);
}

function startQuizOnly() {
  state.mode = 'quiz-only';
  setScreen('quiz-setup');
}

function launchQuizOnly() {
  let picked = state.sectionSelection
    .flatMap((checked, i) => checked ? sections[i] : []);

  if (!picked.length) picked = LETTERS;

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

function renderStudy() {
  const pctLeft = (state.timer / STUDY_SECONDS) * 100;
  return `
    <section class="screen">
      <header class="study-header">
        <div>
          <h2>${state.studyLabel}</h2>
          <p class="meta">Observe silently. Quiz starts automatically.</p>
        </div>
        <div class="countdown-wrap" aria-label="countdown">
          <div class="countdown-bar"><div class="countdown-fill" style="width:${pctLeft}%"></div></div>
          <p class="meta">${state.timer}s</p>
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
  return `
    <section class="screen">
      <h2 style="margin-bottom:10px;">Quiz Setup</h2>
      <p class="meta" style="margin-bottom:16px;">Choose sections or leave all unchecked for the full alphabet.</p>
      <div class="pills" style="margin-bottom:14px;">
        ${sections.map((section, i) => `
          <label class="pill">
            <input type="checkbox" ${state.sectionSelection[i] ? 'checked' : ''}
              onchange="state.sectionSelection[${i}] = this.checked" />
            Section ${i + 1} (${section.length})
          </label>
        `).join('')}
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
  startQuizOnly,
  launchQuizOnly,
  setScreen,
  answer,
  continueFromResult,
});

render();
