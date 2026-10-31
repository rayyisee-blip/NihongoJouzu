/* ============================================================
   CONJUGATION ENGINE — a real rules engine, not hand-written
   questions. Japanese verb conjugation is regular once you know
   the verb's group:
     Group 1 (godan/う-verbs):  書く, 飲む, 帰る
     Group 2 (ichidan/る-verbs): 食べる, 見る
     Group 3 (irregular):       する, 来る (+ noun+する compounds)
   Every verb in VERBS (verbs-data.js) is tagged with its group, and one rule table
   per group produces every form. Distractors are built the same
   way real learners get it wrong: wrong verb-group rule, wrong
   godan branch, or right form/wrong tense-polarity.
   ============================================================ */
const FORM_LABELS = {
  masuNeg: "polite negative (ません) form",
  masuPast: "polite past (ました) form",
  masuPastNeg: "polite past negative (ませんでした) form",
  te: "て-form",
  ta: "plain past (た-form)",
  nai: "plain negative (ない-form)",
  naiPast: "plain past negative (なかった-form)",
  dict: "dictionary form",
  potential: "potential form (“can do”)",
  volitional: "volitional form (“let's / shall”)",
  passive: "passive form",
  causative: "causative form"
};
const FORM_UNLOCK_LESSON = {
  masuNeg:1, masuPast:7, masuPastNeg:7, te:14, ta:14,
  nai:16, naiPast:16, dict:17, potential:17, volitional:19,
  passive:24, causative:25
};

