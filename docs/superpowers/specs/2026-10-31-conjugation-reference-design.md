# Conjugate tab: verb reference and short drills

Date: 2026-10-31
Status: approved 2026-10-31, with the user's two additions (more N5/N4
verbs, sentences that make sense) written in as sections 6 and 7

Mockups the user picked live in `2026-10-31-conjugation-reference-mockups/`
(HTML fragments from the brainstorm browser; open them through any page that
supplies basic styling, or read them as markup). `reference-table.html` is
the table the user said to "stick with". `drill-segments.html`, option A, is
the drill menu the user chose.

## Why

The user cannot tell which verbs belong to which group, and does not
understand how the godan verbs split by final kana or how each form is used
in a sentence. Today the Conjugate tab (`renderConjugate()` in js/app.js)
gives:

- a godan table with nine rows of bare kana and endings (`〜ます 〜ない…`),
  with no example verbs, so there is nothing to match a real verb against;
- one sentence each for Group 2 and Group 3;
- a single "Start Conjugation Drill" button that runs 15 mixed questions.

User's words: "there is no examples of which verb falls into which category i
can reference", "the conjugation drills are also too long and just one
segment", and "the reference table and the information needs to be more
informative with example verbs".

Two further requests from the user: show the reading in brackets next to
the kanji so the last kana is visible (that is what decides godan vs
ichidan), and use English headers (past, negative, negative past…) in the
table instead of ます／ない, with the basic (dictionary) form shown first.

## Goals

1. A reference the user can look up any verb in: every verb in the app,
   filed under its group, with the reading in brackets and the final kana
   highlighted.
2. For godan verbs, the table is organised by final kana so the pattern is
   visible, with each verb's forms laid out beside it.
3. Each form has a short "how to use it in a sentence" panel with real
   example sentences.
4. The drill becomes a menu of short rounds (5 questions each), by verb type
   or by form, so one sitting can be a single small topic.
5. More verbs: the app covers the common N5 and N4 verbs, not just 52.
   (User, on approving: "please use more N5 and N4 verbs in the practice".)
6. Every quiz sentence makes sense in both Japanese and English.
   (User: "make sure the sentence for the quizzes make sense".)

## Non-goals

- No change to question generation, answer checking, spaced repetition
  weighting, the quiz screen itself, or the stored progress shape.
- No step-by-step "pick the group, then the ending, then type" drill (the
  user did not choose it).
- No new forms. (New verbs are in scope: see section 6.)
- No per-verb "show every form" view. The six table columns are the
  per-verb reference; the other forms (polite negative, polite past,
  potential, volitional, passive, causative) are covered by the usage panels
  with one example verb each.
- No locking of forms behind lesson numbers in this drill (it ignores
  `FORM_UNLOCK_LESSON` today and keeps doing so).
- No changes to Today, Lessons, Grammar, Textbook, Reading, Notes, auth or
  sync.

## Anti-goals

- Reference rows typed by hand. A wrong form in a reference is worse than
  none. Every row must be generated from `VERBS` and `computeForms()` so the
  reference can never disagree with the drill.
- A drill menu so long or dense it is unusable on a phone.
- Rounds that end without a clear finish. Today a non-daily round just drops
  back to the tab with no summary.

## What gets built

### 1. Reference section (replaces the three-group block on the Conjugate tab)

