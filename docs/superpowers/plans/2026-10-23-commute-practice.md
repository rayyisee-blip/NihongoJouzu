# Commute Practice (Round One) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 12-question daily quiz with a fixed 10-item commute session built mostly from typed answers. The session includes conjugation practised inside sentences (capped), and the multiple-choice wrong answers become harder to guess.

**Architecture:** Pure logic goes in two new browser-global files:
- `js/answer-check.js` handles normalising and checking typed Japanese.
- `js/session.js` builds the session and holds the typed-sentence pool.

Conjugation frames and in-sentence items extend `js/conjugation.js`. `js/app.js` keeps the rendering. The pure files are tested in Node by loading the scripts into a `vm` context. The UI is verified by hand at 375px width.

**Tech Stack:** Plain HTML/CSS/JS with globals and no build step. Tests use Node 24 `node:test` with `node:assert/strict` and `node:vm`. No npm dependencies.

**Spec:** `docs/superpowers/specs/2026-10-23-commute-practice-design.md`

## Global Constraints

- Static site: plain HTML/CSS/JS, no build step, globals across `js/*.js`. Match existing style: small functions, template-string rendering, comment blocks that explain intent.
- New `PROGRESS` fields get defaults in `defaultProgress()` and a guard in `loadProgress()` (js/storage.js).
- Session: **10 items**. **4** type-the-sentence, **up to 3** conjugation-in-sentence (0 before lesson 14), the rest multiple choice. The last item is multiple choice.
- Typed checks ignore half- and full-width spaces and the punctuation `。、！？!?.,`. They accept kana-only, kanji, katakana-or-hiragana and romaji input.
- Particle set for diagnosis: `は が を に で へ と も の から まで`.
- The typed input has `lang="ja" autocapitalize="off" autocorrect="off" spellcheck="false"` and a font-size of at least 16px.
- Every wrong typed verdict offers **"I was right"**. Overridden answers count as correct for spaced repetition.
- Keep the correct answer, `note` and question order of every hand-written lesson question.
- Don't lose or corrupt the streak, `seen`/box data, notes or completed days.
- No new library unless it is wanakana pinned from cdnjs. The default in this plan is a hand-written converter.
- Must work at 375px width.

## Review Focus

1. **Mixed kanji/kana input.** A phone keyboard converts some words to kanji and not others, e.g. `私はがくせいです`. Each furigana segment may be typed either way, and the answer is accepted. *Test: Task 1 `mixed script accepted`.*
2. **Examples with alternatives or a non-sentence shape.** Entries containing `／` (e.g. `はい、そうです。／いいえ、違います。`) can't be fairly checked, so they're excluded from the typed pool. *Test: Task 3 `typed pool excludes slash examples`.*
3. **Romaji edge cases.** Uppercase, `nn`/`n'`, double consonants (`kitte`), `shi`/`chi`/`tsu` and long vowels typed as `ou` should produce the expected kana. *Test: Task 1 `romaji conversions`.*
4. **Resuming and day rollover.** Today's old-format unfinished entry is rebuilt. A completed old entry stays completed. A reload resumes at the first unanswered item. *Test: Task 3 `ensureTodaysSession migration`.*
5. **Particles typed in romaji.** `watashi wa` is accepted for 私は, but `わたしわ` typed in kana is not. *Test: Task 1 `romaji wa for particle は`.*
6. **Small pools at low lessons.** At lesson 1 the session has no duplicate IDs and no conjugation, and it still fills 10 items when the pools allow. *Test: Task 3 `lesson 1 composition`.*

---

## File Structure

| File | Responsibility |
|---|---|
| `tests/load.js` (create) | Loads `js/lessons-data.js, reference-data.js, storage.js, conjugation.js, answer-check.js, session.js` into a `vm` context. Exports `loadApp()` → `{ run(expr) }`. Sets `PROGRESS = defaultProgress()`. |
| `js/answer-check.js` (create) | Normalisation, romaji→kana, answer matching, particle diagnosis, character diff. Pure. |
| `js/conjugation.js` (modify) | Adds sentence frames, the in-sentence pool and resolver, mistake kinds and legacy box fallback. Removes conjugation multiple choice. |
| `js/session.js` (create) | Typed-sentence pool and resolver. Moves in `lessonQuestionIds`/`allQuestionsUpTo` from app.js. Builds the session and handles today's session plus migration. |
| `js/storage.js` (modify) | Progress default and migration guard. |
| `js/app.js` (modify) | Typed question UI, record-on-Next, override, done screen, Today button, Conjugate tab. |
| `js/lessons-data.js` (modify) | Rewritten wrong options. |
| `index.html`, `css/styles.css` (modify) | Script tags (`answer-check.js`, `session.js` after `conjugation.js`, before `app.js`) and styles. |

