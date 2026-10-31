# Conjugate Tab: Verb Reference and Short Drills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Conjugate tab: a verb reference generated from the verb data, "use it in a sentence" panels, a menu of 5-question drills, about 60 more N5/N4 verbs, and quiz sentences that make sense.

**Architecture:** The verb list moves to its own data file and gains `jlpt`, `comp` (complement phrase), `tags`, `skip` and `drill` fields. Sentence frames declare what they `need`, and the sentence pool only pairs a verb with frames it satisfies. A new pure module, `js/conj-reference.js`, builds everything the tab shows: reference rows, the bold "changed part", build rules, panel examples and drill segments. `app.js` only renders it.

**Tech Stack:** Plain browser JS globals (no build, no modules), `node:test` via `tests/load.js` (a `vm` context), CSS in `css/styles.css`.

**Spec:** `docs/superpowers/specs/2026-10-31-conjugation-reference-design.md` (mockups in `docs/superpowers/specs/2026-10-31-conjugation-reference-mockups/`).

## Global Constraints

- Static site, plain `<script>` globals, no build step, no modules, no new libraries.
- Reuse the existing komorebi tokens and classes (`--ink`, `--line`, `--vermillion`, `.card`, `.gstruct`, `.muted`). Add new CSS only where nothing fits.
- Must be usable at 375px width. Wide tables scroll horizontally inside their own container, never the page.
- Every row of the reference and every panel example is generated from `VERBS`, `computeForms()`, `masuForm()`, `GODAN_ROWS`, `TE_TA_MAP`, `CONJ_FRAMES` and `FORM_LABELS`. Nothing about a specific verb's conjugation is typed twice.
- `VERBS` is **append-only**. Existing entries keep their array index, because qids are `conjs-<verbIdx>-<formKey>-<frameIdx>`.
- `CONJ_FRAMES[form]` arrays are **append-only by index**. Rewriting a frame in place is fine. Retire a frame with `retired: true`; never delete one.
- Do not change the shape of saved progress (`PROGRESS`). Daily-session behaviour stays the same (existing `tests/session.test.js` must stay green).
- The drill's existing feedback text (`explainForm()`, `diagnoseConj()`) is not changed.
- Rounds are 5 questions. Tile progress is "practised / total", taken from `PROGRESS.seen[qid].count > 0`.
- The finish screen must not touch the streak and must not say "Done for today".
- Run all tests with `node --test tests/*.test.js`. (`node --test tests/` fails on this Node version.)

## Review Focus

1. **Old qids from saved progress or today's saved session that are no longer in the pool** (for example 死ぬ, now drill-off, or a combination a new tag excludes) must still resolve and render, not throw. *Test: Task 1 `excluded combos still resolve`.*
2. **Typed answers for new noun+する and okurigana verbs** (りょうりして for 料理して, かたづけた for 片付けた) must be accepted by the existing checker. *Test: Task 2 `new verbs check as typed`.*
3. **A segment whose pool is smaller than 5** must give a shorter round without duplicates or a crash. Today every segment must have at least 5 sentences. *Test: Task 4 `every segment has at least 5` and `round from small pool`.*
4. **Leaving a round mid-way** (switching tab, reloading) and coming back to Conjugate resumes the round, as `renderConjugate()` does today. *Check: Task 7, step "Manual check".*
5. **Phone width.** At 375px, tiles sit two per row, tables scroll inside their wrapper, and nothing overflows the page. *Check: Task 6 and Task 7, step "Manual check".*

---

## File Structure

| File | Responsibility |
|---|---|
| `js/verbs-data.js` (create) | `VERBS`, moved out of conjugation.js unchanged in order, plus the new fields and new verbs. |
| `js/conjugation.js` (modify) | Engine as today. `CONJ_FRAMES` gains `needs`, `{o}` and `retired`. Pool builder and `resolveConjSentence` respect tags and complements. |
| `js/conj-reference.js` (create) | Pure helpers for the tab: reference rows, `displayForm`, `FORM_BUILD_RULES`, panel data, `endingsAtGlance`, segments. |
| `js/app.js` (modify) | `renderConjugate()` rewritten. Conjugation round finish screen. Shared missed-list helper. |
| `css/styles.css` (modify) | Tiles, reference tables, final-kana and row highlights, `<details>` panels. |
| `index.html` (modify) | Script tags: `verbs-data.js` before `conjugation.js`; `conj-reference.js` after `session.js`, before `app.js`. |
| `tests/load.js` (modify) | `FILES` gains `verbs-data.js` (before `conjugation.js`) and `conj-reference.js` (after `session.js`). |
| `tests/conjugation.test.js` (modify) | Sentence-rule tests. |
| `tests/verbs-data.test.js` (create) | Append-only guard and new-verb coverage. |
| `tests/conj-reference.test.js` (create) | Helpers and segments. |
| `tests/fixtures/verbs-v1.json` (create) | The 52 current `dict` strings in order, for the append-only guard. |
| `tools/list-conj-sentences.js` (create) | Prints every pool sentence for the human review in Task 3. |