Shown below the drill menu (or above it; builder's call, see below). Three
parts, one per group, each generated from `VERBS`.

**Group 1, godan.** Per the table mockup:

- A one-line rule at the top: look at the last kana of the verb in
  hiragana; that kana picks the row.
- Columns: *Ends in* | *Basic form* | *Polite (present)* | *Past* |
  *Negative* | *Negative past* | *て-form*. English headers, no ます／ない
  in the header. Under the て-form header a small "(linking)" hint, under
  Polite a small "(present)" hint, as in the mockup.
- One row per verb, grouped by final kana, in this order: う, く, ぐ, す, つ,
  ぬ・ぶ・む, る. The *Ends in* cell shows the kana large and in the accent
  red; ぬ・ぶ・む share one group cell because they share the んで／んだ rule.
- *Basic form* shows kanji with reading in brackets, English meaning in
  muted text, and the final kana in red (`飲（の）む`).
- The other columns show the form with the readings stripped (as in the
  mockup) and the part that changed in bold: for Polite only the い-row kana
  (`飲み`ます), for the others the whole new ending (`飲んだ`, `飲まない`).
- 行く is flagged (amber row, "odd one") because its て／た form is 行って／
  行った, not 行いて. The five trap verbs (帰る 入る 要る 知る 走る, i.e.
  `trap:true`) are flagged (orange row) as "looks like Group 2, is Group 1".
- Every godan verb in `VERBS` appears (not just the 2–3 per ending shown in
  the mockup). The mockup is a sample of the layout.

**Group 2, ichidan.** Same columns and row layout, one row per ichidan verb.
Above it, a short "how to tell" note: ends in る, with an い-sound or え-sound
just before it, and not on the trap list. The rule for building every form
is "drop る, add the ending".

**Group 3, irregular.** Same columns, rows for する, 来る and one noun+する
compound (勉強する). For 来る only, the conjugated columns keep the reading
on the 来 (来（き）ます, 来（こ）ない) because the reading is the thing that
changes; every other row strips readings from conjugated columns.

**Which part is bold.** In every row, bold the characters from the first one
that differs from the basic form onward, except the trailing ます in the
Polite column, which stays plain (so 飲みます bolds only み). For 来る leave
the 来 itself plain and bold the kana after it. Exactly how this plays out
for ichidan polite forms (where nothing but ます differs) is the builder's
call; showing no bold there is acceptable.

Collapsible sections are acceptable if the full page is too long on a phone
(builder's call).

### 2. "Endings at a glance" panel (above the godan table)

A small panel answering "how and when does godan split?", with the facts the
code already encodes in `TE_TA_MAP` and `GODAN_ROWS`:

- て／た form: う・つ・る → って／った; ぬ・ぶ・む → んで／んだ; く → いて／いた;
  ぐ → いで／いだ; す → して／した; and the 行く exception.
- Negative: the final kana moves to its あ-row partner (う takes わ).
- Polite: final kana moves to its い-row partner.

Generated from the same two tables, not retyped.

### 3. "Using a form in a sentence" panels

One panel per entry in `FORM_LABELS` (12 forms), in this order: the forms
that have a table column first (past, negative, negative past, て-form,
basic/dictionary), then polite negative, polite past, polite past negative,
potential, volitional, passive, causative. The table's *Polite (present)*
column (ます) is not a `FORM_LABELS` entry and has no frames, so it gets no
panel of its own; the three polite panels mention that ます is the polite
present. Each panel:

- the form name in English (e.g. "Past, plain"), with the Japanese name small;
- how it is built, one line per group (godan / ichidan / irregular), from a
  new small hand-written table in conjugation.js (form × group → one line of
  prose, e.g. ichidan potential: "drop る, add られる"). `explainForm()` does
  not cover all 12 forms and is left untouched;
- two or three example sentences taken from `CONJ_FRAMES[formKey]`: the
  Japanese with the blank filled by a fixed example verb's form (readings
  shown in brackets, as in the Basic form column), the frame's English
  template with the verb's meaning in brackets in place of the blank (the
  same way the drill shows it: "Please ___ (to wait)"), and the frame's
  existing `use` note.

Panels are generated from `CONJ_FRAMES` and `computeForms()`. The same
frames the drill uses, so what the user reads is what they get quizzed on.
Each panel is a native `<details>` element (collapsed by default, opened by
tapping its header), so opening one never re-renders the tab or loses
scroll position. Table column headers are not links.

### 4. Drill menu (replaces the single "Start Conjugation Drill" button)

A grid of tiles; tapping a tile starts a round of 5 questions drawn from
that tile's slice of `CONJ_SENTENCE_POOL`, weighted by `boxWeight` as today.

By verb type (tiles, from the chosen mockup):

| Tile | Verbs |
|------|-------|
| Godan: く・ぐ | godan, non-trap, last kana く or ぐ (includes 行く) |
| Godan: す・つ・う | last kana す, つ or う |
| Godan: ぬ・ぶ・む | last kana ぬ, ぶ or む |
| Godan: る | godan, non-trap, last kana る |
| Ichidan | `group === 2` |
| Trap verbs | `trap: true` (帰る 入る 要る 知る 走る) |
| する・来る | `group === 3` (including noun+する compounds) |
| Mixed review | everything |

By form: one tile per form key in `FORM_LABELS` (12), labelled in English
with the Japanese name small, each drawing all verbs for that form.

Each tile shows how many of its sentences the user has practised
(`PROGRESS.seen[qid].count > 0`) out of the slice size, e.g. "12/84",
computed from existing progress. No new stored fields.