Run all tests with `node --test tests/`.

---

### Task 1: Test harness and answer checking

**Files:**
- Create: `tests/load.js`, `tests/answer-check.test.js`, `js/answer-check.js`
- Modify: `index.html:112` (add `<script src="js/answer-check.js"></script>` after conjugation.js)

**Interfaces:**
- Produces (globals in `js/answer-check.js`):
  - `toHiragana(str: string): string`. Converts katakana (U+30A1–U+30F6) to hiragana and leaves everything else alone.
  - `romajiToHiragana(str: string): string`. Converts runs of ASCII letters, case-insensitively, and leaves non-ASCII alone.
  - `normalizeAnswer(str: string): string`. Trims, then romaji→hiragana, katakana→hiragana, then strips spaces (`\s` and U+3000) and `。、！？!?.,`.
  - `buildAnswerRegex(modelJp: string, opts?: {romaji?: boolean}): RegExp`.
    With `opts.romaji`, set by `checkTyped` when the raw input contains ASCII letters, a chunk-final particle は also accepts わ, へ also accepts え, and を also accepts お. That's because romaji users type these by sound. Kana typists still have to write は/へ/を. Each `漢字（よみ）` segment becomes `(?:漢字|よみ)`. A reading containing `・` gives one alternative per part. Every other character is a literal. All parts go through `normalizeAnswer` (so katakana → hiragana, spaces and punctuation dropped). The result is anchored `^…$`.
  - `kanaForm(modelJp: string): string`. The normalised kana-only answer, using the first reading. Used for display and diff.
  - `checkTyped(input: string, modelJp: string): {correct: boolean, kind: 'exact'|'particle'|'other'|'empty', expected: string, used?: string, needed?: string}`.
    - An empty normalised input gives `kind:'empty'`, `correct:false`.
    - For particle diagnosis, split the model on spaces into chunks. For each chunk ending in a particle from the set (longest match first, so から/まで before と), build variants replacing it with each other particle. If `buildAnswerRegex(variant)` matches the input, return `kind:'particle'` with `used` (the substituted particle) and `needed` (the original).
  - `diffChars(a: string, b: string): Array<{ch: string, op: 'same'|'del'|'add'}>`. An LCS diff, where `del` = in `a` (your answer) only and `add` = in `b` (the model) only.

- [ ] **Step 1: Write `tests/load.js`**

Create a context `{window:{}, console, setTimeout, Math, Date}` with `globalThis` pointing at the context itself. `runInContext` each file in the order above, skipping any that don't exist yet. Then run `PROGRESS = defaultProgress()`. Return `{ run: expr => vm.runInContext(expr, ctx) }`. (Loading the four existing files this way has been checked and works.)

- [ ] **Step 2: Write the failing tests in `tests/answer-check.test.js`**