const GODAN_ROWS = {
  'う':['わ','い','う','え','お'], 'く':['か','き','く','け','こ'],
  'ぐ':['が','ぎ','ぐ','げ','ご'], 'す':['さ','し','す','せ','そ'],
  'つ':['た','ち','つ','て','と'], 'ぬ':['な','に','ぬ','ね','の'],
  'ぶ':['ば','び','ぶ','べ','ぼ'], 'む':['ま','み','む','め','も'],
  'る':['ら','り','る','れ','ろ']
};
const TE_TA_MAP = {
  'う':{te:'って',ta:'った'}, 'つ':{te:'って',ta:'った'}, 'る':{te:'って',ta:'った'},
  'む':{te:'んで',ta:'んだ'}, 'ぶ':{te:'んで',ta:'んだ'}, 'ぬ':{te:'んで',ta:'んだ'},
  'く':{te:'いて',ta:'いた'}, 'ぐ':{te:'いで',ta:'いだ'}, 'す':{te:'して',ta:'した'}
};
function godanForms(oku){
  const last = oku.slice(-1), rest = oku.slice(0,-1);
  const row = GODAN_ROWS[last], teTa = TE_TA_MAP[last];
  return {
    dict: oku,
    masuNeg: rest+row[1]+'ません', masuPast: rest+row[1]+'ました', masuPastNeg: rest+row[1]+'ませんでした',
    te: rest+teTa.te, ta: rest+teTa.ta,
    nai: rest+row[0]+'ない', naiPast: rest+row[0]+'なかった',
    potential: rest+row[3]+'る', volitional: rest+row[4]+'う',
    passive: rest+row[0]+'れる', causative: rest+row[0]+'せる'
  };
}
function ichidanForms(oku){
  const rest = oku.slice(0,-1);
  return {
    dict: oku,
    masuNeg: rest+'ません', masuPast: rest+'ました', masuPastNeg: rest+'ませんでした',
    te: rest+'て', ta: rest+'た',
    nai: rest+'ない', naiPast: rest+'なかった',
    potential: rest+'られる', volitional: rest+'よう',
    passive: rest+'られる', causative: rest+'させる'
  };
}
const SURU_SUFFIX = {
  dict:'する', masuNeg:'しません', masuPast:'しました', masuPastNeg:'しませんでした',
  te:'して', ta:'した', nai:'しない', naiPast:'しなかった',
  potential:'できる', volitional:'しよう', passive:'される', causative:'させる'
};
const KURU_FORMS = {
  dict:'来（く）る', masuNeg:'来（き）ません', masuPast:'来（き）ました', masuPastNeg:'来（き）ませんでした',
  te:'来（き）て', ta:'来（き）た', nai:'来（こ）ない', naiPast:'来（こ）なかった',
  potential:'来（こ）られる', volitional:'来（こ）よう', passive:'来（こ）られる', causative:'来（こ）させる'
};
function computeForms(verb){
  if(verb.irregular==='kuru') return KURU_FORMS;
  if(verb.irregular==='suru'){
    const out = {};
    for(const k in SURU_SUFFIX) out[k] = (verb.stem||'') + SURU_SUFFIX[k];
    return out;
  }
  if(verb.group===2){
    const f = ichidanForms(verb.oku);
    const out = {}; for(const k in f) out[k] = (verb.stem||'') + f[k];
    return out;
  }
  const f = godanForms(verb.oku);
  if(verb.irregularTe){
    const rest = verb.oku.slice(0,-1);
    f.te = rest+'って'; f.ta = rest+'った';
  }
  const out = {}; for(const k in f) out[k] = (verb.stem||'') + f[k];
  return out;
}
function masuForm(verb){
  if(verb.irregular==='kuru') return '来（き）ます';
  if(verb.irregular==='suru') return (verb.stem||'')+'します';
  if(verb.group===2) return (verb.stem||'')+verb.oku.slice(0,-1)+'ます';
  const last = verb.oku.slice(-1), rest = verb.oku.slice(0,-1);
  return (verb.stem||'')+rest+GODAN_ROWS[last][1]+'ます';
}
// The most common real learner mistakes, generated the same way a person
// would actually make them — not random unrelated verbs. Each is tagged so
// diagnoseConj can name the slip: 'group' (wrong verb-group rule), 'branch'
// (wrong godan て/た branch), 'tense' (right verb, neighbouring form; also
// carries that form's key). opts.allBranches skips the random sampling of
// wrong branches so diagnosis can recognise every one of them.
function generateMistakes(verb, formKey, opts){
  const out = [];
  const push = (text, kind, extra) => {
    if(text && !out.some(m=>m.text===text)) out.push(Object.assign({text, kind}, extra||{}));
  };
  const forms = computeForms(verb);
  const correct = forms[formKey];

  if(verb.group===1){
    const ic = ichidanForms(verb.oku);
    push((verb.stem||'')+ic[formKey], 'group');
  } else if(verb.group===2){
    const go = godanForms(verb.oku);
    push((verb.stem||'')+go[formKey], 'group');
  } else if(verb.irregular==='suru'){
    const go = godanForms('する');
    push((verb.stem||'')+go[formKey], 'group');
  }

  if(verb.group===1 && (formKey==='te'||formKey==='ta')){
    const last = verb.oku.slice(-1);
    const rest = verb.oku.slice(0,-1);
    const altBranches = ['く','む','す','ぐ'].filter(b=>b!==last);
    const chosen = opts && opts.allBranches ? altBranches : shuffle(altBranches, Math.random).slice(0,2);
    chosen.forEach(b=>{
      const teTa = TE_TA_MAP[b];
      push((verb.stem||'')+rest+(formKey==='te'?teTa.te:teTa.ta), 'branch');
    });
  }

  const masuFam = ['masuNeg','masuPast','masuPastNeg'];
  const plainFam = ['dict','nai','ta','naiPast'];
  const advFam = ['potential','volitional','passive','causative'];
  const fam = masuFam.includes(formKey) ? masuFam : plainFam.includes(formKey) ? plainFam : advFam.includes(formKey) ? advFam : null;
  if(fam) fam.filter(k=>k!==formKey).forEach(k=>push(forms[k], 'tense', {formKey:k}));

  return out.filter(m=>m.text!==correct);
}

