/* ============================================================
   CONJUGATION REFERENCE — pure helpers behind the Conjugate tab:
   the reference tables, the "using a form in a sentence" panels and
   the drill segments. No DOM here; app.js renders what these return.
   Everything is derived from VERBS, computeForms() and CONJ_FRAMES
   (conjugation.js), so the reference can never disagree with the drill.
   ============================================================ */

// Drops the bracketed readings: 飲（の）む -> 飲む.
function stripReadings(jp){
  return jp.replace(CHECK_KANJI_READING_RE, '$1');
}

// One table cell, split for display: lead stays plain, changed is bold,
// tail is plain again. colKey is a FORM_LABELS key or 'masu' (the polite
// present, which has no FORM_LABELS entry). changed starts at the first
// character that differs from the dictionary form; the trailing ます of the
// polite column is the tail. 来る keeps its reading on the 来 (来（こ）ない)
// because that reading is the thing that changes.
function displayForm(verb, colKey){
  const masu = colKey === 'masu';
  const full = masu ? masuForm(verb) : computeForms(verb)[colKey];
  const tail = masu ? 'ます' : '';
  const dictPlain = stripReadings(verb.dict);
  if(verb.irregular === 'kuru'){
    if(colKey === 'dict') return {lead: dictPlain, changed: '', tail: ''};
    const reading = /^来（.）/.exec(full)[0];
    return {lead: reading, changed: full.slice(reading.length, full.length - tail.length), tail};
  }
  const body = stripReadings(full).slice(0, stripReadings(full).length - tail.length);
  let i = 0;
  while(i < body.length && i < dictPlain.length && body[i] === dictPlain[i]) i++;
  return {lead: body.slice(0, i), changed: body.slice(i), tail};
}

const REFERENCE_COLUMNS = [
  {key:'dict', en:'Basic form'},
  {key:'masu', en:'Polite', hint:'(present)'},
  {key:'ta', en:'Past'},
  {key:'nai', en:'Negative'},
  {key:'naiPast', en:'Negative past'},
  {key:'te', en:'て-form', hint:'(linking)'}
];

// Godan sections, one per final kana; ぬ・ぶ・む share a section because they
// share the んで／んだ rule.
const GODAN_SECTIONS = [
  {label:'う', ends:'う'}, {label:'く', ends:'く'}, {label:'ぐ', ends:'ぐ'},
  {label:'す', ends:'す'}, {label:'つ', ends:'つ'}, {label:'ぬ・ぶ・む', ends:'ぬぶむ'},
  {label:'る', ends:'る'}
];
const REFERENCE_GROUP3 = ['する', '来る', '勉強する'];
function referenceGroups(){
  const godan = VERBS.filter(v => v.group === 1);
  const sections = GODAN_SECTIONS.map(s => {
    const verbs = godan.filter(v => s.ends.includes(v.oku.slice(-1)));
    // Trap verbs sort last: they look like ichidan but are godan.
    return {label: s.label, verbs: verbs.filter(v => !v.trap).concat(verbs.filter(v => v.trap))};
  });
  return [
    {group: 1, sections},
    {group: 2, verbs: VERBS.filter(v => v.group === 2)},
    {group: 3, verbs: REFERENCE_GROUP3.map(d => VERBS.find(v => stripReadings(v.dict) === d))}
  ];
}

// The godan て／た endings grouped by their て-form: [{endings:['う','つ','る'], te, ta}, ...]
function endingsAtGlance(){
  const rows = [];
  Object.keys(TE_TA_MAP).forEach(kana => {
    const {te, ta} = TE_TA_MAP[kana];
    let row = rows.find(r => r.te === te);
    if(!row) rows.push(row = {endings: [], te, ta});
    row.endings.push(kana);
  });
  return rows;
}

// ---- "Using a form in a sentence" panels -----------------------------
const FORM_EN = {
  dict: 'Basic form', ta: 'Past, plain', nai: 'Negative, plain', naiPast: 'Negative past, plain',
  te: 'て-form', masuNeg: 'Polite negative', masuPast: 'Polite past', masuPastNeg: 'Polite past negative',
  potential: 'Potential', volitional: 'Volitional', passive: 'Passive', causative: 'Causative'
};
const PANEL_ORDER = ['dict','ta','nai','naiPast','te','masuNeg','masuPast','masuPastNeg','potential','volitional','passive','causative'];