```js
const test = require('node:test'); const assert = require('node:assert/strict');
const { loadApp } = require('./load.js'); const app = loadApp();
const chk = (i, m) => app.run(`checkTyped(${JSON.stringify(i)}, ${JSON.stringify(m)})`);
const M = '私（わたし）は 学生（がくせい）です。';

test('kana only accepted', () => assert.equal(chk('わたしはがくせいです', M).correct, true));
test('kanji accepted', () => assert.equal(chk('私は学生です。', M).correct, true));
test('mixed script accepted', () => assert.equal(chk('私はがくせいです', M).correct, true));
test('spaces and punctuation ignored', () => assert.equal(chk('わたしは　がくせい です！', M).correct, true));
test('katakana accepted', () => assert.equal(chk('ワタシハガクセイデス', M).correct, true));
test('reading alternatives', () => {
  assert.equal(chk('なんですか', '何（なん・なに）ですか。').correct, true);
  assert.equal(chk('なにですか', '何（なん・なに）ですか。').correct, true);
});
test('romaji with ha', () => assert.equal(chk('watashiha gakusei desu', M).correct, true));
test('romaji wa for particle は', () => assert.equal(chk('watashi wa gakusei desu', M).correct, true));
test('kana わ for particle は still wrong', () => assert.equal(chk('わたしわがくせいです', M).correct, false));
test('particle swap diagnosed', () => {
  const r = chk('わたしががくせいです', M);
  assert.equal(r.kind, 'particle'); assert.equal(r.used, 'が'); assert.equal(r.needed, 'は');
});
test('other mistake', () => assert.equal(chk('わたしはせんせいです', M).kind, 'other'));
test('empty input', () => assert.equal(chk('  。', M).kind, 'empty'));
test('romaji conversions', () => {
  const r = s => app.run(`romajiToHiragana(${JSON.stringify(s)})`);
  assert.equal(r('KITTE'), 'きって'); assert.equal(r('konnichiha'), 'こんにちは');
  assert.equal(r("kan'i"), 'かんい'); assert.equal(r('shichitsu'), 'しちつ');
  assert.equal(r('benkyou'), 'べんきょう'); assert.equal(r('hon'), 'ほん');
});
test('diff marks differences', () => {
  const d = app.run(`diffChars('がくせい','せんせい')`);
  assert.ok(d.some(x => x.op === 'del') && d.some(x => x.op === 'add'));
  assert.deepEqual(d.filter(x => x.op !== 'add').map(x => x.ch).join(''), 'がくせい');
});
```

- [ ] **Step 3: Run it to confirm it fails**

Run: `node --test tests/` — Expected: FAIL, `checkTyped is not defined`.

- [ ] **Step 4: Implement `js/answer-check.js` to the interfaces above**

The romaji table covers the basic gojūon plus dakuten, the y-combinations (`kya`, `sha`, `cha`, `ja`…), `tsu`, `fu`, a doubled consonant → `っ`, and `n` before a consonant, `'` or end of string → `ん`. Unknown letters pass through unchanged.

- [ ] **Step 5: Run the tests**

Run: `node --test tests/` — Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add tests/ js/answer-check.js index.html
git commit -m "Add typed-answer checking with kana/kanji/romaji normalisation"
```

---

### Task 2: Conjugation inside sentences

**Files:**
- Modify: `js/conjugation.js` (frames, pool, resolver, `generateMistakes`, `boxWeight`. Remove `conjugationIdsUpTo`, `resolveConjugationQuestion` and `CONJUGATION_POOL`.)
- Test: `tests/conjugation.test.js`

**Interfaces:**
- Consumes: `normalizeAnswer`, `checkTyped` (Task 1).
- Produces:
  - `CONJ_FRAMES: {[formKey]: Array<{jp: string, en: string, use: string}>}`. There are 2–3 frames for **every** key of `FORM_UNLOCK_LESSON`. `jp` contains `___` exactly once. `en` contains `___` exactly once. `use` is a one-line "when to use" note. Frames must fit any verb, with no object that's specific to one verb.
  - `CONJ_SENTENCE_POOL: Array<{qid, verbIdx, formKey, frameIdx}>`, where `qid = 'conjs-<verbIdx>-<formKey>-<frameIdx>'`.
  - `conjSentenceIdsUpTo(lessonNum): string[]`. Returns `[]` below 14. Otherwise only forms with `FORM_UNLOCK_LESSON[form] <= lessonNum`.
  - `allConjSentenceIds(): string[]`. Every form, for the Conjugate tab.
  - `resolveConjSentence(qid): {qid, lesson: 14, type: 'typed', kind: 'conj', promptEn: string, frameJp: string, dict: string, model: string, use: string, explain: string}`.
    - `promptEn` is the frame's `en` with `___` replaced by `___ (meaning)`, using `verb.meaning`.
    - `frameJp` keeps `___`.
    - `model` is `computeForms(verb)[formKey]`.
  - `generateMistakes(verb, formKey): Array<{text: string, kind: 'group'|'branch'|'tense'}>`. Same mistakes and order as today, now tagged: wrong-group rule → `group`, wrong て/た branch → `branch`, same-family form → `tense`.
  - `diagnoseConj(verb, formKey, input): string|null`. Matches `normalizeAnswer(input)` against `normalizeAnswer` of each mistake's text with readings removed. To strip readings, use `buildAnswerRegex(text)` on the mistake text so either script matches. Message templates:
    - `group`: `${dict} is Group ${g}${verb.trap ? ' (looks like a る-verb but isn\'t)' : ''}, so the ${FORM_LABELS[formKey]} is ${model}.`
    - `branch`: `Verbs ending in ${last} take ${ending}: ${model}.`
    - `tense`: `That's the ${FORM_LABELS[matchedForm]}; this sentence needs the ${FORM_LABELS[formKey]}.` This needs the matched form key, so `tense` mistakes also carry `formKey`.
  - `legacyConjKey(qid): string|null`. Maps `conjs-<v>-<form>-<i>` → `conj-<v>-<form>`.
  - `boxWeight(qid)`. Unchanged for every other ID. For `conjs-*` IDs with no record of their own, it uses the legacy record's box when that exists, with the same formula as a seen record.
  - `recordResult(qid, correct)`. Moved here from `selectAnswer` in app.js:
    - It creates the record if missing. A `conjs-*` record starts at the legacy box.
    - On correct, `count+1`, `correct+1`, `box+1` (max 5). On wrong, `count+1` and `box = 1`.
    - It does not save. The caller calls `saveProgress()`.

