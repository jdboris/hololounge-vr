import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const cache = { jp: { en: {} } };

export const LocalizationContext = createContext();

export function Localizationprovider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "JP"
  );
  const wrapperRef = useRef();

  useEffect(() => {
    if (wrapperRef.current) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((n) => {
            localizeNode(n, language);
          });
        });
      });
      observer.observe(wrapperRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      return () => observer.disconnect();
    }
  }, [language, wrapperRef]);

  useEffect(() => {
    if (wrapperRef.current) {
      localizeNode(wrapperRef.current, language);
    }
  }, [language, wrapperRef]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  function localizeNode(el, language) {
    textNodesUnder(el).forEach((n) => {
      n.textContent = localize(n.textContent, language);
    });
  }

  function localize(text, newLanguage = language) {
    if (newLanguage == "JP") {
      const english = text;
      const japanese = jp(text);
      cache.jp.en[japanese] = cache.jp.en[japanese] || english;
      return japanese;
    }

    if (newLanguage == "EN") {
      return cache.jp.en[text] || text;
    }
  }

  return (
    <LocalizationContext.Provider
      value={{
        language,
        setLanguage,
        localize,
      }}
    >
      <div ref={wrapperRef}>{children}</div>
    </LocalizationContext.Provider>
  );
}

/**
 * @typedef LocalizationContextValue
 * @property {"EN"|"JP"} language
 * @property {(neLanguage: "EN"|"JP") => void} setLanguage
 * @property {(text: string, language: "EN"|"JP") => string} localize
 */

/**
 *  @returns {LocalizationContextValue}
 */
export function useLocalization() {
  return useContext(LocalizationContext);
}

function textNodesUnder(el) {
  let n,
    a = [],
    walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  while ((n = walk.nextNode())) a.push(n);
  return a;
}

