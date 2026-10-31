const test=require('node:test'); const assert=require('node:assert/strict'); const {loadApp}=require('./load.js'); const app=loadApp();

test('frames well formed', () => assert.equal(app.run(`Object.keys(FORM_UNLOCK_LESSON).every(k => CONJ_FRAMES[k].filter(f=>!f.retired).length >= 2 && CONJ_FRAMES[k].every(f => f.jp.split('___').length===2 && f.en.split('___').length===2 && f.jp.split('{o}').length<=2 && f.en.split('{o}').length<=2 && f.use))`), true));
test('pool respects needs, skip, drill', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.every(it => { const v=VERBS[it.verbIdx], f=CONJ_FRAMES[it.formKey][it.frameIdx]; return frameFits(v,f) && !(v.skip||[]).includes(it.formKey); })`), true));
test('no verb lacking action in a request', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.filter(it=>it.formKey==='te'&&it.frameIdx===0).every(it=>VERBS[it.verbIdx].tags.includes('action'))`), true));
test('passive only for person verbs', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.filter(it=>it.formKey==='passive').every(it=>VERBS[it.verbIdx].tags.includes('person'))`), true));
test('already-state frame only for state verbs', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.filter(it=>it.formKey==='te'&&it.frameIdx===3).every(it=>VERBS[it.verbIdx].tags.includes('state'))`), true));
test('死ぬ is reference only', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.some(it=>it.verbIdx===8)`), false));
test('every drill verb has a sentence', () => assert.equal(app.run(`VERBS.every((v,i)=> v.drill===false || CONJ_SENTENCE_POOL.some(it=>it.verbIdx===i))`), true));
test('complement filled', () => {
  const q = app.run(`resolveConjSentence('conjs-5-te-0')`);
  assert.equal(q.frameJp, 'コーヒーを___ください。');
  assert.equal(q.promptEn, 'Please ___ (to drink) coffee.');
});
// Frames gated by the finer tags only ever pair with verbs carrying them.
const onlyFor = (form, idx, tag) => app.run(`CONJ_SENTENCE_POOL.filter(it=>it.formKey==='${form}'&&it.frameIdx===${idx}).every(it=>VERBS[it.verbIdx].tags.includes('${tag}'))`);
test('progressive frame only for ongoing verbs', () => assert.equal(onlyFor('te', 2, 'ongoing'), true));
test('result frame only for result verbs', () => assert.equal(onlyFor('te', 4, 'result'), true));
test("please-don't frame only for dont verbs", () => assert.equal(onlyFor('nai', 0, 'dont'), true));
test('causative frames need school or home', () => {
  assert.equal(onlyFor('causative', 0, 'school'), true);
  assert.equal(onlyFor('causative', 1, 'home'), true);
});
// 'ask' gives a non-action verb its own ください request; an action verb already has te[0].
test('ask request only for non-action verbs', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.filter(it=>it.formKey==='te'&&it.frameIdx===5).every(it=>VERBS[it.verbIdx].tags.includes('ask')&&!VERBS[it.verbIdx].tags.includes('action'))`), true));
test('potential object takes が, route を stays', () => {
  const i = app.run(`VERBS.findIndex(v=>v.dict==='書（か）く')`);
  assert.equal(app.run(`resolveConjSentence('conjs-${i}-potential-0').frameJp`), '私（わたし）は手紙（てがみ）が___。');
  assert.equal(app.run(`resolveConjSentence('conjs-${i}-dict-1').frameJp`), '手紙（てがみ）を___ことができます。');
  const j = app.run(`VERBS.findIndex(v=>v.dict==='渡（わた）る')`);
  assert.equal(app.run(`resolveConjSentence('conjs-${j}-potential-0').frameJp`), '私（わたし）は橋（はし）を___。');
});
test('pools large enough for per-form drills', () => {
  const n = form => app.run(`CONJ_SENTENCE_POOL.filter(it=>it.formKey==='${form}').length`);
  assert.ok(n('passive') >= 10); assert.ok(n('causative') >= 10);
});
test('no slot token left', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.every(it => { const q=resolveConjSentence(it.qid); return !q.frameJp.includes('{o}') && !q.promptEn.includes('{o}'); })`), true));
test('excluded combos still resolve', () => assert.equal(app.run(`resolveConjSentence('conjs-8-te-0').model`), '死（し）んで'));
test('gating', () => {
  assert.equal(app.run(`conjSentenceIdsUpTo(13).length`), 0);
  assert.ok(app.run(`conjSentenceIdsUpTo(14).every(id => ['masuNeg','masuPast','masuPastNeg','te','ta'].includes(id.split('-')[2]))`));
  assert.ok(app.run(`allConjSentenceIds().some(id => id.includes('-causative-'))`));
});
test('resolve te-form of 書く', () => {
  const q = app.run(`resolveConjSentence('conjs-0-te-0')`);
  assert.equal(q.model, '書（か）いて'); assert.ok(q.promptEn.includes('(to write)')); assert.ok(q.frameJp.includes('___'));
  assert.equal(q.type, 'typed'); assert.equal(q.kind, 'conj'); assert.equal(q.lesson, 14);
});
test('group mistake named for 帰る', () => {
  const vi = app.run(`VERBS.findIndex(v => v.dict.startsWith('帰'))`);
  const msg = app.run(`diagnoseConj(VERBS[${vi}], 'te', 'かえて')`);
  assert.match(msg, /Group 1/); assert.match(msg, /looks like a る-verb/);
});
test('branch mistake named', () => assert.match(app.run(`diagnoseConj(VERBS[0], 'te', 'かんで')`), /Verbs ending in く take いて/));
// te-form has no "family" in generateMistakes, so test tense on the ます family
test('tense mistake named', () => assert.match(app.run(`diagnoseConj(VERBS[0], 'masuPast', 'かきません')`), /polite negative.*needs the polite past/));
test('unknown wrong answer gives null', () => assert.equal(app.run(`diagnoseConj(VERBS[0], 'te', 'ねこ')`), null));
test('mistakes are tagged', () => {
  const kinds = app.run(`generateMistakes(VERBS[0], 'masuPast').map(m => m.kind)`);
  assert.deepEqual([...new Set(kinds)].sort(), ['group', 'tense']);
});
test('legacy key mapping', () => {
  assert.equal(app.run(`legacyConjKey('conjs-3-masuNeg-2')`), 'conj-3-masuNeg');
  assert.equal(app.run(`legacyConjKey('conj-3-te')`), null);
});
test('legacy box carries over', () => {
  app.run(`PROGRESS.seen['conj-0-te'] = {count:3, correct:3, box:5}`);
  assert.equal(app.run(`boxWeight('conjs-0-te-1')`), 1);
  app.run(`recordResult('conjs-0-te-1', true)`);
  assert.equal(app.run(`PROGRESS.seen['conjs-0-te-1'].box`), 5);
});
test('recordResult wrong resets box', () => {
  app.run(`recordResult('conjs-0-te-1', false)`);
  assert.equal(app.run(`PROGRESS.seen['conjs-0-te-1'].box`), 1);
  assert.equal(app.run(`PROGRESS.seen['conjs-0-te-1'].count`), 2);
});
