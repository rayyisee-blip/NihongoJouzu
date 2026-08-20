/* ============================================================
   CUMULATIVE REVIEW CAPSTONES — every 5 lessons, a short set that
   deliberately combines grammar points from across that whole block,
   so earlier lessons don't quietly rot while you move forward. Each
   sentence carries a "check" list of the specific elements to
   self-verify against, instead of just eyeballing the whole sentence.
   ============================================================ */
const REVIEW_CAPSTONES = [
  {block:5, title:"Review — Lessons 1–5", cap:[
    {en:"That dictionary is mine. How much was it?",jp:"あの 辞書（じしょ）は 私（わたし）のです。いくらですか。",
     note:"Combines この／その／あの + noun (Lesson 2) with N1のN2 possession (Lesson 1) and いくらですか (Lesson 2).",
     check:["あの + noun, not あれ alone, since a specific dictionary is named","の for possession (私のです)","いくらですか kept as its own separate question"]},
    {en:"I'll go to the station by train, alone, at seven.",jp:"7時（じ）に 一人（ひとり）で 電車（でんしゃ）で 駅（えき）へ 行（い）きます。",
     note:"Combines 時に for clock time (Lesson 4) with 一人で, 電車で, and 駅へ (Lesson 5) — で appears twice doing two different jobs.",
     check:["7時に for the specific time, not は","電車で for the means of transport","駅へ for the destination direction","一人で for 'alone' — a different use of で than the transport one"]},
    {en:"Where is that department store? I'll go by bus.",jp:"あの デパートは どこですか。バスで 行（い）きます。",
     note:"Combines あの + noun (Lesson 2) and どこですか (Lesson 3) with バスで for the means of transport (Lesson 5).",
     check:["あの + noun since a specific department store is meant","どこですか to ask where it is","バスで for the means of transport, not へ or に"]}
  ]},
  {block:10, title:"Review — Lessons 6–10", cap:[
    {en:"I gave Tanaka-san a book, but he doesn't understand English very well.",jp:"田中（たなか）さんに 本（ほん）を あげましたが、英語（えいご）が あまり わかりません。",
     note:"Combines あげました + に for the recipient (Lesson 7) with が + わかります and あまり + negative (Lesson 9).",
     check:["に marks Tanaka-san as the recipient of あげました","を marks 本 as the thing given","が (not を) before わかりません, since わかります always pairs with が","あまり + negative for 'not very'"]},
    {en:"This town is quiet, and there is a nice park nearby.",jp:"この 町（まち）は 静（しず）かで、近（ちか）くに いい 公園（こうえん）が あります。",
     note:"Combines the な-adjective で-connector (Lesson 8) with あります + に for location (Lesson 10).",
     check:["静かで, not 静かの／静かだ, to connect the な-adjective mid-sentence","に marks 近く as the location where the park exists","が あります since 公園 is inanimate"]},
    {en:"I haven't eaten breakfast yet, but I already understand this kanji.",jp:"まだ 朝（あさ）ごはんを 食（た）べていませんが、この 漢字（かんじ）は もう わかりました。",
     note:"Combines まだ + negative (Lesson 7) with もう + past tense (also Lesson 7), applied across two different clauses joined by が.",
     check:["まだ + ていません = 'haven't done yet'","もう + わかりました = 'already understood'","が connects the two clauses as 'but'"]}
  ]},
  {block:15, title:"Review — Lessons 11–15", cap:[
    {en:"I only bought three apples, because they were more expensive than yesterday.",jp:"りんごは 昨日（きのう）より 高（たか）かったですから、三（みっ）つだけ 買（か）いました。",
     note:"Combines より + adjかった past comparison (Lesson 12) with quantity + だけ (Lesson 11).",
     check:["adjかったです for the past tense of 高い","より marks 昨日 as the point of comparison","だけ directly after the quantity 三つ"]},
    {en:"I want to go to Kyoto to take photos, but you mustn't take photos inside the train.",jp:"写真（しゃしん）を 撮（と）りに 京都（きょうと）へ 行（い）きたいですが、電車（でんしゃ）の 中（なか）で 写真（しゃしん）を 撮（と）っては いけません。",
     note:"Combines purpose に行きたい (Lesson 13) with てはいけません prohibition (Lesson 15).",
     check:["撮りに 行きたい: purpose に行きます fused with たい on the same verb stem","電車の中で for 'inside the train' — で for where the (prohibited) action happens","撮っては いけません for the prohibition, not てもいいです"]},
    {en:"You may wait here, but please turn off your phone.",jp:"ここで 待（ま）っても いいですが、電話（でんわ）を 消（け）してください。",
     note:"Combines てもいいです permission (Lesson 15) with てください request (Lesson 14).",
     check:["待っても いいです for permission to wait","消してください for the polite request to turn it off","が connecting the two clauses as 'but'"]}
  ]},
  {block:20, title:"Review — Lessons 16–20", cap:[
    {en:"I must submit the report by tomorrow, so I plan to study at the library today.",jp:"レポートを 明日（あした）までに 出（だ）さなければ なりませんから、今日（きょう） 図書館（としょかん）で 勉強（べんきょう）する 予定（よてい）です。",
     note:"Combines なければなりません obligation (Lesson 16) with 辞書形＋予定です (Lesson 19).",
     check:["出さなければ なりません for the obligation (drop い from 出さない, add ければなりません)","から linking the reason to the plan","辞書形 (勉強する, not 勉強します) directly before 予定です"]},
    {en:"On weekends I do things like clean and read books, but I think it's better to do laundry too.",jp:"週末（しゅうまつ）は 掃除（そうじ）したり 本（ほん）を 読（よ）んだり しますが、洗濯（せんたく）も した ほうが いいと 思（おも）います。",
     note:"Combines たり〜たりします (Lesson 18) with た方がいい advice + と思います opinion (Lessons 20-21 style).",
     check:["たり〜たりします lists example weekend activities","した ほうがいい for advice, using the た-form, not the dictionary form","と思います frames it as an opinion"]},
    {en:"I worked too much yesterday, so I think I'll rest today.",jp:"昨日（きのう）は 働（はたら）きすぎましたから、今日（きょう）は 休（やす）もうと 思（おも）っています。",
     note:"Combines すぎました excess (Lesson 20) with volitional + と思っています (Lesson 19).",
     check:["働きすぎました for 'worked too much'","から linking cause to the plan that follows","volitional 休もう, not 休みます, before と思っています"]}
  ]},
  {block:25, title:"Review — Lessons 21–25", cap:[
    {en:"The person standing over there will probably be a teacher.",jp:"あそこに 立（た）っている 人（ひと）は たぶん 先生（せんせい）でしょう。",
     note:"Combines ている noun modification (Lesson 22) with でしょう probability (Lesson 21).",
     check:["ている clause (立っている) modifying 人 directly, placed right before the noun","でしょう for a probability guess, no と思います needed"]},
    {en:"When I turned right at that corner, I was scolded by my mother.",jp:"あの 角（かど）を 右（みぎ）に 曲（ま）がった とき、母（はは）に 叱（しか）られました。",
     note:"Combines を + movement verb and た-form とき (Lesson 23) with に + passive form (Lesson 24).",
     check:["を marks 角 as the corner being turned at (movement verb)","曲がった (plain past, not 曲がる) since the turn already happened before the scolding","に marks 母 as the one doing the scolding in this passive sentence"]},
    {en:"My boss made me go to Osaka, so I was very tired.",jp:"上司（じょうし）は 私（わたし）を 大阪（おおさか）へ 行（い）かせましたから、とても 疲（つか）れました。",
     note:"Combines causative 行かせました (Lesson 25) with から linking to a result clause.",
     check:["を marks 私 as the person made to go, since 行く is intransitive (compare に for transitive causative verbs)","causative 行かせました, not just 行きました","から linking the cause to the result (とても疲れました)"]}
  ]}
];

