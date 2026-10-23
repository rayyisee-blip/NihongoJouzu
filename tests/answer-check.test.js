const test = require('node:test'); const assert = require('node:assert/strict');
const { loadApp } = require('./load.js'); const app = loadApp();
const chk = (i, m) => app.run(`checkTyped(${JSON.stringify(i)}, ${JSON.stringify(m)})`);
const M = '私（わたし）は 学生（がくせい）です。';

test('kana only accepted', () => assert.equal(chk('わたしはがくせいです', M).correct, true));
test('kanji accepted', () => assert.equal(chk('私は学生です。', M).correct, true));
test('mixed script accepted', () => assert.equal(chk('私はがくせいです', M).correct, true));
test('spaces and punctuation ignored', () => assert.equal(chk('わたしは　がくせい です！', M).correct, true));
test('katakana accepted', () => assert.equal(chk('ワタシハガクセイデス', M).correct, true));
test('reading alternatives', () => {
  assert.equal(chk('なんですか', '何（なん・なに）ですか。').correct, true);
  assert.equal(chk('なにですか', '何（なん・なに）ですか。').correct, true);
});
test('romaji with ha', () => assert.equal(chk('watashiha gakusei desu', M).correct, true));
test('romaji wa for particle は', () => assert.equal(chk('watashi wa gakusei desu', M).correct, true));
test('kana わ for particle は still wrong', () => assert.equal(chk('わたしわがくせいです', M).correct, false));
test('particle swap diagnosed', () => {
  const r = chk('わたしががくせいです', M);
  assert.equal(r.kind, 'particle'); assert.equal(r.used, 'が'); assert.equal(r.needed, 'は');
});
test('other mistake', () => assert.equal(chk('わたしはせんせいです', M).kind, 'other'));
test('empty input', () => assert.equal(chk('  。', M).kind, 'empty'));
test('romaji conversions', () => {
  const r = s => app.run(`romajiToHiragana(${JSON.stringify(s)})`);
  assert.equal(r('KITTE'), 'きって'); assert.equal(r('konnichiha'), 'こんにちは');
  assert.equal(r("kan'i"), 'かんい'); assert.equal(r('shichitsu'), 'しちつ');
  assert.equal(r('benkyou'), 'べんきょう'); assert.equal(r('hon'), 'ほん');
});
test('diff marks differences', () => {
  const d = app.run(`diffChars('がくせい','せんせい')`);
  assert.ok(d.some(x => x.op === 'del') && d.some(x => x.op === 'add'));
  assert.deepEqual(d.filter(x => x.op !== 'add').map(x => x.ch).join(''), 'がくせい');
});