function jp(english) {
  switch (english) {
    case `Games`:
      return `ゲーム`;
    case `Catalog`:
      return `コンテンツ`;
    case `CATALOG`:
      return `コンテンツ`;
    case `ACCOUNT`:
      return `アカウント`;
    // case `English`:
    //   return `日本語`;
    case `Login`:
      return `ログイン`;
    case `ABOUT SHOP`:
      return `ショップについて`;
    case `BOOK NOW`:
      return `今すぐ予約`;
    case `CHECK IN NOW`:
      return `チェックインする`;
    case `Location`:
      return `住所`;
    case `Booking`:
      return `予約`;
    case `Select station(s) to reserve.`:
      return `予約したいステーションを選んでください（複数可）`;
    case `Station A`:
      return `ステーションA`;
    case `Summary`:
      return `予約内容`;
    case `Date`:
      return `予約日`;
    case `Start Time`:
      return `開始時間`;
    case `Duration`:
      return `利用時間`;
    case `Contact`:
      return `予約者情報`;
    case `Last Name`:
      return `姓`;
    case `First Name`:
      return `名`;
    case `Date of Birth`:
      return `生年月日（西暦）`;
    case `Continue to payment`:
      return `支払いに進む`;
    case `Select station(s) to reserve.`:
      return `予約したいステーションを選択してください。`;
    case `Enter your last name.`:
      return `姓を入力して下さい。`;
    case `Station B`:
      return `ステーションB`;
    case `Station C`:
      return `ステーションC`;
    case `Station D`:
      return `ステーションD`;
    case `Station E`:
      return `ステーションE`;
    case `Station F`:
      return `ステーションF`;
    case `Enter your first name.`:
      return `名を入力して下さい。`;
    case `Enter your email address.`:
      return `メールアドレスを入力して下さい。`;
    case `Phone`:
      return `電話番号`;
    case `Enter your phone number.`:
      return `電話番号を入力して下さい。`;
    case `Enter your date of birth.`:
      return `生年月日（西暦）を入力して下さい。`;
    case `CONTINUE TO PAYMENT`:
      return `支払いに進む`;
    case `Select station(s) to reserve.`:
      return `予約したいステーションを選択してください。`;
    case `Please enter a first and last name.`:
      return `予約時に入力した名前を入力して下さい。`;
    case `Last Name`:
      return `姓`;
    case `First Name`:
      return `名`;
    case `Check-in`:
      return `チェックイン`;
    case `CHECK IN`:
      return `チェックイン`;
    case `No upcoming reservations found under that name.`:
      return `こちらのお名前では予約を確認できませんでした。`;
    case `You may not check in more than 5 minutes before your reservation. (Your next reservation is at {startTime})`:
      return `ご予約の時間5分前からチェックインが可能です。（あなたの予約開始時間は {startTime} です。）`;
    case `Check-in complete! You are now checked in at these stations. Your experience(s) will start automatically.`:
      return `チェックインが完了しました！あなたはこちらのステーションにチェックインしました。それではVR体験をお楽しみください。`;
    case `Booking complete! You will receive a receipt and booking confirmation via email. Please check in at the in-store kiosk up to 5 minutes in advance.`:
      return `予約が完了しました！予約時に入力いただいたメールアドレスに予約詳細とレシートを送信しました。ご予約開始時間の5分前に店舗の受付カウンターにてチェックインをして下さい。`;
    case `Please continue to the payment terminal to complete your order…`:
      return `注文を完了するには、支払い端末に進んでください…`;
    case `Redirecting for checkout…`:
      return `お支払情報入力ページへ移動します…`;
    case `A ton of feathers is a VR game that pushes the experiential boundaries of VR to the absolute limit. You play as a writer in a future dystopian City asked to hunt down a serial killer by exploring The criminals books and writings, you are transported in to bizarre Worlds where you will meet Kings, robots, sentient teddy bears and more. The games genre hops from comedic to psychological horror With an overarching story that blends the narrative together in a hallucinogenic Robotik Joyride. A ton of feathers has to be experienced to be understood and presents a story that can only be told in VR.`:
      return `A ton of feathers は、VR の体験的な境界を絶対的な限界まで押し上げる VR ゲームです。あなたは犯罪者の本や著作を探索して連続殺人犯を追い詰めるように頼まれた未来のディストピア都市で作家としてプレイし、王様、ロボット、知的なテディベアなどと出会う奇妙な世界に運ばれます。ゲームのジャンルは、コメディからサイコ ホラーへとホップします。幻覚的なロボティック ジョイライドで物語を融合させる包括的なストーリーを備えています。理解するには多くの羽毛を体験する必要があり、VR でしか語ることのできないストーリーを提示します。`;
    case `Get your aprons ready… The award-winning multiplayer VR cooking game from Resolution Games just keeps getting better!`:
      return `エプロンを準備しましょう… Resolution Games の受賞歴のあるマルチプレイヤー VR クッキング ゲームは、進化を続けています。`;
    case `Travel back in time to 1943 and relive the excitement of classic arcade dogfights in VR`:
      return `1943 年にタイムスリップして、VR でクラシックなアーケード ドッグファイトの興奮を追体験しましょう。`;
    case `Join Red, Chuck, Bomb & the Blues to save the stolen eggs in Angry Birds VR: Isle of Pigs, an immersive VR adventure! Discover the island where the greedy pigs vacation, slingshot your way to defeat Dr. Frankenswine & create/share/discover an infinite number of levels with the online level builder.`:
      return `Red、Chuck、Bomb & the Blues に参加して、没入型 VR アドベンチャー、Angry Birds VR: Isle of Pigs で盗まれた卵を救いましょう!貪欲な豚が休暇を過ごす島を発見し、スリングショットでフランケンワイン博士を倒し、オンライン レベル ビルダーで無限の数のレベルを作成/共有/発見してください。`;
    case `The stunning new experience from the brilliant imagination of artist and musician Arjan van Meerten, Apex delivers a surrealistic and darkly beautiful apocalyptic vision set to an original score in the anticipated follow up to Van Meerten's Surge.`:
      return `アーティストでありミュージシャンでもある Arjan van Meerten の素晴らしい想像力による驚くべき新しい体験である Apex は、Van Meerten の Surge に期待されるフォローアップで、オリジナルのスコアに設定されたシュールで暗く美しい終末論的なビジョンを提供します。`;
    case `Arizona Sunshine is a first-person shooter built exclusively for VR that immerses you and up to three fellow survivors in a post-apocalyptic southwestern America overrun by zombies.`:
      return `Arizona SunshineはVR専用に作成された一人称シューティングゲームで、ゾンビに蹂躙された黙示録後のアメリカ南西部にあなたと最大3人の生存者が没頭します。`;
    case `Get the feeling of being inside famous paintings! Art Plunge is a gallery where you can get the feeling of being inside famous paintings. This is a short but sweet experience featuring 5 VR interpretations of the following artworks: * Mona Lisa * Starry Night * The Birth of Venus * The Creation of Adam * Girl Reading a Letter at an Open Window`:
      return `有名な絵画の中にいる気分を味わえます！ Art Plungeは名画の中にいるような気分になれるギャラリーです。これは、次のアートワークの 5 つの VR 解釈を特徴とする、短いが甘い体験です: * モナリザ * 星月夜 * ヴィーナスの誕生 * アダムの創造 * 開いた窓で手紙を読む少女`;
    case `Spawn and combine shapes, colors and freehand painting to sync them seamlessly into the background music. Let your creativity flow free!`:
      return `形、色、フリーハンド ペイントを生成して組み合わせ、バックグラウンド ミュージックにシームレスに同期させます。あなたの創造性を自由に発揮させましょう！`;
    case `The familiar mechanics of this casual tetromino block game will let anybody enjoy it in minutes. Three game modes will keep you entertained both in singe and in co-op with a friend. Designed by a virtual reality experience centre based on feedback from hundreds of customers. Our aim was to create an experience that is easy for anyone to have fun with and can be enjoyable for all family members.`:
      return `このカジュアルなテトロミノ ブロック ゲームのおなじみの仕組みは、誰でも数分で楽しめるようになります。 3 つのゲーム モードで、1 人プレイでも友達との協力プレイでも楽しませてくれます。何百人もの顧客からのフィードバックに基づいて、仮想現実体験センターによって設計されました。誰でも簡単に、家族みんなで楽しめる体験を目指しました。`;
    case `Embark on a mysterious adventure in this 1-4 player VR game set in the alternate world of the Western Frontier. Lots of discoveries, dangers, and digging action await adventurers.`:
      return `ウェスタン フロンティアの異世界を舞台にした 1 ～ 4 人用の VR ゲームで、ミステリアスな冒険に出かけましょう。多くの発見、危険、そして掘り出し物が冒険者を待っています。`;
    case `You are Adonis Creed, fighting toe-to-toe with the world's top opponents to establish your boxing legacy. This intense cinematic experience features new Phantom Melee Technology for impactful VR melee combat so you can train, fight, and win like Creed.`:
      return `あなたはアドニス クリードであり、ボクシングの遺産を確立するために世界のトップの対戦相手と真っ向から戦います。この強烈な映画体験は、インパクトのある VR 近接戦闘のための新しい Phantom Melee テクノロジーを備えているため、Creed のように訓練し、戦い、勝利することができます。`;
    case `First person VR Kung Fu combat against a variety of different opponents, with a variety of different fighting styles, special moves and back stories`:
      return `さまざまな戦闘スタイル、必殺技、バックストーリーを備えた、さまざまな対戦相手との一人称 VR カンフー戦闘`;
    case `Embark on an immersive journey through a sonic dimension of bumping beats and psychedelic visuals. Electronauts Arcade sets the stage for you to DJ, perform, and make music magic in virtual reality as you build, drop, remix, and jam on 40-plus songs from 50 top artists -- including Tiesto, Steve Aoki, and Dada Life -- with no music skills needed.`:
      return `ぶつかり合うビートとサイケデリックなビジュアルの音の次元を通して、没入感のある旅に出かけましょう。 Electronauts Arcade は、Tiesto、Steve Aoki、Dada Life を含む 50 人のトップ アーティストによる 40 曲以上の曲を作成、ドロップ、リミックス、ジャムしながら、バーチャル リアリティで DJ、パフォーマンス、音楽の魔法をかける舞台を設定します。 - 音楽のスキルは必要ありません。`;
    case `Take a bow and kill hordes of orcs in the epic town defense game. You can play alone to conquer the leaderboards or unite with other assassins in online co-op mode. PS. Be careful to avoid massive axes thrown at you by orc warriors.`:
      return `壮大なタウン ディフェンス ゲームで、お辞儀をしてオークの大群を倒しましょう。一人でプレイしてリーダーボードを征服したり、オンライン協力モードで他の暗殺者と団結したりできます。 PS。オークの戦士が投げる巨大な斧を避けるように注意してください。`;
    case `Do your best to survive in a village infected by some of the scariest creatures you've ever seen. Tread carefully, be alert, shoot with precision and you might be able to make it out alive. Play together with up to five friends in coopmode.`:
      return `あなたが今まで見た中で最も恐ろしい生き物のいくつかに感染した村で生き残るために最善を尽くしてください.慎重に歩き、油断せず、正確に撃てば、生還できるかもしれません。協力モードで最大 5 人の友達と一緒にプレイできます。`;
    case `The sequel to the juiciest VR game ever! Build up a collection of swords and bows. Slice your way through unique levels and mini-games. Explore the colorful world of Fruitasia and become a true Fruit Ninja Master!`:
      return `これまでで最もジューシーな VR ゲームの続編!剣と弓のコレクションを構築します。ユニークなレベルとミニゲームを切り抜けましょう。 Fruitasia のカラフルな世界を探検して、真のフルーツ忍者マスターになりましょう!`;
    case `Show your skills at table soccer. Play with your friends or challenge the machine and fill your trophy case. In the world's first multiplayer VR table soccer game.`:
      return `テーブルサッカーであなたのスキルを見せてください。友達と遊んだり、マシンに挑戦してトロフィーケースをいっぱいにしましょう。世界初の多人数参加型 VR テーブル サッカー ゲームで。`;
    case `A Festive Snowman Building Sandbox VR Game. Choose from over 50 different props to decorate your snowman, or environment. Mix and match different eyes, mouths, arms, hats, accesories and more—get creative! We'll be adding even more accessories in future updates.`:
      return `お祝いの雪だるまビルディング サンドボックス VR ゲーム。 50 種類以上の小道具から選択して、雪だるまや環境を飾りましょう。さまざまな目、口、腕、帽子、アクセサリーなどを組み合わせて、創造性を発揮しましょう。今後のアップデートでさらに多くのアクセサリを追加する予定です。`;
    case `Challenge your friends (up to 4 players) to a food fight in VR! From free-for-all to team battle multiplayer, IgKnight Food Fight comes with face haptic support, kids mode and 5 different festival decorations!`:
      return `友達 (最大 4 人) と VR でのフード ファイトに挑戦しましょう!フリーフォーオールからチーム バトル マルチプレイヤーまで、IgKnight フード ファイトには、フェイス ハプティック サポート、キッズ モード、5 種類のフェスティバル デコレーションが付属しています`;
    case `The Infinite Art Museum is a free, permanent virtual reality museum and archive of art. Explore a growing collection of over 800 original paintings, illustrations, digital art and photographs from artists around the world.`:
      return `Infinite Art Museum は、無料の常設のバーチャル リアリティ ミュージアムであり、アートのアーカイブでもあります。世界中のアーティストによる 800 点を超えるオリジナルの絵画、イラスト、デジタル アート、写真のコレクションをご覧ください。`;
    case `A whole new way to spend your holidays! Equipped with a handy jetpack, fly, bounce and shoot! Various fun mini-games using a jetpack are enriched! Let's take off!`:
      return `休日のまったく新しい過ごし方！便利なジェットパックを装備して、飛んで、跳ねて、撃て！ジェットパックを使った楽しいミニゲームが充実！離陸しよう！`;
    case `In a world where robots have replaced all human jobs, step into the "Job Simulator" to learn what it was like 'to job'.`:
      return `人間の仕事がすべてロボットに取って代わられた世界で、「働くこと」がどのようなものかを学ぶために「ジョブ シミュレーター」に足を踏み入れましょう。`;
    case `Kooring VR Wonderland : Medicano's Attack contains 6 mini games, with special experiences in VR. In the mysterious Wonderland, you can devour exhilarating magical experience!`:
      return `Kooring VR Wonderland : Medicano's Attack には、VR で特別な体験ができる 6 つのミニゲームが含まれています。ミステリアスなワンダーランドで、爽快な魔法体験をむさぼり食うことができます！`;
    case `LyraVR is a music creation app that offers everyone a fun and unique music-making experience. Make music in 3D and interact with music sequences from entirely new perspectives in virtual reality.`:
      return `LyraVR は、誰もが楽しくユニークな音楽制作体験を提供する音楽制作アプリです。 3D で音楽を作成し、バーチャル リアリティでまったく新しい視点から音楽シーケンスを操作します。`;
    case `Ocean's Treasures is a VR underwater treasure hunt that places the player on the bottom of the sea to explore shipwrecks and recover lost treasures. Within 12 different scenes, you will be surrounded by some spectacular environment and fishes.`:
      return `Ocean's Treasures は VR 水中トレジャー ハントで、プレイヤーを海の底に置いて難破船を探索し、失われた宝物を回収します。 12 の異なるシーンで、壮大な環境と魚に囲まれます。`;
    case `Relive the experience of playing the classic war arcade in a totally amazing way, thanks to virtual reality and the innovative immersion system that will make it possible for you to travel inside the video game.`:
      return `バーチャル リアリティと、ビデオ ゲーム内を移動できる革新的な没入型システムのおかげで、古典的な戦争アーケードをまったく驚くべき方法でプレイした経験を追体験できます。`;
    case `Visionarium is a visionary music driven VR journey. In this experience a visionary trance state is simulated.`:
      return `Visionarium は、幻想的な音楽主導の VR ジャーニーです。この体験では、幻想的なトランス状態がシミュレートされます。`;
    case `Pierhead Arcade is back with all new VR physics based arcade games to play!`:
      return `Pierhead Arcade が、すべての新しい VR 物理ベースのアーケード ゲームをプレイできるようになって帰ってきました!`;
    case `Combining survival horror and static wave shooting, Propagation VR will get your adrenaline pumping as you try to survive a zombie apocalypse. Armed only with your guns and your fists, fight off terrifying zombies and other multi-species mutants. Will you get out alive?`:
      return `サバイバル ホラーと静波シューティングを組み合わせた Propagation VR では、ゾンビの黙示録を生き延びようとするときに、アドレナリンが放出されます。銃とこぶしだけで武装し、恐ろしいゾンビやその他の多種多様なミュータントを撃退してください。あなたは生きて出られますか？`;
    case `Rec Room is the best place to build and play games together. Party up with friends from all around the world to chat, hang out, explore MILLIONS of player-created rooms, or build something new and amazing to share with us all.`:
      return `Rec Room は、一緒にゲームを構築してプレイするのに最適な場所です。世界中の友達とパーティーを組んで、チャットしたり、たむろしたり、プレイヤーが作成した数百万の部屋を探索したり、新しくて素晴らしいものを作ってみんなと共有したりできます。`;
    case `Rotten Apple is a Co-op Zombie-Shooter that lets you dive into a post-apocalyptic New York. Enter the Quarantine Zone with up to 3 friends to defeat the ever-growing zombie horde, secure critical research data and get out again in one piece. Challenge yourselves in the story or wave-shooter modes.`:
      return `Rotten Apple は、世界滅亡後のニューヨークに飛び込むことができる協力型ゾンビシューティング ゲームです。最大 3 人のフレンドと一緒に検疫ゾーンに入り、増え続けるゾンビの大群を倒し、重要な研究データを確保して、無事に再び脱出しましょう。ストーリー モードまたはウェーブ シューター モードで自分自身に挑戦してください。`;
    case `"SUPERHOT" is a unique FPS game where "time advances only when you move". There is no life recovery or ammo replenishment. I'm the only one who can stand up against armed red guys.`:
      return `「SUPERHOT」は「動いているだけで時間が進む」という異色のFPSゲームです。ライフ回復や弾薬補充はありません。武装した赤いやつらに立ち向かえるのは俺だけだ。`;
    case `JUST UPDATED: Explore the Second Floor of the Museum! Explore a virtual museum in room-scale VR: see famous sculptures in full, 1:1 scale and see famous paintings without the limitations of glass and security guards.`:
      return `最新情報: 博物館の 2 階を探検しよう!ルーム スケールの VR でバーチャル ミュージアムを探索: ガラスや警備員の制限なしに、有名な彫刻を 1:1 のスケールで完全に見て、有名な絵画を見てください。`;
    case `There's no rest when survival is on the line. Step into AMC's The Walking Dead and prepare for an onslaught of walkers as you assume the roles of your favorite characters from the show, and confront the horrors and humanity of this apocalyptic new world.`:
      return `生存がかかっているとき、休むことはありません。 AMC の The Walking Dead に足を踏み入れ、ショーのお気に入りのキャラクターの役割を引き受けながらウォーカーの猛攻撃に備え、この黙示録的な新しい世界の恐怖と人間性に立ち向かいましょう。`;
    case `Get secret missions from Secret Delivery Agency (SDA) and save the world from zombie horde in the VR action game,Throw Anything!`:
      return `Secret Delivery Agency (SDA) から秘密のミッションを取得し、VR アクション ゲーム、Throw Anything でゾンビの大群から世界を救いましょう!`;
    case `Step into the role of Thor in this arcade style VR game where you get to wield Mjölnir, the famous hammer, and defend the human village from the giants. Fight waves of enemies and try to keep as high a multiplier as possible to get the highest score.`:
      return `このアーケード スタイルの VR ゲームでトールの役割に足を踏み入れると、有名なハンマーであるミョルニルを振り回し、人間の村を巨人から守ります。敵の波と戦い、できるだけ高い乗数を維持して最高のスコアを獲得してください。`;
    case `The mechanics are ready. Cheers erupt from the audience. Let's step into the arena! Ultimex, a new multiplayer VR game from Resolution Games, combines the excitement of professional sports with the allure of precision racing machines.`:
      return `メカニックは準備ができています。客席から歓声が上がる。アリーナに足を踏み入れましょう！ Resolution Games の新しいマルチプレイヤー VR ゲームである Ultimex は、プロ スポーツの興奮と精密レーシング マシンの魅力を兼ね備えています。`;
    case `How long would you survive in this unrealistic representation of the zombie apocalypse? Scavenge for supplies, find a base, and construct your defenses. Break down furniture and board up your home. Set bear traps, nail your axe to a gun, or find your own ways to fight off the undead. VR required.`:
      return `この非現実的なゾンビの黙示録の中で、あなたはどのくらい生き延びられるでしょうか?物資をあさり、基地を見つけ、防御を構築します。家具を分解し、家に乗り込みましょう。クマのわなを設置したり、斧を銃に釘付けにしたり、アンデッドと戦う独自の方法を見つけたりしてください。`;
    case `An active VR game that fights with swords, combining fantasy and synthwave. A hack-and-slash roguelite that hones your skills as you battle your way through neon-lit fantasy worlds and slay enchanted monsters. Fight, fall, and rise again.`:
      return `ファンタジーとシンセウェーブを融合させた、剣で戦うアクティブVRゲーム。ネオンに照らされたファンタジーの世界で戦い、魅惑的なモンスターを倒しながらスキルを磨くハック アンド スラッシュ ローグライト。戦って、転んで、また立ち上がる。`;
    case `Visionarium is a visionary music driven VR journey. In this experience a visionary trance state is simulated.`:
      return `Visionarium は、幻想的な音楽主導の VR ジャーニーです。この体験では、幻想的なトランス状態がシミュレートされます。`;
    case `Hours (every day)`:
      return `営業時間（定休日無し）`;
    case `Email`:
      return `メールアドレス`;
    case `Station(s)`:
      return `ステーション`;
    case `Total`:
      return `合計金額`;
    case `INSTALL THE APP`:
      return `アプリをインストールする`;
    case `Last check-in`:
      return `最終予約可能時刻`;
    case `PAY WITH CREDIT CARD`:
      return `クレジットカードで払う`;
    case `CONTINUE`:
      return `確認`;
    case `Enter your resservation's start date and time.`:
      return `ご希望の予約開始時間と利用時間を入力して下さい。`;
    case `BACK`:
      return `戻る`;
    case `min.`:
      return `分`;
    case ``:
      return ``;
  }

  return english;
}
