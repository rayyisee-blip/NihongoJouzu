const test=require('node:test'); const assert=require('node:assert/strict'); const {loadApp}=require('./load.js'); const app=loadApp();
const snap=require('./fixtures/lesson-answers.json');
const lessons=app.run('LESSONS.map(l=>l.q)');

// Guard: wrong options may change, but the correct answer, prompt, note and type may not.
test('lesson questions keep prompt, type, note and correct answer', () => {
  assert.equal(lessons.length, snap.length);
  lessons.forEach((qs, li) => {
    assert.equal(qs.length, snap[li].length, `lesson ${li+1} question count`);
    qs.forEach((q, qi) => {
      const s = snap[li][qi], id = `lesson ${li+1} q${qi+1}`;
      assert.equal(q.prompt, s.prompt, id+' prompt');
      assert.equal(q.type, s.type, id+' type');
      assert.equal(q.note, s.note, id+' note');
      assert.equal(q.choices[q.a], s.answer, id+' answer');
      assert.equal(q.choices.length, 4, id+' choice count');
      assert.equal(new Set(q.choices).size, 4, id+' unique choices');
      assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a <= 3, id+' a range');
    });
  });
});