- [ ] **Step 1: Write failing tests in `tests/conjugation.test.js`**

```js
// Header as in Task 1: require node:test, node:assert/strict, ./load.js; const app = loadApp();
test('frames cover every form', () => assert.equal(app.run(`Object.keys(FORM_UNLOCK_LESSON).every(k => (CONJ_FRAMES[k]||[]).length >= 2 && CONJ_FRAMES[k].every(f => f.jp.split('___').length===2 && f.en.split('___').length===2))`), true));
test('gating', () => {
  assert.equal(app.run(`conjSentenceIdsUpTo(13).length`), 0);
  assert.ok(app.run(`conjSentenceIdsUpTo(14).every(id => ['masuNeg','masuPast','masuPastNeg','te','ta'].includes(id.split('-')[2]))`));
  assert.ok(app.run(`allConjSentenceIds().some(id => id.includes('-causative-'))`));
});
test('resolve te-form of 書く', () => {
  const q = app.run(`resolveConjSentence('conjs-0-te-0')`);
  assert.equal(q.model, '書（か）いて'); assert.ok(q.promptEn.includes('(to write)')); assert.ok(q.frameJp.includes('___'));
});
test('group mistake named for 帰る', () => {
  const vi = app.run(`VERBS.findIndex(v => v.dict.startsWith('帰'))`);
  const msg = app.run(`diagnoseConj(VERBS[${vi}], 'te', 'かえて')`);
  assert.match(msg, /Group 1/); assert.match(msg, /looks like a る-verb/);
});
// te-form has no "family" in generateMistakes, so test tense on the ます family
test('tense mistake named', () => assert.match(app.run(`diagnoseConj(VERBS[0], 'masuPast', 'かきません')`), /polite negative.*needs the polite past/));
test('unknown wrong answer gives null', () => assert.equal(app.run(`diagnoseConj(VERBS[0], 'te', 'ねこ')`), null));
test('legacy box carries over', () => {
  app.run(`PROGRESS.seen['conj-0-te'] = {count:3, correct:3, box:5}`);
  assert.equal(app.run(`boxWeight('conjs-0-te-1')`), 1);
  app.run(`recordResult('conjs-0-te-1', true)`);
  assert.equal(app.run(`PROGRESS.seen['conjs-0-te-1'].box`), 5);
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `node --test tests/` — Expected: the new tests FAIL. Task 1 still passes.

- [ ] **Step 3: Implement the Interfaces block in `js/conjugation.js`**

Remove `CONJUGATION_POOL`, `conjugationIdsUpTo` and `resolveConjugationQuestion`. Their callers in app.js are fixed in Tasks 3 and 5. Until then, `index.html` would error at those call sites, which is fine between commits on this branch.

- [ ] **Step 4: Run the tests**

Run: `node --test tests/` — Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add js/conjugation.js tests/conjugation.test.js
git commit -m "Practise conjugation inside sentence frames with named mistakes"
```

---

### Task 3: Session builder and today's session

**Files:**
- Create: `js/session.js`, `tests/session.test.js`
- Modify:
  - `js/app.js`: delete `allQuestionsUpTo`, `lessonQuestionIds`, `getTodaysSet`. Update the `qByQid` branches for `type-` and `conjs-`, and drop the `conj-` branch.
  - `js/storage.js:73-125`: guard only, see Step 3.
  - `index.html`: add `<script src="js/session.js"></script>` after answer-check.js.