// How each form is built, one line per group. Hand-written; computeForms()
// is the source of truth and conj-reference.test.js checks examples against it.
const FORM_BUILD_RULES = {
  dict: {
    godan: 'Nothing to change: it is the form listed in the dictionary, ending in a う-row kana (書く, 飲む).',
    ichidan: 'Nothing to change: it is the form listed in the dictionary, ending in る (食べる, 見る).',
    irregular: 'Nothing to change: する and 来る (くる) are the dictionary forms.'
  },
  ta: {
    godan: 'Look at the last kana: う・つ・る → った, む・ぶ・ぬ → んだ, く → いた, ぐ → いだ, す → した (行く is the exception: 行った).',
    ichidan: 'Drop る, add た (食べる → 食べた).',
    irregular: 'する → した; 来る → 来た (きた).'
  },
  nai: {
    godan: 'Change the last kana to its あ-row partner, then add ない (書く → 書かない); う becomes わ (買う → 買わない).',
    ichidan: 'Drop る, add ない (食べる → 食べない).',
    irregular: 'する → しない; 来る → 来ない (こない).'
  },
  naiPast: {
    godan: 'Change the last kana to its あ-row partner, then add なかった (書く → 書かなかった); う becomes わ (買う → 買わなかった).',
    ichidan: 'Drop る, add なかった (食べる → 食べなかった).',
    irregular: 'する → しなかった; 来る → 来なかった (こなかった).'
  },
  te: {
    godan: 'Same split as the past: う・つ・る → って, む・ぶ・ぬ → んで, く → いて, ぐ → いで, す → して (行く is the exception: 行って).',
    ichidan: 'Drop る, add て (食べる → 食べて).',
    irregular: 'する → して; 来る → 来て (きて).'
  },
  masuNeg: {
    godan: 'Change the last kana to its い-row partner, then add ません (書く → 書きません).',
    ichidan: 'Drop る, add ません (食べる → 食べません).',
    irregular: 'する → しません; 来る → 来ません (きません).'
  },
  masuPast: {
    godan: 'Change the last kana to its い-row partner, then add ました (書く → 書きました).',
    ichidan: 'Drop る, add ました (食べる → 食べました).',
    irregular: 'する → しました; 来る → 来ました (きました).'
  },
  masuPastNeg: {
    godan: 'Change the last kana to its い-row partner, then add ませんでした (書く → 書きませんでした).',
    ichidan: 'Drop る, add ませんでした (食べる → 食べませんでした).',
    irregular: 'する → しませんでした; 来る → 来ませんでした (きませんでした).'
  },
  potential: {
    godan: 'Change the last kana to its え-row partner, then add る (書く → 書ける, 飲む → 飲める).',
    ichidan: 'Drop る, add られる (食べる → 食べられる).',
    irregular: 'する becomes a different word, できる; 来る → 来られる (こられる).'
  },
  volitional: {
    godan: 'Change the last kana to its お-row partner, then add う (書く → 書こう, 飲む → 飲もう).',
    ichidan: 'Drop る, add よう (食べる → 食べよう).',
    irregular: 'する → しよう; 来る → 来よう (こよう).'
  },
  passive: {
    godan: 'Change the last kana to its あ-row partner, then add れる (書く → 書かれる); う becomes わ (買う → 買われる).',
    ichidan: 'Drop る, add られる (食べる → 食べられる), the same shape as the potential.',
    irregular: 'する → される; 来る → 来られる (こられる).'
  },
  causative: {
    godan: 'Change the last kana to its あ-row partner, then add せる (書く → 書かせる); う becomes わ (買う → 買わせる).',
    ichidan: 'Drop る, add させる (食べる → 食べさせる).',
    irregular: 'する → させる; 来る → 来させる (こさせる).'
  }
};

// Up to three example sentences for a form, one per live frame: the first
// verb in VERBS order that fits it and is drilled on that form. Built through
// resolveConjSentence, so each is exactly the sentence the drill asks.
function panelExamples(formKey){
  const out = [];
  CONJ_FRAMES[formKey].forEach((frame, frameIdx) => {
    if(out.length >= 3) return;
    const vi = VERBS.findIndex(v => frameFits(v, frame) && !(v.skip || []).includes(formKey));
    if(vi === -1) return;
    const q = resolveConjSentence(`conjs-${vi}-${formKey}-${frameIdx}`);
    out.push({jp: q.frameJp.replace('___', () => q.model), en: q.promptEn, use: q.use});
  });
  return out;
}

// ---- Drill segments --------------------------------------------------
// Godan segments leave out the trap verbs; those have their own segment.
const lastKana = v => v.oku.slice(-1);
const godanEnding = ends => v => v.group === 1 && !v.trap && ends.includes(lastKana(v));
const SEGMENT_TEST = {
  'g-kg': godanEnding('くぐ'),
  'g-stu': godanEnding('すつう'),
  'g-nbm': godanEnding('ぬぶむ'),
  'g-ru': godanEnding('る'),
  'ichidan': v => v.group === 2,
  'trap': v => !!v.trap,
  'irregular': v => v.group === 3,
  'mixed': () => true
};
const FORM_JP = {
  dict: '辞書形', ta: 'た形', nai: 'ない形', naiPast: 'なかった形', te: 'て形',
  masuNeg: 'ません', masuPast: 'ました', masuPastNeg: 'ませんでした',
  potential: '可能形', volitional: '意向形', passive: '受身形', causative: '使役形'
};
const CONJ_SEGMENTS = [
  {key:'g-kg', label:'Godan: く・ぐ', kind:'type'},
  {key:'g-stu', label:'Godan: す・つ・う', kind:'type'},
  {key:'g-nbm', label:'Godan: ぬ・ぶ・む', kind:'type'},
  {key:'g-ru', label:'Godan: る', kind:'type'},
  {key:'ichidan', label:'Ichidan', kind:'type'},
  {key:'trap', label:'Trap verbs', kind:'type'},
  {key:'irregular', label:'する・来る', kind:'type'},
  {key:'mixed', label:'Mixed review', kind:'type'}
].concat(PANEL_ORDER.map(k => ({key:`f-${k}`, label: FORM_EN[k], labelJp: FORM_JP[k], kind:'form'})));

function segmentIds(key){
  if(key.startsWith('f-')){
    const formKey = key.slice(2);
    return CONJ_SENTENCE_POOL.filter(it => it.formKey === formKey).map(it => it.qid);
  }
  const test = SEGMENT_TEST[key];
  return test ? CONJ_SENTENCE_POOL.filter(it => test(VERBS[it.verbIdx])).map(it => it.qid) : [];
}
// How many of a segment's sentences have been practised at least once.
function segmentProgress(key){
  const ids = segmentIds(key);
  return {done: ids.filter(id => PROGRESS.seen[id] && PROGRESS.seen[id].count > 0).length, total: ids.length};
}
// One round: up to 5 sentences without repeats, weighted toward the ones that
// need practice. ids is a parameter so a small pool can be tested.
function segmentRound(key, ids = segmentIds(key)){
  return weightedSample(ids, boxWeight, 5);
}
