// answer-check.js
// Pure helpers for checking a typed Japanese answer against a model sentence.
// Model sentences store readings inline as 漢字（かな）, e.g. 私（わたし）は 学生（がくせい）です。
// A typed answer is accepted in kana, kanji, katakana or romaji, ignoring spaces and
// the punctuation 。、！？!?.,  No DOM or storage access here, so it is easy to test.

// Particles used for "you got the particle wrong" diagnosis.
const CHECK_PARTICLES = ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'の', 'から', 'まで'];

// Longest first, so から/まで are matched before a bare で or と could be.
const CHECK_PARTICLES_BY_LENGTH = CHECK_PARTICLES.slice().sort((a, b) => b.length - a.length);

// Romaji typists write particles by sound: wa / e / o for は / へ / を.
const ROMAJI_PARTICLE_SOUNDS = { 'は': 'わ', 'へ': 'え', 'を': 'お' };

const CHECK_STRIP_RE = /[\s　。、！？!?.,]/g;
const CHECK_PUNCT_TAIL_RE = /[。、！？!?.,]+$/;
const CHECK_KANJI_READING_RE = /([0-9０-９一-鿿々〆ヵヶ]+)（([^）]*)）/g;

// ---------- Romaji ----------

// Romaji -> hiragana table. Longest match wins (3, then 2, then 1 letters).
const ROMAJI_TABLE = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  sa: 'さ', shi: 'し', si: 'し', su: 'す', se: 'せ', so: 'そ',
  ta: 'た', chi: 'ち', ti: 'ち', tsu: 'つ', tu: 'つ', te: 'て', to: 'と',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', fu: 'ふ', hu: 'ふ', he: 'へ', ho: 'ほ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  wa: 'わ', wo: 'を',
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  za: 'ざ', ji: 'じ', zi: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  // y-combinations
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ', sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ',
  nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
  hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
  rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ', jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ',
  zya: 'じゃ', zyu: 'じゅ', zyo: 'じょ',
  bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
  pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ'
};

const ROMAJI_VOWELS = 'aiueo';

