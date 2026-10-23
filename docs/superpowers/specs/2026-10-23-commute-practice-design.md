# Commute practice: round one design

Date: 2026-10-23
Status: draft, awaiting approval

## Why

The goal is to speak simple, complete Japanese sentences. Phrasing and verb
conjugation are what break down when speaking. Study happens on a phone with
earphones during the commute, and after 10-15 minutes attention drifts to
social media. The habit is not yet built.

The current app works against this in three ways:

1. **Conjugation questions crowd out everything else.** From lesson 14 on,
   `getTodaysSet()` (js/app.js) samples 12 questions from
   `allQuestionsUpTo()`. That includes about 500 generated conjugation
   questions (52 verbs × ~10 forms) against roughly 100 hand-written lesson
   questions plus the generated vocab/sentence pool. Unseen questions get
   weight 6 in `boxWeight()`, so the large, mostly unseen conjugation pool
   dominates.
2. **The answers are easy to guess.** Many hand-written lesson questions use
   unrelated wrong options (傘 → "Umbrella / Book / Watch / Bag"). In
   `resolveConjugationQuestion()` (js/conjugation.js), when
   `generateMistakes()` returns fewer than 3 mistakes, the gap is filled
   with the same form of *other* verbs. Those have different kanji, so the
   answer stands out.