**Interfaces:**
- Consumes: `weightedSample`, `boxWeight`, `conjSentenceIdsUpTo`, `resolveConjSentence` (Task 2), `GENERATED_POOL_BY_LESSON`, `LESSONS`, `TEXTBOOK`.
- Produces:
  - `SESSION_SIZE = 10`, `SESSION_TYPED = 4`, `SESSION_CONJ_MAX = 3`.
  - `lessonQuestionIds(lessonNum): string[]`. Moved unchanged from app.js. Multiple-choice IDs only.
  - `allQuestionsUpTo(lessonNum): string[]`. Multiple-choice IDs for lessons 1..n, with **no conjugation**.
  - `typedSentenceIdsUpTo(lessonNum): string[]`. IDs `type-senjp-<lesson>-<patternIdx>-<exampleIdx>` for TEXTBOOK examples in lessons ≤ n. Examples whose `jp` contains `／` are excluded.
  - `resolveTypedSentence(qid): {qid, lesson, type: 'typed', kind: 'sentence', promptEn, hint, model, explain}`. `hint` = pattern `title`, `explain` = pattern `explain`, `model` = example `jp`.
  - `buildSessionIds(lessonNum): string[]`:
    - Pick `min(3, conj pool)` conjugation items. Their unused slots go first to typed, up to the typed pool size, then to multiple choice.
    - Typed takes `SESSION_TYPED` plus the overflow. Multiple choice fills the rest, up to `SESSION_SIZE`.
    - Each type is sampled with `weightedSample(pool, boxWeight, n)`, with no duplicates.
    - Order: interleave so no two adjacent items have the same type where counts allow, and the last item is multiple choice when there is any.
  - `itemType(qid): 'typed'|'conj'|'mc'`. `type-*` → typed, `conjs-*` → conj, else mc.
  - `ensureTodaysSession(progress, date, lessonNum): {v: 2, qids: string[], answers: {}, completed: boolean}`:
    - Returns `progress.dailyLog[date]` if it has `v === 2` or `completed === true`.
    - Otherwise it builds a new set with `buildSessionIds`, stores it and returns it. It does not save.
  - `firstUnansweredIndex(set): number`. The index of the first qid not in `set.answers`, or `qids.length`.

- [ ] **Step 1: Write failing tests in `tests/session.test.js`**

```js
// Header as in Task 1
test('lesson 1 composition', () => {
  const ids = app.run(`buildSessionIds(1)`);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.length <= 10);
  assert.equal(ids.filter(id => id.startsWith('conjs-')).length, 0);
  assert.ok(ids.filter(id => id.startsWith('type-')).length >= 4);
  assert.ok(!ids.at(-1).startsWith('type-'));
});
test('lesson 20 caps conjugation at 3', () => {
  for (let i = 0; i < 20; i++) {
    const ids = app.run(`buildSessionIds(20)`);
    assert.equal(ids.length, 10);
    assert.ok(ids.filter(id => id.startsWith('conjs-')).length <= 3);
    assert.equal(ids.filter(id => id.startsWith('type-')).length, 4);
    assert.equal(app.run(`itemType(${JSON.stringify(ids.at(-1))})`), 'mc');
  }
});
test('no old conjugation in MC pool', () => assert.equal(app.run(`allQuestionsUpTo(25).filter(id=>id.startsWith('conj')).length`), 0));
test('typed pool excludes slash examples', () => {
  const ok = app.run(`typedSentenceIdsUpTo(25).every(id => !resolveTypedSentence(id).model.includes('／'))`);
  assert.equal(ok, true);
});
test('ensureTodaysSession migration', () => {
  app.run(`PROGRESS.dailyLog['2026-10-23'] = {qids:['1-0'], answers:{}, completed:false}`);
  assert.equal(app.run(`ensureTodaysSession(PROGRESS,'2026-10-23',3).v`), 2);
  app.run(`PROGRESS.dailyLog['2026-10-22'] = {qids:['1-0'], answers:{}, completed:true}`);
  assert.equal(app.run(`ensureTodaysSession(PROGRESS,'2026-10-22',3).qids.length`), 1);
  assert.equal(app.run(`firstUnansweredIndex({qids:['a','b','c'], answers:{a:{correct:true}}})`), 1);
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `node --test tests/` — Expected: the session tests FAIL with `buildSessionIds is not defined`.

- [ ] **Step 3: Implement `js/session.js` and update the callers**

- In app.js, `renderToday` uses `ensureTodaysSession(PROGRESS, todayStr(), PROGRESS.currentLesson)`, then `saveProgress()`.
- `qByQid` sends `type-` → `resolveTypedSentence` and `conjs-` → `resolveConjSentence`.
- In storage.js `loadProgress()`, add `if(!PROGRESS.dailyLog) PROGRESS.dailyLog = {};` next to the existing guards. No other storage change is needed, because the day's set migrates lazily.

- [ ] **Step 4: Run the tests**

Run: `node --test tests/` — Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add js/session.js js/app.js js/storage.js index.html tests/session.test.js
git commit -m "Build a fixed 10-item daily session with capped conjugation"
```