// Names the slip behind a wrong typed answer, or null when it isn't one of
// the predictable mistakes. Readings are stripped by matching the mistake
// through buildAnswerRegex, so kana-only and kanji answers both match.
function diagnoseConj(verb, formKey, input){
  const norm = normalizeAnswer(input);
  const model = computeForms(verb)[formKey];
  const hit = generateMistakes(verb, formKey, {allBranches:true}).find(m=>buildAnswerRegex(m.text).test(norm));
  if(!hit) return null;
  if(hit.kind==='group')
    return `${verb.dict} is Group ${verb.group}${verb.trap ? " (looks like a る-verb but isn't)" : ''}, so the ${FORM_LABELS[formKey]} is ${model}.`;
  if(hit.kind==='branch'){
    const last = verb.oku.slice(-1);
    // 行く is the one く-verb that breaks the pattern (行って, not 行いて).
    const ending = verb.irregularTe ? (formKey==='te' ? 'って' : 'った') : TE_TA_MAP[last][formKey];
    return `Verbs ending in ${last} take ${ending}: ${model}.`;
  }
  return `That's the ${FORM_LABELS[hit.formKey]}; this sentence needs the ${FORM_LABELS[formKey]}.`;
}
function explainForm(verb, formKey){
  const groupLabel = verb.group===1 ? "Group 1 (godan/う-verb)" : verb.group===2 ? "Group 2 (ichidan/る-verb)" : "Group 3 (irregular)";
  let rule = '';
  if(verb.group===1){
    if(formKey==='te'||formKey==='ta') rule = "Godan て/た-form depends on the final kana: う・つ・る→って/った, む・ぶ・ぬ→んで/んだ, く→いて/いた, ぐ→いで/いだ, す→して/した.";
    else if(formKey==='nai'||formKey==='naiPast') rule = "Godan ない-form: change the final う-row kana to its あ-row equivalent, then add ない (う verbs take わ, not あ).";
    else if(formKey==='potential') rule = "Godan potential: change the final う-row kana to its え-row equivalent, then add る.";
    else if(formKey==='volitional') rule = "Godan volitional: change the final う-row kana to its お-row equivalent, then add う.";
    else if(formKey==='passive'||formKey==='causative') rule = "Godan passive/causative: change the final う-row kana to its あ-row equivalent, then add れる/せる.";
    if(verb.trap) rule += ` ${verb.dict} ends in る but is godan, not ichidan — a classic trap.`;
  } else if(verb.group===2){
    rule = "Ichidan verbs just drop る and add the ending directly — no branching by final kana.";
  } else if(verb.irregular==='suru'){
    rule = "する is irregular: します／して／した／しない, and its potential is the special form できる, not される-style.";
  } else if(verb.irregular==='kuru'){
    rule = "来る is irregular: the kanji 来 shifts reading between き (来ます／来て／来た) and こ (来ない／来よう／来られる).";
  }
  return `${groupLabel}. ${rule} Meaning: ${verb.meaning}.`.trim();
}
// ---- Sentence frames -------------------------------------------------
// Each frame is a short, natural N5 sentence with one blank for the verb
// form. jp/en both hold ___ exactly once and {o} at most once: {o} is the
// verb's complement (verb.comp), dropped when the verb has none. needs lists
// the verb tags the frame requires (see frameFits); a 'thing' frame has the
// complement as its subject. use is the "when do I use this form" note.
// APPEND-ONLY by index (it is part of the qid): rewrite a frame in place or
// mark it retired:true, never delete one.
const CONJ_FRAMES = {
  masuNeg: [
    {jp:'今日（きょう）は{o}___。', en:"I won't ___ {o} today.", needs:['action'], use:'Polite negative: say you do not do something, politely.'},
    {jp:'あまり{o}___。', en:"I don't ___ {o} much.", use:'Polite negative; あまり always pairs with a negative.'},
    {jp:'もう{o}___。', en:"I won't ___ {o} anymore.", needs:['action'], use:'Polite negative with もう: something you no longer do.'},
    {jp:'今日（きょう）は{o}___。', en:"Today, {o} doesn't ___.", needs:['thing'], use:'Polite negative with a thing as the subject (が).'}
  ],
  masuPast: [
    {jp:'昨日（きのう）、{o}___。', en:'Yesterday, I ___ {o}.', use:'Polite past: something you did, said politely.'},
    {jp:'先週（せんしゅう）、{o}___。', en:'Last week, I ___ {o}.', needs:['action'], use:'Polite past: a finished action in the past.'},
    {jp:'さっき{o}___。', en:'A little while ago, I ___ {o}.', needs:['action'], use:'Polite past: something that just happened.'},
    {jp:'昨日（きのう）は{o}___。', en:'Yesterday, {o} ___.', needs:['thing'], use:'Polite past with a thing as the subject (が).'}
  ],
  masuPastNeg: [
    {jp:'昨日（きのう）は{o}___。', en:"I didn't ___ {o} yesterday.", use:'Polite past negative: something you did not do, politely.'},
    {jp:'先週（せんしゅう）は{o}___。', en:"I didn't ___ {o} last week.", needs:['action'], use:'Polite past negative: an action that did not happen.'},
    {jp:'昨日（きのう）は{o}___。', en:"Yesterday, {o} didn't ___.", needs:['thing'], use:'Polite past negative with a thing as the subject (が).'}
  ],
  te: [
    {jp:'{o}___ください。', en:'Please ___ {o}.', needs:['action'], use:'て-form + ください: a polite request.'},
    {jp:'{o}___もいいですか。', en:'May I ___ {o}?', needs:['action'], use:'て-form + もいいですか: asking permission.'},
    {jp:'いま、{o}___います。', en:'I am ___ {o} right now.', needs:['action'], use:'て-form + います: an action in progress.'},
    {jp:'もう{o}___います。', en:'I already ___ {o}.', use:'て-form + います: a state that is already true (知っています, 疲れています).'}
  ],
  ta: [
    {jp:'昨日（きのう）、{o}___。', en:'Yesterday, I ___ {o} (plain past).', use:'Plain past (た): casual or written past tense.'},
    {jp:'先週（せんしゅう）、{o}___。', en:'Last week, I ___ {o} (plain past).', needs:['action'], use:'Plain past (た): a finished action, casually.'},
    {jp:'さっき{o}___。', en:'A little while ago, I ___ {o} (plain past).', needs:['action'], use:'Plain past (た): something that just happened.'},
    {jp:'昨日（きのう）は{o}___。', en:'Yesterday, {o} ___ (plain past).', needs:['thing'], use:'Plain past (た) with a thing as the subject (が).'}
  ],
  nai: [
    {jp:'{o}___でください。', en:"Please don't ___ {o}.", needs:['action'], use:'ない-form + でください: asking someone not to do it.'},
    {jp:'明日（あした）は{o}___つもりです。', en:"Tomorrow, I don't plan to ___ {o}.", needs:['action'], use:'ない-form + つもりです: a plan not to do something.'},
    {jp:'たぶん{o}___。', en:"I probably won't ___ {o}.", use:'Plain negative (ない): casual "do not".'},
    {jp:'明日（あした）は{o}___。', en:"Tomorrow, {o} won't ___ (plain).", needs:['thing'], use:'Plain negative (ない) with a thing as the subject (が).'}
  ],
  naiPast: [
    {jp:'昨日（きのう）は{o}___。', en:"I didn't ___ {o} yesterday (plain).", use:'Plain past negative (なかった): casual "did not".'},
    {jp:'先週（せんしゅう）は{o}___。', en:"I didn't ___ {o} last week (plain).", needs:['action'], use:'Plain past negative (なかった): an action that did not happen.'},
    {jp:'昨日（きのう）は{o}___。', en:"Yesterday, {o} didn't ___ (plain).", needs:['thing'], use:'Plain past negative (なかった) with a thing as the subject (が).'}
  ],
  dict: [
    {jp:'明日（あした）、{o}___つもりです。', en:'Tomorrow, I plan to ___ {o}.', needs:['action'], use:'Dictionary form + つもりです: a plan to do something.'},
    {jp:'{o}___ことができます。', en:'I can ___ {o}.', needs:['action'], use:'Dictionary form + ことができます: ability.'},
    {jp:'毎日（まいにち）{o}___。', en:'Every day, I ___ {o} (plain).', needs:['action'], use:'Dictionary form: plain present or habit.'}
  ],
  potential: [
    {jp:'私（わたし）は{o}___。', en:'I can ___ {o}.', needs:['action'], use:'Potential form: be able to do something.'},
    {jp:'明日（あした）なら{o}___。', en:'If it is tomorrow, I can ___ {o}.', needs:['action'], use:'Potential form: what you are able to do.'}
  ],
  volitional: [
    {jp:'一緒（いっしょ）に{o}___。', en:"Let's ___ {o} together.", needs:['action'], use:'Volitional form: "let\'s" or "shall we".'},
    {jp:'そろそろ{o}___。', en:"Shall we ___ {o} soon?", needs:['action'], use:'Volitional form: suggesting that you start.'},
    {jp:'今（いま）から{o}___。', en:"Let's ___ {o}, starting now.", needs:['action'], use:'Volitional form: proposing to start now.'}
  ],
  passive: [
    {jp:'よく先生（せんせい）に___。', en:'I often get ___ by my teacher (passive).', needs:['action','person'], use:'Passive form: something is done to the subject, by someone (に).'},
    {jp:'よく友達（ともだち）に___。', en:'I often get ___ by a friend (passive).', needs:['action','person'], use:'Passive form: something is done to the subject, by someone (に).'}
  ],
  causative: [
    {jp:'先生（せんせい）は、毎日（まいにち）{o}___。', en:'My teacher makes us ___ {o} every day.', needs:['action'], use:'Causative form: someone makes other people do something.'},
    {jp:'母（はは）は、いつも{o}___。', en:'My mother always makes us ___ {o}.', needs:['action'], use:'Causative form: someone makes other people do something.'}
  ]
};

