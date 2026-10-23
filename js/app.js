// Capstone unlock stays gated on the 4 original hand-written questions only
// (not the full generated pool) so lesson pacing doesn't change - the
// generated questions add practice depth without slowing progression.
function lessonFullySeen(lessonNum){
  const l = LESSONS.find(x=>x.n===lessonNum);
  const staticIds = l.q.map((q,i)=> l.n+"-"+i);
  return staticIds.every(qid => PROGRESS.seen[qid] && PROGRESS.seen[qid].count>0);
}
function qByQid(qid){
  if(qid.indexOf('gen-') === 0){
    return resolveGeneratedQuestion(GENERATED_INDEX[qid]);
  }
  if(qid.indexOf('type-') === 0){
    return resolveTypedSentence(qid);
  }
  if(qid.indexOf('conjs-') === 0){
    return resolveConjSentence(qid);
  }
  const [lessonNum, idx] = qid.split("-").map(Number);
  const l = LESSONS.find(x=>x.n===lessonNum);
  return {...l.q[idx], lesson:lessonNum, qid};
}

// Builds an on-demand practice round for the current lesson, with no daily limit.
// Prioritizes questions from the current lesson not yet seen (so capstones unlock
// fast); once everything in the lesson has been seen at least once, it falls back
// to spaced-repetition weighting across the lesson's full pool (static + generated)
// so struggling questions resurface more than mastered ones.
function buildPracticeSet(){
  const cur = PROGRESS.currentLesson;
  const ids = lessonQuestionIds(cur);
  const unseen = ids.filter(qid => !PROGRESS.seen[qid] || PROGRESS.seen[qid].count===0);
  const pool = unseen.length>0 ? unseen : ids;
  return weightedSample(pool, boxWeight, pool.length);
}
function updateStreakOnComplete(){
  const date = todayStr();
  if(PROGRESS.lastCompletedDate === date) return;
  const yest = new Date(); yest.setDate(yest.getDate()-1);
  const yestStr = yest.getFullYear()+"-"+String(yest.getMonth()+1).padStart(2,'0')+"-"+String(yest.getDate()).padStart(2,'0');
  if(PROGRESS.lastCompletedDate === yestStr){
    PROGRESS.streak += 1;
  } else {
    PROGRESS.streak = 1;
  }
  PROGRESS.lastCompletedDate = date;
  if(!PROGRESS.stampDates.includes(date)){
    PROGRESS.stampDates.push(date);
    PROGRESS.totalStamps += 1;
  }
}
function checkLessonUnlocks(){
  const cur = PROGRESS.currentLesson;
  if(lessonFullySeen(cur) && (!PROGRESS.capstoneStatus[cur] || PROGRESS.capstoneStatus[cur]==='locked')){
    PROGRESS.capstoneStatus[cur] = 'available';
  }
}
function isCapstoneDone(lessonNum){
  return PROGRESS.capstoneStatus[lessonNum] === 'done';
}
function completeCapstone(lessonNum){
  PROGRESS.capstoneStatus[lessonNum] = 'done';
  if(REVIEW_CAPSTONES.some(rc=>rc.block===lessonNum) && !PROGRESS.reviewCapstoneStatus[lessonNum]){
    PROGRESS.reviewCapstoneStatus[lessonNum] = 'available';
  }
  if(lessonNum === PROGRESS.currentLesson && lessonNum < 25){
    PROGRESS.currentLesson = lessonNum + 1;
    if(!PROGRESS.capstoneStatus[lessonNum+1]) PROGRESS.capstoneStatus[lessonNum+1] = 'locked';
  }
}
// Sentences marked "needs more work" resurface later instead of disappearing.
function requeueSentence(sentence){
  if(!PROGRESS.capstoneRequeue.some(x=>x.jp===sentence.jp)){
    PROGRESS.capstoneRequeue.push({en:sentence.en, jp:sentence.jp, note:sentence.note, check:sentence.check||null});
  }
}

/* ============================================================
   RENDERING
   ============================================================ */
let activeTab = 'today';
let quizState = null; // {qids, idx, mode:'daily'|'practice', answers}
let capstoneState = null; // {mode:'lesson'|'review'|'requeue', lessonNum, idx, list}

const main = document.getElementById('main');

function setTab(tab){
  activeTab = tab;
  document.querySelectorAll('nav.tabs button').forEach(b=>{
    b.classList.toggle('active', b.dataset.tab===tab);
  });
  quizState = null;
  capstoneState = null;
  if(tab !== 'reading') stopReadingAudio();
  render();
}
document.querySelectorAll('nav.tabs button').forEach(b=>{
  b.addEventListener('click', ()=> setTab(b.dataset.tab));
});

function render(){
  document.getElementById('streakNum').textContent = PROGRESS.streak;
  updateSaveStatusUI();
  if(activeTab==='today') renderToday();
  else if(activeTab==='lessons') renderLessons();
  else if(activeTab==='grammar') renderGrammar();
  else if(activeTab==='conjugate') renderConjugate();
  else if(activeTab==='textbook') renderTextbook();
  else if(activeTab==='reading') renderReading();
  else if(activeTab==='stats') renderStats();
  else if(activeTab==='notes') renderNotes();
}

