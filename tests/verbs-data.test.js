const test=require('node:test'); const assert=require('node:assert/strict'); const {loadApp}=require('./load.js'); const app=loadApp();

// VERBS is append-only: saved progress keys (conjs-<verbIdx>-...) depend on the index.
test('existing verbs keep their index', () => {
  const v1 = require('./fixtures/verbs-v1.json');
  assert.deepEqual(JSON.parse(app.run(`JSON.stringify(VERBS.slice(0, ${v1.length}).map(v => v.dict))`)), v1);
});
test('every verb has jlpt and tags', () =>
  assert.equal(app.run(`VERBS.every(v => (v.jlpt===4||v.jlpt===5) && Array.isArray(v.tags))`), true));