// A frame fits a verb when the verb is drilled, the frame is live, the verb
// has every tag the frame needs, and the frame is a 'thing' frame exactly
// when the verb is a 'thing' verb (a thing subject never fits an "I" frame).
function frameFits(verb, frame){
  const tags = verb.tags || [], needs = frame.needs || [];
  return verb.drill !== false && !frame.retired
    && needs.every(t => tags.includes(t))
    && needs.includes('thing') === tags.includes('thing');
}
// Fills a frame's {o} slot with the complement, or drops the slot and one
// adjacent space when there is none ('Please ___ {o}.' -> 'Please ___.').
function fillFrame(text, compPart){
  if(compPart) return text.replace('{o}', compPart);
  return text.replace(/ \{o\}|\{o\} ?/, '');
}

const CONJ_SENTENCE_POOL = [];
VERBS.forEach((v,vi)=>{
  Object.keys(FORM_UNLOCK_LESSON).forEach(formKey=>{
    if((v.skip||[]).includes(formKey)) return;
    CONJ_FRAMES[formKey].forEach((f,frameIdx)=>{
      if(!frameFits(v, f)) return;
      CONJ_SENTENCE_POOL.push({ qid:`conjs-${vi}-${formKey}-${frameIdx}`, verbIdx:vi, formKey, frameIdx });
    });
  });
});
function conjSentenceIdsUpTo(lessonNum){
  if(lessonNum < 14) return [];
  return CONJ_SENTENCE_POOL
    .filter(it => FORM_UNLOCK_LESSON[it.formKey] <= lessonNum)
    .map(it => it.qid);
}
function allConjSentenceIds(){
  return CONJ_SENTENCE_POOL.map(it => it.qid);
}
// Resolves any well-formed qid, including ones no longer in the pool, so
// old saved progress still renders.
function resolveConjSentence(qid){
  const parts = qid.split('-');
  const verb = VERBS[Number(parts[1])];
  const formKey = parts[2];
  const frame = CONJ_FRAMES[formKey][Number(parts[3])];
  const comp = verb.comp || {jp:'', en:''};
  return {
    qid, lesson: 14, type:'typed', kind:'conj',
    promptEn: fillFrame(frame.en.replace('___', `___ (${verb.meaning})`), comp.en),
    frameJp: fillFrame(frame.jp, comp.jp),
    dict: verb.dict,
    model: computeForms(verb)[formKey],
    use: frame.use,
    explain: explainForm(verb, formKey)
  };
}
// conjs-<verb>-<form>-<frame> -> the old multiple-choice record conj-<verb>-<form>.
function legacyConjKey(qid){
  const m = /^conjs-(\d+)-([A-Za-z]+)-\d+$/.exec(qid);
  return m ? `conj-${m[1]}-${m[2]}` : null;
}