function renderToday(){
  checkLessonUnlocks();
  const date = todayStr();
  const before = PROGRESS.dailyLog[date];
  const set = ensureTodaysSession(PROGRESS, date, PROGRESS.currentLesson);
  if(set !== before) saveProgress();   // only when a new set was built
  const curLesson = LESSONS.find(l=>l.n===PROGRESS.currentLesson);

  if(quizState){
    renderQuizQuestion();
    return;
  }

  let stampsHtml = '';
  const last14 = [];
  for(let i=13;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const ds = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,'0')+"-"+String(d.getDate()).padStart(2,'0');
    last14.push(ds);
  }
  last14.forEach(ds=>{
    const filled = PROGRESS.stampDates.includes(ds);
    const day = Number(ds.split('-')[2]);
    stampsHtml += `<div class="stamp ${filled?'filled':'empty'}">${filled?'済':day}</div>`;
  });

  const answeredCount = Object.keys(set.answers||{}).length;
  let dotsHtml = '';
  set.qids.forEach(qid=>{
    const ans = set.answers ? set.answers[qid] : null;
    let cls = 'dot';
    if(ans!==undefined && ans!==null){ cls += ans.correct ? ' done' : ' wrong'; }
    dotsHtml += `<div class="${cls}"></div>`;
  });

  const capstoneAvailable = PROGRESS.capstoneStatus[PROGRESS.currentLesson] === 'available';
  const allDone = set.completed;
  const lessonRemaining = lessonQuestionIds(PROGRESS.currentLesson).filter(qid => !PROGRESS.seen[qid] || PROGRESS.seen[qid].count===0).length;

  main.innerHTML = `
    <div class="card"><div class="card-inner">
      <div class="section-title">Today &mdash; ${date}</div>
      <p class="muted">Lesson ${PROGRESS.currentLesson} in rotation &middot; ${curLesson.title}</p>
      <div class="dots">${dotsHtml}</div>
      ${ allDone
        ? `<p class="muted" style="margin-top:14px;">Done for today &mdash; all ${set.qids.length} questions finished${capstoneAvailable ? '. Take on the lesson capstone below whenever you\'re ready.' : '.'}</p>`
        : `<button class="primary" id="startQuizBtn" style="margin-top:8px;">${answeredCount>0 ? 'Continue session' : "Start today's session"}</button>`
      }
      <div class="stampcard">${stampsHtml}</div>
      <p class="muted" style="font-size:11px;">Stamp trail &middot; last 14 days</p>
    </div></div>

    <div class="card"><div class="card-inner">
      <div class="section-title" style="font-size:17px;">Keep Going</div>
      <p class="muted">Not limited to once a day &mdash; drill Lesson ${PROGRESS.currentLesson} whenever you like to unlock its capstone and move on to the next lesson.</p>
      <button class="ghost" id="practiceBtn" style="margin-top:10px;">${lessonRemaining>0 ? `Practice Lesson ${PROGRESS.currentLesson} (${lessonRemaining} new)` : `Review Lesson ${PROGRESS.currentLesson} Again`}</button>
    </div></div>

    ${capstoneAvailable ? `
    <div class="card"><div class="card-inner">
      <div class="section-title">Lesson ${PROGRESS.currentLesson} Capstone Unlocked</div>
      <p class="muted">${curLesson.title} &middot; Translate short English sentences into Japanese using this lesson's grammar and vocabulary.</p>
      <button class="primary" id="startCapstoneBtn" style="margin-top:10px;">Begin Capstone</button>
    </div></div>` : '' }

    ${ (() => {
      const readyBlock = REVIEW_CAPSTONES.find(rc => PROGRESS.reviewCapstoneStatus[rc.block]==='available');
      if(!readyBlock) return '';
      return `
    <div class="card"><div class="card-inner">
      <div class="section-title">${readyBlock.title} Unlocked</div>
      <p class="muted">A cumulative check-in combining grammar from lessons ${readyBlock.block-4}&ndash;${readyBlock.block}, so earlier patterns don't fade as you move on.</p>
      <button class="primary" id="startReviewCapstoneBtn" data-block="${readyBlock.block}" style="margin-top:10px;">Begin Review</button>
    </div></div>`;
    })() }

    ${ PROGRESS.capstoneRequeue.length>0 ? `
    <div class="card"><div class="card-inner">
      <div class="section-title" style="font-size:17px;">Needs More Work (${PROGRESS.capstoneRequeue.length})</div>
      <p class="muted">Capstone sentences you marked "needs more work" — they stay here until you get them right.</p>
      <button class="ghost" id="startRequeueBtn" style="margin-top:10px;">Review Them</button>
    </div></div>` : '' }

    ${ (PROGRESS.currentLesson>1 || Object.values(PROGRESS.capstoneStatus).some(s=>s==='done')) ? `
    <div class="card"><div class="card-inner">
      <div class="section-title" style="font-size:16px;">Progress</div>
      <p class="muted">Lessons completed: ${Object.values(PROGRESS.capstoneStatus).filter(s=>s==='done').length} / 25 &middot; Currently on Lesson ${PROGRESS.currentLesson}</p>
    </div></div>` : ''}
  `;

  const startBtn = document.getElementById('startQuizBtn');
  if(startBtn) startBtn.addEventListener('click', ()=>{
    quizState = { qids: set.qids, idx: firstUnansweredIndex(set), mode:'daily', answers:{}, date };
    renderQuizQuestion();
  });
  const practiceBtn = document.getElementById('practiceBtn');
  if(practiceBtn) practiceBtn.addEventListener('click', ()=>{
    quizState = { qids: buildPracticeSet(), idx: 0, mode:'practice', answers:{} };
    renderQuizQuestion();
  });
  const capBtn = document.getElementById('startCapstoneBtn');
  if(capBtn) capBtn.addEventListener('click', ()=> startLessonCapstone(PROGRESS.currentLesson));

  const reviewBtn = document.getElementById('startReviewCapstoneBtn');
  if(reviewBtn) reviewBtn.addEventListener('click', ()=> startReviewCapstone(Number(reviewBtn.dataset.block)));

  const requeueBtn = document.getElementById('startRequeueBtn');
  if(requeueBtn) requeueBtn.addEventListener('click', startRequeueCapstone);
}

function renderQuizQuestion(){
  const isDaily = quizState.mode === 'daily';
  const dailySet = isDaily ? PROGRESS.dailyLog[quizState.date || todayStr()] : null;

  if(quizState.idx >= quizState.qids.length){
    const qids = quizState.qids;
    if(isDaily){
      dailySet.completed = true;
      updateStreakOnComplete();
    }
    checkLessonUnlocks();
    saveProgress();
    quizState = null;
    if(isDaily){
      document.getElementById('streakNum').textContent = PROGRESS.streak;
      renderDoneScreen(dailySet.answers || {}, qids);
      return;
    }
    render();
    return;
  }
  const qid = quizState.qids[quizState.idx];
  const q = qByQid(qid);
  const alreadyAnswered = quizState.answers[qid];
  if(itemType(qid) !== 'mc'){
    renderTypedQuestion(qid, q);
    return;
  }

  main.innerHTML = `
    <div class="card"><div class="card-inner">
      <div class="qmeta">${quizMetaLine(q)}</div>
      <p class="qprompt">${q.prompt}</p>
      <div class="choices" id="choicesWrap"></div>
      <div id="feedbackArea"></div>
      <div class="nextbar" id="nextBar" style="display:none;">
        <button class="primary" id="nextBtn">Next &rarr;</button>
      </div>
    </div></div>
  `;
  const wrap = document.getElementById('choicesWrap');
  q.choices.forEach((choiceText, i)=>{
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = choiceText;
    btn.addEventListener('click', ()=> selectAnswer(qid, q, i));
    wrap.appendChild(btn);
  });

  if(alreadyAnswered){
    lockChoices(q, alreadyAnswered.picked);
  }
}