/* ============================================================
   GRAMMAR REFERENCE — Sentence structure & particle guide
   Sourced from Minna no Nihongo I (Lessons 1–25) plus standard
   JLPT N4 particle usage.
   ============================================================ */
const SENTENCE_STRUCTURE = [
  {
    title:"Basic word order: SOV",
    body:"Japanese sentences end with the verb (or adjective/です). Subject and object can move around fairly freely because particles — not position — show each word's role, but the verb always comes last.",
    example:{jp:"私（わたし）は 毎朝（まいあさ） 公園（こうえん）で コーヒーを 飲（の）みます。",en:"I drink coffee at the park every morning.",note:"Topic → time → place → object → verb-last. Reordering time/place/object is usually fine; the verb stays at the end."}
  },
  {
    title:"Topic vs. subject: は and が",
    body:"は marks what the sentence is about (the topic); が marks the grammatical subject, often introducing new information or answering a 'who/what' question. A sentence can have a は-topic and a が-subject at the same time.",
    example:{jp:"この 町（まち）は 冬（ふゆ）が 寒（さむ）いです。",en:"As for this town, [its] winters are cold.",note:"町 is the topic (は); 冬 is the subject of 寒い (が)."}
  },
  {
    title:"Noun modification comes before the noun",
    body:"Unlike English, any word or clause describing a noun — adjectives, possessives, and even entire verb clauses — is placed directly in front of that noun, never after it.",
    example:{jp:"昨日（きのう） 買（か）った 本（ほん）",en:"the book [that I] bought yesterday",note:"The whole clause 昨日買った (plain past tense) sits before 本, acting like a long adjective."}
  },
  {
    title:"Particles attach directly to the word they mark",
    body:"A particle always comes immediately after the noun (or noun phrase) it's marking, with no space or gap in meaning — this is how you can tell a word's grammatical job in a sentence regardless of where it appears.",
    example:{jp:"友達（ともだち）に 京都（きょうと）で 会（あ）いました。",en:"I met [my] friend in Kyoto.",note:"に marks the person met; で marks where the meeting happened — order between them is flexible."}
  }
];

