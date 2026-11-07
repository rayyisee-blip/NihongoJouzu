/* ============================================================
   HISTORY — what you answered over the past week.
   Daily sessions already log every answer under their date in
   PROGRESS.dailyLog. Practice rounds and conjugation drills only
   updated running totals, so they are now also logged here, in
   PROGRESS.history, with a timestamp. weekHistory() merges both.
   ============================================================ */
const HISTORY_KEEP_DAYS = 14;    // older entries are dropped as new ones arrive
const HISTORY_MAX_ENTRIES = 1000; // keeps the saved progress small

function dateStrOf(ts){
  const d = new Date(ts);
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,'0')+"-"+String(d.getDate()).padStart(2,'0');
}

// ['2026-11-07', '2026-11-06', ...] newest first, `days` long.
function recentDates(today, days){
  const [y, m, d] = today.split('-').map(Number);
  const out = [];
  for(let i=0;i<days;i++) out.push(dateStrOf(new Date(y, m-1, d-i).getTime()));
  return out;
}

// Records one answered question from a practice or conjugation round.
// entry: {qid, mode, correct, typed?, pickedText?}. The answer itself is only
// kept for misses, since a right answer is just the model answer. A chosen
// option is kept as text, not an index: generated multiple-choice questions
// pick fresh options every time they are built, so an index means nothing later.
// Does not save; the caller calls saveProgress().
function logHistory(progress, entry, now){
  if(now === undefined) now = Date.now();
  if(!Array.isArray(progress.history)) progress.history = [];
  const rec = { t: now, qid: entry.qid, mode: entry.mode, correct: entry.correct };
  if(!entry.correct){
    if(entry.typed !== undefined) rec.typed = entry.typed;
    if(entry.pickedText !== undefined) rec.pickedText = entry.pickedText;
  }
  progress.history.push(rec);
  const cutoff = now - HISTORY_KEEP_DAYS * 86400000;
  progress.history = progress.history.filter(e => e.t >= cutoff);
  if(progress.history.length > HISTORY_MAX_ENTRIES){
    progress.history = progress.history.slice(progress.history.length - HISTORY_MAX_ENTRIES);
  }
}

// [{date, entries:[{qid, mode, correct, typed?, picked?, t?}]}], newest day
// first, only days with at least one answer. Daily-session answers come
// first within a day (they carry no time), then rounds in the order done.
function weekHistory(progress, today, days){
  const log = progress.dailyLog || {};
  const rounds = Array.isArray(progress.history) ? progress.history : [];
  const out = [];
  recentDates(today, days).forEach(date => {
    const entries = [];
    const set = log[date];
    if(set && set.answers){
      Object.keys(set.answers).forEach(qid => {
        const a = set.answers[qid];
        const e = { qid, mode:'daily', correct: !!a.correct };
        if(a.typed !== undefined) e.typed = a.typed;
        if(a.picked !== undefined) e.picked = a.picked;
        if(a.pickedText !== undefined) e.pickedText = a.pickedText;
        entries.push(e);
      });
    }
    rounds.filter(e => dateStrOf(e.t) === date)
      .sort((a, b) => a.t - b.t)
      .forEach(e => entries.push(e));
    if(entries.length) out.push({ date, entries });
  });
  return out;
}

function weekSummary(week){
  let total = 0, correct = 0;
  week.forEach(day => day.entries.forEach(e => { total += 1; if(e.correct) correct += 1; }));
  return { total, correct };
}
