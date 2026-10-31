const test=require('node:test'); const assert=require('node:assert/strict'); const {loadApp}=require('./load.js'); const app=loadApp();

// VERBS is append-only: saved progress keys (conjs-<verbIdx>-...) depend on the index.
test('existing verbs keep their index', () => {
  const v1 = require('./fixtures/verbs-v1.json');
  assert.deepEqual(JSON.parse(app.run(`JSON.stringify(VERBS.slice(0, ${v1.length}).map(v => v.dict))`)), v1);
});
test('every verb has jlpt and tags', () =>
  assert.equal(app.run(`VERBS.every(v => (v.jlpt===4||v.jlpt===5) && Array.isArray(v.tags))`), true));
// A 'thing' frame's subject is the verb's comp, so a 'thing' verb without one has no subject.
test('every thing verb has a comp', () =>
  assert.equal(app.run(`VERBS.filter(v => v.tags.includes('thing')).every(v => v.comp && v.comp.jp && v.comp.en)`), true));
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
