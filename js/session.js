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

// type-senjp-<lesson>-<patternIdx>-<exampleIdx>: pick the Japanese for a
// textbook example from four (see sentenceChoices). The id keeps its old
// name so saved progress still matches. Examples holding several sentences (／) are skipped.
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

// ---- Multiple-choice options for sentence items --------------------------
// Each particle has one replacement chosen to be wrong in every textbook
// sentence, not merely unusual: に becomes を, never で (ここで車を止める is
// fine Japanese), and は becomes へ, never に (週末に本を読む is fine too).
const WRONG_PARTICLE = { 'は':'へ', 'が':'に', 'を':'へ', 'に':'を', 'へ':'が', 'で':'を', 'と':'に', 'も':'に', 'の':'を', 'から':'を', 'まで':'を' };
const DETERMINERS = ['この', 'その', 'あの', 'どの'];

// The model sentence with one particle swapped, one option per chunk that
// ends in a particle. この/その are determiners, and も/は right after て/で
// or で right after ん are verb endings (つけても, 止めては, 読んで), so those
// are skipped; ごはんを keeps its を.
function particleSwaps(model){
  const parts = model.split(/([\s　]+)/);
  const out = [];
  parts.forEach((chunk, i)=>{
    if(i % 2 || DETERMINERS.includes(chunk)) return;
    const found = trailingParticle(chunk);
    if(!found) return;
    const before = chunk.slice(0, found.start);
    if((found.particle === 'も' || found.particle === 'は') && /[てで]$/.test(before)) return;
    if(found.particle === 'で' && before.endsWith('ん')) return;
    const used = WRONG_PARTICLE[found.particle];
    const swapped = parts.slice();
    swapped[i] = before + used + chunk.slice(found.start + found.particle.length);
    out.push({ text: swapped.join(''), kind: 'particle', used, needed: found.particle });
  });
  return out;
}

// Share of characters two sentences have in common, readings stripped.
function sentenceSimilarity(a, b){
  const x = [...kanaForm(a)], y = [...kanaForm(b)];
  let shared = 0;
  const rest = y.slice();
  x.forEach(ch=>{ const k = rest.indexOf(ch); if(k >= 0){ shared++; rest.splice(k, 1); } });
  return shared / Math.max(x.length, y.length, 1);
}

// Four shuffled options for a sentence item: the model, up to two particle
// swaps of it, and textbook sentences that look alike but mean something
// else (from lessons up to the item's own, closest first). Wrong options carry
// what diagnoses them: {used, needed} for a swap, {en} for another sentence.
function sentenceChoices(qid, rand){
  rand = rand || Math.random;
  const q = resolveTypedSentence(qid);
  const picked = shuffle(particleSwaps(q.model), rand).slice(0, 2);
  const taken = new Set([q.model, ...picked.map(o => o.text)]);
  const pool = ids => ids.map(resolveTypedSentence).filter(o => !taken.has(o.model) && o.promptEn !== q.promptEn);
  let others = pool(typedSentenceIdsUpTo(q.lesson));
  if(others.length < 3) others = pool(typedSentenceIdsUpTo(25));
  others.sort((a, b) => sentenceSimilarity(q.model, b.model) - sentenceSimilarity(q.model, a.model));
  shuffle(others.slice(0, 6), rand).forEach(o=>{
    if(picked.length < 3 && !taken.has(o.model)){
      taken.add(o.model);
      picked.push({ text: o.model, kind: 'other', en: o.promptEn });
    }
  });
  return shuffle([{ text: q.model, kind: 'answer' }, ...picked], rand);
}

// "Try again": the item at position idx goes back into the sequence a few
// places later (RETRY_GAP other questions in between, or the end if fewer
// remain), so it comes back during the same round or session. Returns a new
// array; an item that is already waiting later in the sequence is not queued
// twice. Used for question ids and for capstone sentence positions alike.
const RETRY_GAP = 3;
function withRetry(seq, idx, item, gap){
  const out = seq.slice();
  if(out.indexOf(item, idx + 1) !== -1) return out;
  const pos = Math.min(idx + 1 + (gap === undefined ? RETRY_GAP : gap), out.length);
  out.splice(pos, 0, item);
  return out;
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
