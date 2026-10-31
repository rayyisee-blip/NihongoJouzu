// Prints every conjugation quiz sentence in the pool, one per line, grouped
// by verb (the pool is built verb by verb), so a person can read them all
// against the "natural N5/N4" bar:
//   <dict> | <formKey> | <frameIdx> | <frameJp with the model filled in> | <promptEn>
// The last line is the total. Usage: node tools/list-conj-sentences.js > out.txt
const { loadApp } = require('../tests/load.js');
const app = loadApp();

const lines = JSON.parse(app.run(`JSON.stringify(CONJ_SENTENCE_POOL.map(it => {
  const q = resolveConjSentence(it.qid);
  return [VERBS[it.verbIdx].dict, it.formKey, it.frameIdx, q.frameJp.replace('___', q.model), q.promptEn].join(' | ');
}))`));
for (const line of lines) console.log(line);
console.log(`TOTAL ${lines.length}`);
