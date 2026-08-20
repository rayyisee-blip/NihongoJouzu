/* ============================================================
   DATA — 25 lessons, each with quiz questions + capstone lines
   ============================================================ */
const LESSONS = [
{n:1,title:"これ・それ・あれ / です",topic:"Identifying things, basic です sentences",
 q:[
  {type:"vocab",prompt:"How do you say \"this (thing, near me)\" in Japanese?",choices:["これ","それ","あれ","どれ"],a:0,note:"これ = this (near speaker). それ = that (near listener). あれ = that over there (far from both)."},
  {type:"vocab",prompt:"「学生（がくせい）」means:",choices:["Teacher","Student","Company employee","Doctor"],a:1,note:"学生（がくせい）= student."},
  {type:"grammar",prompt:"これ ___ 辞書（じしょ）です。(This is a dictionary.)",choices:["は","を","に","で"],a:0,note:"は marks the topic. 'これは辞書（じしょ）です' = As for this, it is a dictionary."},
  {type:"structure",prompt:"Choose the correct question form of 'Is that a book?'",choices:["それは 本（ほん）です か。","それは 本（ほん）ですか。","それ 本（ほん）は ですか。","それ は 本（ほん） か です。"],a:1,note:"Add か directly after です, no extra space needed: それは本（ほん）ですか。"}
 ],
 cap:[
  {en:"This is a dictionary.",jp:"これは 辞書（じしょ）です。",note:"これ + は + noun + です for simple identification."},
  {en:"Is that your umbrella?",jp:"それは あなたの 傘（かさ）ですか。",note:"あなたの = your; の links possessor and noun."},
  {en:"That is a magazine.",jp:"それは 雑誌（ざっし）です。",note:"Same これ／それ／あれ + です pattern as the other sentences here, just with a different demonstrative and noun."},
  {en:"Is that person a teacher?",jp:"あの人（ひと）は 先生（せんせい）ですか。",note:"あの人（ひと）(that person) + は + noun + ですか — the same question pattern used for これ／それ／あれ, just applied to a person."},
  {en:"I am also a student.",jp:"私（わたし）も 学生（がくせい）です。",note:"も replaces は when the same fact applies to another topic — 'also'."}
 ]},
{n:2,title:"この／その／あの + N",topic:"Demonstrative adjectives, prices",
 q:[
  {type:"vocab",prompt:"「傘（かさ）」means:",choices:["Umbrella","Book","Watch","Bag"],a:0,note:"傘（かさ）= umbrella."},
  {type:"vocab",prompt:"How do you ask \"How much is it?\"",choices:["これは 何（なに）ですか。","いくらですか。","どこですか。","誰（だれ）のですか。"],a:1,note:"いくら = how much (price)."},
  {type:"grammar",prompt:"___ 本（ほん）は 私（わたし）のです。(That book [near you] is mine.)",choices:["この","その","あの","どの"],a:1,note:"その + noun = that (near listener). Contrast with それ, which stands alone."},
  {type:"structure",prompt:"Which is correctly formed: \"Whose bag is this?\"",choices:["これは 誰（だれ）の かばんですか。","これ 誰（だれ）は かばんですか。","誰（だれ）の これは かばんですか。","これは かばん 誰（だれ）のですか。"],a:0,note:"誰（だれ）の (whose) + noun comes right before です."}
 ],
 cap:[
  {en:"This pen is 500 yen.",jp:"この ペンは 500円（えん）です。",note:"この + noun for 'this ___', then price + です."},
  {en:"Whose dictionary is that (over there)?",jp:"あれは 誰（だれ）の 辞書（じしょ）ですか。",note:"あれ stands alone (no noun follows) since it means 'that thing over there'."},
  {en:"This car isn't mine.",jp:"この 車（くるま）は 私（わたし）のじゃありません。",note:"Negative of です for nouns: 〜じゃありません (casual, same weight as 〜ではありません)."},
  {en:"How much is that watch?",jp:"その 時計（とけい）は いくらですか。",note:"その + noun for 'that (near the listener)', then いくらですか to ask its price."},
  {en:"Whose shoes are these?",jp:"これは 誰（だれ）の 靴（くつ）ですか。",note:"誰の (whose) + noun asks who something belongs to; これ stands alone as the subject since it isn't modified by a demonstrative adjective."}
 ]},
{n:3,title:"ここ・そこ・あそこ / どこ",topic:"Places, N1のN2, asking origin",
 q:[
  {type:"vocab",prompt:"「デパート」means:",choices:["Station","Department store","Hospital","School"],a:1,note:"デパート = department store (loanword)."},
  {type:"vocab",prompt:"How do you say \"where\"?",choices:["ここ","そこ","あそこ","どこ"],a:3,note:"どこ = where (question word)."},
  {type:"grammar",prompt:"お手洗（てあら）いは ___ ですか。(Where is the restroom?)",choices:["どこ","なに","だれ","いつ"],a:0,note:"どこ asks about location."},
  {type:"structure",prompt:"Choose the correct sentence for \"The department store is over there.\"",choices:["デパートは あそこです。","あそこは デパートです。","デパート あそこ です。","そこは デパートが です。"],a:0,note:"Topic (デパート) + は + location + です."}
 ],
 cap:[
  {en:"Where is the telephone?",jp:"電話（でんわ）は どこですか。",note:"N + は + どこ + ですか is the standard 'where is N' pattern."},
  {en:"This is a book about computers.",jp:"これは コンピューターの 本（ほん）です。",note:"N1のN2 here means 'a book about/on computers', not possession."},
  {en:"Where is your dictionary?",jp:"あなたの 辞書（じしょ）は どこですか。",note:"Combines the N1のN2 possessive from Lessons 1-2 (あなたの) with this lesson's どこですか location question."},
  {en:"Where is the meeting room?",jp:"会議室（かいぎしつ）は どこですか。",note:"N + は + どこ + ですか is the standard 'where is N' pattern, here applied to 会議室 (meeting room)."},
  {en:"The reception desk is over there.",jp:"受付（うけつけ）は あそこです。",note:"あそこ answers a location question directly — 'over there'."}
 ]},
{n:4,title:"時間（じかん） / Vます",topic:"Telling time, present-tense verbs",
 q:[
  {type:"vocab",prompt:"「起（お）きます」means:",choices:["To sleep","To wake up","To work","To rest"],a:1,note:"起（お）きます = to get up / wake up."},
  {type:"vocab",prompt:"「働（はたら）きます」means:",choices:["To eat","To study","To work","To drink"],a:2,note:"働（はたら）きます = to work."},
  {type:"grammar",prompt:"毎日（まいにち） 7時（じ） ___ 起（お）きます。(I get up at 7 every day.)",choices:["は","に","を","へ"],a:1,note:"に marks a specific point in time with clock times, days, etc."},
  {type:"structure",prompt:"Which correctly says \"I work from 9 to 5\"?",choices:["9時（じ）から5時（じ）まで 働（はたら）きます。","9時（じ） 5時（じ）まで 働（はたら）きます。","9時（じ）までから5時（じ） 働（はたら）きます。","働（はたら）きます 9時（じ）から5時（じ）まで は。"],a:0,note:"から (from) ... まで (until) brackets the time range, verb comes last."}
 ],
 cap:[
  {en:"I get up at six every morning.",jp:"毎朝（まいあさ） 6時（じ）に 起（お）きます。",note:"時（じ） + に for a specific clock time; 毎朝（まいあさ） = every morning, no particle needed before it."},
  {en:"I work from Monday to Friday.",jp:"月曜日（げつようび）から 金曜日（きんようび）まで 働（はたら）きます。",note:"から〜まで brackets a range of time, here days of the week."},
  {en:"I go to bed at eleven every night.",jp:"毎晩（まいばん） 11時（じ）に 寝（ね）ます。",note:"Same 時（じ） + に pattern as the model answer above, just with 寝ます (to sleep) instead of 起きます."},
  {en:"I study every day from seven to nine.",jp:"毎日（まいにち） 7時（じ）から 9時（じ）まで 勉強（べんきょう）します。",note:"から〜まで brackets the study time; 毎日 needs no particle before it, just like 毎朝／毎晩 elsewhere in this lesson."},
  {en:"I rest at noon every day.",jp:"毎日（まいにち） 12時（じ）に 休（やす）みます。",note:"時（じ） + に marks a specific clock time, the same pattern used with 起きます and 寝ます."}
 ]},
{n:5,title:"へ・で・と + 行（い）きます",topic:"Movement verbs, direction, means, companion",
 q:[
  {type:"vocab",prompt:"「駅（えき）」means:",choices:["Airport","Station","Bridge","Park"],a:1,note:"駅（えき）= station."},
  {type:"vocab",prompt:"How do you say \"alone / by oneself\"?",choices:["一人（ひとり）で","二人（ふたり）で","みんなで","一緒（いっしょ）に"],a:0,note:"一人（ひとり）で = alone, by oneself."},
  {type:"grammar",prompt:"電車（でんしゃ） ___ 行（い）きます。(I go by train.)",choices:["へ","と","で","を"],a:2,note:"で marks the means of transportation."},
  {type:"structure",prompt:"Choose the correct sentence: \"I'll go to Kyoto with my family.\"",choices:["家族（かぞく）と 京都（きょうと）へ 行（い）きます。","家族（かぞく）へ 京都（きょうと）と 行（い）きます。","京都（きょうと）で 家族（かぞく）と 行（い）きます。","家族（かぞく）を 京都（きょうと）へ 行（い）きます。"],a:0,note:"Companion + と, destination + へ, then the verb."}
 ],
 cap:[
  {en:"I will go to the station by taxi.",jp:"タクシーで 駅（えき）へ 行（い）きます。",note:"で = means of transport, へ = destination direction."},
  {en:"I don't go anywhere on Sundays.",jp:"日曜日（にちようび）は どこ[へ]も 行（い）きません。",note:"どこへも + negative verb = 'don't go anywhere'; へ is often dropped before も."},
  {en:"I'll go home alone, by bicycle.",jp:"自転車（じてんしゃ）で 一人（ひとり）で 帰（かえ）ります。",note:"で appears twice doing two different jobs: 自転車で marks the means of transport, 一人で marks 'alone' — the same particle, different roles."},
  {en:"I'll go to the office by bus with my friend.",jp:"友達（ともだち）と バスで 事務所（じむしょ）へ 行（い）きます。",note:"と marks the companion, で the means of transport, へ the destination — three particles doing three different jobs in one sentence."},
  {en:"I go to the station on foot every morning.",jp:"毎朝（まいあさ） 歩（ある）いて 駅（えき）へ 行（い）きます。",note:"歩（ある）いて ('on foot') expresses means but takes no particle of its own; へ still marks the destination."}
 ]},
{n:6,title:"を + 食（た）べます／します",topic:"Object particle, invitations",
 q:[
  {type:"vocab",prompt:"「新聞（しんぶん）」means:",choices:["Newspaper","Magazine","Letter","Notebook"],a:0,note:"新聞（しんぶん）= newspaper."},
  {type:"vocab",prompt:"How do you invite someone: \"Won't you eat?\"",choices:["食（た）べます。","食（た）べません。","食（た）べませんか。","食（た）べましょう。"],a:2,note:"Vませんか = a polite invitation, 'won't you...?'"},
  {type:"grammar",prompt:"朝（あさ）ごはん ___ 食（た）べます。(I eat breakfast.)",choices:["が","を","に","へ"],a:1,note:"を marks the direct object of a transitive verb."},
  {type:"structure",prompt:"Which correctly proposes \"Let's go together\"?",choices:["一緒（いっしょ）に 行（い）きましょう。","一緒（いっしょ） 行（い）きに ましょう。","行（い）きましょう 一緒（いっしょ）に。","一緒（いっしょ）に を 行（い）きましょう。"],a:0,note:"一緒（いっしょ）に (together) + verb in the ましょう (let's) form."}
 ],
 cap:[
  {en:"Shall we drink coffee together?",jp:"一緒（いっしょ）に コーヒーを 飲（の）みませんか。",note:"Object + を + Vませんか is a natural, polite invitation."},
  {en:"I buy a newspaper every morning.",jp:"毎朝（まいあさ） 新聞（しんぶん）を 買（か）います。",note:"を marks 新聞（しんぶん） as the thing being bought."},
  {en:"I read a magazine every day.",jp:"毎日（まいにち） 雑誌（ざっし）を 読（よ）みます。",note:"を marks 雑誌（ざっし） as the object of 読みます, same structure as the newspaper sentence above."},
  {en:"Won't you eat breakfast together?",jp:"一緒（いっしょ）に 朝（あさ）ごはんを 食（た）べませんか。",note:"を marks 朝ごはん as the object; ませんか turns the sentence into a polite invitation."},
  {en:"I read the newspaper every morning.",jp:"毎朝（まいあさ） 新聞（しんぶん）を 読（よ）みます。",note:"を marks 新聞 as the object of 読みます, the same を + Vます pattern as 買います and 飲みます."}
 ]},
{n:7,title:"あげます・もらいます",topic:"Giving/receiving, もう・まだ",
 q:[
  {type:"vocab",prompt:"「あげます」means:",choices:["To receive","To give","To borrow","To lend"],a:1,note:"あげます = to give (to someone else)."},
  {type:"vocab",prompt:"「もう」+ past tense means:",choices:["Not yet","Already","Still","Never"],a:1,note:"もう + Vました = already did something."},
  {type:"grammar",prompt:"田中（たなか）さんに 花（はな） ___ もらいました。(I received flowers from Mr. Tanaka.)",choices:["を","に","が","で"],a:0,note:"The thing received takes を; に marks the giver."},
  {type:"structure",prompt:"Which correctly says \"I haven't eaten lunch yet\"?",choices:["まだ 昼（ひる）ごはんを 食（た）べていません。","もう 昼（ひる）ごはんを 食（た）べました。","まだ 昼（ひる）ごはんを 食（た）べました。","昼（ひる）ごはんを もう 食（た）べていません。"],a:0,note:"まだ + negative = 'not yet'."}
 ],
 cap:[
  {en:"I gave a present to Yamada-san.",jp:"山田（やまだ）さんに プレゼントを あげました。",note:"Recipient + に, item + を, then あげました (gave)."},
  {en:"Have you already called the office?",jp:"もう 会社（かいしゃ）に 電話（でんわ）を かけましたか。",note:"もう + past tense question = 'have you already...?'"},
  {en:"I received a letter from my friend.",jp:"友達（ともだち）に 手紙（てがみ）を もらいました。",note:"に marks the giver with もらいます (receive) — the mirror image of あげます, where に marks the recipient instead."},
  {en:"I gave a letter to my friend.",jp:"友達（ともだち）に 手紙（てがみ）を あげました。",note:"Recipient + に, item + を, then あげました — the standard giving pattern."},
  {en:"I haven't received the present yet.",jp:"まだ プレゼントを もらっていません。",note:"まだ + ていません = 'haven't ... yet', combining this lesson's まだ with もらいます (receive)."}
 ]},
{n:8,title:"い形容詞（けいようし）・な形容詞（けいようし）",topic:"Adjectives, とても／あまり",
 q:[
  {type:"vocab",prompt:"「静（しず）か」means:",choices:["Noisy","Quiet","Busy","Kind"],a:1,note:"静（しず）かな = quiet (な-adjective)."},
  {type:"vocab",prompt:"「おいしい」means:",choices:["Delicious","Expensive","Difficult","Interesting"],a:0,note:"おいしい = delicious (い-adjective)."},
  {type:"grammar",prompt:"この 町（まち）は あまり ___ ありません。(This town isn't very lively.)",choices:["にぎやかで","にぎやかだ","にぎやかいで","にぎやかくて"],a:0,note:"な-adjective negative: 〜で + ありません (or じゃありません)."},
  {type:"structure",prompt:"Which correctly says \"This book is very interesting\"?",choices:["この 本（ほん）は とても 面白（おもしろ）いです。","この 本（ほん）は とても 面白（おもしろ）いくです。","とても この 本（ほん）は 面白（おもしろ）いだ です。","この 本（ほん） とても 面白（おもしろ）いです は。"],a:0,note:"とても + い-adjective + です, straightforward word order."}
 ],
 cap:[
  {en:"This restaurant is very quiet and clean.",jp:"この レストランは とても 静（しず）かで きれいです。",note:"な-adjectives connect with で when linking two descriptions."},
  {en:"That test wasn't very difficult.",jp:"あの テストは あまり 難（むずか）しくなかったです。",note:"い-adjective past negative: 〜くなかったです (or 〜くありませんでした)."},
  {en:"That department store isn't very convenient.",jp:"あの デパートは あまり 便利（べんり）じゃありません。",note:"な-adjective negative 〜じゃありません, paired with あまり for 'not very'."},
  {en:"This restaurant's food is very delicious.",jp:"この レストランの 料理（りょうり）は とても おいしいです。",note:"とても + い-adjective + です, a straightforward positive description."},
  {en:"That test wasn't very interesting.",jp:"あの テストは あまり 面白（おもしろ）くなかったです。",note:"い-adjective past negative: 〜くなかったです, the same form as 難（むずか）しくなかった but with 面白い."}
 ]},
{n:9,title:"好（す）き・上手（じょうず）・わかります",topic:"Likes, skill, understanding",
 q:[
  {type:"vocab",prompt:"「上手（じょうず）」means:",choices:["Skilled / good at","Bad at","Difficult","Famous"],a:0,note:"上手（じょうず）な = skilled, good at."},
  {type:"vocab",prompt:"「わかります」means:",choices:["To see","To understand","To hear","To speak"],a:1,note:"わかります = to understand / comprehend."},
  {type:"grammar",prompt:"私（わたし）は 音楽（おんがく） ___ 好（す）きです。(I like music.)",choices:["を","に","が","へ"],a:2,note:"With 好（す）き/嫌（きら）い/上手（じょうず）/下手（へた）/わかります, the object takes が, not を."},
  {type:"structure",prompt:"Which correctly says \"I don't understand Japanese very well\"?",choices:["日本語（にほんご）が あまり わかりません。","日本語（にほんご）を あまり わかりません。","日本語（にほんご）は あまり わかりますせん。","あまり 日本語（にほんご） わかりません が。"],a:0,note:"わかります pairs with が for the thing understood."}
 ],
 cap:[
  {en:"I like Japanese food, but I'm not good at cooking.",jp:"日本料理（にほんりょうり）が 好（す）きですが、料理（りょうり）は 上手（じょうず）じゃありません。",note:"が marks each liked/skilled-at item; が as a connector here means 'but'."},
  {en:"Do you understand this sentence?",jp:"この 文（ぶん）が わかりますか。",note:"文（ぶん）= sentence; わかります takes が."},
  {en:"Yamada-san is bad at cooking.",jp:"山田（やまだ）さんは 料理（りょうり）が 下手（へた）です。",note:"下手（へた）is the opposite of 上手（じょうず） — both pair with が, never を."},
  {en:"Do you like Japanese food?",jp:"日本料理（にほんりょうり）が 好（す）きですか。",note:"が marks 日本料理 as the thing liked; the same が + 好きです pattern works equally well as a question."},
  {en:"I'm not very good at Japanese.",jp:"日本語（にほんご）が あまり 上手（じょうず）じゃありません。",note:"上手 pairs with が, not を; あまり + じゃありません gives 'not very good at'."}
 ]},
{n:10,title:"あります・います",topic:"Existence, location words",
 q:[
  {type:"vocab",prompt:"Which verb is used for living things (people/animals)?",choices:["あります","います","です","します"],a:1,note:"います = there is/are, for animate things (people, animals)."},
  {type:"vocab",prompt:"「隣（となり）」means:",choices:["Inside","Next to","Under","Behind"],a:1,note:"隣（となり）= next to, adjacent."},
  {type:"grammar",prompt:"机（つくえ）の 上（うえ） ___ 本（ほん）が あります。(There is a book on the desk.)",choices:["に","を","へ","と"],a:0,note:"に marks the location where something exists."},
  {type:"structure",prompt:"Which correctly says \"There is a cat under the chair\"?",choices:["椅子（いす）の 下（した）に 猫（ねこ）が います。","椅子（いす）の 下（した）は 猫（ねこ）が あります。","猫（ねこ）が 椅子（いす）の 下（した） います。","椅子（いす） 下（した）の に 猫（ねこ）が います。"],a:0,note:"Location + の + 上（うえ）/下（した）/etc + に, then subject + が + います (animate)."}
 ],
 cap:[
  {en:"There is a park in front of the station.",jp:"駅（えき）の 前（まえ）に 公園（こうえん）が あります。",note:"公園（こうえん） (park) is inanimate, so あります is correct, not います."},
  {en:"My older brother is in the living room.",jp:"兄（あに）は 居間（いま）に います。",note:"兄（あに） (older brother) is animate → います; 居間（いま） = living room."},
  {en:"There is a cat in front of the station.",jp:"駅（えき）の 前（まえ）に 猫（ねこ）が います。",note:"猫（ねこ）is animate → います, paired with 駅の前に for the location."},
  {en:"There is a dictionary next to the book.",jp:"本（ほん）の 隣（となり）に 辞書（じしょ）が あります。",note:"隣（となり）に marks 'next to'; 辞書 is inanimate, so あります is correct."},
  {en:"There is a dog under the desk.",jp:"机（つくえ）の 下（した）に 犬（いぬ）が います。",note:"犬（いぬ）(dog) is animate → います, paired with 下に for the location."}
 ]},
{n:11,title:"数量（すうりょう） / だけ",topic:"Counters and quantity",
 q:[
  {type:"vocab",prompt:"「卵（たまご）」means:",choices:["Apple","Egg","Bread","Milk"],a:1,note:"卵（たまご）= egg."},
  {type:"vocab",prompt:"「だけ」means:",choices:["Also","Only","Still","Already"],a:1,note:"だけ = only, just."},
  {type:"grammar",prompt:"りんごを 三（さん） ___ 買（か）いました。(I bought three apples.)",choices:["つ","人（ひと）","枚（まい）","匹（びき）"],a:0,note:"つ is the general counter for small round/miscellaneous objects like apples."},
  {type:"structure",prompt:"Which correctly says \"I only have 500 yen\"?",choices:["500円（えん）だけ あります。","500円（えん） あります だけ。","だけ 500円（えん） あります。","500円（えん）は だけ あります。"],a:0,note:"Quantity + だけ + verb."}
 ],
 cap:[
  {en:"I bought two tickets and one bag.",jp:"切符（きっぷ）を 二枚（にまい）と かばんを 一（いち）つ 買（か）いました。",note:"枚（まい） counts flat objects (tickets); つ is the general counter for the bag."},
  {en:"There are only three students in this class.",jp:"この クラスに 学生（がくせい）が 三人（さんにん）だけ います。",note:"人（ひと） counts people; だけ follows the counted quantity."},
  {en:"I bought five mandarin oranges and two apples.",jp:"みかんを 五（いつ）つ、りんごを 二（ふた）つ 買（か）いました。",note:"Both use the general counter つ, since みかん and りんご are both small round objects."},
  {en:"I drank two cups of coffee this morning.",jp:"今朝（けさ） コーヒーを 二杯（にはい） 飲（の）みました。",note:"杯（はい） counts cupfuls of liquid; the quantity phrase comes right before the verb, with no particle."},
  {en:"There are only two dogs in this park.",jp:"この 公園（こうえん）に 犬（いぬ）が 二匹（にひき）だけ います。",note:"匹（ひき） counts small animals; だけ follows right after the counted quantity."}
 ]},
{n:12,title:"比較（ひかく） / 形容詞（けいようし）の過去（かこ）",topic:"Comparison, adjective past tense",
 q:[
  {type:"vocab",prompt:"「一番（いちばん）」means:",choices:["Number one / the most","Half","Second","Only"],a:0,note:"一番（いちばん）= the most, number one (superlative marker)."},
  {type:"vocab",prompt:"「季節（きせつ）」means:",choices:["Weather","Season","Month","Weekend"],a:1,note:"季節（きせつ）= season."},
  {type:"grammar",prompt:"夏（なつ）と 冬（ふゆ）と、___ 好（す）きですか。(Summer or winter, which do you like?)",choices:["どちらが","どちらを","どこが","どれに"],a:0,note:"N1とN2と、どちらが〜 is the standard comparison question pattern."},
  {type:"structure",prompt:"Which correctly says \"Of all seasons, I like spring the most\"?",choices:["季節（きせつ）の 中（なか）で 春（はる）が 一番（いちばん） 好（す）きです。","春（はる）の 中（なか）で 季節（きせつ）が 一番（いちばん） 好（す）きです。","一番（いちばん） 季節（きせつ）は 春（はる）が 好（す）きです。","季節（きせつ）が 春（はる）の 中（なか）で 一番（いちばん）です。"],a:0,note:"Nの中（なか）で + subject + が + 一番（いちばん） + adjective/verb."}
 ],
 cap:[
  {en:"Between coffee and tea, which do you like better?",jp:"コーヒーと 紅茶（こうちゃ）と、どちらが 好（す）きですか。",note:"N1とN2と、どちらが好（す）きですか asks for a preference between two options."},
  {en:"Last year's winter was colder than this year.",jp:"去年（きょねん）の 冬（ふゆ）は 今年（ことし）より 寒（さむ）かったです。",note:"より marks the point of comparison; 寒（さむ）かった is the past form of 寒（さむ）い."},
  {en:"This year is hotter than last year.",jp:"今年（ことし）は 去年（きょねん）より 暑（あつ）いです。",note:"より marks the point of comparison, same pattern as the model answer but with 暑い instead of 寒い."},
  {en:"Of the four seasons, I like summer the most.",jp:"季節（きせつ）の 中（なか）で 夏（なつ）が 一番（いちばん） 好（す）きです。",note:"Nの中で + が + 一番 + adjective/verb is the superlative pattern, applied here to seasons."},
  {en:"Between spring and autumn, which do you like better?",jp:"春（はる）と 秋（あき）と、どちらが 好（す）きですか。",note:"N1とN2と、どちらが〜ですか asks for a preference between two named options."}
 ]},
{n:13,title:"Vたい / 目的（もくてき）",topic:"Wanting to do, purpose with に行（い）きます",
 q:[
  {type:"vocab",prompt:"「旅行（りょこう）」means:",choices:["Work","Travel","Study","Shopping"],a:1,note:"旅行（りょこう）= travel, trip."},
  {type:"vocab",prompt:"How do you say \"nothing\" (with negative verb)?",choices:["何（なに）か","何（なに）も","何（なに）が","何（なに）を"],a:1,note:"何（なに）も + negative verb = nothing."},
  {type:"grammar",prompt:"日本（にほん）へ 旅行（りょこう）に 行（い）き ___ です。(I want to go to Japan on a trip.)",choices:["ます","たい","ました","ません"],a:1,note:"Vます-stem + たい = want to do."},
  {type:"structure",prompt:"Which correctly says \"I'm going to the library to borrow a book\"?",choices:["本（ほん）を 借（か）りに 図書館（としょかん）へ 行（い）きます。","本（ほん）を 借（か）ります 図書館（としょかん）に 行（い）きます。","図書館（としょかん）へ 本（ほん）を 借（か）りたい 行（い）きます。","本（ほん）が 借（か）りに 図書館（としょかん） 行（い）きます。"],a:0,note:"Vます-stem + に + 行（い）きます expresses purpose of movement."}
 ],
 cap:[
  {en:"I want to eat sushi someday.",jp:"いつか 寿司（すし）が 食（た）べたいです。",note:"With Vたい, the object commonly takes が instead of を."},
  {en:"I'm going to the station to meet a friend.",jp:"友達（ともだち）に 会（あ）いに 駅（えき）へ 行（い）きます。",note:"会（あ）います takes に for 'meet with someone'; 会（あ）い + に + 行（い）きます = go to meet."},
  {en:"I want to buy a new car someday.",jp:"いつか 新（あたら）しい 車（くるま）を 買（か）いたいです。",note:"Vたい for wanting to do an action (買いたい) — contrast ほしい from Lesson 9, which is for wanting a thing."},
  {en:"I want to go to a hot spring someday.",jp:"いつか 温泉（おんせん）へ 行（い）きたいです。",note:"Vたい attaches to the ます-stem of 行きます (行き) to express the speaker's own desire."},
  {en:"I'm going shopping at the department store.",jp:"デパートへ 買（か）い物（もの）に 行（い）きます。",note:"Noun + に + 行きます also expresses the purpose of movement, the same role Vます-stem+に plays with a verb."}
 ]},
{n:14,title:"て形（けい） / ています",topic:"Te-form requests and ongoing states",
 q:[
  {type:"vocab",prompt:"「手伝（てつだ）います」means:",choices:["To wait","To help","To turn off","To submit"],a:1,note:"手伝（てつだ）います= to help."},
  {type:"vocab",prompt:"「消（け）します」means:",choices:["To turn on","To turn off/erase","To open","To close"],a:1,note:"消（け）します = to turn off (a light) or erase."},
  {type:"grammar",prompt:"ちょっと 待（ま）っ ___ ください。(Please wait a moment.)",choices:["て","た","たり","ない"],a:0,note:"Te-form + ください = a polite request."},
  {type:"structure",prompt:"Which correctly says \"I am reading a book now\" (ongoing action)?",choices:["今（いま） 本（ほん）を 読（よ）んでいます。","今（いま） 本（ほん）を 読（よ）みています。","今（いま） 本（ほん）を 読（よ）みますいる。","本（ほん）を 今（いま） 読（よ）んでいました。"],a:0,note:"Te-form + います shows an action in progress."}
 ],
 cap:[
  {en:"Please turn off the light and wait here.",jp:"電気（でんき）を 消（け）して、ここで 待（ま）ってください。",note:"Two te-forms chained together, the second ending in ください for the request."},
  {en:"My father is working in Osaka now.",jp:"父（ちち）は 今（いま） 大阪（おおさか）で 働（はたら）いています。",note:"働（はたら）いています = ongoing state 'is working', not a one-time action."},
  {en:"Please hurry and sit here.",jp:"急（いそ）いで、ここに 座（すわ）ってください。",note:"急いで (て-form of 急ぎます) chains into 座ってください — the same two-て-forms construction as the model answer, with different verbs."},
  {en:"Please help with the cleaning, and photocopy this.",jp:"掃除（そうじ）を 手伝（てつだ）って、これを コピーしてください。",note:"Two て-forms chained together, the second ending in ください for the request."},
  {en:"I already know that person.",jp:"あの 人（ひと）を もう 知（し）っています。",note:"知っています ('to know') is a fixed ている state — Japanese doesn't say 知ります for a current state of knowing."}
 ]},
{n:15,title:"てもいいです／てはいけません",topic:"Permission and prohibition",
 q:[
  {type:"vocab",prompt:"「使（つか）います」means:",choices:["To use","To buy","To sell","To fix"],a:0,note:"使（つか）います= to use."},
  {type:"vocab",prompt:"「写真（しゃしん）」means:",choices:["Photo","Painting","Movie","Letter"],a:0,note:"写真（しゃしん）= photograph."},
  {type:"grammar",prompt:"ここで 写真（しゃしん）を 撮（と）っ ___ いいですか。(Is it okay to take photos here?)",choices:["ても","ては","たら","ながら"],a:0,note:"Te-form + もいいですか asks for permission."},
  {type:"structure",prompt:"Which correctly says \"You must not smoke here\"?",choices:["ここで たばこを 吸（す）っては いけません。","ここで たばこを 吸（す）っても いいです。","たばこを 吸（す）わないで いいです。","ここで たばこは 吸（す）いません いけません。"],a:0,note:"Te-form + はいけません = prohibition, 'must not.'"}
 ],
 cap:[
  {en:"May I use this telephone?",jp:"この 電話（でんわ）を 使（つか）っても いいですか。",note:"てもいいですか is the standard 'may I...?' request for permission."},
  {en:"You mustn't enter this room.",jp:"この 部屋（へや）に 入（はい）っては いけません。",note:"入（はい）ります → て-form 入（はい）って + はいけません."},
  {en:"May I sit here?",jp:"ここに 座（すわ）っても いいですか。",note:"てもいいですか permission pattern applied to 座ります instead of 使います."},
  {en:"May I use the air conditioner?",jp:"エアコンを 使（つか）っても いいですか。",note:"てもいいですか is the same permission pattern as before, now with エアコンを使います."},
  {en:"You mustn't smoke near the window.",jp:"窓（まど）の 近（ちか）くで 吸（す）っては いけません。",note:"てはいけません states the prohibition; 近くで marks where the prohibited action happens."}
 ]},
{n:16,title:"なければなりません",topic:"Obligation and non-obligation",
 q:[
  {type:"vocab",prompt:"「予約（よやく）」means:",choices:["Reservation","Payment","Appointment card","Ticket"],a:0,note:"予約（よやく）= reservation, booking."},
  {type:"vocab",prompt:"「出（だ）します」means:",choices:["To take out / submit","To put in","To carry","To throw away"],a:0,note:"出（だ）します = to take out, submit, mail."},
  {type:"grammar",prompt:"レポートを 明日（あした）までに 出（だ）さ ___ なりません。(I must submit the report by tomorrow.)",choices:["なければ","ないと","なくても","ないでは"],a:0,note:"Vない-form (dropping い) + ければなりません = must do."},
  {type:"structure",prompt:"Which correctly says \"You don't have to make a reservation\"?",choices:["予約（よやく）を しなくても いいです。","予約（よやく）を しなければ なりません。","予約（よやく）を してはいけません。","予約（よやく）を しないと いいです。"],a:0,note:"Vない-form + くてもいいです = don't have to."}
 ],
 cap:[
  {en:"I have to go to the hospital today.",jp:"今日（きょう） 病院（びょういん）へ 行（い）かなければ なりません。",note:"行（い）きます → ない-form 行（い）かない → 行（い）かなければなりません."},
  {en:"You don't have to bring an umbrella; it won't rain.",jp:"雨（あめ）は 降（ふ）りませんから、傘（かさ）を 持（も）ってこなくても いいです。",note:"から gives the reason; なくてもいいです = no obligation."},
  {en:"You don't have to prepare anything.",jp:"何（なに）も 準備（じゅんび）しなくても いいです。",note:"何も + くてもいいです combines Lesson 13's 'nothing' pattern with this lesson's non-obligation form."},
  {en:"I must line up here.",jp:"ここに 並（なら）ばなければ なりません。",note:"並（なら）びます → ない-form 並（なら）ばない → 並（なら）ばなければなりません, the same construction used for obligation elsewhere in this lesson."},
  {en:"You don't have to sign this.",jp:"これに サインしなくても いいです。",note:"サインします → なくてもいいです for 'don't have to' — the non-obligation counterpart to なければなりません."}
 ]},
{n:17,title:"辞書形（じしょけい） / ことができます",topic:"Dictionary form, ability, hobbies",
 q:[
  {type:"vocab",prompt:"「趣味（しゅみ）」means:",choices:["Job","Hobby","Habit","Talent"],a:1,note:"趣味（しゅみ）= hobby."},
  {type:"vocab",prompt:"「泳（およ）ぐ」(dictionary form) means:",choices:["To run","To swim","To climb","To fly"],a:1,note:"泳（およ）ぐ= to swim."},
  {type:"grammar",prompt:"私（わたし）は ギターを 弾（ひ）く ___ できます。(I can play the guitar.)",choices:["こと が","もの が","の を","ため に"],a:0,note:"Dictionary form + ことができます = to be able to do."},
  {type:"structure",prompt:"Which correctly says \"Before eating, I wash my hands\"?",choices:["食（た）べる 前（まえ）に、手（て）を 洗（あら）います。","食（た）べた 前（まえ）に、手（て）を 洗（あら）います。","食（た）べる 後（あと）で、手（て）を 洗（あら）います。","手（て）を 洗（あら）う 前（まえ）に、食（た）べます。"],a:0,note:"Dictionary form + 前（まえ）に = 'before doing'."}
 ],
 cap:[
  {en:"My hobby is playing the piano; I can also swim well.",jp:"私（わたし）の 趣味（しゅみ）は ピアノを 弾（ひ）くことです。泳（およ）ぐことも 上手（じょうず）です。",note:"Dictionary form + こと turns a verb into a noun, usable as a topic or with 上手（じょうず）/好（す）き."},
  {en:"After finishing work, I study Japanese.",jp:"仕事（しごと）が 終（お）わった 後（あと）で、日本語（にほんご）を 勉強（べんきょう）します。",note:"Vた-form + 後（あと）で = 'after doing'."},
  {en:"I can speak a little Japanese.",jp:"日本語（にほんご）を 少（すこ）し 話（はな）すことが できます。",note:"を marks 日本語 as 話す's own object; が marks ことができます as the ability clause itself — two particles doing two different jobs in one sentence."},
  {en:"I can drive a car.",jp:"車（くるま）を 運転（うんてん）することが できます。",note:"Dictionary form + ことができます expresses ability, here with 運転する instead of 話す."},
  {en:"My hobby is swimming.",jp:"私（わたし）の 趣味（しゅみ）は 泳（およ）ぐことです。",note:"Dictionary form + こと turns 泳ぐ into a noun usable right after は."}
 ]},
{n:18,title:"たり〜たりします",topic:"Listing example actions",
 q:[
  {type:"vocab",prompt:"「掃除（そうじ）します」means:",choices:["To clean","To cook","To wash clothes","To shop"],a:0,note:"掃除（そうじ）します= to clean."},
  {type:"vocab",prompt:"「洗濯（せんたく）します」means:",choices:["To wash dishes","To do laundry","To take a bath","To iron"],a:1,note:"洗濯（せんたく）します= to do laundry."},
  {type:"grammar",prompt:"週末（しゅうまつ）は 掃除（そうじ）を ___ 洗濯（せんたく）を したり します。(On weekends I do things like cleaning and laundry.)",choices:["し","した","して","したり"],a:3,note:"Both verbs take the たり form when listing example actions: 〜たり〜たりします."},
  {type:"structure",prompt:"Which correctly says \"On holidays I read books or watch movies\"?",choices:["休（やす）みの日（ひ）は 本（ほん）を 読（よ）んだり 映画（えいが）を 見（み）たり します。","休（やす）みの日（ひ）は 本（ほん）を 読（よ）む 映画（えいが）を 見（み）る します。","休（やす）みの日（ひ）は 本（ほん）を 読（よ）んでから 映画（えいが）を 見（み）ます。","休（やす）みの日（ひ） 本（ほん）を 読（よ）んだり します 映画（えいが）を。"],a:0,note:"〜たり〜たりします lists a few representative activities, not an exhaustive list."}
 ],
 cap:[
  {en:"On Sundays I clean, do laundry, and sometimes go shopping.",jp:"日曜日（にちようび）は 掃除（そうじ）したり 洗濯（せんたく）したり、時（じ）々 買（か）い物（もの）に 行（い）ったり します。",note:"Chain several たり clauses, ending in します once."},
  {en:"During the trip we took photos and ate delicious food.",jp:"旅行中（りょこうちゅう）に 写真（しゃしん）を 撮（と）ったり おいしい 物（もの）を 食（た）べたり しました。",note:"Past tense: 〜たり〜たりしました."},
  {en:"On rainy days I read books or clean.",jp:"雨（あめ）の 日（ひ）は 本（ほん）を 読（よ）んだり 掃除（そうじ）したり します。",note:"たり〜たりします lists example activities; 雨の日 ('a rainy day') reuses the noun-modification idea from earlier lessons."},
  {en:"On my day off I do laundry and go for a walk.",jp:"休（やす）みの日（ひ）は 洗濯（せんたく）したり 散歩（さんぽ）したり します。",note:"休みの日 ('day off') reuses the noun-modification idea from earlier lessons; たり〜たりします lists example activities."},
  {en:"I relaxed at home and cleaned a little.",jp:"家（いえ）で のんびり したり、少（すこ）し 掃除（そうじ）したり しました。",note:"Past tense 〜たり〜たりしました; のんびりします takes the same たり conjugation as any other verb."}
 ]},
{n:19,title:"予定（よてい） / 〜と思（おも）っています",topic:"Plans and ongoing intentions",
 q:[
  {type:"vocab",prompt:"「予定（よてい）」means:",choices:["Plan / schedule","Memory","Promise","Reservation"],a:0,note:"予定（よてい）= plan, schedule."},
  {type:"vocab",prompt:"「帰国（きこく）します」means:",choices:["To travel abroad","To return to one's home country","To move house","To graduate"],a:1,note:"帰国（きこく）します= to return to one's country."},
  {type:"grammar",prompt:"来年（らいねん） 日本（にほん）へ 行（い）こう ___ 思（おも）っています。(I'm planning to go to Japan next year.)",choices:["と","を","が","に"],a:0,note:"Volitional form + と思（おも）っています expresses an ongoing intention/plan."},
  {type:"structure",prompt:"Which correctly says \"I plan to study abroad next year\"?",choices:["来年（らいねん） 留学（りゅうがく）する 予定（よてい）です。","来年（らいねん） 留学（りゅうがく） 予定（よてい）する です。","予定（よてい）は 来年（らいねん） 留学（りゅうがく）します。","留学（りゅうがく）する 来年（らいねん） 予定（よてい）です。"],a:0,note:"Dictionary form + 予定（よてい）です states a plan."}
 ],
 cap:[
  {en:"I'm thinking of returning to my country next month.",jp:"来月（らいげつ） 帰国（きこく）しようと 思（おも）っています。",note:"Volitional (帰国（きこく）しよう) + と思（おも）っています = an intention held over time."},
  {en:"This weekend I plan to clean my room and do laundry.",jp:"今週末（こんしゅうまつ）は 部屋（へや）を 掃除（そうじ）したり 洗濯（せんたく）したり する 予定（よてい）です。",note:"Combine たり listing with 予定（よてい）です for a planned itinerary."},
  {en:"I'm thinking of studying Japanese next year too.",jp:"来年（らいねん）も 日本語（にほんご）を 勉強（べんきょう）しようと 思（おも）っています。",note:"も (Lesson 6) replacing は／を, combined with volitional + と思っています for an ongoing intention."},
  {en:"I plan to graduate next spring.",jp:"来年（らいねん）の 春（はる） 卒業（そつぎょう）する 予定（よてい）です。",note:"Dictionary form (卒業する, not 卒業します) placed directly before 予定です states the plan."},
  {en:"I'm thinking of moving next month too.",jp:"来月（らいげつ）も 引（ひ）っ越（こ）そうと 思（おも）っています。",note:"Volitional 引っ越そう + と思っています expresses an intention held over time, not a spur-of-the-moment idea."}
 ]},
{n:20,title:"すぎます / ほうがいいです",topic:"Excess, giving advice",
 q:[
  {type:"vocab",prompt:"「疲（つか）れます」means:",choices:["To relax","To get tired","To get sick","To sleep"],a:1,note:"疲（つか）れます= to become tired."},
  {type:"vocab",prompt:"「込（こ）みます」means:",choices:["To become crowded","To become empty","To become quiet","To become expensive"],a:0,note:"込（こ）みます= to get crowded."},
  {type:"grammar",prompt:"昨日（きのう）は 働（はたら）き ___ 疲（つか）れました。(I worked too much yesterday and got tired.)",choices:["すぎて","すぎます","すぎた","すぎるので"],a:0,note:"Vます-stem + すぎて = 'because of doing too much', linking to the result."},
  {type:"structure",prompt:"Which correctly gives advice: \"You'd better see a doctor\"?",choices:["医者（いしゃ）に 行（い）った ほうが いいです。","医者（いしゃ）に 行（い）く ほうが いいです。","医者（いしゃ）に 行（い）きます ほうが いいです。","医者（いしゃ）は 行（い）った ほうが いいです。"],a:0,note:"Vた-form + ほうがいいです is the standard way to give advice."}
 ],
 cap:[
  {en:"You ate too much, so you should rest a bit.",jp:"食（た）べすぎましたから、少（すこ）し 休（やす）んだ ほうが いいです。",note:"すぎました states the excess; ほうがいいです gives the recommendation."},
  {en:"Trains are crowded in the morning, so it's better to leave early.",jp:"朝（あさ）は 電車（でんしゃ）が 込（こ）みますから、早（はや）く 出（だ）た ほうが いいです。",note:"から gives the reason for the advice that follows."},
  {en:"I worked too much yesterday, so I'm planning to rest today.",jp:"昨日（きのう）は 働（はたら）きすぎましたから、今日（きょう）は 休（やす）もうと 思（おも）っています。",note:"働きすぎました states the excess; volitional 休もう (not 休みます) before と思っています expresses the plan."},
  {en:"You've gained too much weight, so you'd better not eat too much.",jp:"太（ふと）りすぎましたから、食（た）べすぎない ほうが いいです。",note:"太りすぎました states the excess; 食べすぎないほうがいいです is the negative variant of the advice pattern — 'you'd better not'."},
  {en:"It gets crowded at night too, so it's better to eat early.",jp:"夜（よる）も 込（こ）みますから、早（はや）く 食（た）べた ほうが いいです。",note:"から gives the reason; 食べたほうがいいです applies the advice pattern to a new situation."}
 ]},
{n:21,title:"と思（おも）います／でしょう",topic:"Opinions, hearsay, probability",
 q:[
  {type:"vocab",prompt:"「台風（たいふう）」means:",choices:["Typhoon","Earthquake","Rain","Snow"],a:0,note:"台風（たいふう）= typhoon."},
  {type:"vocab",prompt:"「天気（てんき）」means:",choices:["Season","Weather","Temperature","Sky"],a:1,note:"天気（てんき）= weather."},
  {type:"grammar",prompt:"明日（あした）は 雨（あめ）が 降（ふ）る ___ 思（おも）います。(I think it will rain tomorrow.)",choices:["と","を","が","に"],a:0,note:"Plain form + と思（おも）います = 'I think that...'"},
  {type:"structure",prompt:"Which correctly says \"It will probably be sunny tomorrow\"?",choices:["明日（あした）は 晴（は）れるでしょう。","明日（あした）は 晴（は）れますでしょう。","明日（あした）は 晴（は）れると でしょう。","明日（あした）は 晴（は）れでしょうる。"],a:0,note:"Plain form + でしょう expresses probability, said with falling intonation for a guess."}
 ],
 cap:[
  {en:"I think this typhoon is quite big.",jp:"この 台風（たいふう）は かなり 大（おお）きいと 思（おも）います。",note:"い-adjective plain form + と思（おも）います, no だ needed after い-adjectives."},
  {en:"Tanaka-san said the meeting is tomorrow.",jp:"田中（たなか）さんは 会議（かいぎ）は 明日（あした）だと 言（い）いました。",note:"Noun + だ + と言（い）いました reports what someone said (plain copula だ before と in casual quotes)."},
  {en:"This test will probably be difficult.",jp:"この テストは 難（むずか）しいでしょう。",note:"い-adjective + でしょう for a probability guess — でしょう alone carries the same idea と思います does, more casually."},
  {en:"I think there was an earthquake just now.",jp:"今（いま） 地震（じしん）が あったと 思（おも）います。",note:"Plain past あった + と思います reports a past-tense belief."},
  {en:"The weather forecast said it will be a typhoon tomorrow.",jp:"天気予報（てんきよほう）は 明日（あした） 台風（たいふう）だと 言（い）いました。",note:"Noun + だ + と言いました reports what was said, the plain copula だ appearing before と in casual quotes."}
 ]},
{n:22,title:"名詞修飾（めいししゅうしょく）",topic:"Modifying nouns with verb/adjective clauses",
 q:[
  {type:"vocab",prompt:"「眼鏡（めがね）」means:",choices:["Glasses","Hat","Watch","Necklace"],a:0,note:"眼鏡（めがね）= eyeglasses."},
  {type:"vocab",prompt:"「人形（にんぎょう）」means:",choices:["Doll","Toy car","Puzzle","Photo frame"],a:0,note:"人形（にんぎょう）= doll."},
  {type:"grammar",prompt:"これは 私（わたし）が 撮（と）っ ___ 写真（しゃしん）です。(This is the photo that I took.)",choices:["た","て","ている","たり"],a:0,note:"Plain past form directly modifies the following noun: 撮（と）った写真（しゃしん） = 'the photo [that I] took'."},
  {type:"structure",prompt:"Which correctly says \"The woman wearing glasses is my mother\"?",choices:["眼鏡（めがね）を かけている 人（ひと）は 母（はは）です。","眼鏡（めがね）が かけて いる人（ひと）は 母（はは）です。","眼鏡（めがね）を かけました 人（ひと）は 母（はは）です。","母（はは）は 眼鏡（めがね）を かけている です人（ひと）。"],a:0,note:"A clause ending in ている can modify a noun directly, just like an adjective."}
 ],
 cap:[
  {en:"The doll that Tanaka-san gave me is very cute.",jp:"田中（たなか）さんが くれた 人形（にんぎょう）は とても かわいいです。",note:"くれた (gave to me) modifies 人形（にんぎょう） directly, placed right before the noun."},
  {en:"The person standing over there is my teacher.",jp:"あそこに 立（た）っている 人（ひと）は 私（わたし）の 先生（せんせい）です。",note:"立（た）っている (standing) modifies 人（ひと） (person) as a noun-modifying clause."},
  {en:"The book that is on the desk is mine.",jp:"机（つくえ）の 上（うえ）に ある 本（ほん）は 私（わたし）のです。",note:"ある (the plain form of あります) modifies 本 directly — the same noun-modification pattern as ている clauses, just with an existence verb."},
  {en:"The photo that my mother gave me is very old.",jp:"母（はは）が くれた 写真（しゃしん）は とても 古（ふる）いです。",note:"くれた (gave to me) modifies 写真 directly, placed right before the noun it describes."},
  {en:"The person wearing glasses over there is my father.",jp:"あそこで 眼鏡（めがね）を かけている 人（ひと）は 私（わたし）の 父（ちち）です。",note:"かけている modifies 人 directly, the same ている noun-modification pattern as other ongoing-state clauses."}
 ]},
{n:23,title:"とき / 移動動詞（いどうどうし）",topic:"Time clauses, movement across a place",
 q:[
  {type:"vocab",prompt:"「曲（ま）がります」means:",choices:["To turn","To stop","To cross","To fall"],a:0,note:"曲（ま）がります= to turn."},
  {type:"vocab",prompt:"「まっすぐ」means:",choices:["Slowly","Straight ahead","Quickly","Carefully"],a:1,note:"まっすぐ = straight, straight ahead."},
  {type:"grammar",prompt:"日本（にほん）へ 行（い）く ___ 、パスポートが 要（い）ります。(When [you] go to Japan, you need a passport.)",choices:["とき","たら","ながら","のに"],a:0,note:"Dictionary form + とき describes 'when [an event happens/will happen]'."},
  {type:"structure",prompt:"Which correctly says \"I walk across the park every morning\"?",choices:["毎朝（まいあさ） 公園（こうえん）を 歩（ある）きます。","毎朝（まいあさ） 公園（こうえん）に 歩（ある）きます。","毎朝（まいあさ） 公園（こうえん）で 歩（ある）きます。","毎朝（まいあさ） 公園（こうえん）が 歩（ある）きます。"],a:0,note:"を marks the space traversed with verbs of movement like 歩（ある）きます, 渡（わた）ります, 通（とお）ります."}
 ],
 cap:[
  {en:"When I was a child, I lived in Osaka.",jp:"子供（こども）の とき、大阪（おおさか）に 住（す）んでいました。",note:"Noun + の + とき for 'when [I was] N'."},
  {en:"Turn right at that corner, then go straight.",jp:"あの 角（かど）を 右（みぎ）に 曲（ま）がって、まっすぐ 行（い）ってください。",note:"を marks the corner as the point of turning; 曲（ま）がって chains into the next instruction."},
  {en:"When it rains, I don't go outside.",jp:"雨（あめ）が 降（ふ）る とき、外（そと）へ 行（い）きません。",note:"Dictionary form + とき for a habitual 'when'; combines weather vocabulary (雨が降る) with this lesson's time-clause pattern."},
  {en:"When you cross that bridge, go straight ahead.",jp:"あの 橋（はし）を 渡（わた）る とき、まっすぐ 行（い）ってください。",note:"を marks 橋 as the thing being crossed; dictionary form + とき describes 'when [the crossing happens]'."},
  {en:"A visa is necessary when you go to that country.",jp:"あの 国（くに）へ 行（い）く とき、ビザが 要（い）ります。",note:"Dictionary form + とき for 'when [you] go'; 要ります ('to be necessary') is this lesson's own vocabulary."}
 ]},
{n:24,title:"受身形（うけみけい）",topic:"Passive voice",
 q:[
  {type:"vocab",prompt:"「褒（ほ）めます」means:",choices:["To scold","To praise","To ignore","To thank"],a:1,note:"褒（ほ）めます= to praise."},
  {type:"vocab",prompt:"「叱（しか）ります」means:",choices:["To scold","To laugh","To cry","To help"],a:0,note:"叱（しか）ります= to scold."},
  {type:"grammar",prompt:"私（わたし）は 先生（せんせい）に ___ 。(I was praised by my teacher.)",choices:["褒（ほ）めました","褒（ほ）められました","褒（ほ）めさせました","褒（ほ）めています"],a:1,note:"Passive form: 褒（ほ）める → 褒（ほ）められる → past 褒（ほ）められました."},
  {type:"structure",prompt:"Which correctly says \"This building was built 100 years ago\"?",choices:["この 建物（たてもの）は 100年前（ねんまえ）に 建（た）てられました。","この 建物（たてもの）は 100年前（ねんまえ）に 建（た）てました。","この 建物（たてもの）が 100年前（ねんまえ）に 建（た）てられます。","100年前（ねんまえ） この 建物（たてもの）は 建（た）てられる でした。"],a:0,note:"Passive form 建（た）てられました is natural when the agent (who built it) is unspecified or unimportant."}
 ],
 cap:[
  {en:"I was scolded by my mother yesterday.",jp:"昨日（きのう） 母（はは）に 叱（しか）られました。",note:"The person doing the action takes に in passive sentences: 母（はは）に叱（しか）られる = 'be scolded by mother'."},
  {en:"This song is loved by many people.",jp:"この 歌（うた）は 多（おお）くの 人（ひと）に 愛（あい）されています。",note:"愛（あい）する → 愛（あい）される (passive) → 愛（あい）されています for an ongoing state."},
  {en:"I was invited to the party by Tanaka-san.",jp:"田中（たなか）さんに パーティーに 招待（しょうたい）されました。",note:"に marks the person doing the inviting in this passive sentence, the same role as 先生に in the model answer."},
  {en:"I was praised by the teacher for my kanji.",jp:"漢字（かんじ）を 先生（せんせい）に 褒（ほ）められました。",note:"に marks the teacher as the one doing the praising in this passive sentence."},
  {en:"This building was built 50 years ago.",jp:"この 建物（たてもの）は 50年前（ねんまえ）に 建（た）てられました。",note:"建てられました is the passive of 建てます, natural when the builder is unspecified."}
 ]},
{n:25,title:"使役形（しえきけい）",topic:"Causative form",
 q:[
  {type:"vocab",prompt:"「泣（な）きます」means:",choices:["To laugh","To cry","To shout","To smile"],a:1,note:"泣（な）きます= to cry."},
  {type:"vocab",prompt:"「休（やす）ませます」is the causative of which verb?",choices:["働（はたら）きます","休（やす）みます","泣（な）きます","待（ま）ちます"],a:1,note:"休（やす）みます (to rest) → 休（やす）ませます (to make/let someone rest)."},
  {type:"grammar",prompt:"母（はは）は 子供（こども） ___ 野菜（やさい）を 食（た）べさせました。(Mother made the child eat vegetables.)",choices:["を","に","が","で"],a:1,note:"With causative verbs, the person made to act usually takes に (especially with verbs that can take an object)."},
  {type:"structure",prompt:"Which correctly makes a humble request: \"Please let me rest today\"?",choices:["今日（きょう） 休（やす）ませて ください。","今日（きょう） 休（やす）みさせて ください。","今日（きょう） 休（やす）んで もらって ください。","今日（きょう） 休（やす）ませます ください。"],a:0,note:"Causative te-form + ください = 'please let/make me do...', a common polite request pattern."}
 ],
 cap:[
  {en:"My boss let me go home early today.",jp:"今日（きょう） 上司（じょうし）は 私（わたし）を 早（はや）く 帰（かえ）らせて くれました。",note:"Causative 帰（かえ）らせて + くれました = 'let me go home' as a favor granted by the boss."},
  {en:"Could you please let me use this computer?",jp:"この コンピューターを 使（つか）わせて いただけませんか。",note:"Causative + ていただけませんか is a very polite way to request permission."},
  {en:"My mother made me clean my room.",jp:"母（はは）は 私（わたし）に 部屋（へや）を 掃除（そうじ）させました。",note:"Causative させました combined with を for the thing being cleaned — the person made to act takes に, the object of their action still takes を."},
  {en:"The teacher made the students line up.",jp:"先生（せんせい）は 学生（がくせい）たちを 並（なら）ばせました。",note:"並（なら）びます (line up) → causative 並（なら）ばせる → past 並（なら）ばせました, the same group-1 causative pattern (う→あ + せる) as 行かせました."},
  {en:"My father made me help with the cleaning.",jp:"父（ちち）は 私（わたし）に 掃除（そうじ）を 手伝（てつだ）わせました。",note:"手伝（てつだ）います (to help) → causative 手伝（てつだ）わせる, the same construction as させました but with a different verb."}
 ]}
];