---

### Task 1: Sentence model (tags, complements, frame needs)

**Files:**
- Create: `js/verbs-data.js`, `tests/fixtures/verbs-v1.json`, `tests/verbs-data.test.js`
- Modify: `js/conjugation.js`, `tests/load.js`, `index.html`, `tests/conjugation.test.js`

**Interfaces:**
- Produces, on each verb: `jlpt: 5|4`; `comp?: {jp: string, en: string}` (a phrase with its particle, readings inline, e.g. `{jp:'水（みず）を', en:'water'}`); `tags: string[]`, drawn from `'action'` (chosen action: requests, permission, plans, "let's", potential, causative), `'person'` (can be done to a person: passive frames) and `'thing'` (subject is a thing, not "I"; `comp` is then that subject, e.g. `雨（あめ）が`); `skip?: string[]` (form keys never drilled for this verb); `drill?: false` (reference only).
- Produces, on each frame: `jp` and `en` each with exactly one `___` and at most one `{o}`; `use: string`; `needs?: string[]`; `retired?: true`.
- Produces `frameFits(verb, frame) -> boolean`: true iff `verb.drill !== false`, `!frame.retired`, every tag in `frame.needs` is in `verb.tags`, and the frame needs `'thing'` exactly when the verb has `'thing'`.
- Produces `fillFrame(text, compPart) -> string`: replaces `{o}` with `compPart`, or removes `{o}` and one adjacent space when `compPart` is empty.
- `CONJ_SENTENCE_POOL` includes `(verb, form, frame)` only when `frameFits` holds and `form` is not in `verb.skip`.
- `resolveConjSentence(qid)` returns the same shape as today. `frameJp` has the complement filled, and `promptEn` is `fillFrame(frame.en.replace('___', '___ (<meaning>)'), comp.en)`. It still resolves qids that are out of the pool.

- [ ] **Step 1: Snapshot the current verb order**

Run: `node -e "const {loadApp}=require('./tests/load.js');require('fs').writeFileSync('tests/fixtures/verbs-v1.json',JSON.stringify(loadApp().run('VERBS.map(v=>v.dict)'),null,1))"`
Expected: the file holds 52 strings, the first `"書（か）く"`, the last `"結婚（けっこん）する"`.

- [ ] **Step 2: Write the failing tests**

