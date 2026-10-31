/* ============================================================
   VERBS — the verb list the conjugation engine (conjugation.js)
   works from. APPEND-ONLY: saved progress is keyed by array index
   (conjs-<verbIdx>-<formKey>-<frameIdx>), so never reorder or delete.
   Fields beyond the engine's own (dict/stem/oku/group/...):
     jlpt  5 or 4.
     tags  what the verb can do in a sentence frame:
             'action' a chosen action (requests, permission, plans,
                      "let's", potential, causative)
             'person' can be done to a person (passive frames)
             'state'  non-action, subject "I", natural as a state in
                      もう___います (知っています, 分かっています)
             'thing'  the subject is a thing, not "I"; comp is then
                      that subject (e.g. 雨（あめ）が)
     comp  optional complement with its particle, filled into a
           frame's {o} slot: {jp:'水（みず）を', en:'water'}.
     skip  form keys never drilled for this verb.
     drill false = reference only, never drilled.
   ============================================================ */
const VERBS = [
  // ---- Group 1 (godan) ----
  {dict:"書（か）く", stem:"書（か）", oku:"く", group:1, meaning:"to write", jlpt:5, tags:['action'], comp:{jp:'手紙（てがみ）を', en:'a letter'}},
  {dict:"聞（き）く", stem:"聞（き）", oku:"く", group:1, meaning:"to listen, hear, ask", jlpt:5, tags:['action','person'], comp:{jp:'音楽（おんがく）を', en:'music'}},
  {dict:"歩（ある）く", stem:"歩（ある）", oku:"く", group:1, meaning:"to walk", jlpt:5, tags:['action'], comp:{jp:'駅（えき）まで', en:'to the station'}},
  {dict:"働（はたら）く", stem:"働（はたら）", oku:"く", group:1, meaning:"to work", jlpt:5, tags:['action']},
  {dict:"泳（およ）ぐ", stem:"泳（およ）", oku:"ぐ", group:1, meaning:"to swim", jlpt:5, tags:['action'], comp:{jp:'海（うみ）で', en:'in the sea'}},
  {dict:"飲（の）む", stem:"飲（の）", oku:"む", group:1, meaning:"to drink", jlpt:5, tags:['action'], comp:{jp:'水（みず）を', en:'water'}},
  {dict:"読（よ）む", stem:"読（よ）", oku:"む", group:1, meaning:"to read", jlpt:5, tags:['action'], comp:{jp:'この本（ほん）を', en:'this book'}},
  {dict:"住（す）む", stem:"住（す）", oku:"む", group:1, meaning:"to live (somewhere)", jlpt:5, tags:['action'], comp:{jp:'東京（とうきょう）に', en:'in Tokyo'}},
  {dict:"死（し）ぬ", stem:"死（し）", oku:"ぬ", group:1, meaning:"to die", jlpt:5, tags:[], drill:false},
  {dict:"遊（あそ）ぶ", stem:"遊（あそ）", oku:"ぶ", group:1, meaning:"to play", jlpt:5, tags:['action'], comp:{jp:'公園（こうえん）で', en:'in the park'}},
  {dict:"話（はな）す", stem:"話（はな）", oku:"す", group:1, meaning:"to speak", jlpt:5, tags:['action'], comp:{jp:'日本語（にほんご）で', en:'in Japanese'}},
  {dict:"消（け）す", stem:"消（け）", oku:"す", group:1, meaning:"to turn off, erase", jlpt:5, tags:['action'], comp:{jp:'電気（でんき）を', en:'the light'}},
  {dict:"貸（か）す", stem:"貸（か）", oku:"す", group:1, meaning:"to lend", jlpt:5, tags:['action'], comp:{jp:'ペンを', en:'a pen'}},
  {dict:"待（ま）つ", stem:"待（ま）", oku:"つ", group:1, meaning:"to wait", jlpt:5, tags:['action'], comp:{jp:'ここで', en:'here'}},
  {dict:"立（た）つ", stem:"立（た）", oku:"つ", group:1, meaning:"to stand", jlpt:5, tags:['action']},
  {dict:"買（か）う", stem:"買（か）", oku:"う", group:1, meaning:"to buy", jlpt:5, tags:['action'], comp:{jp:'パンを', en:'bread'}},
  {dict:"使（つか）う", stem:"使（つか）", oku:"う", group:1, meaning:"to use", jlpt:5, tags:['action'], comp:{jp:'このペンを', en:'this pen'}},
  {dict:"手伝（てつだ）う", stem:"手伝（てつだ）", oku:"う", group:1, meaning:"to help", jlpt:4, tags:['action'], comp:{jp:'父（ちち）を', en:'my father'}},
  {dict:"会（あ）う", stem:"会（あ）", oku:"う", group:1, meaning:"to meet", jlpt:5, tags:['action'], comp:{jp:'友達（ともだち）に', en:'a friend'}},
  {dict:"帰（かえ）る", stem:"帰（かえ）", oku:"る", group:1, meaning:"to go home / return", trap:true, jlpt:5, tags:['action']},
  {dict:"入（はい）る", stem:"入（はい）", oku:"る", group:1, meaning:"to enter", trap:true, jlpt:5, tags:['action'], comp:{jp:'部屋（へや）に', en:'the room'}},
  {dict:"要（い）る", stem:"要（い）", oku:"る", group:1, meaning:"to be necessary", trap:true, jlpt:5, tags:[], comp:{jp:'傘（かさ）が', en:'an umbrella'}, skip:['te']},
  {dict:"知（し）る", stem:"知（し）", oku:"る", group:1, meaning:"to know", trap:true, jlpt:5, tags:['state'], skip:['dict']},
  {dict:"走（はし）る", stem:"走（はし）", oku:"る", group:1, meaning:"to run", trap:true, jlpt:5, tags:['action']},
  {dict:"作（つく）る", stem:"作（つく）", oku:"る", group:1, meaning:"to make", jlpt:5, tags:['action'], comp:{jp:'晩（ばん）ご飯（はん）を', en:'dinner'}},
  {dict:"座（すわ）る", stem:"座（すわ）", oku:"る", group:1, meaning:"to sit", jlpt:5, tags:['action'], comp:{jp:'ここに', en:'here'}},
  {dict:"撮（と）る", stem:"撮（と）", oku:"る", group:1, meaning:"to take (a photo)", jlpt:5, tags:['action'], comp:{jp:'ここで', en:'here'}},
  {dict:"曲（ま）がる", stem:"曲（ま）", oku:"がる", group:1, meaning:"to turn", jlpt:5, tags:['action'], comp:{jp:'右（みぎ）に', en:'right'}},
  {dict:"渡（わた）る", stem:"渡（わた）", oku:"る", group:1, meaning:"to cross", jlpt:5, tags:['action'], comp:{jp:'橋（はし）を', en:'the bridge'}},
  {dict:"通（とお）る", stem:"通（とお）", oku:"る", group:1, meaning:"to pass through", jlpt:4, tags:['action'], comp:{jp:'この道（みち）を', en:'this road'}},
  {dict:"分（わ）かる", stem:"分（わ）", oku:"かる", group:1, meaning:"to understand", jlpt:5, tags:['state']},
  {dict:"行（い）く", stem:"行（い）", oku:"く", group:1, meaning:"to go", irregularTe:true, jlpt:5, tags:['action'], comp:{jp:'学校（がっこう）に', en:'to school'}},
  // ---- Group 2 (ichidan) ----
  {dict:"食（た）べる", stem:"食（た）", oku:"べる", group:2, meaning:"to eat", jlpt:5, tags:['action'], comp:{jp:'野菜（やさい）を', en:'vegetables'}},
  {dict:"見（み）る", stem:"見（み）", oku:"る", group:2, meaning:"to see, watch", jlpt:5, tags:['action'], comp:{jp:'テレビを', en:'TV'}},
  {dict:"起（お）きる", stem:"起（お）", oku:"きる", group:2, meaning:"to wake up", jlpt:5, tags:['action']},
  {dict:"寝（ね）る", stem:"寝（ね）", oku:"る", group:2, meaning:"to sleep", jlpt:5, tags:['action']},
  {dict:"出（で）る", stem:"出（で）", oku:"る", group:2, meaning:"to leave, go out", jlpt:5, tags:['action'], comp:{jp:'部屋（へや）を', en:'the room'}},
  {dict:"見（み）せる", stem:"見（み）", oku:"せる", group:2, meaning:"to show", jlpt:5, tags:['action'], comp:{jp:'写真（しゃしん）を', en:'the photo'}},
  {dict:"教（おし）える", stem:"教（おし）", oku:"える", group:2, meaning:"to teach", jlpt:5, tags:['action'], comp:{jp:'日本語（にほんご）を', en:'Japanese'}},
  {dict:"覚（おぼ）える", stem:"覚（おぼ）", oku:"える", group:2, meaning:"to remember", jlpt:5, tags:['action'], comp:{jp:'漢字（かんじ）を', en:'kanji'}},
  {dict:"着（き）る", stem:"着（き）", oku:"る", group:2, meaning:"to wear", jlpt:5, tags:['action'], comp:{jp:'セーターを', en:'a sweater'}},
  {dict:"借（か）りる", stem:"借（か）", oku:"りる", group:2, meaning:"to borrow", jlpt:5, tags:['action'], comp:{jp:'本（ほん）を', en:'a book'}},
  {dict:"降（お）りる", stem:"降（お）", oku:"りる", group:2, meaning:"to get off, go down", jlpt:5, tags:['action'], comp:{jp:'電車（でんしゃ）を', en:'the train'}},
  {dict:"疲（つか）れる", stem:"疲（つか）", oku:"れる", group:2, meaning:"to get tired", jlpt:5, tags:['state']},
  {dict:"褒（ほ）める", stem:"褒（ほ）", oku:"める", group:2, meaning:"to praise", jlpt:4, tags:['action','person']},
  {dict:"閉（し）める", stem:"閉（し）", oku:"める", group:2, meaning:"to close", jlpt:5, tags:['action'], comp:{jp:'窓（まど）を', en:'the window'}},
  // ---- Group 3 (irregular) ----
  {dict:"する", group:3, irregular:'suru', meaning:"to do", stem:"", jlpt:5, tags:['action'], comp:{jp:'宿題（しゅくだい）を', en:'homework'}},
  {dict:"来（く）る", group:3, irregular:'kuru', meaning:"to come", jlpt:5, tags:['action'], comp:{jp:'ここに', en:'here'}},
  {dict:"勉強（べんきょう）する", group:3, irregular:'suru', meaning:"to study", stem:"勉強（べんきょう）", jlpt:5, tags:['action'], comp:{jp:'日本語（にほんご）を', en:'Japanese'}},
  {dict:"洗濯（せんたく）する", group:3, irregular:'suru', meaning:"to do laundry", stem:"洗濯（せんたく）", jlpt:5, tags:['action']},
  {dict:"掃除（そうじ）する", group:3, irregular:'suru', meaning:"to clean", stem:"掃除（そうじ）", jlpt:5, tags:['action'], comp:{jp:'部屋（へや）を', en:'the room'}},
  {dict:"結婚（けっこん）する", group:3, irregular:'suru', meaning:"to marry", stem:"結婚（けっこん）", jlpt:5, tags:['action']},
  // ==== Appended verbs (index 52 on). Grouped for reading only; order is fixed. ====
  // ---- Group 1 (godan) ----
  {dict:"洗（あら）う", stem:"洗（あら）", oku:"う", group:1, meaning:"to wash", jlpt:5, tags:['action'], comp:{jp:'手（て）を', en:'my hands'}},
  {dict:"言（い）う", stem:"言（い）", oku:"う", group:1, meaning:"to say", jlpt:5, tags:['action','person'], comp:{jp:'答（こた）えを', en:'the answer'}},
  {dict:"歌（うた）う", stem:"歌（うた）", oku:"う", group:1, meaning:"to sing", jlpt:5, tags:['action'], comp:{jp:'歌（うた）を', en:'a song'}},
  {dict:"習（なら）う", stem:"習（なら）", oku:"う", group:1, meaning:"to learn (from someone)", jlpt:5, tags:['action'], comp:{jp:'ピアノを', en:'the piano'}},
  {dict:"笑（わら）う", stem:"笑（わら）", oku:"う", group:1, meaning:"to laugh", jlpt:4, tags:['action','person']},
  {dict:"誘（さそ）う", stem:"誘（さそ）", oku:"う", group:1, meaning:"to invite", jlpt:4, tags:['action','person'], comp:{jp:'友達（ともだち）を', en:'a friend'}},
  {dict:"置（お）く", stem:"置（お）", oku:"く", group:1, meaning:"to put, place", jlpt:5, tags:['action'], comp:{jp:'荷物（にもつ）を', en:'the luggage'}},
  {dict:"弾（ひ）く", stem:"弾（ひ）", oku:"く", group:1, meaning:"to play (an instrument)", jlpt:5, tags:['action'], comp:{jp:'ギターを', en:'the guitar'}},
  {dict:"磨（みが）く", stem:"磨（みが）", oku:"く", group:1, meaning:"to brush, polish", jlpt:5, tags:['action'], comp:{jp:'歯（は）を', en:'my teeth'}},
  {dict:"咲（さ）く", stem:"咲（さ）", oku:"く", group:1, meaning:"to bloom", jlpt:5, tags:['thing'], comp:{jp:'花（はな）が', en:'the flower'}},
  {dict:"急（いそ）ぐ", stem:"急（いそ）", oku:"ぐ", group:1, meaning:"to hurry", jlpt:4, tags:['action']},
  {dict:"脱（ぬ）ぐ", stem:"脱（ぬ）", oku:"ぐ", group:1, meaning:"to take off (clothes, shoes)", jlpt:5, tags:['action'], comp:{jp:'靴（くつ）を', en:'my shoes'}},
  {dict:"出（だ）す", stem:"出（だ）", oku:"す", group:1, meaning:"to take out, put out", jlpt:5, tags:['action'], comp:{jp:'ゴミを', en:'the trash'}},
  {dict:"返（かえ）す", stem:"返（かえ）", oku:"す", group:1, meaning:"to give back", jlpt:5, tags:['action'], comp:{jp:'本（ほん）を', en:'the book'}},
  {dict:"押（お）す", stem:"押（お）", oku:"す", group:1, meaning:"to push, press", jlpt:5, tags:['action'], comp:{jp:'このボタンを', en:'this button'}},
  {dict:"探（さが）す", stem:"探（さが）", oku:"す", group:1, meaning:"to look for", jlpt:4, tags:['action'], comp:{jp:'鍵（かぎ）を', en:'my key'}},
  {dict:"落（お）とす", stem:"落（お）", oku:"とす", group:1, meaning:"to drop, lose", jlpt:4, tags:[], comp:{jp:'財布（さいふ）を', en:'my wallet'}},
  {dict:"起（お）こす", stem:"起（お）", oku:"こす", group:1, meaning:"to wake (someone) up", jlpt:4, tags:['action','person'], comp:{jp:'弟（おとうと）を', en:'my little brother'}},
  {dict:"持（も）つ", stem:"持（も）", oku:"つ", group:1, meaning:"to hold, carry", jlpt:5, tags:['action'], comp:{jp:'かばんを', en:'the bag'}},
  {dict:"勝（か）つ", stem:"勝（か）", oku:"つ", group:1, meaning:"to win", jlpt:4, tags:['action'], comp:{jp:'試合（しあい）に', en:'the match'}, skip:['causative']},
  {dict:"呼（よ）ぶ", stem:"呼（よ）", oku:"ぶ", group:1, meaning:"to call", jlpt:5, tags:['action','person'], comp:{jp:'タクシーを', en:'a taxi'}},
  {dict:"並（なら）ぶ", stem:"並（なら）", oku:"ぶ", group:1, meaning:"to line up", jlpt:5, tags:['action'], comp:{jp:'ここに', en:'here'}},
  {dict:"運（はこ）ぶ", stem:"運（はこ）", oku:"ぶ", group:1, meaning:"to carry", jlpt:4, tags:['action'], comp:{jp:'この箱（はこ）を', en:'this box'}},
  {dict:"休（やす）む", stem:"休（やす）", oku:"む", group:1, meaning:"to rest, take time off", jlpt:5, tags:['action'], comp:{jp:'学校（がっこう）を', en:'school'}},
  {dict:"頼（たの）む", stem:"頼（たの）", oku:"む", group:1, meaning:"to ask (a favour)", jlpt:5, tags:['action','person']},
  {dict:"包（つつ）む", stem:"包（つつ）", oku:"む", group:1, meaning:"to wrap", jlpt:4, tags:['action'], comp:{jp:'プレゼントを', en:'the present'}},
  {dict:"乗（の）る", stem:"乗（の）", oku:"る", group:1, meaning:"to ride, get on", jlpt:5, tags:['action'], comp:{jp:'電車（でんしゃ）に', en:'the train'}},
  {dict:"取（と）る", stem:"取（と）", oku:"る", group:1, meaning:"to take, pass", jlpt:5, tags:['action'], comp:{jp:'塩（しお）を', en:'the salt'}},
  {dict:"送（おく）る", stem:"送（おく）", oku:"る", group:1, meaning:"to send", jlpt:4, tags:['action'], comp:{jp:'メールを', en:'an email'}},
  {dict:"終（お）わる", stem:"終（お）", oku:"わる", group:1, meaning:"to end", jlpt:5, tags:['thing'], comp:{jp:'授業（じゅぎょう）が', en:'class'}},
  {dict:"始（はじ）まる", stem:"始（はじ）", oku:"まる", group:1, meaning:"to begin", jlpt:5, tags:['thing'], comp:{jp:'映画（えいが）が', en:'the movie'}},
  {dict:"止（と）まる", stem:"止（と）", oku:"まる", group:1, meaning:"to stop", jlpt:4, tags:['thing'], comp:{jp:'電車（でんしゃ）が', en:'the train'}},
  {dict:"降（ふ）る", stem:"降（ふ）", oku:"る", group:1, meaning:"to fall (rain, snow)", jlpt:5, tags:['thing'], comp:{jp:'雨（あめ）が', en:'rain'}},
  {dict:"戻（もど）る", stem:"戻（もど）", oku:"る", group:1, meaning:"to go back", jlpt:4, tags:['action'], comp:{jp:'教室（きょうしつ）に', en:'to the classroom'}},
  {dict:"頑張（がんば）る", stem:"頑張（がんば）", oku:"る", group:1, meaning:"to do one's best", jlpt:4, tags:['action']},
  {dict:"怒（おこ）る", stem:"怒（おこ）", oku:"る", group:1, meaning:"to get angry", jlpt:4, tags:['action','person'], skip:['dict','potential','volitional','causative']},
  {dict:"切（き）る", stem:"切（き）", oku:"る", group:1, meaning:"to cut", trap:true, jlpt:5, tags:['action'], comp:{jp:'ケーキを', en:'the cake'}},
  {dict:"減（へ）る", stem:"減（へ）", oku:"る", group:1, meaning:"to decrease", trap:true, jlpt:4, tags:['thing'], comp:{jp:'人（ひと）が', en:'the crowd'}},
  {dict:"喋（しゃべ）る", stem:"喋（しゃべ）", oku:"る", group:1, meaning:"to chat", trap:true, jlpt:4, tags:['action'], comp:{jp:'友達（ともだち）と', en:'with a friend'}},
  {dict:"滑（すべ）る", stem:"滑（すべ）", oku:"る", group:1, meaning:"to slip, slide", trap:true, jlpt:4, tags:[]},
  // ---- Group 2 (ichidan) ----
  {dict:"開（あ）ける", stem:"開（あ）", oku:"ける", group:2, meaning:"to open", jlpt:5, tags:['action'], comp:{jp:'ドアを', en:'the door'}},
  {dict:"浴（あ）びる", stem:"浴（あ）", oku:"びる", group:2, meaning:"to take (a shower)", jlpt:5, tags:['action'], comp:{jp:'シャワーを', en:'a shower'}},
  {dict:"答（こた）える", stem:"答（こた）", oku:"える", group:2, meaning:"to answer", jlpt:5, tags:['action'], comp:{jp:'質問（しつもん）に', en:'the question'}},
  {dict:"出（で）かける", stem:"出（で）", oku:"かける", group:2, meaning:"to go out", jlpt:5, tags:['action']},
  {dict:"入（い）れる", stem:"入（い）", oku:"れる", group:2, meaning:"to put in", jlpt:5, tags:['action'], comp:{jp:'砂糖（さとう）を', en:'sugar'}},
  {dict:"忘（わす）れる", stem:"忘（わす）", oku:"れる", group:2, meaning:"to forget", jlpt:5, tags:[], comp:{jp:'宿題（しゅくだい）を', en:'my homework'}},
  {dict:"始（はじ）める", stem:"始（はじ）", oku:"める", group:2, meaning:"to start (something)", jlpt:5, tags:['action'], comp:{jp:'仕事（しごと）を', en:'work'}},
  {dict:"調（しら）べる", stem:"調（しら）", oku:"べる", group:2, meaning:"to look up, check", jlpt:4, tags:['action'], comp:{jp:'この言葉（ことば）を', en:'this word'}},
  {dict:"捨（す）てる", stem:"捨（す）", oku:"てる", group:2, meaning:"to throw away", jlpt:4, tags:['action'], comp:{jp:'古（ふる）い服（ふく）を', en:'old clothes'}},
  {dict:"迎（むか）える", stem:"迎（むか）", oku:"える", group:2, meaning:"to meet, pick up (someone)", jlpt:4, tags:['action','person'], comp:{jp:'母（はは）を', en:'my mother'}},
  {dict:"見（み）つける", stem:"見（み）", oku:"つける", group:2, meaning:"to find", jlpt:4, tags:['action'], comp:{jp:'いい店（みせ）を', en:'a good shop'}},
  {dict:"片付（かたづ）ける", stem:"片付（かたづ）", oku:"ける", group:2, meaning:"to tidy up", jlpt:4, tags:['action'], comp:{jp:'おもちゃを', en:'the toys'}},
  {dict:"落（お）ちる", stem:"落（お）", oku:"ちる", group:2, meaning:"to fall, drop", jlpt:4, tags:['thing'], comp:{jp:'りんごが', en:'the apple'}},
  {dict:"遅（おく）れる", stem:"遅（おく）", oku:"れる", group:2, meaning:"to be late", jlpt:4, tags:['thing'], comp:{jp:'バスが', en:'the bus'}},
  // ---- Group 3 (noun + する) ----
  {dict:"料理（りょうり）する", group:3, irregular:'suru', meaning:"to cook", stem:"料理（りょうり）", jlpt:4, tags:['action']},
  {dict:"練習（れんしゅう）する", group:3, irregular:'suru', meaning:"to practise", stem:"練習（れんしゅう）", jlpt:5, tags:['action'], comp:{jp:'テニスを', en:'tennis'}},
  {dict:"運転（うんてん）する", group:3, irregular:'suru', meaning:"to drive", stem:"運転（うんてん）", jlpt:4, tags:['action'], comp:{jp:'車（くるま）を', en:'the car'}},
  {dict:"散歩（さんぽ）する", group:3, irregular:'suru', meaning:"to take a walk", stem:"散歩（さんぽ）", jlpt:5, tags:['action'], comp:{jp:'公園（こうえん）を', en:'in the park'}},
  {dict:"電話（でんわ）する", group:3, irregular:'suru', meaning:"to phone", stem:"電話（でんわ）", jlpt:5, tags:['action'], comp:{jp:'家（いえ）に', en:'home'}},
  {dict:"旅行（りょこう）する", group:3, irregular:'suru', meaning:"to travel", stem:"旅行（りょこう）", jlpt:5, tags:['action'], comp:{jp:'京都（きょうと）に', en:'to Kyoto'}},
  {dict:"説明（せつめい）する", group:3, irregular:'suru', meaning:"to explain", stem:"説明（せつめい）", jlpt:4, tags:['action'], comp:{jp:'使（つか）い方（かた）を', en:'how to use it'}},
  {dict:"質問（しつもん）する", group:3, irregular:'suru', meaning:"to ask a question", stem:"質問（しつもん）", jlpt:5, tags:['action'], comp:{jp:'先生（せんせい）に', en:'the teacher'}},
  {dict:"予約（よやく）する", group:3, irregular:'suru', meaning:"to reserve, book", stem:"予約（よやく）", jlpt:4, tags:['action'], comp:{jp:'レストランを', en:'a restaurant'}}
];
