/* ============================================================
   CONJUGATION ENGINE — a real rules engine, not hand-written
   questions. Japanese verb conjugation is regular once you know
   the verb's group:
     Group 1 (godan/う-verbs):  書く, 飲む, 帰る
     Group 2 (ichidan/る-verbs): 食べる, 見る
     Group 3 (irregular):       する, 来る (+ noun+する compounds)
   Every verb below is tagged with its group, and one rule table
   per group produces every form. Distractors are built the same
   way real learners get it wrong: wrong verb-group rule, wrong
   godan branch, or right form/wrong tense-polarity.
   ============================================================ */
const VERBS = [
  // ---- Group 1 (godan) ----
  {dict:"書（か）く", stem:"書（か）", oku:"く", group:1, meaning:"to write"},
  {dict:"聞（き）く", stem:"聞（き）", oku:"く", group:1, meaning:"to listen, hear, ask"},
  {dict:"歩（ある）く", stem:"歩（ある）", oku:"く", group:1, meaning:"to walk"},
  {dict:"働（はたら）く", stem:"働（はたら）", oku:"く", group:1, meaning:"to work"},
  {dict:"泳（およ）ぐ", stem:"泳（およ）", oku:"ぐ", group:1, meaning:"to swim"},
  {dict:"飲（の）む", stem:"飲（の）", oku:"む", group:1, meaning:"to drink"},
  {dict:"読（よ）む", stem:"読（よ）", oku:"む", group:1, meaning:"to read"},
  {dict:"住（す）む", stem:"住（す）", oku:"む", group:1, meaning:"to live (somewhere)"},
  {dict:"死（し）ぬ", stem:"死（し）", oku:"ぬ", group:1, meaning:"to die"},
  {dict:"遊（あそ）ぶ", stem:"遊（あそ）", oku:"ぶ", group:1, meaning:"to play"},
  {dict:"話（はな）す", stem:"話（はな）", oku:"す", group:1, meaning:"to speak"},
  {dict:"消（け）す", stem:"消（け）", oku:"す", group:1, meaning:"to turn off, erase"},
  {dict:"貸（か）す", stem:"貸（か）", oku:"す", group:1, meaning:"to lend"},
  {dict:"待（ま）つ", stem:"待（ま）", oku:"つ", group:1, meaning:"to wait"},
  {dict:"立（た）つ", stem:"立（た）", oku:"つ", group:1, meaning:"to stand"},
  {dict:"買（か）う", stem:"買（か）", oku:"う", group:1, meaning:"to buy"},
  {dict:"使（つか）う", stem:"使（つか）", oku:"う", group:1, meaning:"to use"},
  {dict:"手伝（てつだ）う", stem:"手伝（てつだ）", oku:"う", group:1, meaning:"to help"},
  {dict:"会（あ）う", stem:"会（あ）", oku:"う", group:1, meaning:"to meet"},
  {dict:"帰（かえ）る", stem:"帰（かえ）", oku:"る", group:1, meaning:"to go home / return", trap:true},
  {dict:"入（はい）る", stem:"入（はい）", oku:"る", group:1, meaning:"to enter", trap:true},
  {dict:"要（い）る", stem:"要（い）", oku:"る", group:1, meaning:"to be necessary", trap:true},
  {dict:"知（し）る", stem:"知（し）", oku:"る", group:1, meaning:"to know", trap:true},
  {dict:"走（はし）る", stem:"走（はし）", oku:"る", group:1, meaning:"to run", trap:true},
  {dict:"作（つく）る", stem:"作（つく）", oku:"る", group:1, meaning:"to make"},
  {dict:"座（すわ）る", stem:"座（すわ）", oku:"る", group:1, meaning:"to sit"},
  {dict:"撮（と）る", stem:"撮（と）", oku:"る", group:1, meaning:"to take (a photo)"},
  {dict:"曲（ま）がる", stem:"曲（ま）", oku:"がる", group:1, meaning:"to turn"},
  {dict:"渡（わた）る", stem:"渡（わた）", oku:"る", group:1, meaning:"to cross"},
  {dict:"通（とお）る", stem:"通（とお）", oku:"る", group:1, meaning:"to pass through"},
  {dict:"分（わ）かる", stem:"分（わ）", oku:"かる", group:1, meaning:"to understand"},
  {dict:"行（い）く", stem:"行（い）", oku:"く", group:1, meaning:"to go", irregularTe:true},
  // ---- Group 2 (ichidan) ----
  {dict:"食（た）べる", stem:"食（た）", oku:"べる", group:2, meaning:"to eat"},
  {dict:"見（み）る", stem:"見（み）", oku:"る", group:2, meaning:"to see, watch"},
  {dict:"起（お）きる", stem:"起（お）", oku:"きる", group:2, meaning:"to wake up"},
  {dict:"寝（ね）る", stem:"寝（ね）", oku:"る", group:2, meaning:"to sleep"},
  {dict:"出（で）る", stem:"出（で）", oku:"る", group:2, meaning:"to leave, go out"},
  {dict:"見（み）せる", stem:"見（み）", oku:"せる", group:2, meaning:"to show"},
  {dict:"教（おし）える", stem:"教（おし）", oku:"える", group:2, meaning:"to teach"},
  {dict:"覚（おぼ）える", stem:"覚（おぼ）", oku:"える", group:2, meaning:"to remember"},
  {dict:"着（き）る", stem:"着（き）", oku:"る", group:2, meaning:"to wear"},
  {dict:"借（か）りる", stem:"借（か）", oku:"りる", group:2, meaning:"to borrow"},
  {dict:"降（お）りる", stem:"降（お）", oku:"りる", group:2, meaning:"to get off, go down"},
  {dict:"疲（つか）れる", stem:"疲（つか）", oku:"れる", group:2, meaning:"to get tired"},
  {dict:"褒（ほ）める", stem:"褒（ほ）", oku:"める", group:2, meaning:"to praise"},
  {dict:"閉（し）める", stem:"閉（し）", oku:"める", group:2, meaning:"to close"},
  // ---- Group 3 (irregular) ----
  {dict:"する", group:3, irregular:'suru', meaning:"to do", stem:""},
  {dict:"来（く）る", group:3, irregular:'kuru', meaning:"to come"},
  {dict:"勉強（べんきょう）する", group:3, irregular:'suru', meaning:"to study", stem:"勉強（べんきょう）"},
  {dict:"洗濯（せんたく）する", group:3, irregular:'suru', meaning:"to do laundry", stem:"洗濯（せんたく）"},
  {dict:"掃除（そうじ）する", group:3, irregular:'suru', meaning:"to clean", stem:"掃除（そうじ）"},
  {dict:"結婚（けっこん）する", group:3, irregular:'suru', meaning:"to marry", stem:"結婚（けっこん）"}
];

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
// would actually make them — not random unrelated verbs.
function generateMistakes(verb, formKey){
  const out = [];
  const push = s => { if(s && !out.includes(s)) out.push(s); };
  const forms = computeForms(verb);
  const correct = forms[formKey];

  if(verb.group===1){
    const ic = ichidanForms(verb.oku);
    push((verb.stem||'')+ic[formKey]);
  } else if(verb.group===2){
    const go = godanForms(verb.oku);
    push((verb.stem||'')+go[formKey]);
  } else if(verb.irregular==='suru'){
    const go = godanForms('する');
    push((verb.stem||'')+go[formKey]);
  }

  if(verb.group===1 && (formKey==='te'||formKey==='ta')){
    const last = verb.oku.slice(-1);
    const rest = verb.oku.slice(0,-1);
    const altBranches = ['く','む','す','ぐ'].filter(b=>b!==last);
    shuffle(altBranches, Math.random).slice(0,2).forEach(b=>{
      const teTa = TE_TA_MAP[b];
      push((verb.stem||'')+rest+(formKey==='te'?teTa.te:teTa.ta));
    });
  }

  const masuFam = ['masuNeg','masuPast','masuPastNeg'];
  const plainFam = ['dict','nai','ta','naiPast'];
  const advFam = ['potential','volitional','passive','causative'];
  const fam = masuFam.includes(formKey) ? masuFam : plainFam.includes(formKey) ? plainFam : advFam.includes(formKey) ? advFam : null;
  if(fam) fam.filter(k=>k!==formKey).forEach(k=>push(forms[k]));

  return out.filter(s=>s && s!==correct);
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
const CONJUGATION_POOL = [];
VERBS.forEach((v,vi)=>{
  Object.keys(FORM_LABELS).forEach(formKey=>{
    CONJUGATION_POOL.push({ qid:`conj-${vi}-${formKey}`, verbIdx:vi, formKey });
  });
});
function conjugationIdsUpTo(lessonNum){
  if(lessonNum < 14) return [];
  return CONJUGATION_POOL
    .filter(it => (FORM_UNLOCK_LESSON[it.formKey]||99) <= lessonNum)
    .map(it => it.qid);
}
function resolveConjugationQuestion(qid){
  const parts = qid.split('-');
  const verbIdx = Number(parts[1]);
  const formKey = parts.slice(2).join('-');
  const verb = VERBS[verbIdx];
  const forms = computeForms(verb);
  const given = masuForm(verb);
  const correct = forms[formKey];
  const mistakes = generateMistakes(verb, formKey);
  let distractors = mistakes.slice(0,3);
  if(distractors.length < 3){
    const otherVerbs = shuffle(VERBS.filter((v,i)=>i!==verbIdx), Math.random);
    for(const ov of otherVerbs){
      if(distractors.length>=3) break;
      const ovForm = computeForms(ov)[formKey];
      if(ovForm && ovForm!==correct && !distractors.includes(ovForm)) distractors.push(ovForm);
    }
  }
  const choices = shuffle([correct, ...distractors.slice(0,3)], Math.random);
  return {
    qid, lesson: 14, type:'conjugation',
    prompt: `What's the ${FORM_LABELS[formKey]} of ${given}?`,
    choices, a: choices.indexOf(correct),
    note: explainForm(verb, formKey)
  };
}

// Spaced repetition (Leitner-style): each question tracks a "box" 1-5.
// Wrong answer -> back to box 1 (resurfaces soon). Right answer -> box up
// to 5 (resurfaces less often). Selection weight favors low boxes and
// brand-new questions, without ever fully excluding mastered ones.
function boxWeight(qid){
  const rec = PROGRESS.seen[qid];
  if(!rec || rec.count===0) return 6;
  const box = rec.box || 1;
  return Math.max(1, 6-box);
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
