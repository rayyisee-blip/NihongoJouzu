/* ============================================================
   STORAGE
   ============================================================ */
const STORE_KEY = "nihongo-daily-progress";
let PROGRESS = null;

/* ------------------------------------------------------------
   FIREBASE (optional) — enables email/password login and syncs
   progress across any device/browser you log into.

   TO ENABLE: create a free Firebase project (see the setup guide),
   then paste your project's config values below, replacing the
   placeholders. Leave it as-is and the app works exactly as before
   (Claude.ai storage or this-browser-only storage) — nothing breaks
   if you skip this.
   ------------------------------------------------------------ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDnty7QwjaljeNfYJW-Y2xAi6sKPQtyA9Y",
  authDomain: "nihongojouzu-65aee.firebaseapp.com",
  projectId: "nihongojouzu-65aee",
  storageBucket: "nihongojouzu-65aee.firebasestorage.app",
  messagingSenderId: "1071331888412",
  appId: "1:1071331888412:web:0b0eee603953e7cea1bed9",
  measurementId: "G-M5CG8V9GQ4"
};

const FIREBASE_ENABLED = typeof firebase !== 'undefined'
  && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY';

// FIREBASE_READY reflects whether initialization actually succeeded (not just
// whether config values look filled in). If anything about the config is
// wrong, or an SDK script failed to load, we fall back gracefully to
// browser-only storage instead of the whole app failing to load.
let fbAuth = null, fbDb = null, fbUser = null, FIREBASE_READY = false, FIREBASE_INIT_ERROR = null;
if(FIREBASE_ENABLED){
  try{
    firebase.initializeApp(FIREBASE_CONFIG);
    fbAuth = firebase.auth();
    fbDb = firebase.firestore();
    FIREBASE_READY = true;
  }catch(e){
    console.error('Firebase failed to initialize — check FIREBASE_CONFIG values.', e);
    FIREBASE_INIT_ERROR = e;
    FIREBASE_READY = false;
  }
}

// Two possible save destinations depending on where this file is running:
//  - "cloud": Claude.ai's built-in artifact storage (window.storage) — works when
//             this file is opened/rendered inside a Claude.ai conversation.
//  - "local": the browser's own localStorage — works when this .html file is
//             downloaded and opened directly (double-clicked, file://, or hosted).
// We detect which is available at load time and use that one consistently.
let STORAGE_MODE = 'none';

function detectStorageMode(){
  if(FIREBASE_READY && fbUser){
    return 'firebase';
  }
  if(typeof window!=='undefined' && window.storage && typeof window.storage.get==='function'){
    return 'cloud';
  }
  try{
    const testKey = '__nihongo_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return 'local';
  }catch(e){
    return 'none';
  }
}

function defaultProgress(){
  return {
    currentLesson: 1,
    seen: {},              // qKey -> {count, correct}
    dailyLog: {},           // date -> {qids:[], completed:bool}
    capstoneStatus: {},     // lessonNum -> 'locked'|'available'|'done'
    capstoneResults: {},    // lessonNum -> {sentenceIdx: 'good'|'retry'}
    reviewCapstoneStatus: {}, // block (5/10/15/20/25) -> 'available'|'done'
    capstoneRequeue: [],    // sentences marked "needs more work", resurfaced later
    notes: [],              // user's own study notes: {id, text, createdAt}[]
    streak: 0,
    lastCompletedDate: null,
    totalStamps: 0,
    stampDates: []
  };
}

async function loadProgress(){
  STORAGE_MODE = detectStorageMode();
  let loaded = null;
  try{
    if(STORAGE_MODE === 'firebase'){
      const snap = await fbDb.collection('progress').doc(fbUser.uid).get();
      loaded = (snap.exists && snap.data().payload) ? JSON.parse(snap.data().payload) : null;
    } else if(STORAGE_MODE === 'cloud'){
      const res = await window.storage.get(STORE_KEY, false);
      loaded = (res && res.value) ? JSON.parse(res.value) : null;
    } else if(STORAGE_MODE === 'local'){
      const raw = window.localStorage.getItem(STORE_KEY);
      loaded = raw ? JSON.parse(raw) : null;
    }
  }catch(e){
    // Read failed — fall back to a local safety-net copy if one exists,
    // so a backend hiccup doesn't look like lost progress.
    try{
      const raw = window.localStorage.getItem(STORE_KEY + '-safetynet');
      loaded = raw ? JSON.parse(raw) : null;
    }catch(e2){ /* no safety net available either */ }
  }
  PROGRESS = loaded || defaultProgress();
  if(!PROGRESS.capstoneStatus[1]) PROGRESS.capstoneStatus[1] = 'locked';
  if(!PROGRESS.reviewCapstoneStatus) PROGRESS.reviewCapstoneStatus = {};
  if(!PROGRESS.capstoneRequeue) PROGRESS.capstoneRequeue = [];
  if(!PROGRESS.dailyLog) PROGRESS.dailyLog = {};
  // Notes used to be a single freeform string; migrate any old save into
  // the new one-entry-per-note-bar array format so nothing is lost.
  if(typeof PROGRESS.notes === 'string'){
    PROGRESS.notes = PROGRESS.notes.trim()
      ? [{ id: String(Date.now()), text: PROGRESS.notes, createdAt: Date.now() }]
      : [];
  } else if(!Array.isArray(PROGRESS.notes)){
    PROGRESS.notes = [];
  }
}