3. **Everything is recognition.** You pick from a list, which never asks
   you to produce a sentence. Conjugation is asked in isolation ("What's the
   て-form of 書きます?"), so you learn form names, not when to use them.

## Goals

- One-tap, ~10-minute session that ends with a clear "done" screen, sized
  for one commute leg.
- The session is mostly *production*: you type Japanese, not pick it.
- Conjugation is practised inside sentences, capped so it can't dominate.
- Multiple-choice wrong answers are plausible mistakes, not giveaways.
- It works well on a phone (portrait, one hand, on-screen keyboard).

## Non-goals for this round

- Speaking into the mic / speech recognition (decided: typing for now).
- Listen-and-type drills and new audio generation (round two).
- One-form-at-a-time conjugation teaching cards and mastery gating (round two).
- New reward systems (XP, "sentences you can say" counter, unlocks) (round two).
- Changes to Lessons, Grammar, Textbook, Reading, Notes, auth or sync,
  beyond storing new progress fields.

## Anti-goals (failure even if it technically works)

- Sessions that run long or have no visible end. That is the moment the
  phone gets switched to social media.
- Typed answers marked wrong for trivial reasons (spaces, 。, kanji vs kana,
  a valid alternative word order) with no way to overrule it. That makes
  typing feel punishing, and it will be abandoned.
- Feedback that just says "wrong" and shows the answer. Every miss should
  say *what kind* of mistake it was where the app can tell.
- Losing or corrupting existing progress (streak, seen/box data, notes).

## Constraints

- Static site: plain HTML/CSS/JS, no build step, globals across
  `js/*.js` files. Follow the existing code style (small functions,
  template-string rendering, comment blocks explaining intent).
- Progress lives in the `PROGRESS` object and syncs through
  `saveProgress()` (Firebase / Claude storage / localStorage). New fields
  must get defaults in `defaultProgress()` and a migration guard in
  `loadProgress()`, like the existing `capstoneRequeue` guard.
- Sentence data stores readings inline as `漢字（かな）`, e.g.
  `飲（の）みます`. Kana-only answers can be derived from that format.
- No automated test suite exists. Verification is manual in a browser at
  phone width (375px), plus any small pure-function checks the builder
  wants to run in the console.

## What gets built

### 1. Today tab: one fixed session

- The Today tab's main action becomes a single **Start today's session**
  button. It replaces the 12-question daily quiz as the thing that counts
  for the streak.
- A session is **10 items**, built once per day and stored in
  `dailyLog[date]` (same pattern as now, so it resumes if you leave
  mid-way).
- Mix per session:
  - **4 type-the-sentence** items (section 2)
  - **up to 3 conjugation-in-sentence** items (section 3). Hard cap, and 0
    before lesson 14 when no conjugation is unlocked.
  - **the rest multiple choice** (vocab / grammar / structure, hand-written
    and generated), using the improved wrong answers (section 4).
  - Before lesson 14 the conjugation slots go to type-the-sentence first,
    then multiple choice.
- Within each slot type, keep the existing spaced-repetition weighting
  (`weightedSample` + `boxWeight`). The cap is per type, so a big pool can no
  longer flood the session.
- Order: mix the types, don't group them. End on a multiple-choice item so
  the session finishes on something quick.
- **Done screen** at the end: "Done for today", score, the streak, and a
  short list of the items you missed, each with its correct answer. One
  optional button, "Another round", starts the existing unlimited practice
  round. Nothing else nudges you to keep going.
- Streak rule stays as it is: a completed session counts for the day.
- The existing **Practice round** and the **Conjugate tab** drill keep
  working. The Conjugate tab should switch to the new in-sentence format
  (section 3) so there's one way of practising conjugation.

### 2. Type-the-sentence drill

- Prompt: an English sentence from the textbook examples
  (`TEXTBOOK[...].patterns[...].examples[...]` with `jp`/`en`), up to the
  current lesson. The pattern title is shown as a small hint.
- You type the Japanese in a text field and press **Check** (Enter also
  works).
- **Checking.** Normalise both sides, then compare:
  - Strip spaces (half and full width) and punctuation (。、！？!?.,).
  - Convert the model answer to kana-only by replacing each
    `漢字（かな）` with its kana, so `飲（の）みます` → `のみます`.
  - Accept a match against the kana-only form *or* the kanji form (kanji
    with readings removed).
  - Convert katakana in both to hiragana before comparing, so either
    script is accepted.
  - Accept romaji input by converting it to hiragana first. The builder
    may write a small converter or load a pinned version of wanakana from
    cdnjs.
- **Feedback when wrong.**
  - Show your answer and the model answer one above the other, with the
    differing characters highlighted.
  - If the difference is only a particle (one of は が を に で へ と も
    の から まで swapped), say "Particle: you used X, this needs Y" and
    show the pattern's `explain` text.
  - Otherwise show the pattern's `explain` text.
  - *(Designer's call)* Examples have no per-sentence `note` field, so the
    pattern's `explain` is the fallback. Writing ~90 per-sentence notes is
    out of scope for this round.
- **"I was right" override.** Every wrong verdict has a button that
  counts it as correct, for valid alternative word orders or synonyms.
  Overridden answers count as correct for spaced repetition.
- Item IDs: reuse the existing generated `gen-senjp-*` IDs with a typed
  variant prefix (e.g. `type-senjp-*`), so typed and multiple-choice
  history are tracked separately.
- Input field: `lang="ja"`, `autocapitalize="off"`, `autocorrect="off"`,
  `spellcheck="false"`, and large enough to tap easily. On iOS it should
  not zoom the page (font-size ≥ 16px).

### 3. Conjugation inside sentences

- Replaces "What's the X form of Y?" with a sentence that has a blank:
  - The English meaning of the whole sentence is shown.
  - The sentence frame has a blank where the verb goes, with the
    dictionary form in brackets, e.g. `友達（ともだち）に 手紙（てがみ）を ___ ください。 (書く)`
  - You type the conjugated verb, checked with the same normalisation as
    section 2.
- **Frames.** For each form, write 2-3 sentence frames in
  `js/conjugation.js` that fit any verb in that form, each with an English
  template and a one-line "when to use" note. Examples:
  - て-form + ください: "Please ___." (requests)
  - ました: "昨日（きのう）、___。" "Yesterday I ___." (finished past action)
  - ない + でください: "Please don't ___." (negative requests)

  Frames don't need a verb-specific object. A generic frame is better than
  a wrong one.
- English line: a rough line is fine, e.g. "Yesterday I ___ (to write)."
  It uses the frame's English template plus the verb's existing `meaning`.
  No English verb forms need writing. *(Designer's call.)*
- **In the daily session:** keep the existing form unlock levels
  (`FORM_UNLOCK_LESSON`) and the lesson-14 start.
- **In the Conjugate tab** *(designer's call)*: keep the tab's current
  "independent of your lesson pace" behaviour, with all verbs and forms
  available. The question changes to the in-sentence format.
- **IDs and history** *(designer's call)*:
  - The tab and the session use the same in-sentence IDs, keyed by verb
    index + form + frame index, so practice in either one counts for both.
  - The first time an in-sentence ID is seen, it starts from the existing
    `conj-<verb>-<form>` record's box, if there is one, so old conjugation
    history carries over.
- **Feedback.** If your answer matches one of `generateMistakes()`'s
  outputs, name the mistake:
  - wrong verb group: "帰る is Group 1 (looks like a る-verb but isn't), so …"
  - wrong て/た branch: "む verbs take んで: 飲んで"
  - right verb, wrong tense or politeness: "That's the polite past; this
    frame needs the て-form"

  `generateMistakes()` will need to return the kind of each mistake
  alongside the string. Otherwise, show `explainForm()` and the frame's
  "when to use" note.
- Uses the same "I was right" override as section 2.

### 4. Better multiple-choice wrong answers

- **Conjugation multiple choice goes away** *(designer's call)*:
  - `conj-*` items are removed from the daily pool (`allQuestionsUpTo`),
    so they can't flood the multiple-choice slots.
  - Conjugation is practised only through the in-sentence typed format.
  - `resolveConjugationQuestion()` needs no distractor rework. It can stay
    for resolving old IDs or be removed.
- **Hand-written lesson questions** in `js/lessons-data.js` (100
  questions, 25 lessons × 4): rewrite the wrong options that are giveaways.
  Rules:
  - vocab: wrong options come from the same lesson or a close category
    (other people words for 学生, other everyday objects for 傘), in the
    same script and similar length.
  - grammar: wrong particles are ones a learner would plausibly pick for
    that slot (は/が, に/で, を/が, へ/に).
  - structure: wrong options differ in one realistic way (word order,
    particle, politeness), not several.
  - Keep the correct answer, the `note`, and the question order unchanged
    so existing progress IDs (`lesson-index`) still map correctly.
  - Changing the `a` index is fine if the options are reordered.

## Data / progress changes

- `dailyLog[date]` gets the new item list (mixed IDs). Old entries with
  the previous shape must still load. A day that was already completed
  stays completed.
- `seen` records for the new `type-*` and in-sentence conjugation IDs use
  the same `{count, correct, box}` shape.
- If there's a session in progress on the day of upgrade, it's fine to
  rebuild that day's set in the new format.

## Left to the builder

- Exact layout and styling of the session, input, diff highlight and done
  screen, as long as it fits the app's existing visual identity and works
  at 375px.
- Choice between a hand-written romaji converter and wanakana (pinned
  version, from cdnjs).
- Exact sentence frames and how frames are picked per item.
- How the conjugation-in-sentence IDs are formed. They should be stable
  across reloads, so spaced repetition works.
- Code organisation: new file vs extending `conjugation.js` / `app.js`.

## Round two (not now, for context)

Listen-and-type with new ElevenLabs clips, one-form-at-a-time conjugation
cards with mastery gating, and a "sentences you can now say" progress
reward.