function selectAnswer(qid, q, pickedIdx){
  const isDaily = quizState.mode === 'daily';
  const correct = pickedIdx === q.a;
  quizState.answers[qid] = { picked: pickedIdx, correct };

  if(isDaily){
    const dailySet = PROGRESS.dailyLog[quizState.date || todayStr()];
    if(!dailySet.answers) dailySet.answers = {};
    dailySet.answers[qid] = { picked: pickedIdx, correct };
  }

  recordResult(qid, correct);

  saveProgress();
  lockChoices(q, pickedIdx);
}

// ---------- Typed questions ----------

// Meta line shared by multiple-choice and typed screens.
function quizMetaLine(q){
  const label = quizState.mode==='daily' ? 'Today’s Quiz' : quizState.mode==='conjugation' ? 'Conjugation Drill' : 'Practice Round';
  return `${q.kind==='conj' ? 'Conjugation Drill' : 'Lesson '+q.lesson} &middot; ${q.type} &middot; ${label} &middot; Question ${quizState.idx+1} of ${quizState.qids.length}`;
}

// Both lines of the "Not quite" diff come from one diffChars result.
// You: your characters only (same + del, del struck out). Model: same + add (add underlined).
function diffLinesHtml(yours, modelKana){
  const d = diffChars(yours, modelKana);
  const span = (x, op) => `<span class="diff-${op}">${escapeHtml(x.ch)}</span>`;
  const youHtml = d.filter(x=>x.op!=='add').map(x=> x.op==='del' ? span(x,'del') : escapeHtml(x.ch)).join('');
  const modelHtml = d.filter(x=>x.op!=='del').map(x=> x.op==='add' ? span(x,'add') : escapeHtml(x.ch)).join('');
  return { youHtml, modelHtml };
}

// Verb and form key behind a conjs-<verbIdx>-<formKey>-<frameIdx> id.
function conjParts(qid){
  const parts = qid.split('-');
  return { verb: VERBS[Number(parts[1])], formKey: parts[2] };
}

// Typed screen for sentence and conjugation-in-sentence items. The result is
// held until Next so "I was right" can still flip it; only then is it recorded.
function renderTypedQuestion(qid, q){
  const isConj = q.kind === 'conj';
  const promptHtml = isConj
    ? `<p class="qprompt">${escapeHtml(q.promptEn)}</p>
       <p class="frame-jp">${escapeHtml(q.frameJp).replace('___', '<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;</span>')} <span class="muted">(${escapeHtml(q.dict)})</span></p>`
    : `<p class="qprompt">${escapeHtml(q.promptEn)}</p>
       <p class="muted typed-hint">${escapeHtml(q.hint)}</p>`;

  main.innerHTML = `
    <div class="card"><div class="card-inner">
      <div class="qmeta">${quizMetaLine(q)}</div>
      ${promptHtml}
      <div class="typed-row">
        <input type="text" id="typedInput" class="typed-input" lang="ja" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off" placeholder="${isConj ? 'Type the missing word' : 'Type in Japanese or romaji'}">
        <button class="primary" id="checkBtn">Check</button>
      </div>
      <div id="feedbackArea"></div>
      <div class="nextbar" id="nextBar" style="display:none;">
        <button class="primary" id="nextBtn">Next &rarr;</button>
      </div>
    </div></div>
  `;
  const input = document.getElementById('typedInput');
  const checkBtn = document.getElementById('checkBtn');
  input.focus();

  let finalCorrect = null;
  function runCheck(){
    if(finalCorrect !== null) return;
    const value = input.value;
    const res = checkTyped(value, q.model);
    if(res.kind === 'empty') return;   // nothing typed: no verdict, nothing recorded
    finalCorrect = res.correct;
    input.disabled = true;
    checkBtn.style.display = 'none';
    showTypedVerdict(qid, q, value, res, ()=>{ finalCorrect = true; });
    document.getElementById('nextBar').style.display = 'flex';
    document.getElementById('nextBtn').onclick = ()=> finishTyped(qid, value, finalCorrect);
  }
  checkBtn.addEventListener('click', runCheck);
  input.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){ e.preventDefault(); runCheck(); }
  });
}

function showTypedVerdict(qid, q, value, res, markCorrect){
  const area = document.getElementById('feedbackArea');
  // No furigana helper exists in the app, so the model is shown as stored.
  const modelHtml = `<div class="verdict-model">${escapeHtml(q.model)}</div>`;
  if(res.correct){
    area.innerHTML = `<div class="feedback-note verdict-ok"><strong>Correct</strong>${modelHtml}</div>`;
    return;
  }
  const isConj = q.kind === 'conj';
  const diff = diffLinesHtml(normalizeAnswer(value), res.expected);
  let specific = '';
  // Conjugation items skip particle diagnosis so diagnoseConj gets its turn.
  if(res.kind === 'particle' && !isConj){
    specific = `Particle: you used ${res.used}, this needs ${res.needed}.`;
  } else if(isConj){
    const { verb, formKey } = conjParts(qid);
    specific = diagnoseConj(verb, formKey, value) || '';
  }
  const why = isConj ? [q.use, q.explain] : [q.explain];
  area.innerHTML = `
    <div class="feedback-note verdict-bad">
      <div id="verdictStatus"><strong>Not quite</strong></div>
      <div class="diff-block">
        <div class="diff-line"><span class="diff-label">You</span> ${diff.youHtml}</div>
        <div class="diff-line"><span class="diff-label">Model</span> ${diff.modelHtml}</div>
      </div>
      ${modelHtml}
      ${specific ? `<p class="verdict-line">${escapeHtml(specific)}</p>` : ''}
      ${why.filter(Boolean).map(t=>`<p class="verdict-line">${escapeHtml(t)}</p>`).join('')}
      <button class="ghost" id="rightBtn" style="margin-top:8px;">I was right</button>
    </div>`;
  document.getElementById('rightBtn').addEventListener('click', ()=>{
    markCorrect();
    document.getElementById('verdictStatus').innerHTML = '<strong>Counted as correct.</strong>';
    document.getElementById('rightBtn').remove();
  });
}

// Writes a typed result (called when Next is pressed) and moves on.
function finishTyped(qid, input, correct){
  recordResult(qid, correct);
  quizState.answers[qid] = { correct, typed: input };
  if(quizState.mode === 'daily'){
    const dailySet = PROGRESS.dailyLog[quizState.date || todayStr()];
    if(!dailySet.answers) dailySet.answers = {};
    dailySet.answers[qid] = { correct, typed: input };
  }
  saveProgress();
  quizState.idx += 1;
  renderQuizQuestion();
}