---

### Task 4: Typed question UI, override and done screen

**Files:**
- Modify: `js/app.js` (`renderToday`, `renderQuizQuestion`, `selectAnswer`, new `renderTypedQuestion`, `finishTyped`, `renderDoneScreen`), `css/styles.css`

**Interfaces:**
- Consumes: `checkTyped`, `kanaForm`, `diffChars`, `diagnoseConj`, `recordResult`, `itemType`, `firstUnansweredIndex`, `resolveTypedSentence`, `resolveConjSentence`.
- Produces: `renderTypedQuestion(qid, q)` and `renderDoneScreen(answers: object, qids: string[])`.

Behaviour:
- **Today card:**
  - Button text is `Start today's session` when nothing is answered and `Continue session` part-way through.
  - The quiz starts at `firstUnansweredIndex(set)`.
  - The dots and stamp trail stay. The "completed" text says `Done for today`.
- **Dispatch:** `renderQuizQuestion` sends `itemType(qid) !== 'mc'` to `renderTypedQuestion`.
- **Typed screen:**
  - The meta line is the same as for multiple choice.
  - Typed sentences show the prompt `promptEn` and the hint `hint`.
  - Conjugation items show `promptEn`, then `frameJp` with `___` rendered as a highlighted blank, then `(dict)`.
  - The input has the Global Constraints attributes. Check is a button, and Enter also works.
  - **Empty input does nothing.** If `kind:'empty'`, there's no verdict and nothing is recorded.
- **Verdict:**
  - Correct: a "Correct" note plus the model in kanji (furigana as in the data).
  - Wrong:
    - Show the user's normalised answer above `kanaForm(model)`, with `diffChars` ops styled. `del` is struck through and red, `add` is underlined and green.
    - Then the specific message: for particle, `Particle: you used ${used}, this needs ${needed}.`; for conjugation, `diagnoseConj(...)` when non-null.
    - Then `explain` (sentence) or `use` + `explain` (conjugation).
    - A ghost button labelled **I was right** flips the pending verdict to correct and replaces the verdict note with `Counted as correct.`
- **Recording:**
  - Typed results are written only when **Next** is pressed. This calls `recordResult(qid, finalCorrect)`, writes `quizState.answers[qid]` and (daily mode) `dailyLog[date].answers[qid] = {correct, typed: input}`, then calls `saveProgress()`.
  - Multiple-choice `selectAnswer` now calls `recordResult` instead of its inline box logic. The behaviour is the same.
- **End of a daily session:**
  - Calls `updateStreakOnComplete()` and `checkLessonUnlocks()` as now.
  - Then shows `renderDoneScreen`:
    - Title `Done for today`.
    - `N / 10 correct`.
    - Streak count.
    - Each missed item, with its prompt (`promptEn` or the multiple-choice prompt) and the correct answer.
    - One ghost button, **Another round**, which starts `buildPracticeSet()` in practice mode, and a primary **Back to Today** button.
  - Practice and conjugation modes end as they do now.
- **CSS:**
  - The input is full-width with font-size ≥ 16px and comfortable tap height.
  - Diff spans.
  - The blank is a highlighted inline box.
  - Everything uses existing CSS variables (`--line` etc.) so it matches the current look.

- [ ] **Step 1: Run the unit tests to confirm nothing regressed before the UI work**

Run: `node --test tests/` — Expected: all pass.

- [ ] **Step 2: Implement the behaviour above**

- [ ] **Step 3: Manual check at phone width**

