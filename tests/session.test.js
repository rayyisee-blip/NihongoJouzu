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