// End-of-day summary: score, streak, and what was missed with the right answer.
function renderDoneScreen(answers, qids){
  const correctCount = qids.filter(qid => answers[qid] && answers[qid].correct).length;
  const missed = qids.filter(qid => !(answers[qid] && answers[qid].correct));
  const missedHtml = missed.map(qid=>{
    const q = qByQid(qid);
    const prompt = q.type === 'typed' ? q.promptEn : q.prompt;
    const answer = q.type === 'typed' ? q.model : q.choices[q.a];
    return `<li><div class="missed-prompt">${escapeHtml(prompt)}</div><div class="missed-answer">${escapeHtml(answer)}</div></li>`;
  }).join('');
  main.innerHTML = `
    <div class="card"><div class="card-inner">
      <div class="section-title">Done for today</div>
      <p class="done-score">${correctCount} / ${qids.length} correct</p>
      <p class="muted">Streak: ${PROGRESS.streak} day${PROGRESS.streak===1?'':'s'}</p>
      ${missed.length ? `<div class="section-title" style="font-size:16px; margin-top:18px;">Missed</div><ul class="missed-list">${missedHtml}</ul>` : '<p class="muted">No misses today.</p>'}
      <div class="done-actions">
        <button class="ghost" id="anotherRoundBtn">Another round</button>
        <button class="primary" id="backTodayBtn">Back to Today</button>
      </div>
    </div></div>
  `;
  document.getElementById('anotherRoundBtn').addEventListener('click', ()=>{
    quizState = { qids: buildPracticeSet(), idx: 0, mode:'practice', answers:{} };
    renderQuizQuestion();
  });
  document.getElementById('backTodayBtn').addEventListener('click', ()=>{
    quizState = null;
    render();
  });
}

function lockChoices(q, pickedIdx){
  const wrap = document.getElementById('choicesWrap');
  Array.from(wrap.children).forEach((btn, i)=>{
    btn.disabled = true;
    if(i===q.a) btn.classList.add('correct');
    else if(i===pickedIdx) btn.classList.add('incorrect');
  });
  document.getElementById('feedbackArea').innerHTML = `<div class="feedback-note">${q.note}</div>`;
  document.getElementById('nextBar').style.display = 'flex';
  document.getElementById('nextBtn').onclick = ()=>{
    quizState.idx += 1;
    renderQuizQuestion();
  };
}

// capstoneState shapes:
//   {mode:'lesson',  lessonNum, idx, list: lesson.cap}
//   {mode:'review',  lessonNum: block, idx, list: reviewSet.cap}
//   {mode:'requeue', idx, list: snapshot of PROGRESS.capstoneRequeue}
function startLessonCapstone(lessonNum){
  const lesson = LESSONS.find(l=>l.n===lessonNum);
  capstoneState = { mode:'lesson', lessonNum, idx:0, list: lesson.cap };
  renderCapstone();
}
function startReviewCapstone(block){
  const rc = REVIEW_CAPSTONES.find(r=>r.block===block);
  capstoneState = { mode:'review', lessonNum: block, idx:0, list: rc.cap };
  renderCapstone();
}
function startRequeueCapstone(){
  capstoneState = { mode:'requeue', idx:0, list: PROGRESS.capstoneRequeue.slice() };
  renderCapstone();
}
function renderCapstone(){
  const sentence = capstoneState.list[capstoneState.idx];
  const isLast = capstoneState.idx === capstoneState.list.length - 1;
  const heading = capstoneState.mode==='lesson' ? `Lesson ${capstoneState.lessonNum} Capstone`
    : capstoneState.mode==='review' ? REVIEW_CAPSTONES.find(r=>r.block===capstoneState.lessonNum).title
    : 'Needs-Work Review';

  main.innerHTML = `
    <div class="card"><div class="card-inner">
      <div class="qmeta">${heading} &middot; ${capstoneState.idx+1} of ${capstoneState.list.length}</div>
      <p class="en-sentence">&ldquo;${sentence.en}&rdquo;</p>
      <textarea id="capInput" placeholder="Type your Japanese translation here..."></textarea>
      <div style="margin-top:14px;" id="capActionArea">
        <button class="primary" id="revealBtn">Show Model Answer</button>
      </div>
      <div id="capAnswerArea"></div>
    </div></div>
  `;

  document.getElementById('revealBtn').addEventListener('click', ()=>{
    const checkHtml = sentence.check ? `
      <div class="feedback-note" style="margin-top:12px;">
        <b>Check your answer for:</b>
        <ul style="margin:8px 0 0; padding-left:18px;">${sentence.check.map(c=>`<li style="margin-bottom:4px;">${c}</li>`).join('')}</ul>
      </div>` : '';
    document.getElementById('capAnswerArea').innerHTML = `
      <div class="model-answer">
        <div class="jp">${sentence.jp}</div>
        <div class="note">${sentence.note}</div>
      </div>
      ${checkHtml}
      <div class="selfgrade">
        <button class="ghost" id="gotItBtn">✓ Got it right</button>
        <button class="ghost" id="retryBtn">Needs more work</button>
      </div>
    `;
    document.getElementById('capActionArea').innerHTML = '';
    document.getElementById('gotItBtn').addEventListener('click', ()=> gradeCapstone(true));
    document.getElementById('retryBtn').addEventListener('click', ()=> gradeCapstone(false));
  });

  function gradeCapstone(good){
    if(capstoneState.mode==='lesson'){
      if(!PROGRESS.capstoneResults[capstoneState.lessonNum]) PROGRESS.capstoneResults[capstoneState.lessonNum] = {};
      PROGRESS.capstoneResults[capstoneState.lessonNum][capstoneState.idx] = good ? 'good' : 'retry';
      if(!good) requeueSentence(sentence);
    } else if(capstoneState.mode==='review'){
      if(!good) requeueSentence(sentence);
    } else if(capstoneState.mode==='requeue' && good){
      PROGRESS.capstoneRequeue = PROGRESS.capstoneRequeue.filter(x=>x.jp!==sentence.jp);
    }
    saveProgress();
    if(isLast){
      if(capstoneState.mode==='lesson') completeCapstone(capstoneState.lessonNum);
      else if(capstoneState.mode==='review') PROGRESS.reviewCapstoneStatus[capstoneState.lessonNum] = 'done';
      saveProgress();
      capstoneState = null;
      setTab('today');
    } else {
      capstoneState.idx += 1;
      renderCapstone();
    }
  }
}