Serve the folder, e.g. `npx http-server -p 8080 -c-1` or `python -m http.server 8080`, open it in the browser pane, and resize to the 375×812 mobile preset. Check each of these:

  1. Today shows `Start today's session`. Tapping it shows 10 items, with conjugation only from lesson 14.
  2. Typing `watashiha gakusei desu` for "I am a student." is marked correct.
  3. A particle swap shows the particle message and diff.
  4. "I was right" counts the item and the dot turns green.
  5. Pressing Enter on empty input does nothing.
  6. Reloading mid-session resumes at the next unanswered item.
  7. Finishing shows `Done for today`, the missed list and the streak, and the stamp is filled.
  8. The page doesn't zoom on focus and has no horizontal scroll.
  9. The console has no errors.

- [ ] **Step 4: Commit**

```bash
git add js/app.js css/styles.css
git commit -m "Add typed answers, I-was-right override and done screen to daily session"
```

---

### Task 5: Conjugate tab uses the sentence format

**Files:**
- Modify: `js/app.js` `renderConjugate` (lines ~509-558)

**Interfaces:**
- Consumes: `allConjSentenceIds`, `CONJ_SENTENCE_POOL`, `weightedSample`, `boxWeight`, and `renderTypedQuestion` (Task 4).

Behaviour:
- **Start Conjugation Drill** samples 15 IDs from `allConjSentenceIds()`, unchanged: "independent of your lesson pace".
- The counter line reads `${seen}/${CONJ_SENTENCE_POOL.length} sentence drills practiced so far`. A seen item has `PROGRESS.seen[qid].count > 0`.
- The intro copy changes to: `Drill any verb in any form inside a real sentence, independent of your lesson pace. Type the conjugated verb; if you slip, you'll see which rule you broke (verb group, godan branch, or wrong tense).`
- The reference cards stay as they are.
- Remove any remaining reference to `CONJUGATION_POOL` or `conj-` multiple choice in app.js.

- [ ] **Step 1: Implement**

- [ ] **Step 2: Verify**

Run: `node --test tests/` — Expected: all pass.

Search the code: `grep -n "CONJUGATION_POOL\|resolveConjugationQuestion\|conjugationIdsUpTo" js/` — Expected: no matches.

Manual check: the Conjugate tab drill shows typed sentence items, typing a 帰る group mistake shows the "looks like a る-verb" message, and the console is clean.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "Switch Conjugate tab drill to typed sentence frames"
```

---

### Task 6: Harder wrong answers in hand-written lesson questions

**Files:**
- Modify: `js/lessons-data.js` (the `q:` arrays, 25 lessons × 4)
- Create: `tests/fixtures/lesson-answers.json`, `tests/lessons-data.test.js`

**Interfaces:** None. This is data only.

- [ ] **Step 1: Snapshot the current correct answers before editing**

Run: `node -e "const {loadApp}=require('./tests/load.js');const a=loadApp();console.log(JSON.stringify(a.run('LESSONS.map(l=>l.q.map(q=>({prompt:q.prompt,answer:q.choices[q.a],note:q.note,type:q.type})))'),null,1))" > tests/fixtures/lesson-answers.json`

- [ ] **Step 2: Write the test in `tests/lessons-data.test.js`**

For every lesson and index, check that `prompt`, `type`, `note` and `choices[a]` equal the snapshot, that there are 4 choices, that the choices are unique, and that `a` is in range 0–3.

- [ ] **Step 3: Run it to confirm it passes against the untouched data**

Run: `node --test tests/` — Expected: all pass. This is the guard for the next step.

- [ ] **Step 4: Rewrite the wrong options under the spec's rules**

- **vocab:** use the same lesson or a close category, the same script and a similar length (other people words for 学生, other everyday objects for 傘).
- **grammar:** use plausible particles for that slot (は/が, に/で, を/が, へ/に).
- **structure:** each wrong option differs from the right one in one realistic way (word order, particle or politeness).

Reordering choices is fine as long as `a` is updated. Leave options that already meet the rules unchanged.

- [ ] **Step 5: Run the tests**

Run: `node --test tests/` — Expected: all pass.

Manual check: open three lesson questions in the app and confirm the options read as plausible.

- [ ] **Step 6: Commit**

```bash
git add js/lessons-data.js tests/fixtures tests/lessons-data.test.js
git commit -m "Replace giveaway wrong options with plausible learner mistakes"
```
