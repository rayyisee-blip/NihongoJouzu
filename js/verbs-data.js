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
  {dict:"知（し）る", stem:"知（し）", oku:"る", group:1, meaning:"to know", trap:true, jlpt:5, tags:[], skip:['dict']},
  {dict:"走（はし）る", stem:"走（はし）", oku:"る", group:1, meaning:"to run", trap:true, jlpt:5, tags:['action']},
  {dict:"作（つく）る", stem:"作（つく）", oku:"る", group:1, meaning:"to make", jlpt:5, tags:['action'], comp:{jp:'晩（ばん）ご飯（はん）を', en:'dinner'}},
  {dict:"座（すわ）る", stem:"座（すわ）", oku:"る", group:1, meaning:"to sit", jlpt:5, tags:['action'], comp:{jp:'ここに', en:'here'}},
  {dict:"撮（と）る", stem:"撮（と）", oku:"る", group:1, meaning:"to take (a photo)", jlpt:5, tags:['action'], comp:{jp:'ここで', en:'here'}},
  {dict:"曲（ま）がる", stem:"曲（ま）", oku:"がる", group:1, meaning:"to turn", jlpt:5, tags:['action'], comp:{jp:'右（みぎ）に', en:'right'}},
  {dict:"渡（わた）る", stem:"渡（わた）", oku:"る", group:1, meaning:"to cross", jlpt:5, tags:['action'], comp:{jp:'橋（はし）を', en:'the bridge'}},
  {dict:"通（とお）る", stem:"通（とお）", oku:"る", group:1, meaning:"to pass through", jlpt:4, tags:['action'], comp:{jp:'この道（みち）を', en:'this road'}},
  {dict:"分（わ）かる", stem:"分（わ）", oku:"かる", group:1, meaning:"to understand", jlpt:5, tags:[]},
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
  {dict:"疲（つか）れる", stem:"疲（つか）", oku:"れる", group:2, meaning:"to get tired", jlpt:5, tags:[]},
  {dict:"褒（ほ）める", stem:"褒（ほ）", oku:"める", group:2, meaning:"to praise", jlpt:4, tags:['action','person']},
  {dict:"閉（し）める", stem:"閉（し）", oku:"める", group:2, meaning:"to close", jlpt:5, tags:['action'], comp:{jp:'窓（まど）を', en:'the window'}},
  // ---- Group 3 (irregular) ----
  {dict:"する", group:3, irregular:'suru', meaning:"to do", stem:"", jlpt:5, tags:['action'], comp:{jp:'宿題（しゅくだい）を', en:'homework'}},
  {dict:"来（く）る", group:3, irregular:'kuru', meaning:"to come", jlpt:5, tags:['action'], comp:{jp:'ここに', en:'here'}},
  {dict:"勉強（べんきょう）する", group:3, irregular:'suru', meaning:"to study", stem:"勉強（べんきょう）", jlpt:5, tags:['action'], comp:{jp:'日本語（にほんご）を', en:'Japanese'}},
  {dict:"洗濯（せんたく）する", group:3, irregular:'suru', meaning:"to do laundry", stem:"洗濯（せんたく）", jlpt:5, tags:['action']},
  {dict:"掃除（そうじ）する", group:3, irregular:'suru', meaning:"to clean", stem:"掃除（そうじ）", jlpt:5, tags:['action'], comp:{jp:'部屋（へや）を', en:'the room'}},
  {dict:"結婚（けっこん）する", group:3, irregular:'suru', meaning:"to marry", stem:"結婚（けっこん）", jlpt:5, tags:['action']}
];