function renderLessons(){
  let rows = '';
  LESSONS.forEach(l=>{
    const status = PROGRESS.capstoneStatus[l.n] || (l.n < PROGRESS.currentLesson ? 'done' : (l.n===PROGRESS.currentLesson ? 'locked' : 'locked'));
    let label = 'Locked', cls = '';
    if(status==='done'){ label='Complete'; cls='done'; }
    else if(status==='available'){ label='Capstone Ready'; cls='avail'; }
    else if(l.n===PROGRESS.currentLesson){ label='In Progress'; cls='avail'; }
    const rowCls = status==='done' ? 'done' : (l.n<=PROGRESS.currentLesson ? 'unlocked' : '');
    rows += `
      <div class="lesson-row ${rowCls}" data-lesson="${l.n}">
        <div class="lesson-num">${String(l.n).padStart(2,'0')}</div>
        <div class="lesson-title"><b>${l.title}</b><span>${l.topic}</span></div>
        <div class="lesson-status ${cls}">${label}</div>
      </div>
    `;
  });
  main.innerHTML = `<div class="card"><div class="card-inner">
    <div class="section-title">25 Lessons</div>
    <p class="muted">Tap an unlocked lesson to review its capstone.</p>
    ${rows}
  </div></div>`;

  document.querySelectorAll('.lesson-row').forEach(row=>{
    row.addEventListener('click', ()=>{
      const n = Number(row.dataset.lesson);
      const status = PROGRESS.capstoneStatus[n];
      if(status==='available' || status==='done'){
        activeTab = 'today';
        document.querySelectorAll('nav.tabs button').forEach(b=> b.classList.toggle('active', b.dataset.tab==='today'));
        startLessonCapstone(n);
      }
    });
  });
}

let openParticle = null; // currently expanded particle in the accordion

function renderGrammar(){
  let structureHtml = SENTENCE_STRUCTURE.map(s => `
    <div class="gstruct">
      <div class="gstruct-title">${s.title}</div>
      <p class="muted" style="margin:6px 0 10px;">${s.body}</p>
      <div class="gexample">
        <div class="gexample-jp">${s.example.jp}</div>
        <div class="gexample-en">${s.example.en}</div>
        <div class="gexample-note">${s.example.note}</div>
      </div>
    </div>
  `).join('');

  let particleRows = PARTICLES.map((pt, i) => {
    const open = openParticle === i;
    const examplesHtml = pt.examples.map(ex => `
      <div class="gexample">
        <div class="gexample-jp">${ex.jp}</div>
        <div class="gexample-en">${ex.en}</div>
      </div>
    `).join('');
    return `
      <div class="particle-row">
        <button class="particle-head" data-idx="${i}">
          <span class="particle-char">${pt.p}</span>
          <span class="particle-role">${pt.role}</span>
          <span class="particle-level">${pt.level}</span>
          <span class="particle-caret">${open ? '\u2212' : '+'}</span>
        </button>
        <div class="particle-body" style="display:${open?'block':'none'};">
          <p class="muted" style="margin:10px 0;">${pt.explain}</p>
          <div class="gpattern">${pt.pattern}</div>
          ${examplesHtml}
          ${pt.confuse ? `<div class="feedback-note" style="margin-top:12px;">${pt.confuse}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  main.innerHTML = `
    <div class="card"><div class="card-inner">
      <div class="section-title">Sentence Structure Basics</div>
      <p class="muted">The core shape of a Japanese sentence, before diving into individual particles.</p>
      ${structureHtml}
    </div></div>

    <div class="card"><div class="card-inner">
      <div class="section-title">Particle Reference</div>
      <p class="muted">Tap a particle to see how it's used, with example sentences. Covers Minna no Nihongo I (Lessons 1&ndash;25) plus standard JLPT N4 particles.</p>
      <div class="particle-list">${particleRows}</div>
    </div></div>
  `;

  document.querySelectorAll('.particle-head').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = Number(btn.dataset.idx);
      openParticle = (openParticle === idx) ? null : idx;
      renderGrammar();
    });
  });
}

function renderConjugate(){
  if(quizState){ renderQuizQuestion(); return; }

  const godanRowHtml = Object.keys(GODAN_ROWS).map(k=>{
    const row = GODAN_ROWS[k], teTa = TE_TA_MAP[k];
    return `<div class="barrow" style="font-family:'JetBrains Mono',monospace; font-size:12px;">
      <div class="lname" style="width:36px;">${k}〜</div>
      <div style="flex:1; display:grid; grid-template-columns:repeat(5,1fr); gap:4px;">
        <span>〜${row[1]}ます</span><span>〜${row[0]}ない</span><span>〜${teTa.te}</span><span>〜${teTa.ta}</span><span>〜${row[3]}る</span>
      </div>
    </div>`;
  }).join('');

  const seenConj = CONJ_SENTENCE_POOL.filter(it=>PROGRESS.seen[it.qid] && PROGRESS.seen[it.qid].count>0).length;

  main.innerHTML = `
    <div class="card"><div class="card-inner">
      <div class="section-title">Conjugation Drill</div>
      <p class="muted">Drill any verb in any form inside a real sentence, independent of your lesson pace. Type the conjugated verb; if you slip, you'll see which rule you broke (verb group, godan branch, or wrong tense).</p>
      <p class="muted" style="margin-top:10px; font-size:12px;">${VERBS.length} verbs &middot; ${Object.keys(FORM_LABELS).length} forms each &middot; ${seenConj}/${CONJ_SENTENCE_POOL.length} sentence drills practiced so far</p>
      <button class="primary" id="startConjDrillBtn" style="margin-top:14px;">Start Conjugation Drill</button>
    </div></div>

    <div class="card"><div class="card-inner">
      <div class="section-title" style="font-size:17px;">Reference &mdash; the three groups</div>
      <div class="gstruct">
        <div class="gstruct-title">Group 1 &mdash; godan / う-verbs</div>
        <p class="muted" style="margin:6px 0 10px;">Every form branches off the verb's final kana. This is the branch table &mdash; memorize the row, not each verb individually.</p>
        <div style="border:1px solid var(--line); padding:10px 12px; margin-top:6px;">${godanRowHtml}</div>
        <div class="gexample-note" style="margin-top:10px;">Watch for traps: 帰る・入る・要る・知る・走る all end in る but are godan, not ichidan &mdash; conjugate them off this table, not the Group 2 rule below.</div>
      </div>
      <div class="gstruct">
        <div class="gstruct-title">Group 2 &mdash; ichidan / る-verbs</div>
        <p class="muted" style="margin:6px 0 10px;">Drop る, then attach the ending directly &mdash; no branching. 食べる → 食べます・食べない・食べて・食べた・食べられる・食べよう.</p>
      </div>
      <div class="gstruct">
        <div class="gstruct-title">Group 3 &mdash; irregular</div>
        <p class="muted" style="margin:6px 0 10px;">Only する and 来る (plus noun＋する compounds like 勉強する). Both are memorized outright: します／して／した／しない, and 来る shifts reading between き and こ depending on the form.</p>
      </div>
    </div></div>
  `;

  document.getElementById('startConjDrillBtn').addEventListener('click', ()=>{
    const ids = weightedSample(allConjSentenceIds(), boxWeight, Math.min(15, CONJ_SENTENCE_POOL.length));
    quizState = { qids: ids, idx:0, mode:'conjugation', answers:{} };
    renderQuizQuestion();
  });
}

