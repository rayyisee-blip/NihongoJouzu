const test=require('node:test'); const assert=require('node:assert/strict'); const {loadApp}=require('./load.js'); const app=loadApp();
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
test('no adjacent same type at lesson 20', () => {
  for (let i = 0; i < 20; i++) {
    const t = app.run(`buildSessionIds(20).map(itemType)`);
    for (let j = 1; j < t.length; j++) assert.notEqual(t[j], t[j-1]);
  }
});
// Digit-containing models (4（よん）つ, 9時（じ）) pass once digits may precede a reading, so none are excluded.
test('every typed model accepts its kana form and its kanji-only form', () => {
  const bad = app.run(`typedSentenceIdsUpTo(25).filter(id=>{
    const m = resolveTypedSentence(id).model;
    const kanjiOnly = m.replace(/（[^）]*）/g,'');
    return !checkTyped(kanaForm(m), m).correct || !checkTyped(kanjiOnly, m).correct;
  })`);
  assert.equal(bad.length, 0, JSON.stringify(bad));
});
test('every conjugation model accepts its own kana form', () => {
  const bad = app.run(`allConjSentenceIds().filter(id=>{
    const m = resolveConjSentence(id).model;
    return !checkTyped(kanaForm(m), m).correct;
  })`);
  assert.equal(bad.length, 0, JSON.stringify(bad));
});
test('ensureTodaysSession reuse returns the same object', () => {
  app.run(`delete PROGRESS.dailyLog['2026-11-01']`);
  const first = app.run(`ensureTodaysSession(PROGRESS,'2026-11-01',3)`);
  assert.equal(app.run(`ensureTodaysSession(PROGRESS,'2026-11-01',3) === PROGRESS.dailyLog['2026-11-01']`), true);
});

// Multiple-choice options for sentence items.
const choicesOf = id => JSON.parse(app.run(`JSON.stringify(sentenceChoices(${JSON.stringify(id)}))`));
const idFor = jp => app.run(`typedSentenceIdsUpTo(25).find(id => resolveTypedSentence(id).model === ${JSON.stringify(jp)})`);
test('sentenceChoices gives 4 distinct options with the answer once, for every sentence', () => assert.deepEqual(JSON.parse(app.run(`JSON.stringify(typedSentenceIdsUpTo(25).filter(id => {
  const c = sentenceChoices(id).map(o => o.text), model = resolveTypedSentence(id).model;
  return c.length !== 4 || new Set(c).size !== 4 || c.filter(x => x === model).length !== 1;
}))`)), []));
test('sentenceChoices swaps one particle for a clearly wrong one', () => {
  const c = choicesOf(idFor('庭（にわ）に 犬（いぬ）が います。'));
  const swaps = c.filter(o => o.kind === 'particle').map(o => o.text).sort();
  assert.deepEqual(swaps, ['庭（にわ）に 犬（いぬ）に います。', '庭（にわ）を 犬（いぬ）が います。']);
  assert.deepEqual(c.find(o => o.text === '庭（にわ）を 犬（いぬ）が います。'), {text:'庭（にわ）を 犬（いぬ）が います。', kind:'particle', used:'を', needed:'に'});
});
test('sentenceChoices leaves この and て-form + も alone', () => {
  const texts = [idFor('この 町（まち）は 静（しず）かです。'), idFor('エアコンを つけても いいですか。')]
    .flatMap(id => choicesOf(id).filter(o => o.kind === 'particle').map(o => o.text));
  assert.equal(texts.some(t => /^こ[をへにが] |つけて[^も]/.test(t)), false);
});
test('other-sentence options carry their meaning', () => {
  const c = choicesOf(idFor('3,000円（えん）です。'));
  assert.equal(c.filter(o => o.kind === 'other').length, 3);
  assert.ok(c.filter(o => o.kind === 'other').every(o => o.en));
});
test('a noun ending in ん still gets its particle swapped', () => {
  const swaps = choicesOf(idFor('朝（あさ）ごはんを 食（た）べます。')).filter(o => o.kind === 'particle').map(o => o.text);
  assert.deepEqual(swaps, ['朝（あさ）ごはんへ 食（た）べます。']);
});

// "Try again": a question goes back into the running sequence a few places later.
const retry = (seq, idx, item, gap) => JSON.parse(app.run(`JSON.stringify(withRetry(${JSON.stringify(seq)}, ${idx}, ${JSON.stringify(item)}${gap === undefined ? '' : ', ' + gap}))`));
test('withRetry puts the item back three questions later', () => {
  assert.deepEqual(retry(['a','b','c','d','e','f'], 0, 'a'), ['a','b','c','d','a','e','f']);
});
test('withRetry goes to the end when fewer questions remain', () => {
  assert.deepEqual(retry(['a','b','c'], 1, 'b'), ['a','b','c','b']);
  assert.deepEqual(retry(['a','b'], 1, 'b'), ['a','b','b']);
});
test('withRetry does not queue an item that is already waiting', () => {
  assert.deepEqual(retry(['a','b','a'], 0, 'a'), ['a','b','a']);
});
test('withRetry does not change the sequence it was given', () => {
  const seq = ['a','b','c'];
  app.run(`var __seq = ${JSON.stringify(seq)}; withRetry(__seq, 0, 'a')`);
  assert.deepEqual(JSON.parse(app.run(`JSON.stringify(__seq)`)), seq);
});