In `tests/verbs-data.test.js`:
```js
test('existing verbs keep their index', () => {
  const v1 = require('./fixtures/verbs-v1.json');
  assert.deepEqual(JSON.parse(app.run(`JSON.stringify(VERBS.slice(0, ${v1.length}).map(v => v.dict))`)), v1);
});
test('every verb has jlpt and tags', () =>
  assert.equal(app.run(`VERBS.every(v => (v.jlpt===4||v.jlpt===5) && Array.isArray(v.tags))`), true));
```
In `tests/conjugation.test.js`, replace `frames cover every form` and add:
```js
test('frames well formed', () => assert.equal(app.run(`Object.keys(FORM_UNLOCK_LESSON).every(k => CONJ_FRAMES[k].filter(f=>!f.retired).length >= 2 && CONJ_FRAMES[k].every(f => f.jp.split('___').length===2 && f.en.split('___').length===2 && f.jp.split('{o}').length<=2 && f.en.split('{o}').length<=2 && f.use))`), true));
test('pool respects needs, skip, drill', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.every(it => { const v=VERBS[it.verbIdx], f=CONJ_FRAMES[it.formKey][it.frameIdx]; return frameFits(v,f) && !(v.skip||[]).includes(it.formKey); })`), true));
test('no verb lacking action in a request', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.filter(it=>it.formKey==='te'&&it.frameIdx===0).every(it=>VERBS[it.verbIdx].tags.includes('action'))`), true));
test('passive only for person verbs', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.filter(it=>it.formKey==='passive').every(it=>VERBS[it.verbIdx].tags.includes('person'))`), true));
test('死ぬ is reference only', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.some(it=>it.verbIdx===8)`), false));
test('every drill verb has a sentence', () => assert.equal(app.run(`VERBS.every((v,i)=> v.drill===false || CONJ_SENTENCE_POOL.some(it=>it.verbIdx===i))`), true));
test('complement filled', () => {
  const q = app.run(`resolveConjSentence('conjs-5-te-0')`);
  assert.equal(q.frameJp, '水（みず）を___ください。');
  assert.equal(q.promptEn, 'Please ___ (to drink) water.');
});
test('no slot token left', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.every(it => { const q=resolveConjSentence(it.qid); return !q.frameJp.includes('{o}') && !q.promptEn.includes('{o}'); })`), true));
test('excluded combos still resolve', () => assert.equal(app.run(`resolveConjSentence('conjs-8-te-0').model`), '死（し）んで'));
```
Keep the existing `resolve te-form of 書く` test as it is (it must still pass).

- [ ] **Step 3: Run the tests to verify they fail**

Run: `node --test tests/*.test.js`
Expected: FAIL. `VERBS` lacks `jlpt`/`tags`, and `frameFits` and `fillFrame` are not defined.

- [ ] **Step 4: Move `VERBS` into `js/verbs-data.js` and tag the 52 existing verbs**

Move the array unchanged in order. Add `jlpt`, `tags`, and `comp` where a natural one exists. Pinned values: `飲む` (index 5) gets `comp: {jp:'水（みず）を', en:'water'}` and `tags: ['action']`. `死ぬ` (index 8) gets `drill: false`. `知る` (index 22) gets `skip: ['dict']` plus any form the Task 3 review finds unnatural. Non-action verbs that take "I" as subject (分かる, 要る, 疲れる) get no `'action'`. Add the script tags to `index.html` and `tests/load.js` in the order given in File Structure.

- [ ] **Step 5: Rewrite `CONJ_FRAMES` with `needs` and `{o}`, add `frameFits` and `fillFrame`, rebuild the pool**

Pinned: `te[0]` becomes `{jp:'{o}___ください。', en:'Please ___ {o}.', needs:['action'], use:<existing>}`. Each form keeps at least two frames usable by `'action'` verbs. The masu forms, `ta`, `nai` and `naiPast` each also get at least one frame with no `needs` (for non-action "I" verbs) and one with `needs:['thing']` (subject first: `'{o}___。'`-style with the English `'… {o} ___ …'`). Passive frames need `['action','person']`. Causative, volitional, potential, permission and `つもり` frames need `['action']`. Wording is the implementer's, subject to the Task 3 review.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node --test tests/*.test.js`
Expected: PASS, including the unchanged `tests/session.test.js`.

- [ ] **Step 7: Commit**

```bash
git add js/verbs-data.js js/conjugation.js index.html tests/
git commit -m "Tag verbs and frames so quiz sentences only pair verbs with frames that fit"
```

### Task 2: About 60 new N5/N4 verbs

**Files:**
- Modify: `js/verbs-data.js`, `tests/verbs-data.test.js`

**Interfaces:**
- Consumes: the verb fields from Task 1.
- Produces: `VERBS.length >= 110`. New verbs are appended after index 51.

- [ ] **Step 1: Write the failing tests**

```js
test('enough verbs', () => assert.ok(app.run('VERBS.length') >= 110));
test('godan endings covered', () => assert.equal(app.run(`['う','く','ぐ','す','つ','ぶ','む','る'].every(e => VERBS.filter(v=>v.group===1&&v.oku.slice(-1)===e).length >= 2)`), true));
test('more traps, ichidan, する compounds', () => {
  assert.ok(app.run(`VERBS.filter(v=>v.trap).length`) >= 8);
  assert.ok(app.run(`VERBS.filter(v=>v.group===2).length`) >= 19);
  assert.ok(app.run(`VERBS.filter(v=>v.irregular==='suru'&&v.stem).length`) >= 9);
});
test('every verb conjugates', () => assert.equal(app.run(`VERBS.every(v => Object.keys(FORM_LABELS).every(k => computeForms(v)[k]))`), true));
test('new verbs check as typed', () => {
  const i = app.run(`VERBS.findIndex(v=>v.dict==='料理（りょうり）する')`);
  assert.ok(i >= 52);
  assert.equal(app.run(`checkTyped('りょうりして', computeForms(VERBS[${i}]).te).correct`), true);
  const j = app.run(`VERBS.findIndex(v=>v.dict==='片付（かたづ）ける')`);
  assert.equal(app.run(`checkTyped('かたづけた', computeForms(VERBS[${j}]).ta).correct`), true);
});
```
(Check `checkTyped`'s return shape in `js/answer-check.js:201` and adjust `.correct` if it differs.)

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/verbs-data.test.js`
Expected: FAIL on `enough verbs`.

- [ ] **Step 3: Append about 60 verbs from the spec appendix**

Include 料理する and 片付ける (the test pins them). Choose the rest from the spec's appendix pool so the coverage tests pass. Each verb gets `jlpt`, `tags`, a natural `comp` where one exists, and `trap: true` for 切る, 減る, 喋る and 滑る. `stem` and `oku` follow the existing convention, with readings inline on the stem, as in `{dict:"分（わ）かる", stem:"分（わ）", oku:"かる"}`.

- [ ] **Step 4: Run all tests to verify they pass**

Run: `node --test tests/*.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/verbs-data.js tests/verbs-data.test.js
git commit -m "Add about 60 N5/N4 verbs with tags and complements"
```

### Task 3: Read every quiz sentence and fix the ones that don't make sense

**Files:**
- Create: `tools/list-conj-sentences.js`
- Modify: `js/verbs-data.js`, `js/conjugation.js` (tags, `skip`, `comp`, frame wording only)

**Interfaces:**
- Consumes: `CONJ_SENTENCE_POOL`, `resolveConjSentence`, `VERBS` (Tasks 1 and 2).

- [ ] **Step 1: Write the listing script**

`node tools/list-conj-sentences.js` uses `tests/load.js`. It prints one line per pool item, grouped by verb: `<dict> | <formKey> | <frameIdx> | <frameJp with ___ replaced by model> | <promptEn>`. The last line is the total count.

- [ ] **Step 2: Generate the listing**

Run: `node tools/list-conj-sentences.js > "$TMPDIR/conj-sentences.txt"` (any scratch path outside the repo).
Expected: one line per sentence, then a total.

- [ ] **Step 3: Read every line against the spec's bar**

The bar: a teacher would accept the sentence as natural N5/N4 Japanese, and the English means the same once the blank is filled in mentally. Fix each failure through `tags`, `skip`, `comp`, `drill:false` or frame wording (append or retire frames, never delete them). Write each fix down as you go: the verb or frame and what was wrong.

- [ ] **Step 4: Regenerate, re-read the changed lines, and run the tests**

Run: `node tools/list-conj-sentences.js > "$TMPDIR/conj-sentences.txt"` then `node --test tests/*.test.js`
Expected: no line fails the bar, and all tests PASS. Repeat Steps 3 and 4 until clean.

- [ ] **Step 5: Commit**

```bash
git add tools/list-conj-sentences.js js/verbs-data.js js/conjugation.js
git commit -m "Review every conjugation sentence and fix unnatural pairings"
```
Put the list of fixes from Step 3 in the commit body.

### Task 4: Reference and drill helpers

**Files:**
- Create: `js/conj-reference.js`, `tests/conj-reference.test.js`

**Interfaces:**
- Consumes: `VERBS`, `computeForms`, `masuForm`, `TE_TA_MAP`, `CONJ_FRAMES`, `CONJ_SENTENCE_POOL`, `frameFits`, `fillFrame`, `resolveConjSentence`, `weightedSample`, `boxWeight`, `CHECK_KANJI_READING_RE`, `PROGRESS`.
- Produces:
  - `stripReadings(jp: string) -> string`
  - `displayForm(verb, colKey) -> {lead: string, changed: string, tail: string}`. `colKey` is a `FORM_LABELS` key or `'masu'`. Readings are stripped, except that 来る keeps `来（き）`/`来（こ）` in `lead`. `tail` is `'ます'` only for `'masu'`. `changed` starts at the first character that differs from the stripped dictionary form.
  - `REFERENCE_COLUMNS: [{key, en, hint?}]` = `dict` "Basic form", `masu` "Polite" "(present)", `ta` "Past", `nai` "Negative", `naiPast` "Negative past", `te` "て-form" "(linking)".
  - `referenceGroups() -> [{group:1, sections:[{label, verbs}]}, {group:2, verbs}, {group:3, verbs}]`. Group 1 sections are in the order う, く, ぐ, す, つ, ぬ・ぶ・む, る; trap verbs sort last within る. Group 3 holds exactly する, 来る and 勉強する.
  - `endingsAtGlance() -> [{endings: string[], te, ta}]`, derived from `TE_TA_MAP` by grouping on `te`.
  - `FORM_EN: {formKey: string}` (12 English names) and `PANEL_ORDER: string[]` = `['dict','ta','nai','naiPast','te','masuNeg','masuPast','masuPastNeg','potential','volitional','passive','causative']`.
  - `FORM_BUILD_RULES: {formKey: {godan, ichidan, irregular}}`, one hand-written line each.
  - `panelExamples(formKey) -> [{jp, en, use}]`, at most 3. For each non-retired frame, use the first verb in `VERBS` order where `frameFits` holds; `jp` keeps readings.
  - `CONJ_SEGMENTS: [{key, label, labelJp?, kind:'type'|'form'}]`. Type keys: `g-kg`, `g-stu`, `g-nbm`, `g-ru`, `ichidan`, `trap`, `irregular`, `mixed` (membership as in the spec's tile table; `g-*` excludes traps). Form keys: `f-<formKey>` for the 12 forms, labelled from `FORM_EN`.
  - `segmentIds(key) -> qid[]`, `segmentProgress(key) -> {done, total}`, `segmentRound(key) -> qid[]` (`weightedSample(segmentIds(key), boxWeight, 5)`).

- [ ] **Step 1: Write the failing tests**

Results that are arrays or objects come from the `vm` realm, so strict `deepEqual` needs them round-tripped. Use `const j = e => JSON.parse(app.run(`JSON.stringify(${e})`));` at the top of the file, and wrap every non-primitive result in `j(...)`.

```js
const df = (dict, col) => j(`displayForm(VERBS.find(v=>v.dict==='${dict}'), '${col}')`);
test('changed part, godan', () => {
  assert.deepEqual(df('飲（の）む','masu'), {lead:'飲', changed:'み', tail:'ます'});
  assert.deepEqual(df('飲（の）む','ta'), {lead:'飲', changed:'んだ', tail:''});
  assert.deepEqual(df('行（い）く','te'), {lead:'行', changed:'って', tail:''});
  assert.deepEqual(df('分（わ）かる','ta'), {lead:'分か', changed:'った', tail:''});
});
test('changed part, ichidan and irregular', () => {
  assert.deepEqual(df('食（た）べる','nai'), {lead:'食べ', changed:'ない', tail:''});
  assert.deepEqual(df('食（た）べる','masu'), {lead:'食べ', changed:'', tail:'ます'});
  assert.deepEqual(df('来（く）る','nai'), {lead:'来（こ）', changed:'ない', tail:''});
  assert.deepEqual(df('勉強（べんきょう）する','ta'), {lead:'勉強', changed:'した', tail:''});
});
test('godan sections in order', () => assert.deepEqual(j(`referenceGroups()[0].sections.map(s=>s.label)`), ['う','く','ぐ','す','つ','ぬ・ぶ・む','る']));
test('traps last in る', () => { const ru = j(`referenceGroups()[0].sections[6].verbs.map(v=>!!v.trap)`); assert.deepEqual(ru, ru.slice().sort()); });
test('every verb in the reference except extra する compounds', () => assert.equal(app.run(`referenceGroups().reduce((n,g)=>n+(g.sections?g.sections.reduce((m,s)=>m+s.verbs.length,0):g.verbs.length),0)`), app.run(`VERBS.filter(v=>v.group!==3).length + 3`)));
test('endings at a glance', () => assert.deepEqual(j(`endingsAtGlance().map(r=>[r.endings.join(''), r.te])`), [['うつる','って'],['むぶぬ','んで'],['く','いて'],['ぐ','いで'],['す','して']]));
test('build rules complete', () => assert.equal(app.run(`PANEL_ORDER.length===12 && PANEL_ORDER.every(k => ['godan','ichidan','irregular'].every(g => FORM_BUILD_RULES[k] && FORM_BUILD_RULES[k][g]))`), true));
test('panel examples filled', () => assert.equal(app.run(`PANEL_ORDER.every(k => { const ex=panelExamples(k); return ex.length>=1 && ex.length<=3 && ex.every(e=>!e.jp.includes('___')&&!e.jp.includes('{o}')&&e.use); })`), true));
test('every segment has at least 5', () => assert.equal(app.run(`CONJ_SEGMENTS.every(s => segmentIds(s.key).length >= 5)`), true));
test('segment membership', () => {
  assert.ok(app.run(`segmentIds('g-kg').some(id => VERBS[+id.split('-')[1]].dict==='行（い）く')`));
  assert.equal(app.run(`segmentIds('g-ru').some(id => VERBS[+id.split('-')[1]].trap)`), false);
  assert.equal(app.run(`segmentIds('trap').every(id => VERBS[+id.split('-')[1]].trap)`), true);
  assert.equal(app.run(`segmentIds('f-te').every(id => id.split('-')[2]==='te')`), true);
  assert.equal(app.run(`segmentIds('mixed').length`), app.run(`CONJ_SENTENCE_POOL.length`));
});
test('segment progress counts seen', () => {
  const id = app.run(`segmentIds('f-te')[0]`);
  app.run(`recordResult('${id}', true)`);
  assert.equal(app.run(`segmentProgress('f-te').done`), 1);
});
test('round from small pool', () => {
  const r5 = j(`segmentRound('mixed')`);
  assert.equal(r5.length, 5); assert.equal(new Set(r5).size, 5);
  const r3 = j(`segmentRound('mixed', segmentIds('mixed').slice(0, 3))`);
  assert.equal(r3.length, 3); assert.equal(new Set(r3).size, 3);
});
```
`segmentRound(key, ids = segmentIds(key))` takes the optional `ids` so the small-pool case is testable.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/conj-reference.test.js`
Expected: FAIL. `displayForm` is not defined.

- [ ] **Step 3: Implement `js/conj-reference.js`**

`stripReadings` uses `jp.replace(CHECK_KANJI_READING_RE, '$1')`. `displayForm` compares the stripped form, with `tail` removed, against the stripped dictionary form, character by character. 来る is special-cased.

- [ ] **Step 4: Run all tests to verify they pass**

Run: `node --test tests/*.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/conj-reference.js tests/conj-reference.test.js
git commit -m "Add pure helpers for the conjugation reference, panels and drill segments"
```

### Task 5: Shared missed list and round finish screen

**Files:**
- Modify: `js/app.js:241-261` (`renderQuizQuestion` end), `js/app.js:436-465` (`renderDoneScreen`)

**Interfaces:**
- Consumes: `segmentRound(key)` (Task 4), `quizState.seg`.
- Produces: `missedListHtml(answers, qids) -> string`, used by both screens. Also `renderConjRoundDone(answers, qids, segKey)`. A conjugation round's `quizState` is `{qids, idx:0, mode:'conjugation', seg:<segment key>, answers:{}}`.

- [ ] **Step 1: Extract `missedListHtml` from `renderDoneScreen`**

The daily done screen renders exactly as before.

- [ ] **Step 2: Add `renderConjRoundDone`**

In `renderQuizQuestion`, when `quizState.mode === 'conjugation'` at the end of the round, capture `answers`, `qids` and `seg` before `quizState = null`, then call `renderConjRoundDone` instead of `render()`. The screen shows the title "Round complete", `${correct} / ${qids.length} correct`, the missed list (or "No misses this round."), and two buttons: `#conjAgainBtn` "Another round" (starts `segmentRound(seg)` with the same `seg`) and `#conjBackBtn` "Back to drills" (`quizState = null; render();`). It does not call `updateStreakOnComplete`.

- [ ] **Step 3: Run the tests**

Run: `node --test tests/*.test.js`
Expected: PASS (no DOM tests; this guards against load errors).

- [ ] **Step 4: Commit**

```bash
git add js/app.js
git commit -m "Show a round summary at the end of a conjugation drill round"
```

### Task 6: Reference section and sentence panels

**Files:**
- Modify: `js/app.js:665-712` (`renderConjugate`), `css/styles.css`

**Interfaces:**
- Consumes: `REFERENCE_COLUMNS`, `referenceGroups`, `displayForm`, `endingsAtGlance`, `GODAN_ROWS`, `PANEL_ORDER`, `FORM_EN`, `FORM_LABELS`, `FORM_BUILD_RULES`, `panelExamples` (Task 4).

- [ ] **Step 1: Render the reference card**

The card replaces the old "Reference — the three groups" card. It contains:
- **Endings at a glance:** rows from `endingsAtGlance()`, plus one line each for the negative (あ-row, う→わ) and the polite (い-row) from `GODAN_ROWS`, and the 行く exception.
- **Group 1:** the one-line rule, then one `<details open>` per section, each holding a table in a `.conj-table-wrap` with `REFERENCE_COLUMNS` headers (the English text, with the hint in a small span).
  - **Basic form cell:** the dictionary form with readings, the final kana in `.conj-final`, the meaning muted, and a small `N5`/`N4` tag.
  - **Other cells:** `lead<b>changed</b>tail`.
  - **Row classes:** `.is-odd` for verbs with `irregularTe` and `.is-trap` for verbs with `trap`, with the legend line from the mockup.
- **Group 2:** the "how to tell" note, then the same table.
- **Group 3:** the same table.

Follow `docs/superpowers/specs/2026-10-31-conjugation-reference-mockups/reference-table.html` for the look.

- [ ] **Step 2: Render the panels card**

The card is titled "Using a form in a sentence". It holds one `<details>` per `PANEL_ORDER` key, with a summary of `FORM_EN[k]` and the Japanese label small. Inside are the three `FORM_BUILD_RULES[k]` lines, then up to three `panelExamples(k)` (Japanese, English, `use` muted). The three polite panels add a line saying the polite present is the ます form.

- [ ] **Step 3: Add CSS**

The CSS covers `.conj-table-wrap {overflow-x:auto}`, `table.conj-table`, `.conj-final` (color `var(--vermillion)`) and the large ending cell. It adds two new tokens beside the existing ones for the `.is-trap` and `.is-odd` backgrounds, plus `.conj-jlpt` and `details.conj-panel`.

- [ ] **Step 4: Manual check**

Serve the folder (`python -m http.server 8000`, or preview_start with a launch.json entry for it) and open the Conjugate tab. Check the following, at desktop width and at 375px:
- 帰る is orange.
- 行く is amber.
- 飲む shows 飲<b>み</b>ます and 飲<b>んだ</b>.
- Each table scrolls inside itself at 375px.
- Opening a panel does not re-render the page or lose the scroll position.

- [ ] **Step 5: Commit**

```bash
git add js/app.js css/styles.css
git commit -m "Replace the conjugation reference with generated verb tables and form panels"
```

### Task 7: Drill menu

**Files:**
- Modify: `js/app.js` (`renderConjugate`), `css/styles.css`

**Interfaces:**
- Consumes: `CONJ_SEGMENTS`, `segmentProgress`, `segmentRound` (Task 4), `renderConjRoundDone` (Task 5).

- [ ] **Step 1: Replace the "Start Conjugation Drill" button with the tile menu**

Keep the count line. Add a "By verb type" grid and a "By form" grid. Each tile is a `<button class="conj-tile" data-seg="<key>">` showing its label (the form tiles also show `labelJp` small) and `${done}/${total}`. Clicking a tile sets `quizState = {qids: segmentRound(key), idx:0, mode:'conjugation', seg:key, answers:{}}` and calls `renderQuizQuestion()`. The `if(quizState){ renderQuizQuestion(); return; }` guard at the top of `renderConjugate` stays.

- [ ] **Step 2: CSS for `.conj-tiles`**

Two columns by default and three from 640px, using the existing card and border styling. The trap tile gets the `.is-trap` background.

- [ ] **Step 3: Manual check**

In the served app:
- Start "Godan: く・ぐ" and answer 2 of the 5 questions. Switch to another tab and back: the round resumes at question 3.
- Finish the round. The summary shows "Round complete" and the streak is unchanged. "Another round" starts 5 new questions from the same tile. "Back to drills" shows the tile with its practised count increased.
- At 375px the tiles sit two per row with no page overflow.

- [ ] **Step 4: Run all tests**

Run: `node --test tests/*.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/app.js css/styles.css
git commit -m "Split the conjugation drill into 5-question rounds picked from a tile menu"
```