let openTextbookLesson = null; // currently expanded lesson in the N5 Textbook accordion

function renderTextbook(){
  const rows = TEXTBOOK.map(l => {
    const lessonMeta = LESSONS.find(x=>x.n===l.n);
    const open = openTextbookLesson === l.n;

    const vocabHtml = l.vocab.map(v => `
      <div class="tb-vocab-row"><span class="tb-vocab-jp">${v.jp}</span><span class="tb-vocab-en">${v.en}</span></div>
    `).join('');

    const patternsHtml = l.patterns.map(p => `
      <div class="tb-pattern">
        <div class="tb-pattern-title">${p.title}</div>
        <p class="muted" style="margin:6px 0 10px;">${p.explain}</p>
        ${p.examples.map(ex => `
          <div class="gexample">
            <div class="gexample-jp">${ex.jp}</div>
            <div class="gexample-en">${ex.en}</div>
          </div>
        `).join('')}
      </div>
    `).join('');

    return `
      <div class="tb-lesson">
        <button class="tb-lesson-head" data-lesson="${l.n}">
          <span class="tb-lesson-num">${String(l.n).padStart(2,'0')}</span>
          <span class="tb-lesson-title-wrap"><b>${lessonMeta.title}</b><span>${lessonMeta.topic}</span></span>
          <span class="particle-caret">${open ? '\u2212' : '+'}</span>
        </button>
        <div class="tb-lesson-body" style="display:${open?'block':'none'};">
          <div class="tb-section-label">I. Vocabulary</div>
          <div class="tb-vocab-list">${vocabHtml}</div>
          <div class="tb-section-label" style="margin-top:18px;">II. Sentence Patterns</div>
          ${patternsHtml}
        </div>
      </div>
    `;
  }).join('');

  main.innerHTML = `
    <div class="card"><div class="card-inner">
      <div class="section-title">N5 Textbook</div>
      <p class="muted">A full vocabulary and grammar reference for all 25 lessons of Minna no Nihongo I, covering JLPT N5 (and into N4). Tap a lesson to open it.</p>
    </div></div>
    <div class="card"><div class="card-inner">
      <div class="tb-lesson-list">${rows}</div>
    </div></div>
  `;

  document.querySelectorAll('.tb-lesson-head').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const n = Number(btn.dataset.lesson);
      openTextbookLesson = (openTextbookLesson === n) ? null : n;
      renderTextbook();
      if(openTextbookLesson === n){
        btn.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });
}

/* ============================================================
   READING — short N5 passages with a translation toggle and an
   ElevenLabs-narrated Listen button (pre-generated static audio files,
   see audio/reading/). Follows the same expand/toggle + re-render
   pattern as renderGrammar/renderTextbook above.
   ============================================================ */
let revealedReading = new Set(); // passage ids currently showing their translation
let readingAudio = null;         // the Audio object currently loaded/playing, if any
let readingPlaybackId = null;    // passage id that owns readingAudio
let readingPlaybackState = null; // 'loading' | 'playing' | null

function stopReadingAudio(){
  if(readingAudio){
    readingAudio.pause();
    readingAudio.src = '';
  }
  readingAudio = null;
  readingPlaybackId = null;
  readingPlaybackState = null;
}

function renderReading(){
  const cards = READING.map(p => {
    const revealed = revealedReading.has(p.id);
    const isThis = readingPlaybackId === p.id;
    const btnState = isThis ? readingPlaybackState : null;
    const btnLabel = btnState === 'loading' ? 'LOADING…' : btnState === 'playing' ? '■ PLAYING' : '▶ LISTEN';
    const btnClass = btnState ? ` is-${btnState}` : '';

    const jpHtml = p.jp.map(s => `<p class="reading-line">${s}</p>`).join('');

    return `
      <div class="card"><div class="card-inner">
        <div class="reading-head">
          <div>
            <div class="section-title" style="margin-bottom:2px;">${p.title}</div>
            <div class="muted" style="font-size:12px;">${p.titleEn} &middot; ${p.lessons}</div>
          </div>
          <button class="ghost reading-listen${btnClass}" data-id="${p.id}" ${btnState ? 'disabled' : ''}>${btnLabel}</button>
        </div>
        <div class="reading-jp">${jpHtml}</div>
        <button class="reading-toggle" data-id="${p.id}">${revealed ? 'Hide translation' : 'Show translation'}</button>
        <div class="reading-en" style="display:${revealed ? 'block' : 'none'};">${p.en}</div>
      </div></div>
    `;
  }).join('');

  main.innerHTML = `
    <div class="card"><div class="card-inner">
      <div class="section-title">Reading</div>
      <p class="muted">Short N5-level passages built from vocabulary and grammar you've already met in the N5 Textbook. Read first, then reveal the translation to check yourself &mdash; or tap Listen to hear it read aloud.</p>
    </div></div>
    ${cards}
  `;

  document.querySelectorAll('.reading-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      if(revealedReading.has(id)) revealedReading.delete(id);
      else revealedReading.add(id);
      renderReading();
    });
  });

  document.querySelectorAll('.reading-listen').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      const passage = READING.find(p=>p.id===id);
      if(!passage) return;

      stopReadingAudio();
      readingPlaybackId = id;
      readingPlaybackState = 'loading';
      renderReading();

      const audio = new Audio(passage.audio);
      audio.playbackRate = 0.7; // slowed down for learners — raw files are normal-speed narration
      readingAudio = audio;

      audio.addEventListener('playing', ()=>{
        if(readingPlaybackId===id){ readingPlaybackState = 'playing'; renderReading(); }
      });
      audio.addEventListener('ended', ()=>{
        if(readingPlaybackId===id){ stopReadingAudio(); renderReading(); }
      });
      audio.addEventListener('error', ()=>{
        if(readingPlaybackId===id){ stopReadingAudio(); renderReading(); }
      });
      audio.play().catch(()=>{
        if(readingPlaybackId===id){ stopReadingAudio(); renderReading(); }
      });
    });
  });
}