const PARTICLES = [
  {p:"は", role:"Topic marker", level:"N5",
   explain:"Marks what the sentence is about — \"as for N...\". Attaches to the topic, which often (but not always) overlaps with the subject.",
   pattern:"N + は + comment",
   examples:[
     {jp:"私（わたし）は 学生（がくせい）です。", en:"I am a student."},
     {jp:"この 本（ほん）は 面白（おもしろ）いです。", en:"This book is interesting."}
   ],
   confuse:"は vs が — は presents known/topic information or draws a contrast; が marks new information or specifically identifies the subject. 「私（わたし）は 田中（たなか）です」 answers \"who are you?\"; 「私（わたし）が 田中（たなか）です」 answers \"which one of you is Tanaka?\""},
  {p:"が", role:"Subject marker (new info)", level:"N5",
   explain:"Marks the grammatical subject, especially when introducing new information, after question words (誰（だれ）が, 何（なに）が), and is required with 好（す）き, 嫌（きら）い, 上手（じょうず）, 下手（へた）, わかります, あります, います, ほしい, and the object of Vたい.",
   pattern:"N + が + predicate",
   examples:[
     {jp:"誰（だれ）が 来（き）ますか。", en:"Who is coming?"},
     {jp:"私（わたし）は 音楽（おんがく）が 好（す）きです。", en:"I like music."}
   ]},
  {p:"を", role:"Direct object / path", level:"N5",
   explain:"Marks the direct object of an action verb. With verbs of movement (歩（ある）きます, 渡（わた）ります, 通（とお）ります), it instead marks the space or route being crossed.",
   pattern:"N + を + transitive verb",
   examples:[
     {jp:"本（ほん）を 読（よ）みます。", en:"I read a book."},
     {jp:"公園（こうえん）を 歩（ある）きます。", en:"I walk through the park."}
   ]},
  {p:"に", role:"Time / location / goal / recipient", level:"N5",
   explain:"One of the most versatile particles: (1) a specific point in time (7時（じ）に), (2) the place something exists with あります/います, (3) the destination of movement, (4) the recipient of an action (あげます/もらいます/会います), and (5) purpose before 行きます (Vます-stem + に行きます).",
   pattern:"N(time/place/person) + に + verb",
   examples:[
     {jp:"7時（じ）に 起（お）きます。", en:"I get up at 7."},
     {jp:"机（つくえ）の 上（うえ）に 本（ほん）が あります。", en:"There's a book on the desk."},
     {jp:"友達（ともだち）に 手紙（てがみ）を 書（か）きます。", en:"I write a letter to my friend."}
   ],
   confuse:"に vs で for location — に marks where something exists (static, with あります/います); で marks where an action takes place (with action verbs)."},
  {p:"で", role:"Place of action / means / cause", level:"N5",
   explain:"(1) Marks the place where an action happens, (2) marks the means, tool, or method used (道具（どうぐ）で, 電車（でんしゃ）で), and (3) marks a cause or reason.",
   pattern:"N(place/tool) + で + verb",
   examples:[
     {jp:"図書館（としょかん）で 勉強（べんきょう）します。", en:"I study at the library."},
     {jp:"バスで 行（い）きます。", en:"I go by bus."}
   ]},
  {p:"へ", role:"Direction", level:"N5",
   explain:"Marks the direction of movement — pronounced \"e\", not \"he\". Often interchangeable with に for a destination, but へ puts more emphasis on the direction/route than the exact arrival point.",
   pattern:"N(place) + へ + 行きます／来ます／帰ります",
   examples:[
     {jp:"京都（きょうと）へ 行（い）きます。", en:"I'll go to (toward) Kyoto."}
   ]},
  {p:"と", role:"And / with / quotation", level:"N5",
   explain:"(1) Connects nouns as an exhaustive \"A and B, nothing else\", (2) marks a companion, \"together with\", (3) marks a quotation or thought before 言（い）います/思（おも）います, and (4) forms a conditional \"when/if\" with a dictionary-form verb.",
   pattern:"N + と + N　／　plain form + と思います／と言います",
   examples:[
     {jp:"コーヒーと 紅茶（こうちゃ）が あります。", en:"There's coffee and tea."},
     {jp:"明日（あした）は 晴（は）れると 思（おも）います。", en:"I think it will be sunny tomorrow."}
   ]},
  {p:"も", role:"Also / neither / nowhere (with negative)", level:"N5",
   explain:"Replaces は/が/を to mean \"also, too\". Paired with a question word and a negative verb (何（なに）も, どこ［へ］も, 誰（だれ）も), it means \"nothing / nowhere / no one\".",
   pattern:"N + も + verb",
   examples:[
     {jp:"私（わたし）も 学生（がくせい）です。", en:"I am also a student."},
     {jp:"何（なに）も 食（た）べませんでした。", en:"I didn't eat anything."}
   ]},
  {p:"の", role:"Possessive / modifier / nominalizer", level:"N5",
   explain:"Connects two nouns where the first describes or owns the second (N1のN2). Can also stand in for an omitted noun (\"~の\" = \"the one belonging to ~\"), and turns a verb phrase into a noun-like phrase before certain predicates (泳（およ）ぐのが好（す）きです).",
   pattern:"N1 + の + N2",
   examples:[
     {jp:"私（わたし）の 本（ほん）です。", en:"It's my book."},
     {jp:"これは 田中（たなか）さんのです。", en:"This one is Tanaka's."}
   ]},
  {p:"から", role:"From / because", level:"N5",
   explain:"Marks a starting point in time or place (\"from\"). Attached to the end of a full clause, it instead marks a reason (\"because\").",
   pattern:"N + から　／　plain form + から",
   examples:[
     {jp:"9時（じ）から 働（はたら）きます。", en:"I work from 9."},
     {jp:"雨（あめ）ですから、行（い）きません。", en:"Since it's raining, I won't go."}
   ]},
  {p:"まで", role:"Until / up to", level:"N5",
   explain:"Marks an ending point in time or place, very commonly paired with から to bracket a range.",
   pattern:"N(time/place) + まで",
   examples:[
     {jp:"5時（じ）まで 働（はたら）きます。", en:"I work until 5."}
   ]},
  {p:"や", role:"And (non-exhaustive list)", level:"N5",
   explain:"Connects a few example nouns from a larger, unstated set — often paired with など (\"and so on\"). Contrast と, which lists everything with nothing left out.",
   pattern:"N1 + や + N2（＋など）",
   examples:[
     {jp:"机（つくえ）の 上（うえ）に 本（ほん）や ノートが あります。", en:"There are things like books and notebooks on the desk (among other things)."}
   ]},
  {p:"か", role:"Question marker / or", level:"N5",
   explain:"Added to the end of a sentence to form a question. Between two nouns, it means \"or\".",
   pattern:"Sentence + か　／　N1 + か + N2",
   examples:[
     {jp:"これは 辞書（じしょ）ですか。", en:"Is this a dictionary?"},
     {jp:"コーヒーか 紅茶（こうちゃ）が いいです。", en:"Coffee or tea would be good."}
   ]},
  {p:"ね", role:"Seeking agreement", level:"N5",
   explain:"Added at the end of a sentence, similar to \"isn't it?\" or \"right?\" — invites agreement or shares an observation with the listener.",
   pattern:"Sentence + ね",
   examples:[
     {jp:"今日（きょう）は 暑（あつ）いですね。", en:"It's hot today, isn't it?"}
   ]},
  {p:"よ", role:"Asserting new information", level:"N5",
   explain:"Added at the end of a sentence to emphasize information the listener may not already know — similar to \"I tell you\" or \"you know\".",
   pattern:"Sentence + よ",
   examples:[
     {jp:"もう 12時（じ）ですよ。", en:"It's already 12, you know."}
   ]},
  {p:"だけ", role:"Only, just", level:"N5",
   explain:"Attaches directly to a noun or quantity to mean \"only, just\" — a neutral, simple limiter.",
   pattern:"N（＋quantity）+ だけ",
   examples:[
     {jp:"三人（さんにん）だけ います。", en:"There are only three people."}
   ]},
  {p:"しか〜ない", role:"Only (emphatic, negative)", level:"N4",
   explain:"Stronger than だけ, and always paired with a negative verb — often carries a nuance of \"that's not enough\".",
   pattern:"N + しか + negative verb",
   examples:[
     {jp:"500円（えん）しか ありません。", en:"I only have 500 yen (and that's a problem)."}
   ]},
  {p:"ばかり", role:"Only / nothing but / just did", level:"N4",
   explain:"(1) After a noun or quantity: \"nothing but\". (2) After a た-form verb: \"just did (and nothing else lately)\", often with a mildly critical nuance.",
   pattern:"N + ばかり　／　Vた-form + ばかり",
   examples:[
     {jp:"甘（あま）い物（もの）ばかり 食（た）べています。", en:"All I eat is sweet things."},
     {jp:"今（いま） 起（お）きたばかりです。", en:"I just woke up."}
   ]},
  {p:"でも", role:"Even / but", level:"N4",
   explain:"After a noun, means \"even\" (子供（こども）でもわかります = even a child would understand). At the start of a sentence, it means \"but, however\".",
   pattern:"N + でも　／　でも、Sentence",
   examples:[
     {jp:"忙（いそが）しい時（とき）でも、朝（あさ）ごはんを 食（た）べます。", en:"Even when I'm busy, I eat breakfast."}
   ]},
  {p:"けど／けれど", role:"But (casual contrast)", level:"N4",
   explain:"Connects two clauses in contrast — a softer, more conversational version of が used as \"but\".",
   pattern:"Clause1 + けど、Clause2",
   examples:[
     {jp:"高（たか）いけど、買（か）います。", en:"It's expensive, but I'll buy it."}
   ]},
  {p:"し", role:"Listing parallel reasons", level:"N4",
   explain:"Lists two or more reasons or facts side by side, often implying \"and what's more...\" leading to a conclusion.",
   pattern:"Clause1（plain）+ し、Clause2（plain）+ し、…",
   examples:[
     {jp:"この 部屋（へや）は 静（しず）かだし、広（ひろ）いし、気（き）に 入（い）っています。", en:"This room is quiet, and it's spacious too — I really like it."}
   ]},
  {p:"ので", role:"Because (softer, more objective)", level:"N4",
   explain:"Similar to から, but presents the reason as a more objective fact rather than a personal opinion — common in polite requests and formal explanations.",
   pattern:"plain form + ので、Clause2",
   examples:[
     {jp:"雨（あめ）が 降（ふ）っているので、傘（かさ）を 持（も）って行（い）ってください。", en:"Since it's raining, please take an umbrella."}
   ]},
  {p:"のに", role:"Although / even though", level:"N4",
   explain:"Expresses contrast between two clauses where the result is unexpected or disappointing — often carries a nuance of surprise, frustration, or regret.",
   pattern:"plain form + のに、Clause2",
   examples:[
     {jp:"一生懸命（いっしょうけんめい） 勉強（べんきょう）したのに、テストが できませんでした。", en:"Even though I studied hard, I couldn't do well on the test."}
   ]}
];

