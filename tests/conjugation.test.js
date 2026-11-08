const test=require('node:test'); const assert=require('node:assert/strict'); const {loadApp}=require('./load.js'); const app=loadApp();

test('frames well formed', () => assert.equal(app.run(`Object.keys(FORM_UNLOCK_LESSON).every(k => CONJ_FRAMES[k].filter(f=>!f.retired).length >= 2 && CONJ_FRAMES[k].every(f => f.jp.split('___').length===2 && f.en.split('___').length===2 && f.jp.split('{o}').length<=2 && f.en.split('{o}').length<=2 && f.use))`), true));
test('pool respects needs, skip, drill', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.every(it => { const v=VERBS[it.verbIdx], f=CONJ_FRAMES[it.formKey][it.frameIdx]; return frameFits(v,f) && !(v.skip||[]).includes(it.formKey); })`), true));
// skipFrames drops single <formKey>-<frameIdx> pairs that read badly for one verb.
test('no pool item matches its verb skipFrames', () => assert.equal(app.run(`CONJ_SENTENCE_POOL.every(it => !(VERBS[it.verbIdx].skipFrames||[]).includes(it.formKey+'-'+it.frameIdx))`), true));
test('skipFrames name real frames the verb would otherwise get', () => assert.deepEqual(JSON.parse(app.run(`JSON.stringify(VERBS.flatMap(v => (v.skipFrames||[]).filter(sf => {
  const m = /^([A-Za-z]+)-(\\d+)$/.exec(sf);
  const f = m && CONJ_FRAMES[m[1]] && CONJ_FRAMES[m[1]][+m[2]];
  return !f || !frameFits(v, f) || (v.skip||[]).includes(m[1]);
}).map(sf => v.dict + ' ' + sf)))`)), []));
test('frameInPool is the pool rule', () => assert.equal(app.run(`VERBS.every((v,vi) => Object.keys(CONJ_FRAMES).every(k => CONJ_FRAMES[k].every((f,fi) => frameInPool(v,k,fi) === CONJ_SENTENCE_POOL.some(it => it.verbIdx===vi && it.formKey===k && it.frameIdx===fi))))`), true));
test('skipFrames is per frame, not per form', () => {
  const i = app.run(`VERBS.findIndex(v=>v.dict==='浴（あ）びる')`);
  const has = id => app.run(`CONJ_SENTENCE_POOL.some(it => it.qid==='${id}')`);
  assert.equal(has(`conjs-${i}-volitional-0`), false);
  assert.equal(has(`conjs-${i}-volitional-1`), true);
});
test('見せる keeps を in potential frames', () => {
  const i = app.run(`VERBS.findIndex(v=>v.dict==='見（み）せる')`);
  assert.equal(app.run(`resolveConjSentence('conjs-${i}-potential-1').frameJp`), '明日（あした）なら写真（しゃしん）を___。');
});
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
test('last-week and plan frames only for event verbs', () => {
  [['masuPast',1],['masuPastNeg',1],['ta',1],['naiPast',1],['dict',0],['nai',1]].forEach(([f,i]) => assert.equal(onlyFor(f, i, 'event'), true));
});
test('outcome verbs skip plain negatives', () => assert.equal(app.run("['勝（か）つ','見（み）つける'].every(d => !CONJ_SENTENCE_POOL.some(it => VERBS[it.verbIdx].dict===d && ['masuPastNeg','naiPast','nai'].includes(it.formKey)))"), true));
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

// Multiple-choice options: the right form plus three predictable mistakes.
test('conjChoices gives 4 distinct options with the answer once, for every pool item', () => assert.deepEqual(JSON.parse(app.run(`JSON.stringify(CONJ_SENTENCE_POOL.filter(it => {
  const v = VERBS[it.verbIdx], c = conjChoices(v, it.formKey), model = computeForms(v)[it.formKey];
  return c.length !== 4 || new Set(c).size !== 4 || c.filter(x => x === model).length !== 1;
}).map(it => it.qid))`)), []));
test('conjChoices leads with the wrong-group mistake', () => {
  const i = app.run(`VERBS.findIndex(v=>v.dict==='帰（かえ）る')`);
  assert.equal(app.run(`conjChoices(VERBS[${i}], 'nai').includes('帰（かえ）ない')`), true);
});
test('diagnoseConj names the slip for a picked option with readings', () => {
  const i = app.run(`VERBS.findIndex(v=>v.dict==='泳（およ）ぐ')`);
  assert.equal(app.run(`diagnoseConj(VERBS[${i}], 'te', '泳（およ）いて')`), 'Verbs ending in ぐ take いで: 泳（およ）いで.');
});
