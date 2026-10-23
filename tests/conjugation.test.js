const test=require('node:test'); const assert=require('node:assert/strict'); const {loadApp}=require('./load.js'); const app=loadApp();

test('frames cover every form', () => assert.equal(app.run(`Object.keys(FORM_UNLOCK_LESSON).every(k => (CONJ_FRAMES[k]||[]).length >= 2 && CONJ_FRAMES[k].every(f => f.jp.split('___').length===2 && f.en.split('___').length===2 && f.use))`), true));
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
