const test=require('node:test'); const assert=require('node:assert/strict'); const {loadApp}=require('./load.js'); const app=loadApp();
// Arrays and objects come from the vm realm, so strict deepEqual needs them round-tripped.
const j = e => JSON.parse(app.run(`JSON.stringify(${e})`));

const df = (dict, col) => j(`displayForm(VERBS.find(v=>v.dict==='${dict}'), '${col}')`);
test('changed part, godan', () => {
  assert.deepEqual(df('飲（の）む','masu'), {lead:'飲', changed:'み', tail:'ます'});
  assert.deepEqual(df('飲（の）む','ta'), {lead:'飲', changed:'んだ', tail:''});
  assert.deepEqual(df('行（い）く','te'), {lead:'行', changed:'って', tail:''});
  assert.deepEqual(df('分（わ）かる','ta'), {lead:'分か', changed:'った', tail:''});
});
test('changed part, ichidan and irregular', () => {
  assert.deepEqual(df('食（た）べる','nai'), {lead:'食べ', changed:'ない', tail:''});
  assert.deepEqual(df('食（た）べる','masu'), {lead:'食べ', changed:'', tail:'ます'});
  assert.deepEqual(df('来（く）る','nai'), {lead:'来（こ）', changed:'ない', tail:''});
  assert.deepEqual(df('勉強（べんきょう）する','ta'), {lead:'勉強', changed:'した', tail:''});
});
test('changed part, basic form and 来る polite', () => {
  assert.deepEqual(df('飲（の）む','dict'), {lead:'飲む', changed:'', tail:''});
  assert.deepEqual(df('来（く）る','dict'), {lead:'来る', changed:'', tail:''});
  assert.deepEqual(df('来（く）る','masu'), {lead:'来（き）', changed:'', tail:'ます'});
  assert.deepEqual(df('来（く）る','te'), {lead:'来（き）', changed:'て', tail:''});
});
test('stripReadings drops bracketed readings only', () => {
  assert.equal(app.run(`stripReadings('勉強（べんきょう）します')`), '勉強します');
  assert.equal(app.run(`stripReadings('コーヒーを')`), 'コーヒーを');
});
test('reference columns', () => assert.deepEqual(j(`REFERENCE_COLUMNS`), [
  {key:'dict', en:'Basic form'}, {key:'masu', en:'Polite', hint:'(present)'}, {key:'ta', en:'Past'},
  {key:'nai', en:'Negative'}, {key:'naiPast', en:'Negative past'}, {key:'te', en:'て-form', hint:'(linking)'}
]));
test('godan sections in order', () => assert.deepEqual(j(`referenceGroups()[0].sections.map(s=>s.label)`), ['う','く','ぐ','す','つ','ぬ・ぶ・む','る']));
test('traps last in る', () => { const ru = j(`referenceGroups()[0].sections[6].verbs.map(v=>!!v.trap)`); assert.deepEqual(ru, ru.slice().sort()); });
test('every verb in the reference except extra する compounds', () => assert.equal(app.run(`referenceGroups().reduce((n,g)=>n+(g.sections?g.sections.reduce((m,s)=>m+s.verbs.length,0):g.verbs.length),0)`), app.run(`VERBS.filter(v=>v.group!==3).length + 3`)));
test('group 3 is exactly する, 来る and 勉強する', () => assert.deepEqual(j(`referenceGroups()[2].verbs.map(v=>stripReadings(v.dict))`), ['する','来る','勉強する']));
test('groups 1 and 2 hold only their own verbs', () => {
  assert.equal(app.run(`referenceGroups()[0].sections.every(s=>s.verbs.every(v=>v.group===1))`), true);
  assert.equal(app.run(`referenceGroups()[1].verbs.every(v=>v.group===2)`), true);
});
test('endings at a glance', () => assert.deepEqual(j(`endingsAtGlance().map(r=>[r.endings.join(''), r.te])`), [['うつる','って'],['むぶぬ','んで'],['く','いて'],['ぐ','いで'],['す','して']]));
test('build rules complete', () => assert.equal(app.run(`PANEL_ORDER.length===12 && PANEL_ORDER.every(k => ['godan','ichidan','irregular'].every(g => FORM_BUILD_RULES[k] && FORM_BUILD_RULES[k][g]))`), true));
test('every form has an English name and a panel position', () => assert.equal(app.run(`Object.keys(FORM_LABELS).every(k => FORM_EN[k] && PANEL_ORDER.includes(k))`), true));
test('panel examples filled', () => assert.equal(app.run(`PANEL_ORDER.every(k => { const ex=panelExamples(k); return ex.length>=2 && ex.length<=3 && ex.every(e=>!e.jp.includes('___')&&!e.jp.includes('{o}')&&e.use); })`), true));
test('panel examples are the drill sentences', () => {
  // Potential frames turn を into が: the panel must show that, not the raw complement.
  const jp = j(`panelExamples('potential').map(e=>e.jp)`);
  assert.ok(jp[0].includes('手紙（てがみ）が書（か）ける'), jp[0]);
  assert.deepEqual(j(`panelExamples('te')[0]`), {
    jp: '手紙（てがみ）を書（か）いてください。',
    en: 'Please ___ (to write) a letter.',
    use: 'て-form + ください: a polite request.'
  });
});
test('every segment has at least 5', () => assert.equal(app.run(`CONJ_SEGMENTS.every(s => segmentIds(s.key).length >= 5)`), true));
test('segment list', () => {
  assert.deepEqual(j(`CONJ_SEGMENTS.filter(s=>s.kind==='type').map(s=>s.key)`), ['g-kg','g-stu','g-nbm','g-ru','ichidan','trap','irregular','mixed']);
  assert.deepEqual(j(`CONJ_SEGMENTS.filter(s=>s.kind==='form').map(s=>s.key)`), j(`PANEL_ORDER.map(k=>'f-'+k)`));
  assert.equal(app.run(`CONJ_SEGMENTS.every(s => s.label)`), true);
});
test('segment membership', () => {
  assert.ok(app.run(`segmentIds('g-kg').some(id => VERBS[+id.split('-')[1]].dict==='行（い）く')`));
  assert.equal(app.run(`segmentIds('g-ru').some(id => VERBS[+id.split('-')[1]].trap)`), false);
  assert.equal(app.run(`segmentIds('trap').every(id => VERBS[+id.split('-')[1]].trap)`), true);
  assert.equal(app.run(`segmentIds('f-te').every(id => id.split('-')[2]==='te')`), true);
  assert.equal(app.run(`segmentIds('mixed').length`), app.run(`CONJ_SENTENCE_POOL.length`));
});
test('verb-type segments split the godan, ichidan and irregular pool', () => {
  assert.equal(app.run(`segmentIds('irregular').every(id => VERBS[+id.split('-')[1]].group===3)`), true);
  assert.equal(app.run(`segmentIds('ichidan').every(id => VERBS[+id.split('-')[1]].group===2)`), true);
  const n = k => app.run(`segmentIds('${k}').length`);
  const godanPool = app.run(`CONJ_SENTENCE_POOL.filter(it=>VERBS[it.verbIdx].group===1).length`);
  assert.equal(n('g-kg')+n('g-stu')+n('g-nbm')+n('g-ru')+n('trap'), godanPool);
});
test('segment progress counts seen', () => {
  const id = app.run(`segmentIds('f-te')[0]`);
  app.run(`recordResult('${id}', true)`);
  assert.equal(app.run(`segmentProgress('f-te').done`), 1);
  assert.equal(app.run(`segmentProgress('f-te').total`), app.run(`segmentIds('f-te').length`));
});
test('round from small pool', () => {
  const r5 = j(`segmentRound('mixed')`);
  assert.equal(r5.length, 5); assert.equal(new Set(r5).size, 5);
  const r3 = j(`segmentRound('mixed', segmentIds('mixed').slice(0, 3))`);
  assert.equal(r3.length, 3); assert.equal(new Set(r3).size, 3);
});
// The build rules are hand-written prose, so check every "dictionary → form"
// example they quote against what computeForms actually produces.
test('build rule examples match computeForms', () => {
  const result = j(`(() => {
    const kana = '一-鿿々ぁ-んァ-ヶ';
    const re = new RegExp('([' + kana + ']+) → ([' + kana + ']+)', 'g');
    let checked = 0; const bad = [];
    PANEL_ORDER.forEach(k => ['godan','ichidan','irregular'].forEach(g => {
      let m;
      while((m = re.exec(FORM_BUILD_RULES[k][g]))){
        const verb = VERBS.find(v => stripReadings(v.dict) === m[1]);
        if(!verb) continue;
        checked++;
        if(stripReadings(computeForms(verb)[k]) !== m[2]) bad.push(k + ' ' + g + ': ' + m[1] + ' → ' + m[2]);
      }
    }));
    return {checked, bad};
  })()`);
  assert.deepEqual(result.bad, []);
  assert.ok(result.checked >= 30, `only ${result.checked} examples checked`);
});