let SAVE_STATUS = 'ok'; // 'ok' | 'retrying' | 'fallback'

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function saveProgress(){
  const payload = JSON.stringify(PROGRESS);

  // Always keep a silent local safety-net copy, regardless of primary storage
  // mode, so a transient server error never risks losing a session's progress.
  try{ window.localStorage.setItem(STORE_KEY + '-safetynet', payload); }catch(e){ /* ignore */ }

  if(STORAGE_MODE === 'firebase'){
    for(let attempt=1; attempt<=2; attempt++){
      try{
        await fbDb.collection('progress').doc(fbUser.uid).set({payload, updatedAt: Date.now()});
        SAVE_STATUS = 'ok';
        updateSaveStatusUI();
        return;
      }catch(e){
        if(attempt===1){
          await wait(600);
        } else {
          console.warn('Sync temporarily unavailable, kept locally instead', e);
          SAVE_STATUS = 'fallback';
          updateSaveStatusUI();
        }
      }
    }
    return;
  }

  if(STORAGE_MODE === 'local'){
    try{
      window.localStorage.setItem(STORE_KEY, payload);
      SAVE_STATUS = 'ok';
    }catch(e){
      console.warn('Local save failed', e);
      SAVE_STATUS = 'fallback';
    }
    updateSaveStatusUI();
    return;
  }

  if(STORAGE_MODE === 'cloud'){
    for(let attempt=1; attempt<=2; attempt++){
      try{
        await window.storage.set(STORE_KEY, payload, false);
        SAVE_STATUS = 'ok';
        updateSaveStatusUI();
        return;
      }catch(e){
        if(attempt===1){
          await wait(600);
        } else {
          // Both attempts failed — likely a transient backend issue. Progress is
          // still safe in the local safety-net copy above; just let the person
          // know saving is temporarily delayed rather than showing a raw error.
          console.warn('Cloud save temporarily unavailable, kept locally instead', e);
          SAVE_STATUS = 'fallback';
          updateSaveStatusUI();
        }
      }
    }
    return;
  }
  // STORAGE_MODE 'none' — nothing persistent available; already safety-netted above if possible.
}

function updateSaveStatusUI(){
  const footer = document.getElementById('storageFooter');
  if(!footer) return;
  if(SAVE_STATUS === 'fallback'){
    footer.innerHTML = `ONE PAGE, YOUR STORY 訳 &middot; SYNC DELAYED &mdash; KEPT SAFE LOCALLY, WILL RETRY`;
  } else {
    const msg = STORAGE_MODE==='firebase' ? `SYNCED TO YOUR ACCOUNT (${fbUser.email})`
      : STORAGE_MODE==='cloud' ? 'PROGRESS SAVES TO YOUR CLAUDE.AI ACCOUNT'
      : STORAGE_MODE==='local' ? 'PROGRESS SAVES TO THIS BROWSER ONLY'
      : 'STORAGE UNAVAILABLE &mdash; PROGRESS WON\u2019T PERSIST';
    footer.innerHTML = `ONE PAGE, YOUR STORY 訳 &middot; ${msg}`;
  }
}