The existing count line ("N verbs · M forms · x/y sentence drills
practiced") may stay as a header.

### 5. Round finish screen

Conjugation rounds end with a short summary instead of silently returning to
the tab: score out of 5, the missed items with the right answer (same list
style as `renderDoneScreen`), and two buttons: *Another round* (same tile)
and *Back to drills*. It must not touch the daily streak and must not say
"Done for today".

### 6. More N5 and N4 verbs

- Add about 60 verbs to `VERBS`, from the pool in the appendix (standard
  JLPT N5/N4 verbs). The builder may swap any for an equally common N5/N4
  verb. Must keep: every godan ending represented by at least two verbs
  (except ぬ, which only has 死ぬ), at least three more trap verbs, at least
  five more ichidan verbs, and at least five more noun+する compounds.
- Every verb, old and new, gets a `jlpt` field (5 or 4). The reference shows
  it as a small "N5"/"N4" tag on the Basic form cell.
- **Append only.** Question ids encode the verb's array index
  (`conjs-<verbIdx>-<form>-<frame>`), and saved progress is keyed by them. New
  verbs go at the end of `VERBS`; existing entries keep their position. The
  reference sorts by group and ending for display, never by array order.
- Each verb also gets the sentence fields described in section 7.

### 7. Quiz sentences that make sense

**The problem.** Today every verb is paired with every frame of every form
(1,612 sentences). The frames were written to have "no object tied to one
verb, so every verb fits", but the result is often nonsense:
死んでください ("Please die"), 一緒に要ろう ("Let's be necessary together"),
よく先生に書かれる ("I often get written by my teacher"), 毎日死ぬ, 要れる.

**The fix: verbs say what they are, frames say what they need.**

- Each verb gets an optional **complement**: a short natural phrase with its
  particle and its English, e.g. 飲む → 水（みず）を / "water", 行く →
  学校（がっこう）に / "to school", 乗る → 電車（でんしゃ）に / "the train".
  Frames may contain a slot for it, so 「___ください」 becomes
  「水を飲んでください」 / "Please drink water". A verb with no complement
  simply drops the slot.
- Each verb gets **tags** describing how it can be used. At minimum:
  - *action*: something you choose to do (飲む, 書く). Only action verbs go
    into requests (ください), permission (もいいですか), invitations
    (volitional), plans (つもり), "can do" (potential, ことができる) and
    causative frames.
  - *person*: something done to a person (呼ぶ, 褒める, 待つ, 頼む). Only
    these go into the passive frames (よく先生に___ = "I often get ___ by my
    teacher").
  - Non-action verbs (分かる, 要る, 疲れる, 降る, 始まる…) appear only in
    frames written to suit them (e.g. a subject complement like 雨（あめ）が
    with a plain past or negative), or are left out of a form entirely.
- Each frame lists the tags it **needs**. The sentence pool is built only
  from (verb, form, frame) combinations where the verb has every tag the
  frame needs and the verb does not skip that form.
- A verb may **skip** forms that are unnatural for it whatever the frame
  (e.g. 知る in the dictionary and polite present, where Japanese says
  知っています). 死ぬ stays in the reference (it is the only ぬ verb) but may
  be dropped from the drill entirely.
- The English prompt must read as real English once the blank is filled in
  mentally, with the verb's meaning in brackets as today.
- The frames themselves may be rewritten and more frames added, so that
  every form has enough natural sentences for the action verbs and suitable
  ones for non-action verbs.
- Frame indices are part of the question id. Rewriting a frame in place is
  fine (progress carries over loosely); removing one would shift the others,
  so retire frames by marking them unused rather than deleting them.

**How "makes sense" is checked.** The plan must include generating the
complete list of quiz sentences (Japanese with the answer filled in, plus
the English prompt) and reading every line. A sentence that a teacher would
not accept as natural N5/N4 Japanese, or whose English does not match, is
fixed through tags, skips, complements or frame wording. The listing is
regenerated and re-read until clean. Tests guard the rules mechanically:
no frame that needs *action* or *person* is paired with a verb lacking that
tag, every drill tile has at least 5 sentences, and every verb that is in the
drill has at least one sentence.

## Constraints

- Static site, plain `<script>` globals, no build step, no modules.
- Reuse the komorebi styling already in css/styles.css (tokens `--ink`,
  `--line`, etc., existing `.card`, `.gstruct`, `.muted`). New CSS only where
  nothing existing fits. Must be usable at phone width (the user studies on a
  phone); wide tables scroll horizontally inside their own container.
- Reference and panel content comes from `VERBS`, `computeForms()`,
  `GODAN_ROWS`, `TE_TA_MAP`, `CONJ_FRAMES`, `FORM_LABELS`. Nothing about a
  specific verb's conjugation is typed twice.
- Tests: the repo has node tests (tests/*.test.js, loaded via
  tests/load.js). Pure helpers added for this (segment filters, the
  "which part changed" split, reading stripping) should have tests there.
  DOM rendering does not need tests.
- Do not change the shape of saved progress.

## Decisions I made (the user did not say these)

These are my calls, so please check them:

1. **Every godan verb is listed**, not 2–3 per ending. The mockup showed a
   sample to keep it readable.
2. **Tile progress is "practised / total"** from existing progress. The
   mockup showed numbers like "2/5", which I read as a mock detail, not a
   requirement; this avoids storing per-round scores.
3. **Rounds are always 5 questions** (including Mixed review).
4. **The "Endings at a glance" panel and the Group 2 "how to tell" note**
   were my additions, to answer "how and when are godan split" and "how do I
   tell the group". The user approved the table, not these.
5. **Panels are collapsed by default**, reference sits below the drill menu.
6. **Form tiles are all 12 forms**, unlocked from the start.
7. **The six-column table is the whole per-verb reference.** You cannot look
   up, say, 飲みませんでした for 飲む in the table; the polite negative, past
   and so on appear only in the usage panels with one example verb. You
   said to stick with the table, so I did not add columns or an "all forms"
   row. Say so if you want that.
8. **No separate panel for the polite present (ます).** It has no sentence
   frames in the drill today; the polite panels explain it instead.
9. **Panel English reads like the drill**: "Please ___ (to wait)", not a
   fully worked English sentence, because the app has no way to inflect
   English verbs.
10. **I am allowed to write new one-line build rules** for each form and
    group (new table in conjugation.js). The drill's existing feedback text
    is not changed.
11. **Panels open by tapping their header only.** Table headers are not links.
12. **来る keeps its reading on the 来 in the conjugated columns**; other
    rows drop readings there.
13. **About 60 new verbs**, picked from the appendix pool, for roughly 110 in
    total. More would make the reference very long on a phone.
14. **The fix for nonsense sentences is tags and complements, not
    hand-written sentences per verb.** Writing 12 forms × 110 verbs by hand
    would be over a thousand sentences to maintain.
15. **死ぬ may become reference-only** (no drill sentences), since almost
    every frame with it is grim or odd.
16. **Each verb shows an N5/N4 tag** in the reference.
17. **With ~110 verbs the godan table is long**, so each ending's rows are
    collapsible on a phone.

## Appendix: candidate verbs (N5/N4)

Pick about 60. Readings are as they should appear in `dict`.

- **Godan う:** 洗（あら）う, 言（い）う, 歌（うた）う, 吸（す）う, 習（なら）う,
  笑（わら）う, 払（はら）う, 拾（ひろ）う, 思（おも）う
- **Godan く:** 置（お）く, 着（つ）く, 弾（ひ）く, 引（ひ）く, 磨（みが）く,
  咲（さ）く
- **Godan ぐ:** 急（いそ）ぐ, 脱（ぬ）ぐ, 騒（さわ）ぐ
- **Godan す:** 出（だ）す, 返（かえ）す, 押（お）す, 渡（わた）す, 探（さが）す,
  落（お）とす, 直（なお）す, 起（お）こす
- **Godan つ:** 持（も）つ, 勝（か）つ
- **Godan ぶ:** 呼（よ）ぶ, 並（なら）ぶ, 選（えら）ぶ, 運（はこ）ぶ, 喜（よろこ）ぶ
- **Godan む:** 休（やす）む, 頼（たの）む, 盗（ぬす）む, 包（つつ）む
- **Godan る:** 乗（の）る, 取（と）る, 売（う）る, 送（おく）る, 登（のぼ）る,
  終（お）わる, 始（はじ）まる, 止（と）まる, 降（ふ）る, 困（こま）る,
  戻（もど）る, 踊（おど）る, 頑張（がんば）る, 怒（おこ）る
- **Godan る, trap (looks ichidan):** 切（き）る, 減（へ）る, 喋（しゃべ）る,
  滑（すべ）る
- **Ichidan:** 開（あ）ける, 浴（あ）びる, 答（こた）える, 出（で）かける,
  入（い）れる, 忘（わす）れる, 始（はじ）める, 集（あつ）める, 調（しら）べる,
  決（き）める, 捨（す）てる, 続（つづ）ける, 届（とど）ける, 投（な）げる,
  迎（むか）える, 見（み）つける, 片付（かたづ）ける, 落（お）ちる, 遅（おく）れる,
  生（う）まれる
- **Noun+する:** 料理（りょうり）する, 練習（れんしゅう）する, 運転（うんてん）する,
  散歩（さんぽ）する, 電話（でんわ）する, 旅行（りょこう）する, 説明（せつめい）する,
  質問（しつもん）する, 予約（よやく）する

## Left to the builder

- Exact order of sections on the page, collapsed vs always open, and tile
  grid sizing.
- How to compute the bold "changed part" cleanly (the mockup bolds only the
  い-row kana in the polite column and the whole new ending elsewhere).
- How to strip readings for the display of conjugated forms (the app already
  has reading-stripping helpers in js/answer-check.js).
- Naming and file layout of any new helpers (a new js file or additions to
  conjugation.js).
- Which example verb to use per form in the usage panels, as long as it
  shows all three groups' build rule correctly.
