// Daily session builder: a fixed 10-item mix of multiple choice, typed
// sentences and (from lesson 14) conjugation-in-sentence items.
const SESSION_SIZE = 10;
const SESSION_TYPED = 4;
const SESSION_CONJ_MAX = 3;

// Multiple-choice IDs for one lesson: hand-written questions plus the
// generated pool. Never includes conjugation or typed items.
function lessonQuestionIds(lessonNum){
  const l = LESSONS.find(x=>x.n===lessonNum);
  const staticIds = l.q.map((q,i)=> l.n+"-"+i);
  const genIds = (GENERATED_POOL_BY_LESSON[lessonNum]||[]).map(it=>it.qid);
  return [...staticIds, ...genIds];
}
function allQuestionsUpTo(lessonNum){
  const out = [];
  for(let n=1;n<=lessonNum;n++) out.push(...lessonQuestionIds(n));
  return out;
}

// type-senjp-<lesson>-<patternIdx>-<exampleIdx>: type the Japanese for a
// textbook example. Examples holding several sentences (／) are skipped.
function typedSentenceIdsUpTo(lessonNum){
  const out = [];
  TEXTBOOK.filter(t=>t.n<=lessonNum).forEach(t=>{
    t.patterns.forEach((p,pi)=> p.examples.forEach((ex,ei)=>{
      if(!ex.jp.includes('／')) out.push(`type-senjp-${t.n}-${pi}-${ei}`);
    }));
  });
  return out;
}
function resolveTypedSentence(qid){
  const [, , lesson, pi, ei] = qid.split('-');
  const p = TEXTBOOK.find(t=>t.n===Number(lesson)).patterns[Number(pi)];
  const ex = p.examples[Number(ei)];
  return {
    qid, lesson:Number(lesson), type:'typed', kind:'sentence',
    promptEn: ex.en, hint: p.title, model: ex.jp, explain: p.explain
  };
}

function itemType(qid){
  if(qid.indexOf('type-') === 0) return 'typed';
  if(qid.indexOf('conjs-') === 0) return 'conj';
  return 'mc';
}

// Orders items so neighbours differ in type where counts allow. Built
// back to front: start from a multiple-choice item (so the session ends on
// one), then repeatedly take from the largest remaining group that differs
// from the previous pick.
function interleaveByType(groups){
  const rest = {typed:[...groups.typed], conj:[...groups.conj], mc:[...groups.mc]};
  const out = [];
  let last = null;
  while(rest.typed.length + rest.conj.length + rest.mc.length > 0){
    const types = Object.keys(rest).filter(t => rest[t].length > 0);
    const options = types.filter(t => t !== last);
    const choices = options.length ? options : types;
    choices.sort((a,b) => rest[b].length - rest[a].length);
    last = (out.length === 0 && rest.mc.length) ? 'mc' : choices[0];
    out.push(rest[last].shift());
  }
  return out.reverse();
}

function buildSessionIds(lessonNum){
  const mcPool = allQuestionsUpTo(lessonNum);
  const typedPool = typedSentenceIdsUpTo(lessonNum);
  const conjPool = conjSentenceIdsUpTo(lessonNum);

  const conj = weightedSample(conjPool, boxWeight, Math.min(SESSION_CONJ_MAX, conjPool.length));
  const spare = SESSION_CONJ_MAX - conj.length;   // unused conjugation slots
  const typedCount = Math.min(typedPool.length, SESSION_TYPED + spare);
  const typed = weightedSample(typedPool, boxWeight, typedCount);
  const mcCount = SESSION_SIZE - conj.length - typed.length;
  const mc = weightedSample(mcPool, boxWeight, mcCount);
  return interleaveByType({typed, conj, mc});
}

// Today's set. Days saved before this format (no v:2) are rebuilt unless
// already completed. Does not save; the caller calls saveProgress().
function ensureTodaysSession(progress, date, lessonNum){
  const existing = progress.dailyLog[date];
  if(existing && (existing.v === 2 || existing.completed === true)) return existing;
  progress.dailyLog[date] = { v:2, qids: buildSessionIds(lessonNum), answers:{}, completed:false };
  return progress.dailyLog[date];
}
function firstUnansweredIndex(set){
  const i = set.qids.findIndex(qid => !(qid in set.answers));
  return i === -1 ? set.qids.length : i;
}