function exportBackup(){
  const blob = new Blob([JSON.stringify(PROGRESS, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nihongo-daily-backup-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importBackup(file){
  const reader = new FileReader();
  reader.onload = async (e) => {
    try{
      const parsed = JSON.parse(e.target.result);
      if(typeof parsed !== 'object' || parsed===null) throw new Error('Invalid file');
      PROGRESS = Object.assign(defaultProgress(), parsed);
      await saveProgress();
      render();
      alert('Progress restored from backup.');
    }catch(err){
      alert("Couldn't read that file — make sure it's a Nihongo Daily backup .json.");
    }
  };
  reader.readAsText(file);
}

/* ============================================================
   HELPERS
   ============================================================ */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function todayStr(){
  const d = new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,'0')+"-"+String(d.getDate()).padStart(2,'0');
}
function dateSeed(str){
  let h = 0;
  for(let i=0;i<str.length;i++){ h = (h*31 + str.charCodeAt(i)) >>> 0; }
  return h;
}
function mulberry32(seed){
  return function(){
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
function shuffle(arr, rand){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(rand()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
/* ============================================================
   QUESTION GENERATION — turns the N5 Textbook's vocab and sentence
   patterns into many more quiz question *variants* than the 4 hand-
   written questions per lesson alone. Each generated question has a
   stable id (for spaced-repetition tracking), but its multiple-choice
   options are freshly sampled each time it's displayed, so the same
   underlying question doesn't look identical on repeat exposure.
   ============================================================ */
function allVocabUpTo(lessonNum){
  const out = [];
  TEXTBOOK.filter(t=>t.n<=lessonNum).forEach(t=> out.push(...t.vocab));
  return out;
}
function allExamplesUpTo(lessonNum){
  const out = [];
  TEXTBOOK.filter(t=>t.n<=lessonNum).forEach(t=> t.patterns.forEach(p=> p.examples.forEach(ex=> out.push({...ex, patternTitle:p.title}))));
  return out;
}
function allPatternTitlesUpTo(lessonNum, excludeTitle){
  const out = [];
  TEXTBOOK.filter(t=>t.n<=lessonNum).forEach(t=> t.patterns.forEach(p=>{ if(p.title!==excludeTitle) out.push(p.title); }));
  return out;
}
function sampleN(arr, n){
  return shuffle(arr, Math.random).slice(0, n);
}

// One lightweight record per generated question: just enough to look the
// content back up later. Built once at load for all 25 lessons.
function buildGeneratedPool(lessonNum){
  const tb = TEXTBOOK.find(t=>t.n===lessonNum);
  const items = [];
  if(!tb) return items;
  tb.vocab.forEach((v,i)=>{
    items.push({ qid:`gen-venjp-${lessonNum}-${i}`, lesson:lessonNum, kind:'vocab_en_jp', vocabIdx:i });
    items.push({ qid:`gen-vjpen-${lessonNum}-${i}`, lesson:lessonNum, kind:'vocab_jp_en', vocabIdx:i });
  });
  tb.patterns.forEach((p,pi)=>{
    p.examples.forEach((ex,ei)=>{
      items.push({ qid:`gen-senjp-${lessonNum}-${pi}-${ei}`, lesson:lessonNum, kind:'sentence_en_jp', patternIdx:pi, exampleIdx:ei });
    });
    items.push({ qid:`gen-precog-${lessonNum}-${pi}`, lesson:lessonNum, kind:'pattern_recognize', patternIdx:pi });
  });
  return items;
}

const GENERATED_POOL_BY_LESSON = {};
const GENERATED_INDEX = {};
LESSONS.forEach(l=>{
  const items = buildGeneratedPool(l.n);
  GENERATED_POOL_BY_LESSON[l.n] = items;
  items.forEach(it=> GENERATED_INDEX[it.qid] = it);
});

// ----------------------------------------------------------------
// MUTATION-BASED DISTRACTORS — instead of grabbing random unrelated
// vocab/sentences (which gives away the answer by script, length, or
// topic alone), build wrong options that are *close* to the answer:
// same script + similar length for vocab, same-lesson topic plus a
// word-order scramble and a particle swap for sentences.
// ----------------------------------------------------------------
function scriptOf(str){
  return (/[゠-ヿ]/.test(str) && !/[一-鿿]/.test(str)) ? 'kata' : 'other';
}
function visibleLen(str){
  return str.replace(/（.*?）/g,'').length;
}
function buildVocabDistractors(pool, answer, key){
  const ansStr = answer[key];
  const ansScript = scriptOf(ansStr);
  const ansLen = visibleLen(ansStr);
  let candidates = pool.filter(x => scriptOf(x[key]) === ansScript);
  if(candidates.length < 3) candidates = pool.slice();
  candidates = candidates
    .map(x => ({x, d: Math.abs(visibleLen(x[key]) - ansLen)}))
    .sort((a,b) => a.d - b.d)
    .map(o => o.x);
  const nearBand = candidates.slice(0, Math.max(6, Math.min(candidates.length, 10)));
  return shuffle(nearBand, Math.random).slice(0,3).map(x => x[key]);
}
const PARTICLE_SWAP_SET = ['は','が','を','に','で','へ','と','も'];
// Only swaps the kana that ends a space-separated phrase chunk — that's
// where a particle actually sits in these example sentences. Scanning the
// raw string for the first matching character instead would happily grab
// one buried mid-word (e.g. the は inside ごはん) and corrupt the vocabulary
// instead of testing the particle.
function particleSwapVariant(jp){
  const chunks = jp.split(' ');
  for(let i=0;i<chunks.length;i++){
    let chunk = chunks[i];
    let trailingPunct = '';
    if(/[。、]$/.test(chunk)){ trailingPunct = chunk.slice(-1); chunk = chunk.slice(0,-1); }
    if(!chunk) continue;
    const last = chunk.slice(-1);
    if(PARTICLE_SWAP_SET.includes(last)){
      const alt = PARTICLE_SWAP_SET.filter(x => x!==last);
      const swap = alt[Math.floor(Math.random()*alt.length)];
      const next = chunks.slice();
      next[i] = chunk.slice(0,-1) + swap + trailingPunct;
      return next.join(' ');
    }
  }
  return null;
}
function scrambleVariant(jp){
  const chunks = jp.split(' ').filter(Boolean);
  if(chunks.length < 3) return null;
  const shuffled = shuffle(chunks, Math.random);
  const joined = shuffled.join(' ');
  return joined === jp ? null : joined;
}
function buildSentenceDistractors(item, ex, tb){
  const sameLessonPool = tb.patterns.flatMap(p => p.examples).filter(x => x.jp!==ex.jp).map(x => x.jp);
  let topicPool = sameLessonPool;
  if(topicPool.length < 3){
    const widened = [];
    for(let ln=Math.max(1,item.lesson-2); ln<=item.lesson; ln++){
      const t = TEXTBOOK.find(x=>x.n===ln);
      if(t) t.patterns.forEach(p=> p.examples.forEach(x=>{ if(x.jp!==ex.jp) widened.push(x.jp); }));
    }
    topicPool = widened.length >= 3 ? widened : allExamplesUpTo(item.lesson).filter(x=>x.jp!==ex.jp).map(x=>x.jp);
  }
  const mutated = [];
  const scr = scrambleVariant(ex.jp); if(scr) mutated.push(scr);
  const swap = particleSwapVariant(ex.jp); if(swap && swap!==ex.jp) mutated.push(swap);
  const shuffledTopicPool = shuffle(topicPool, Math.random);
  const combined = [];
  [...mutated, ...shuffledTopicPool].forEach(s => {
    if(s && s!==ex.jp && !combined.includes(s) && combined.length<3) combined.push(s);
  });
  return combined;
}

// Resolves a lightweight generated-question record into the same
// {prompt, choices, a, note, type, lesson, qid} shape the renderer already
// expects for static questions, sampling fresh distractors each call.
function resolveGeneratedQuestion(item){
  const tb = TEXTBOOK.find(t=>t.n===item.lesson);

  if(item.kind === 'vocab_en_jp'){
    const v = tb.vocab[item.vocabIdx];
    const pool = allVocabUpTo(item.lesson).filter(x=>x.jp!==v.jp);
    const distractors = buildVocabDistractors(pool, v, 'jp');
    const choices = shuffle([v.jp, ...distractors], Math.random);
    return { qid:item.qid, lesson:item.lesson, type:'vocab', prompt:`Which word means "${v.en}"?`, choices, a:choices.indexOf(v.jp), note:`${v.jp} = ${v.en}` };
  }
  if(item.kind === 'vocab_jp_en'){
    const v = tb.vocab[item.vocabIdx];
    const pool = allVocabUpTo(item.lesson).filter(x=>x.en!==v.en);
    const distractors = buildVocabDistractors(pool, v, 'en');
    const choices = shuffle([v.en, ...distractors], Math.random);
    return { qid:item.qid, lesson:item.lesson, type:'vocab', prompt:`「${v.jp}」means:`, choices, a:choices.indexOf(v.en), note:`${v.jp} = ${v.en}` };
  }
  if(item.kind === 'sentence_en_jp'){
    const p = tb.patterns[item.patternIdx];
    const ex = p.examples[item.exampleIdx];
    const distractors = buildSentenceDistractors(item, ex, tb);
    const choices = shuffle([ex.jp, ...distractors], Math.random);
    return { qid:item.qid, lesson:item.lesson, type:'structure', prompt:`Which sentence means: "${ex.en}"?`, choices, a:choices.indexOf(ex.jp), note:`${p.title} \u2014 ${p.explain}` };
  }
  if(item.kind === 'pattern_recognize'){
    const p = tb.patterns[item.patternIdx];
    const ex = p.examples[0];
    let distractorPool = tb.patterns.filter((_,idx)=>idx!==item.patternIdx).map(x=>x.title);
    if(distractorPool.length < 3){
      distractorPool = allPatternTitlesUpTo(item.lesson, p.title);
    }
    const distractors = sampleN(distractorPool, Math.min(3,distractorPool.length));
    const choices = shuffle([p.title, ...distractors], Math.random);
    return { qid:item.qid, lesson:item.lesson, type:'grammar', prompt:`Which grammar point does this sentence use?\n${ex.jp}`, choices, a:choices.indexOf(p.title), note:p.explain };
  }
  return null;
}