// Spaced repetition (Leitner-style): each question tracks a "box" 1-5.
// Wrong answer -> back to box 1 (resurfaces soon). Right answer -> box up
// to 5 (resurfaces less often). Selection weight favors low boxes and
// brand-new questions, without ever fully excluding mastered ones.
// A conjs-* sentence with no record of its own inherits the box of the
// multiple-choice conj-* record it replaces, so earlier progress counts.
function boxWeight(qid){
  let rec = PROGRESS.seen[qid];
  if(!rec){
    const legacy = legacyConjKey(qid);
    if(legacy) rec = PROGRESS.seen[legacy];
  }
  if(!rec || rec.count===0) return 6;
  const box = rec.box || 1;
  return Math.max(1, 6-box);
}
// Leitner bookkeeping for one answer. Does not save; the caller calls saveProgress().
function recordResult(qid, correct){
  if(!PROGRESS.seen[qid]){
    const legacy = legacyConjKey(qid);
    const legacyRec = legacy && PROGRESS.seen[legacy];
    PROGRESS.seen[qid] = {count:0, correct:0, box: legacyRec ? (legacyRec.box||1) : 1};
  }
  const rec = PROGRESS.seen[qid];
  rec.count += 1;
  if(correct){
    rec.correct += 1;
    rec.box = Math.min(5, (rec.box||1) + 1);
  } else {
    rec.box = 1;
  }
}
function weightedSample(items, weightFn, count){
  const pool = items.slice();
  const picked = [];
  const n = Math.min(count, pool.length);
  for(let i=0;i<n;i++){
    const weights = pool.map(weightFn);
    const total = weights.reduce((a,b)=>a+b,0);
    let r = Math.random()*total;
    let idx = 0;
    for(; idx<weights.length-1; idx++){
      r -= weights[idx];
      if(r<=0) break;
    }
    picked.push(pool[idx]);
    pool.splice(idx,1);
  }
  return picked;
}