// Converts runs of ASCII letters (case-insensitive) to hiragana; other characters pass through.
function romajiToHiragana(str) {
  return String(str).replace(/[A-Za-z][A-Za-z']*/g, run => convertRomajiRun(run.toLowerCase()));
}

function convertRomajiRun(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const next = s[i + 1];
    // 'nn' before a consonant or the end is one ん (sennsei); before a vowel it stays ん + na-row (onna).
    if (c === 'n' && next === 'n') {
      const after = s[i + 2];
      if (after === undefined || (ROMAJI_VOWELS.indexOf(after) < 0 && after !== 'y')) {
        out += 'ん';
        i += 2;
        continue;
      }
    }
    // n before a consonant, an apostrophe or the end is ん (n + vowel/y is handled by the table).
    if (c === 'n' && (next === undefined || next === "'" || (ROMAJI_VOWELS.indexOf(next) < 0 && next !== 'y'))) {
      out += 'ん';
      i += next === "'" ? 2 : 1;
      continue;
    }
    // Doubled consonant (kk, tt, ss...) is a small tsu.
    if (next === c && c !== 'n' && c !== "'" && ROMAJI_VOWELS.indexOf(c) < 0) {
      out += 'っ';
      i += 1;
      continue;
    }
    let matched = false;
    for (let len = 3; len >= 1; len--) {
      const hira = ROMAJI_TABLE[s.substr(i, len)];
      if (hira) { out += hira; i += len; matched = true; break; }
    }
    if (!matched) { out += c; i += 1; }
  }
  return out;
}

// ---------- Normalisation ----------

// Katakana (U+30A1-U+30F6) -> hiragana, everything else untouched.
function toHiragana(str) {
  return String(str).replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

// Comparison form of an answer: romaji and katakana become hiragana, spaces and punctuation vanish.
function normalizeAnswer(str) {
  return toHiragana(romajiToHiragana(String(str).trim())).replace(CHECK_STRIP_RE, '');
}

// ---------- Model sentence parsing ----------

// Splits a model sentence into space-separated chunks, each a list of elements:
//   {lit: 'は'}                       a literal character (already normalised)
//   {alts: ['私', 'わたし']}          kanji word plus its readings
function parseModelChunks(modelJp) {
  return String(modelJp).split(/[\s　]+/).filter(Boolean).map(chunk => {
    const els = [];
    let last = 0;
    chunk.replace(CHECK_KANJI_READING_RE, (m, kanji, reading, offset) => {
      pushLiterals(els, chunk.slice(last, offset));
      els.push({ alts: [kanji].concat(reading.split('・').filter(Boolean)).map(normalizeAnswer) });
      last = offset + m.length;
      return m;
    });
    pushLiterals(els, chunk.slice(last));
    return els;
  });
}

// Adds each character as a literal, dropping ones that normalise away (punctuation).
function pushLiterals(els, text) {
  for (const ch of text) {
    const lit = normalizeAnswer(ch);
    if (lit) els.push({ lit });
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Regex that matches a normalised answer for this model sentence.
// opts.romaji lets は/へ/を at the end of a chunk also be typed as わ/え/お.
function buildAnswerRegex(modelJp, opts) {
  const romaji = !!(opts && opts.romaji);
  let src = '';
  for (const els of parseModelChunks(modelJp)) {
    els.forEach((el, idx) => {
      if (el.alts) {
        src += '(?:' + el.alts.map(escapeRegex).join('|') + ')';
      } else if (romaji && idx === els.length - 1 && ROMAJI_PARTICLE_SOUNDS[el.lit]) {
        src += '[' + el.lit + ROMAJI_PARTICLE_SOUNDS[el.lit] + ']';
      } else {
        src += escapeRegex(el.lit);
      }
    });
  }
  return new RegExp('^' + src + '$');
}

// Kana-only normalised answer (first reading of each word), for display and diffing.
function kanaForm(modelJp) {
  return parseModelChunks(modelJp)
    .map(els => els.map(el => el.alts ? (el.alts[1] || el.alts[0]) : el.lit).join(''))
    .join('');
}

// ---------- Checking ----------

// Finds a particle at the end of a chunk (ignoring trailing punctuation).
// Returns {particle, start, tail} or null; start indexes into the chunk string.
function trailingParticle(chunk) {
  const tailMatch = chunk.match(CHECK_PUNCT_TAIL_RE);
  const tail = tailMatch ? tailMatch[0] : '';
  const body = chunk.slice(0, chunk.length - tail.length);
  for (const p of CHECK_PARTICLES_BY_LENGTH) {
    if (body.endsWith(p)) return { particle: p, start: body.length - p.length, tail };
  }
  return null;
}

// If the answer is right except for one wrong particle, say which. Returns {used, needed} or null.
function diagnoseParticle(normInput, modelJp, romaji) {
  const chunks = String(modelJp).split(/[\s　]+/).filter(Boolean);
  for (let ci = 0; ci < chunks.length; ci++) {
    const found = trailingParticle(chunks[ci]);
    if (!found) continue;
    for (const p of CHECK_PARTICLES) {
      if (p === found.particle) continue;
      const variantChunks = chunks.slice();
      variantChunks[ci] = chunks[ci].slice(0, found.start) + p + found.tail;
      if (buildAnswerRegex(variantChunks.join(' '), { romaji }).test(normInput)) {
        return { used: p, needed: found.particle };
      }
    }
  }
  return null;
}

// Checks a typed answer. kind: 'exact' | 'particle' | 'other' | 'empty'.
function checkTyped(input, modelJp) {
  const expected = kanaForm(modelJp);
  const norm = normalizeAnswer(input);
  if (!norm) return { correct: false, kind: 'empty', expected };
  const romaji = /[A-Za-z]/.test(String(input));
  if (buildAnswerRegex(modelJp, { romaji }).test(norm)) {
    return { correct: true, kind: 'exact', expected };
  }
  const diag = diagnoseParticle(norm, modelJp, romaji);
  if (diag) return { correct: false, kind: 'particle', expected, used: diag.used, needed: diag.needed };
  return { correct: false, kind: 'other', expected };
}

// Character diff (LCS). 'del' = only in a (your answer), 'add' = only in b (the model).
function diffChars(a, b) {
  const x = Array.from(String(a));
  const y = Array.from(String(b));
  const dp = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) {
    for (let j = y.length - 1; j >= 0; j--) {
      dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0, j = 0;
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) { out.push({ ch: x[i], op: 'same' }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ ch: x[i], op: 'del' }); i++; }
    else { out.push({ ch: y[j], op: 'add' }); j++; }
  }
  while (i < x.length) out.push({ ch: x[i++], op: 'del' });
  while (j < y.length) out.push({ ch: y[j++], op: 'add' });
  return out;
}