/* ============================================================
   N5 TEXTBOOK — extensive vocabulary + sentence patterns per lesson
   Sourced from the Minna no Nihongo I curriculum (Lessons 1–25),
   written to be read start-to-finish as a study reference.
   ============================================================ */
const TEXTBOOK = [
{n:1,
 vocab:[
   {jp:"これ",en:"this (thing, near me)"},{jp:"それ",en:"that (thing, near you)"},{jp:"あれ",en:"that (thing, over there)"},
   {jp:"私（わたし）",en:"I, me"},{jp:"あなた",en:"you"},{jp:"あの人（ひと）",en:"that person"},
   {jp:"先生（せんせい）",en:"teacher"},{jp:"学生（がくせい）",en:"student"},{jp:"会社員（かいしゃいん）",en:"company employee"},
   {jp:"医者（いしゃ）",en:"doctor"},{jp:"〜さん",en:"Mr./Ms. ~ (polite title)"},{jp:"何（なん・なに）",en:"what"},
   {jp:"辞書（じしょ）",en:"dictionary"},{jp:"本（ほん）",en:"book"},{jp:"雑誌（ざっし）",en:"magazine"}
 ],
 patterns:[
   {title:"N1は N2です",explain:"The basic identifying sentence: 'As for N1, it is N2.' は marks the topic, です politely states what it is.",
    examples:[{jp:"私（わたし）は 学生（がくせい）です。",en:"I am a student."},{jp:"あの人（ひと）は 田中（たなか）さんです。",en:"That person is Mr. Tanaka."}]},
   {title:"これ／それ／あれ",explain:"Demonstrative pronouns that stand alone as the subject — no noun follows them directly. これ = near the speaker, それ = near the listener, あれ = far from both.",
    examples:[{jp:"これは 辞書（じしょ）です。",en:"This is a dictionary."},{jp:"あれは 私（わたし）の 本（ほん）です。",en:"That (over there) is my book."}]},
   {title:"〜か（question）",explain:"Add か to the end of a です/ます sentence to turn it into a yes/no question. Answer with はい、そうです (yes) or いいえ、違（ちが）います (no).",
    examples:[{jp:"これは 辞書（じしょ）ですか。",en:"Is this a dictionary?"},{jp:"はい、そうです。／いいえ、違（ちが）います。",en:"Yes, it is. / No, it isn't."}]},
   {title:"〜も（also）",explain:"Replaces は when the same thing applies to another topic too — 'also, too'.",
    examples:[{jp:"私（わたし）も 学生（がくせい）です。",en:"I am also a student."}]},
   {title:"N1の N2",explain:"Connects two nouns: N1 describes or possesses N2. Very flexible — can mean possession, subject matter, or category.",
    examples:[{jp:"これは 私（わたし）の 本（ほん）です。",en:"This is my book."},{jp:"それは 英語（えいご）の 雑誌（ざっし）です。",en:"That is an English-language magazine."}]}
 ]},
{n:2,
 vocab:[
   {jp:"この／その／あの",en:"this/that/that (+ noun)"},{jp:"万年筆（まんねんひつ）",en:"fountain pen"},{jp:"傘（かさ）",en:"umbrella"},
   {jp:"かばん",en:"bag"},{jp:"靴（くつ）",en:"shoes"},{jp:"時計（とけい）",en:"watch, clock"},
   {jp:"車（くるま）",en:"car"},{jp:"いくら",en:"how much (price)"},{jp:"〜円（えん）",en:"~ yen"},
   {jp:"誰（だれ）",en:"who"},{jp:"違（ちが）います",en:"to be different / wrong"},{jp:"そうです",en:"that's right"}
 ],
 patterns:[
   {title:"この／その／あの + N",explain:"Unlike これ/それ/あれ, these always attach directly to a following noun — 'this N', 'that N'.",
    examples:[{jp:"この かばんは 私（わたし）のです。",en:"This bag is mine."},{jp:"その 時計（とけい）は 高（たか）いです。",en:"That watch (near you) is expensive."}]},
   {title:"いくらですか",explain:"The standard way to ask a price.",
    examples:[{jp:"この 万年筆（まんねんひつ）は いくらですか。",en:"How much is this fountain pen?"},{jp:"3,000円（えん）です。",en:"It's 3,000 yen."}]},
   {title:"誰の〜ですか",explain:"誰の (whose) + noun asks who something belongs to.",
    examples:[{jp:"これは 誰（だれ）の 傘（かさ）ですか。",en:"Whose umbrella is this?"}]},
   {title:"N1（材料・国）の N2",explain:"N1のN2 can describe what something is made of or where it's from.",
    examples:[{jp:"これは ドイツの 車（くるま）です。",en:"This is a German car."}]}
 ]},
{n:3,
 vocab:[
   {jp:"ここ／そこ／あそこ",en:"here / there / over there"},{jp:"どちら・こちら・そちら・あちら",en:"which way (polite) / this way / that way / that way over there"},
   {jp:"教室（きょうしつ）",en:"classroom"},{jp:"事務所（じむしょ）",en:"office"},{jp:"電話（でんわ）",en:"telephone"},
   {jp:"お手洗（てあら）い",en:"restroom"},{jp:"受付（うけつけ）",en:"reception desk"},{jp:"会議室（かいぎしつ）",en:"meeting room"},
   {jp:"エレベーター",en:"elevator"},{jp:"階段（かいだん）",en:"stairs"},{jp:"国（くに）",en:"country"},{jp:"お国（くに）",en:"your country (polite)"}
 ],
 patterns:[
   {title:"N（場所）は どこですか",explain:"Ask where something/someone is located.",
    examples:[{jp:"お手洗（てあら）いは どこですか。",en:"Where is the restroom?"}]},
   {title:"ここ／そこ／あそこ + です",explain:"Answer a location question with these place words.",
    examples:[{jp:"事務所（じむしょ）は あそこです。",en:"The office is over there."}]},
   {title:"N1は N2（場所）です",explain:"Straightforward 'N1 is at/in N2' sentence.",
    examples:[{jp:"会議室（かいぎしつ）は 2階（かい）です。",en:"The meeting room is on the 2nd floor."}]},
   {title:"どちら（polite どこ）",explain:"A more polite way to ask 'where' — often used with people's origins.",
    examples:[{jp:"お国（くに）は どちらですか。",en:"Where are you from? (polite)"}]}
 ]},
{n:4,
 vocab:[
   {jp:"起（お）きます",en:"to wake up"},{jp:"寝（ね）ます",en:"to sleep"},{jp:"働（はたら）きます",en:"to work"},
   {jp:"休（やす）みます",en:"to rest, take a day off"},{jp:"勉強（べんきょう）します",en:"to study"},{jp:"終（お）わります",en:"to end"},
   {jp:"始（はじ）まります",en:"to begin"},{jp:"今（いま）",en:"now"},{jp:"〜時（じ）",en:"~ o'clock"},
   {jp:"〜分（ふん・ぷん）",en:"~ minute(s)"},{jp:"午前（ごぜん）",en:"a.m."},{jp:"午後（ごご）",en:"p.m."},
   {jp:"毎日（まいにち）",en:"every day"},{jp:"今日（きょう）",en:"today"},{jp:"明日（あした）",en:"tomorrow"},{jp:"昨日（きのう）",en:"yesterday"}
 ],
 patterns:[
   {title:"今 何時ですか",explain:"Ask the current time.",
    examples:[{jp:"今（いま） 何時（なんじ）ですか。",en:"What time is it now?"},{jp:"9時（じ）10分（ぷん）です。",en:"It's 9:10."}]},
   {title:"Vます（現在・習慣・未来）",explain:"The polite non-past form covers habitual actions and future plans, not just 'right now'.",
    examples:[{jp:"毎日（まいにち） 6時（じ）に 起（お）きます。",en:"I get up at 6 every day."}]},
   {title:"N（時間）から N（時間）まで",explain:"Brackets a time range: 'from ~ to ~'.",
    examples:[{jp:"9時（じ）から 5時（じ）まで 働（はたら）きます。",en:"I work from 9 to 5."}]},
   {title:"N1と N2",explain:"A simple 'and' connecting two nouns.",
    examples:[{jp:"土曜日（どようび）と 日曜日（にちようび）は 休（やす）みです。",en:"Saturday and Sunday are days off."}]},
   {title:"Sね",explain:"Added at the end of a sentence to seek agreement or share an observation — 'isn't it?'",
    examples:[{jp:"今日（きょう）は 暑（あつ）いですね。",en:"It's hot today, isn't it?"}]}
 ]},
{n:5,
 vocab:[
   {jp:"行（い）きます",en:"to go"},{jp:"来（き）ます",en:"to come"},{jp:"帰（かえ）ります",en:"to go home / return"},
   {jp:"駅（えき）",en:"station"},{jp:"電車（でんしゃ）",en:"train"},{jp:"バス",en:"bus"},
   {jp:"飛行機（ひこうき）",en:"airplane"},{jp:"自転車（じてんしゃ）",en:"bicycle"},{jp:"歩（ある）いて",en:"on foot, walking"},
   {jp:"いつ",en:"when"},{jp:"先週（せんしゅう）",en:"last week"},{jp:"来週（らいしゅう）",en:"next week"},{jp:"一人（ひとり）で",en:"alone"}
 ],
 patterns:[
   {title:"N（場所）へ 行きます／来ます／帰ります",explain:"へ marks the direction/destination of movement verbs.",
    examples:[{jp:"来週（らいしゅう） 国（くに）へ 帰（かえ）ります。",en:"I'll return to my country next week."}]},
   {title:"どこ［へ］も + negative",explain:"'Nowhere' — a question word + も + negative verb means a total negation.",
    examples:[{jp:"週末（しゅうまつ）は どこ［へ］も 行（い）きませんでした。",en:"I didn't go anywhere over the weekend."}]},
   {title:"N（乗り物）で",explain:"で marks the means of transportation.",
    examples:[{jp:"新幹線（しんかんせん）で 行（い）きます。",en:"I'll go by bullet train."}]},
   {title:"N（人）と",explain:"と marks a companion — 'together with'.",
    examples:[{jp:"家族（かぞく）と 旅行（りょこう）します。",en:"I'm traveling with my family."}]},
   {title:"いつ",explain:"Asks 'when', taking no particle before です/verbs.",
    examples:[{jp:"いつ 日本（にほん）へ 来（き）ましたか。",en:"When did you come to Japan?"}]}
 ]},
{n:6,
 vocab:[
   {jp:"食（た）べます",en:"to eat"},{jp:"飲（の）みます",en:"to drink"},{jp:"吸（す）います",en:"to smoke"},
   {jp:"見（み）ます",en:"to see, watch"},{jp:"聞（き）きます",en:"to listen, hear, ask"},{jp:"読（よ）みます",en:"to read"},
   {jp:"書（か）きます",en:"to write"},{jp:"買（か）います",en:"to buy"},{jp:"撮（と）ります",en:"to take (a photo)"},
   {jp:"します",en:"to do"},{jp:"何（なに）を",en:"what (object)"},{jp:"一緒（いっしょ）に",en:"together"}
 ],
 patterns:[
   {title:"Nを Vます",explain:"を marks the direct object of an action verb.",
    examples:[{jp:"朝（あさ）ごはんを 食（た）べます。",en:"I eat breakfast."}]},
   {title:"Vませんか",explain:"A polite invitation — 'won't you...?'",
    examples:[{jp:"映画（えいが）を 見（み）ませんか。",en:"Won't you watch a movie (with me)?"}]},
   {title:"Vましょう",explain:"'Let's...' — proposing an action together.",
    examples:[{jp:"一緒（いっしょ）に 行（い）きましょう。",en:"Let's go together."}]},
   {title:"何をしますか",explain:"A general-purpose way to ask what someone is doing/will do.",
    examples:[{jp:"週末（しゅうまつ） 何（なに）を しますか。",en:"What will you do on the weekend?"}]}
 ]},
{n:7,
 vocab:[
   {jp:"かけます",en:"to make (a phone call)"},{jp:"話（はな）します",en:"to speak"},{jp:"消（け）します",en:"to turn off, erase"},
   {jp:"あげます",en:"to give (to someone else)"},{jp:"もらいます",en:"to receive"},{jp:"くれます",en:"to give (to me)"},
   {jp:"手紙（てがみ）",en:"letter"},{jp:"プレゼント",en:"present, gift"},{jp:"花（はな）",en:"flower"},
   {jp:"何語（なにご）",en:"what language"},{jp:"もう",en:"already"},{jp:"まだ",en:"not yet, still"}
 ],
 patterns:[
   {title:"N（道具）で",explain:"で also marks the tool or method used to do something.",
    examples:[{jp:"はしで 食（た）べます。",en:"I eat with chopsticks."}]},
   {title:"何語で〜ですか",explain:"Ask what something is called in a particular language.",
    examples:[{jp:"これは 何語（なにご）で 何（なん）と 言（い）いますか。",en:"What is this called, in what language?"}]},
   {title:"あげます／もらいます",explain:"あげます = give (away from speaker); もらいます = receive. The giver/recipient is marked with に.",
    examples:[{jp:"誕生日（たんじょうび）に プレゼントを あげました。",en:"I gave a present for their birthday."}]},
   {title:"もう＋Vました／まだ＋negative",explain:"もう + past = 'already did'; まだ + negative = 'not yet'.",
    examples:[{jp:"もう 晩（ばん）ごはんを 食（た）べましたか。",en:"Have you already eaten dinner?"},{jp:"いいえ、まだです。",en:"No, not yet."}]}
 ]},
{n:8,
 vocab:[
   {jp:"大（おお）きい／小（ちい）さい",en:"big / small"},{jp:"新（あたら）しい／古（ふる）い",en:"new / old"},
   {jp:"いい／悪（わる）い",en:"good / bad"},{jp:"熱（あつ）い／寒（さむ）い",en:"hot / cold"},
   {jp:"難（むずか）しい／易（やさ）しい",en:"difficult / easy"},{jp:"高（たか）い／安（やす）い",en:"expensive (or tall) / cheap"},
   {jp:"きれい（な）",en:"pretty, clean (な-adj)"},{jp:"静（しず）か（な）",en:"quiet (な-adj)"},
   {jp:"便利（べんり）（な）",en:"convenient (な-adj)"},{jp:"元気（げんき）（な）",en:"healthy, energetic (な-adj)"}
 ],
 patterns:[
   {title:"Nは adjです",explain:"Simple description sentence, works for both い-adjectives and な-adjectives (な-adjectives drop な before です).",
    examples:[{jp:"この 町（まち）は 静（しず）かです。",en:"This town is quiet."}]},
   {title:"とても／あまり",explain:"とても = very (positive); あまり + negative = not very.",
    examples:[{jp:"あまり 難（むずか）しくないです。",en:"It's not very difficult."}]},
   {title:"adj-く なります",explain:"い-adjective stem + く + なります = 'became/gets [adj]'. な-adjectives use に instead of く.",
    examples:[{jp:"涼（すず）しく なりました。",en:"It got cool."}]},
   {title:"N1は N2が adj",explain:"Describes a specific aspect of N1 using N2 as the subject of the description.",
    examples:[{jp:"東京（とうきょう）は 物価（ぶっか）が 高（たか）いです。",en:"Tokyo has a high cost of living."}]}
 ]},
{n:9,
 vocab:[
   {jp:"好（す）き／嫌（きら）い",en:"like / dislike (な-adj)"},{jp:"上手（じょうず）／下手（へた）",en:"skilled at / bad at (な-adj)"},
   {jp:"わかります",en:"to understand"},{jp:"ほしい",en:"want (a thing)"},{jp:"音楽（おんがく）",en:"music"},
   {jp:"スポーツ",en:"sports"},{jp:"料理（りょうり）",en:"cooking, cuisine"},{jp:"ダンス",en:"dance"},{jp:"歌（うた）",en:"song"}
 ],
 patterns:[
   {title:"Nが 好（す）きです",explain:"With 好き/嫌い/上手/下手/わかります/ほしい, the object takes が instead of を.",
    examples:[{jp:"私（わたし）は すしが 好（す）きです。",en:"I like sushi."}]},
   {title:"Nが 上手（じょうず）です",explain:"Describes skill at something.",
    examples:[{jp:"山田（やまだ）さんは 歌（うた）が 上手（じょうず）です。",en:"Yamada-san is good at singing."}]},
   {title:"Nが わかります",explain:"Describes comprehension/understanding.",
    examples:[{jp:"日本語（にほんご）が 少（すこ）し わかります。",en:"I understand a little Japanese."}]},
   {title:"Nが ほしいです",explain:"Expresses wanting a thing (not an action — for that, use Vたい, covered in Lesson 13).",
    examples:[{jp:"新（あたら）しい 車（くるま）が ほしいです。",en:"I want a new car."}]}
 ]},
{n:10,
 vocab:[
   {jp:"あります",en:"there is (inanimate)"},{jp:"います",en:"there is (animate)"},{jp:"上（うえ）／下（した）",en:"above / below"},
   {jp:"前（まえ）／後（うし）ろ",en:"front / behind"},{jp:"中（なか）／外（そと）",en:"inside / outside"},
   {jp:"隣（となり）",en:"next to"},{jp:"近（ちか）く",en:"nearby"},{jp:"間（あいだ）",en:"between"},
   {jp:"机（つくえ）",en:"desk"},{jp:"椅子（いす）",en:"chair"},{jp:"冷蔵庫（れいぞうこ）",en:"refrigerator"}
 ],
 patterns:[
   {title:"Nが あります",explain:"Existence of inanimate things (objects, plants, events).",
    examples:[{jp:"部屋（へや）に テレビが あります。",en:"There is a TV in the room."}]},
   {title:"Nが います",explain:"Existence of animate things (people, animals).",
    examples:[{jp:"庭（にわ）に 犬（いぬ）が います。",en:"There is a dog in the yard."}]},
   {title:"場所の位置に",explain:"Location word + の + position noun + に pinpoints exactly where.",
    examples:[{jp:"机（つくえ）の 下（した）に かばんが あります。",en:"There's a bag under the desk."}]},
   {title:"何がありますか",explain:"Ask what exists somewhere.",
    examples:[{jp:"冷蔵庫（れいぞうこ）に 何（なに）が ありますか。",en:"What's in the fridge?"}]}
 ]},
{n:11,
 vocab:[
   {jp:"〜つ",en:"~ (general counter)"},{jp:"〜人（にん）",en:"~ people"},{jp:"〜枚（まい）",en:"~ (flat objects)"},
   {jp:"〜本（ほん）",en:"~ (long objects)"},{jp:"〜匹（ひき）",en:"~ (small animals)"},{jp:"〜台（だい）",en:"~ (machines, vehicles)"},
   {jp:"〜杯（はい）",en:"~ (cupfuls)"},{jp:"だけ",en:"only"},{jp:"全部（ぜんぶ）で",en:"in total"},
   {jp:"どのくらい",en:"about how much/many"},{jp:"りんご",en:"apple"},{jp:"みかん",en:"mandarin orange"},{jp:"卵（たまご）",en:"egg"}
 ],
 patterns:[
   {title:"数量＋動詞",explain:"Quantity phrases (number+counter) typically come right before the verb, without a particle.",
    examples:[{jp:"りんごを 4（よん）つ 買（か）いました。",en:"I bought four apples."}]},
   {title:"だけ",explain:"Attaches to a quantity/noun to mean 'only, just'.",
    examples:[{jp:"一（ひと）つだけ 食（た）べました。",en:"I ate only one."}]},
   {title:"どのくらい",explain:"Asks for an approximate quantity.",
    examples:[{jp:"卵（たまご）は どのくらい ありますか。",en:"About how many eggs are there?"}]},
   {title:"とりに 行（い）きます",explain:"Vます-stem + に + 行きます expresses going somewhere to fetch/do something.",
    examples:[{jp:"忘（わす）れ物（もの）を とりに 行（い）きます。",en:"I'll go get the thing I forgot."}]}
 ]},
{n:12,
 vocab:[
   {jp:"どちら",en:"which (of two)"},{jp:"もっと",en:"more"},{jp:"一番（いちばん）",en:"the most, number one"},
   {jp:"〜より",en:"than ~"},{jp:"季節（きせつ）",en:"season"},{jp:"春（はる）／夏（なつ）／秋（あき）／冬（ふゆ）",en:"spring / summer / autumn / winter"},{jp:"〜の中（なか）で",en:"among ~"}
 ],
 patterns:[
   {title:"N1とN2と、どちらが〜ですか",explain:"Ask which of two options is more X.",
    examples:[{jp:"電車（でんしゃ）と バスと、どちらが 速（はや）いですか。",en:"Which is faster, the train or the bus?"}]},
   {title:"N1は N2より〜",explain:"Compares N1 against N2 using より (than).",
    examples:[{jp:"日本（にほん）は 台湾（たいわん）より 寒（さむ）いです。",en:"Japan is colder than Taiwan."}]},
   {title:"Nの中で 一番〜",explain:"Superlative: 'the most X among N'.",
    examples:[{jp:"果物（くだもの）の 中（なか）で 何（なに）が 一番（いちばん） 好（す）きですか。",en:"What fruit do you like the most?"}]},
   {title:"adjかったです（過去）",explain:"い-adjective past tense: drop い, add かった. な-adjectives use だった/でした.",
    examples:[{jp:"昨日（きのう）は 忙（いそが）しかったです。",en:"I was busy yesterday."}]}
 ]},
{n:13,
 vocab:[
   {jp:"〜たい",en:"want to (do)"},{jp:"どこも／何（なに）も／誰（だれ）も",en:"nowhere / nothing / no one (+negative)"},
   {jp:"旅行（りょこう）",en:"travel"},{jp:"温泉（おんせん）",en:"hot spring"},{jp:"買（か）い物（もの）",en:"shopping"},{jp:"遊（あそ）びに",en:"(to go) for fun/to play"}
 ],
 patterns:[
   {title:"Vたいです",explain:"Vます-stem + たい expresses the speaker's own desire to do something. The object often takes が instead of を.",
    examples:[{jp:"沖縄（おきなわ）へ 行（い）きたいです。",en:"I want to go to Okinawa."}]},
   {title:"Vに 行（い）きます（目的）",explain:"Vます-stem + に + 行きます/来ます/帰ります expresses the purpose of the movement.",
    examples:[{jp:"海（うみ）へ 泳（およ）ぎに 行（い）きます。",en:"I'll go to the sea to swim."}]},
   {title:"何もしたくないです",explain:"何も + Vたくない (negative desire) — 'don't want to do anything'.",
    examples:[{jp:"疲（つか）れて 何（なに）も したくないです。",en:"I'm tired and don't want to do anything."}]}
 ]},
{n:14,
 vocab:[
   {jp:"待（ま）ちます",en:"to wait"},{jp:"手伝（てつだ）います",en:"to help"},{jp:"急（いそ）ぎます",en:"to hurry"},
   {jp:"座（すわ）ります",en:"to sit"},{jp:"立（た）ちます",en:"to stand"},{jp:"コピーします",en:"to photocopy"},
   {jp:"結婚（けっこん）しています",en:"to be married"},{jp:"住（す）んでいます",en:"to live (somewhere)"},{jp:"知（し）っています",en:"to know"}
 ],
 patterns:[
   {title:"Vてください",explain:"Te-form + ください is a polite request/instruction.",
    examples:[{jp:"ここに 名前（なまえ）を 書（か）いてください。",en:"Please write your name here."}]},
   {title:"Vています（進行）",explain:"Te-form + います describes an action currently in progress.",
    examples:[{jp:"今（いま）、雨（あめ）が 降（ふ）っています。",en:"It's raining right now."}]},
   {title:"Vています（状態・職業）",explain:"Also used for ongoing states or habitual facts like jobs, marital status, residence.",
    examples:[{jp:"銀行（ぎんこう）に 勤（つと）めています。",en:"I work at a bank."}]}
 ]},
{n:15,
 vocab:[
   {jp:"使（つか）います",en:"to use"},{jp:"座（すわ）ります",en:"to sit"},{jp:"入（はい）ります",en:"to enter"},
   {jp:"吸（す）います",en:"to smoke"},{jp:"エアコン",en:"air conditioner"},{jp:"窓（まど）",en:"window"},{jp:"だめ",en:"not allowed, no good"}
 ],
 patterns:[
   {title:"Vてもいいですか",explain:"Te-form + もいいですか asks for permission — 'may I...?'",
    examples:[{jp:"エアコンを つけても いいですか。",en:"May I turn on the air conditioner?"}]},
   {title:"Vてはいけません",explain:"Te-form + はいけません states a prohibition — 'must not'.",
    examples:[{jp:"ここに 車（くるま）を 止（と）めては いけません。",en:"You mustn't park a car here."}]}
 ]},
{n:16,
 vocab:[
   {jp:"提出（ていしゅつ）します",en:"to submit"},{jp:"準備（じゅんび）します",en:"to prepare"},{jp:"並（なら）びます",en:"to line up"},
   {jp:"ビザ",en:"visa"},{jp:"パスポート",en:"passport"},{jp:"サイン",en:"signature"}
 ],
 patterns:[
   {title:"Vなければなりません",explain:"Vない-form (drop い) + ければなりません = 'must do'.",
    examples:[{jp:"パスポートを 見（み）せなければ なりません。",en:"I must show my passport."}]},
   {title:"Vなくてもいいです",explain:"Vない-form + くてもいいです = 'don't have to do'.",
    examples:[{jp:"急（いそ）がなくても いいです。",en:"You don't have to hurry."}]}
 ]},
{n:17,
 vocab:[
   {jp:"弾（ひ）きます",en:"to play (an instrument)"},{jp:"泳（およ）ぎます",en:"to swim"},{jp:"運転（うんてん）します",en:"to drive"},
   {jp:"特技（とくぎ）",en:"special skill"},{jp:"趣味（しゅみ）",en:"hobby"},{jp:"経験（けいけん）",en:"experience"}
 ],
 patterns:[
   {title:"辞書形（dictionary form）",explain:"The plain, non-past form of a verb — the form you'd look up in a dictionary. Needed as the base for many N4-level patterns.",
    examples:[{jp:"食（た）べます → 食（た）べる",en:"'eat' (polite) → 'eat' (dictionary form)"}]},
   {title:"Vることができます",explain:"Dictionary form + ことができます expresses ability.",
    examples:[{jp:"漢字（かんじ）を 書（か）くことが できます。",en:"I can write kanji."}]},
   {title:"Vる前（まえ）に／Vた後（あと）で",explain:"Dictionary form + 前に = 'before doing'; Vた-form + 後で = 'after doing'.",
    examples:[{jp:"寝（ね）る前（まえ）に 歯（は）を 磨（みが）きます。",en:"I brush my teeth before sleeping."}]}
 ]},
{n:18,
 vocab:[
   {jp:"掃除（そうじ）します",en:"to clean"},{jp:"洗濯（せんたく）します",en:"to do laundry"},{jp:"散歩（さんぽ）します",en:"to go for a walk"},{jp:"のんびり",en:"leisurely, relaxed"}
 ],
 patterns:[
   {title:"〜たり〜たりします",explain:"Lists a few representative example actions, not an exhaustive list — 'things like A and B'.",
    examples:[{jp:"週末（しゅうまつ）は 本（ほん）を 読（よ）んだり テレビを 見（み）たり します。",en:"On weekends I do things like read books and watch TV."}]}
 ]},
{n:19,
 vocab:[
   {jp:"予定（よてい）",en:"plan, schedule"},{jp:"帰国（きこく）します",en:"to return to one's country"},
   {jp:"卒業（そつぎょう）します",en:"to graduate"},{jp:"引（ひ）っ越（こ）します",en:"to move house"},{jp:"転勤（てんきん）",en:"job transfer"}
 ],
 patterns:[
   {title:"辞書形＋予定です",explain:"States a plan using the dictionary form of the verb.",
    examples:[{jp:"来月（らいげつ） 引（ひ）っ越（こ）す 予定（よてい）です。",en:"I plan to move next month."}]},
   {title:"意向形＋と思っています",explain:"Volitional form ('let's...' form used reflexively) + と思っています expresses an intention held over time, not a spur-of-the-moment idea.",
    examples:[{jp:"留学（りゅうがく）しようと 思（おも）っています。",en:"I'm thinking of studying abroad."}]}
 ]},
{n:20,
 vocab:[
   {jp:"疲（つか）れます",en:"to get tired"},{jp:"太（ふと）ります",en:"to gain weight"},{jp:"やせます",en:"to lose weight"},
   {jp:"込（こ）みます",en:"to get crowded"},{jp:"無理（むり）",en:"unreasonable, too much"}
 ],
 patterns:[
   {title:"Vすぎます",explain:"Vます-stem + すぎます = 'do too much of'.",
    examples:[{jp:"食（た）べすぎて、おなかが 痛（いた）いです。",en:"I ate too much and my stomach hurts."}]},
   {title:"Vた方（ほう）がいいです／Vない方がいいです",explain:"Giving advice: 'you'd better do' / 'you'd better not do'.",
    examples:[{jp:"たばこは やめた 方（ほう）が いいです。",en:"You'd better quit smoking."}]}
 ]},
{n:21,
 vocab:[
   {jp:"台風（たいふう）",en:"typhoon"},{jp:"地震（じしん）",en:"earthquake"},{jp:"天気予報（てんきよほう）",en:"weather forecast"},{jp:"意見（いけん）",en:"opinion"}
 ],
 patterns:[
   {title:"普通形＋と思います",explain:"Plain form + と思います = 'I think that...' States an opinion.",
    examples:[{jp:"彼（かれ）は 来（こ）ないと 思（おも）います。",en:"I don't think he's coming."}]},
   {title:"でしょう",explain:"Plain form + でしょう expresses probability, often with a guessing/falling intonation.",
    examples:[{jp:"明日（あした）は 雪（ゆき）でしょう。",en:"It will probably snow tomorrow."}]},
   {title:"N（行事）が あります",explain:"あります can also describe scheduled events, not just physical objects.",
    examples:[{jp:"来週（らいしゅう） テストが あります。",en:"There's a test next week."}]}
 ]},
{n:22,
 vocab:[
   {jp:"くれます",en:"to give (to me/my in-group)"},{jp:"かけます（眼鏡）",en:"to wear (glasses)"},{jp:"立（た）ちます",en:"to stand"}
 ],
 patterns:[
   {title:"Vる／Vた ＋ N",explain:"A verb clause in plain form can modify a noun directly, placed right before it — like a long adjective.",
    examples:[{jp:"これは 私（わたし）が 撮（と）った 写真（しゃしん）です。",en:"This is the photo that I took."}]},
   {title:"Vている ＋ N",explain:"An ongoing-state clause can modify a noun the same way.",
    examples:[{jp:"眼鏡（めがね）を かけている 人（ひと）は 私（わたし）の 母（はは）です。",en:"The person wearing glasses is my mother."}]}
 ]},
{n:23,
 vocab:[
   {jp:"要（い）ります",en:"to be necessary, needed"},{jp:"曲（ま）がります",en:"to turn"},{jp:"渡（わた）ります",en:"to cross"},
   {jp:"通（とお）ります",en:"to pass through"},{jp:"まっすぐ",en:"straight ahead"}
 ],
 patterns:[
   {title:"Vるとき／Vたとき",explain:"'When [an event happens/happened]'. Dictionary form = at/before the moment; た-form = after it's already happened.",
    examples:[{jp:"家（いえ）を 出（で）るとき、電気（でんき）を 消（け）します。",en:"When I leave the house, I turn off the lights."}]},
   {title:"Nを ＋ 移動動詞",explain:"を marks the space or path being traversed with verbs like 渡ります, 曲がります, 通ります, 歩きます.",
    examples:[{jp:"橋（はし）を 渡（わた）ります。",en:"I cross the bridge."}]}
 ]},
{n:24,
 vocab:[
   {jp:"褒（ほ）めます",en:"to praise"},{jp:"叱（しか）ります",en:"to scold"},{jp:"建（た）てます",en:"to build"},
   {jp:"招待（しょうたい）します",en:"to invite"},{jp:"発見（はっけん）します",en:"to discover"}
 ],
 patterns:[
   {title:"受身形の作り方",explain:"The passive form: for group 1 verbs, change the final う-sound to あ-sound + れる (褒める→褒められる already ends in る so it follows group 2 rules: drop る, add られる).",
    examples:[{jp:"褒（ほ）める → 褒（ほ）められる",en:"'to praise' → 'to be praised'"}]},
   {title:"〜に ＋ 受身形",explain:"The person doing the action to you takes に in a passive sentence.",
    examples:[{jp:"先生（せんせい）に 褒（ほ）められました。",en:"I was praised by my teacher."}]}
 ]},
{n:25,
 vocab:[
   {jp:"休（やす）ませます",en:"to let/make (someone) rest"},{jp:"手伝（てつだ）わせます",en:"to make (someone) help"},
   {jp:"行（い）かせます",en:"to make/let (someone) go"},{jp:"泣（な）かせます",en:"to make (someone) cry"}
 ],
 patterns:[
   {title:"使役形の作り方",explain:"The causative form: group 1 verbs change the final う-sound to あ-sound + せる; group 2 verbs drop る and add させる.",
    examples:[{jp:"休（やす）む → 休（やす）ませる",en:"'to rest' → 'to make/let (someone) rest'"}]},
   {title:"〜（さ）せてください",explain:"Causative te-form + ください is a humble way to ask permission to do something yourself — 'please let me...'",
    examples:[{jp:"説明（せつめい）させてください。",en:"Please let me explain."}]}
 ]}
];