function renderStats(){
  const seenIds = Object.keys(PROGRESS.seen);
  let totalAttempts=0, totalCorrect=0;
  seenIds.forEach(id=>{
    totalAttempts += PROGRESS.seen[id].count;
    totalCorrect += PROGRESS.seen[id].correct;
  });
  const acc = totalAttempts>0 ? Math.round(100*totalCorrect/totalAttempts) : 0;
  const lessonsDone = Object.values(PROGRESS.capstoneStatus).filter(s=>s==='done').length;

  let barsHtml = '';
  LESSONS.filter(l=>l.n<=PROGRESS.currentLesson).forEach(l=>{
    const ids = lessonQuestionIds(l.n);
    let att=0, cor=0;
    ids.forEach(id=>{
      if(PROGRESS.seen[id]){ att+=PROGRESS.seen[id].count; cor+=PROGRESS.seen[id].correct; }
    });
    const pct = att>0 ? Math.round(100*cor/att) : 0;
    barsHtml += `
      <div class="barrow">
        <div class="lname">L${l.n}</div>
        <div class="barwrap"><div class="barfill" style="width:${pct}%"></div></div>
        <div style="width:34px; text-align:right; font-family:'JetBrains Mono',monospace; font-size:11px;">${pct}%</div>
      </div>
    `;
  });

  main.innerHTML = `
    <div class="statgrid">
      <div class="statbox"><div class="num">${PROGRESS.streak}</div><div class="lbl">Day Streak</div></div>
      <div class="statbox"><div class="num">${acc}%</div><div class="lbl">Overall Accuracy</div></div>
      <div class="statbox"><div class="num">${lessonsDone}/25</div><div class="lbl">Lessons Complete</div></div>
      <div class="statbox"><div class="num">${PROGRESS.totalStamps}</div><div class="lbl">Total Stamps</div></div>
    </div>
    <div class="card"><div class="card-inner">
      <div class="section-title" style="font-size:17px;">Mastery by Lesson</div>
      <p class="muted">Accuracy across all attempts so far, current lesson and earlier.</p>
      <div style="margin-top:16px;">${barsHtml || '<p class="muted">Answer some questions to see lesson breakdowns here.</p>'}</div>
    </div></div>

    <div class="card"><div class="card-inner">
      <div class="section-title" style="font-size:17px;">Backup &amp; Restore</div>
      <p class="muted">
        ${STORAGE_MODE==='local'
          ? "Progress currently saves to this browser's storage. Clearing your browser data will erase it, so download a backup now and then to be safe."
          : STORAGE_MODE==='cloud'
            ? "Progress saves to your Claude.ai account automatically. A backup file is still handy if you want to move your progress to a locally-opened copy of this file."
            : "This browser doesn't support saved storage right now, so progress will reset when you close the page. Download a backup before closing so you can restore it next time."}
      </p>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
        <button class="ghost" id="exportBtn">Download Backup (.json)</button>
        <label class="ghost" for="importFile" style="display:inline-block; cursor:pointer;">Restore From Backup</label>
        <input type="file" id="importFile" accept="application/json" style="display:none;">
      </div>
    </div></div>
  `;

  document.getElementById('exportBtn').addEventListener('click', exportBackup);
  document.getElementById('importFile').addEventListener('change', (e)=>{
    if(e.target.files && e.target.files[0]) importBackup(e.target.files[0]);
  });
}

/* ============================================================
   MY NOTES — each saved note is its own bar/card, stored in
   PROGRESS.notes (an array) so it syncs/backs up alongside quiz
   progress. A search box filters the list by text.
   ============================================================ */
let notesSearchQuery = '';

function formatNoteDate(ts){
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})
    + ' · ' + d.toLocaleTimeString(undefined, {hour:'numeric', minute:'2-digit'});
}

function renderNotesList(){
  const listEl = document.getElementById('notesList');
  if(!listEl) return;
  const q = notesSearchQuery.trim().toLowerCase();
  const all = PROGRESS.notes || [];
  const filtered = q ? all.filter(n => n.text.toLowerCase().includes(q)) : all;
  const sorted = filtered.slice().sort((a,b)=> b.createdAt - a.createdAt);

  if(all.length===0){
    listEl.innerHTML = `<p class="muted">No notes yet &mdash; write your first one above.</p>`;
  } else if(sorted.length===0){
    listEl.innerHTML = `<p class="muted">No notes match &ldquo;${escapeHtml(notesSearchQuery)}&rdquo;.</p>`;
  } else {
    listEl.innerHTML = sorted.map(n => `
      <div class="card note-card"><div class="card-inner">
        <div class="note-card-header">
          <span class="note-card-date">${formatNoteDate(n.createdAt)}</span>
          <button class="linklike-delete" data-id="${n.id}">Delete</button>
        </div>
        <div class="note-card-text">${escapeHtml(n.text)}</div>
      </div></div>
    `).join('');
  }

  listEl.querySelectorAll('.linklike-delete').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      PROGRESS.notes = (PROGRESS.notes || []).filter(n => n.id !== btn.dataset.id);
      saveProgress();
      renderNotesList();
    });
  });
}

function renderNotes(){
  main.innerHTML = `
    <div class="card"><div class="card-inner">
      <div class="section-title">My Notes</div>
      <p class="muted">Write mnemonics, grammar you want to remember, or questions to look up later. Each saved note becomes its own entry below.</p>
      <input type="text" id="notesSearch" placeholder="Search notes…" value="${escapeHtml(notesSearchQuery)}" style="width:100%; font-family:'Zen Kaku Gothic New',sans-serif; font-size:15px; border:1.5px solid var(--ink); background:var(--paper); padding:10px 12px; margin-top:14px;">
    </div></div>

    <div class="card"><div class="card-inner">
      <div class="section-title" style="font-size:17px;">New Note</div>
      <textarea id="notesArea" class="notes-textarea" placeholder="Write a note…"></textarea>
      <div class="notes-savebar">
        <span class="notes-savestatus" id="notesSaveStatus"></span>
        <button class="primary" id="notesSaveBtn">Save Now</button>
      </div>
    </div></div>

    <div id="notesList"></div>
  `;

  renderNotesList();

  const area = document.getElementById('notesArea');
  const statusEl = document.getElementById('notesSaveStatus');
  const saveBtn = document.getElementById('notesSaveBtn');
  const searchEl = document.getElementById('notesSearch');

  function saveNewNote(){
    const text = area.value.trim();
    if(!text) return;
    if(!PROGRESS.notes) PROGRESS.notes = [];
    PROGRESS.notes.push({ id: String(Date.now()) + Math.random().toString(36).slice(2,7), text, createdAt: Date.now() });
    area.value = '';
    statusEl.textContent = 'Saved';
    saveProgress();
    renderNotesList();
    setTimeout(()=>{ if(statusEl.textContent==='Saved') statusEl.textContent = ''; }, 1500);
  }

  saveBtn.addEventListener('click', saveNewNote);

  searchEl.addEventListener('input', ()=>{
    notesSearchQuery = searchEl.value;
    renderNotesList();
  });
}

