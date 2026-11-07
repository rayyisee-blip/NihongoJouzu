const test=require('node:test'); const assert=require('node:assert/strict'); const {loadApp}=require('./load.js'); const app=loadApp();
const j = e => JSON.parse(app.run(`JSON.stringify(${e})`));
const DAY = 86400000;
const at = (y,m,d,h=12) => new Date(y,m-1,d,h).getTime();

test('dateStrOf uses the local date', () => assert.equal(app.run(`dateStrOf(${at(2026,11,7,23)})`), '2026-11-07'));
test('recentDates is newest first and crosses month ends', () => {
  assert.deepEqual(j(`recentDates('2026-11-07', 7)`), ['2026-11-07','2026-11-06','2026-11-05','2026-11-04','2026-11-03','2026-11-02','2026-11-01']);
  assert.deepEqual(j(`recentDates('2026-03-02', 3)`), ['2026-03-02','2026-03-01','2026-02-28']);
});
test('logHistory keeps the answer only for misses', () => {
  app.run(`P = defaultProgress()`);
  app.run(`logHistory(P, {qid:'conjs-0-te-0', mode:'conjugation', correct:true, typed:'かいて'}, ${at(2026,11,7)})`);
  app.run(`logHistory(P, {qid:'1-0', mode:'practice', correct:false, pickedText:'これ'}, ${at(2026,11,7)})`);
  assert.deepEqual(j(`P.history`), [
    {t: at(2026,11,7), qid:'conjs-0-te-0', mode:'conjugation', correct:true},
    {t: at(2026,11,7), qid:'1-0', mode:'practice', correct:false, pickedText:'これ'}
  ]);
});
test('logHistory prunes old entries and caps the size', () => {
  app.run(`P = defaultProgress(); P.history = [{t:${at(2026,10,1)}, qid:'old', mode:'practice', correct:true}, {t:${at(2026,11,1)}, qid:'keep', mode:'practice', correct:true}]`);
  app.run(`logHistory(P, {qid:'new', mode:'practice', correct:true}, ${at(2026,11,7)})`);
  assert.deepEqual(j(`P.history.map(e=>e.qid)`), ['keep','new']);
  app.run(`P.history = []; for(let i=0;i<1005;i++) logHistory(P, {qid:'q'+i, mode:'practice', correct:true}, ${at(2026,11,7)}+i)`);
  assert.equal(app.run(`P.history.length`), 1000);
  assert.equal(app.run(`P.history[0].qid`), 'q5');
});
test('weekHistory merges daily answers and round entries by day', () => {
  app.run(`P = defaultProgress();
    P.dailyLog['2026-11-07'] = {v:2, qids:['1-0','1-1'], completed:true, answers:{'1-0':{picked:1, pickedText:'あれ', correct:false}, '1-1':{typed:'x', correct:true}}};
    P.dailyLog['2026-11-05'] = {v:2, qids:['1-2'], completed:true, answers:{'1-2':{picked:0, correct:true}}};
    P.dailyLog['2026-10-20'] = {v:2, qids:['1-3'], completed:true, answers:{'1-3':{picked:0, correct:true}}};
    P.history = [{t:${at(2026,11,7,15)}, qid:'c2', mode:'conjugation', correct:true}, {t:${at(2026,11,7,9)}, qid:'c1', mode:'practice', correct:false, pickedText:'それ'}, {t:${at(2026,11,6)}, qid:'c0', mode:'practice', correct:true}]`);
  const w = j(`weekHistory(P, '2026-11-07', 7)`);
  assert.deepEqual(w.map(d => d.date), ['2026-11-07','2026-11-06','2026-11-05']);
  assert.deepEqual(w[0].entries.map(e => [e.qid, e.mode, e.correct]), [['1-0','daily',false],['1-1','daily',true],['c1','practice',false],['c2','conjugation',true]]);
  assert.equal(w[0].entries[0].picked, 1);
  assert.equal(w[0].entries[0].pickedText, 'あれ');
  assert.equal(w[0].entries[1].typed, 'x');
  assert.deepEqual(w[2].entries.map(e => e.qid), ['1-2']);
});
test('weekHistory copes with missing history and an empty log', () => {
  app.run(`P = defaultProgress(); delete P.history; P.dailyLog = {}`);
  assert.deepEqual(j(`weekHistory(P, '2026-11-07', 7)`), []);
  app.run(`delete P.dailyLog`);
  assert.deepEqual(j(`weekHistory(P, '2026-11-07', 7)`), []);
});
test('weekSummary counts questions and correct answers', () => {
  assert.deepEqual(j(`weekSummary([{date:'a', entries:[{correct:true},{correct:false}]}, {date:'b', entries:[{correct:true}]}])`), {total:3, correct:2});
  assert.deepEqual(j(`weekSummary([])`), {total:0, correct:0});
});