/* ============================================================
   ACCOUNT / SYNC BAR (Firebase email+password login)
   ============================================================ */
let showAuthForm = false;
let authFormMode = 'login'; // 'login' | 'signup'
let authError = '';
let authBusy = false;

function renderAuthBar(){
  const bar = document.getElementById('authBar');
  if(!bar) return;

  if(!FIREBASE_ENABLED){
    bar.innerHTML = '';
    return;
  }

  if(FIREBASE_ENABLED && !FIREBASE_READY){
    bar.innerHTML = `
      <div class="authbar" style="border-color:var(--vermillion); color:var(--vermillion);">
        <span>Sync setup error — check your FIREBASE_CONFIG values in the file (see setup guide).${FIREBASE_INIT_ERROR ? ' Details: ' + (FIREBASE_INIT_ERROR.message || FIREBASE_INIT_ERROR) : ''}</span>
      </div>
    `;
    return;
  }

  if(fbUser){
    bar.innerHTML = `
      <div class="authbar">
        <span>Signed in as <b>${fbUser.email}</b> &middot; syncing across devices</span>
        <button class="linklike" id="signOutBtn">Sign out</button>
      </div>
    `;
    document.getElementById('signOutBtn').addEventListener('click', ()=> fbAuth.signOut());
    return;
  }

  if(!showAuthForm){
    bar.innerHTML = `
      <div class="authbar">
        <span>Not signed in &mdash; progress is only saved on this device</span>
        <button class="linklike" id="openAuthBtn">Sign in to sync</button>
      </div>
    `;
    document.getElementById('openAuthBtn').addEventListener('click', ()=>{ showAuthForm = true; renderAuthBar(); });
    return;
  }

  bar.innerHTML = `
    <div class="card authcard"><div class="card-inner">
      <div class="authtabs">
        <button data-mode="login" class="${authFormMode==='login'?'active':''}">Log In</button>
        <button data-mode="signup" class="${authFormMode==='signup'?'active':''}">Create Account</button>
      </div>
      <div class="authfield">
        <label>Email</label>
        <input type="email" id="authEmail" autocomplete="email" placeholder="you@example.com">
      </div>
      <div class="authfield">
        <label>Password</label>
        <input type="password" id="authPassword" autocomplete="${authFormMode==='signup'?'new-password':'current-password'}" placeholder="At least 6 characters">
      </div>
      ${authError ? `<p class="autherror">${authError}</p>` : ''}
      <div style="display:flex; gap:10px; margin-top:6px;">
        <button class="primary" id="authSubmitBtn">${authBusy ? 'Please wait…' : (authFormMode==='login' ? 'Log In' : 'Create Account')}</button>
        <button class="ghost" id="authCancelBtn">Cancel</button>
      </div>
      <p class="authnote">Your account only unlocks sync for this quiz app &mdash; use any email and password you'll remember. There's no password recovery yet, so keep it somewhere safe.</p>
    </div></div>
  `;
  document.querySelectorAll('.authtabs button').forEach(b=>{
    b.addEventListener('click', ()=>{ authFormMode = b.dataset.mode; authError=''; renderAuthBar(); });
  });
  document.getElementById('authCancelBtn').addEventListener('click', ()=>{ showAuthForm=false; authError=''; renderAuthBar(); });
  document.getElementById('authSubmitBtn').addEventListener('click', submitAuthForm);
}

async function submitAuthForm(){
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  authError = '';
  if(!email || !password){
    authError = 'Please fill in both fields.';
    renderAuthBar();
    return;
  }
  authBusy = true;
  renderAuthBar();
  try{
    if(authFormMode === 'signup'){
      await fbAuth.createUserWithEmailAndPassword(email, password);
    } else {
      await fbAuth.signInWithEmailAndPassword(email, password);
    }
    showAuthForm = false;
    authError = '';
    // onAuthStateChanged below picks up the new session, reloads progress, and re-renders.
  }catch(e){
    authError = friendlyAuthError(e);
  }
  authBusy = false;
  renderAuthBar();
}

function friendlyAuthError(e){
  const code = e && e.code ? e.code : '';
  if(code.includes('email-already-in-use')) return 'That email already has an account — try Log In instead.';
  if(code.includes('wrong-password') || code.includes('user-not-found') || code.includes('invalid-credential')) return 'Email or password not recognized.';
  if(code.includes('weak-password')) return 'Password should be at least 6 characters.';
  if(code.includes('invalid-email')) return 'That email address doesn\u2019t look right.';
  return 'Something went wrong — please try again.';
}

/* ============================================================
   INIT
   ============================================================ */
async function bootProgress(){
  await loadProgress();
  render();
  renderAuthBar();
  main.dataset.loaded = 'true';
}

function showFatalError(e){
  console.error('Nihongo Daily failed to load:', e);
  main.innerHTML = `
    <div class="card"><div class="card-inner">
      <div class="section-title">Couldn't load the app</div>
      <p class="muted" style="margin-top:8px;">${(e && e.message) ? e.message : 'An unexpected error occurred.'}</p>
      <p class="muted" style="margin-top:10px;">Try reloading the page. If this keeps happening, open your browser's developer console (F12 or right-click → Inspect → Console) for the full error, or double-check the FIREBASE_CONFIG values in the file against the setup guide.</p>
    </div></div>
  `;
}

async function init(){
  main.innerHTML = `<div class="empty-state"><div class="glyph">読</div>Loading your progress&hellip;</div>`;
  renderAuthBar();
  if(FIREBASE_READY){
    fbAuth.onAuthStateChanged(async (user)=>{
      try{
        fbUser = user;
        await bootProgress();
      }catch(e){
        showFatalError(e);
      }
    });
  } else {
    try{
      await bootProgress();
    }catch(e){
      showFatalError(e);
    }
  }
}
init();
