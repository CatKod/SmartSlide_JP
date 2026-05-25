/**
 * Seed script: tạo dữ liệu mẫu cho MongoDB Atlas (smartslide_db)
 * Chạy: npm run seed
 */
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');
const Template = require('./models/Template');
const Material = require('./models/Material');

const templates = [
  {
    title: 'N3文法：〜てくる・〜ていく',
    category: 'grammar', categoryLabel: '文法', level: 'N3',
    author: '佐々木先生', rating: 4.8, downloads: 1320,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=900&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=900&auto=format&fit=crop',
    description: '「〜てくる」「〜ていく」の意味、使い分け、例文、会話練習、小テストまで入った授業用テンプレートです。',
    tags: ['N3', '文法', '練習問題'],
    slidesData: [
      { id: 's1', title: 'N3文法：〜てくる・〜ていく', body: '今日の目標：移動・変化・継続を表す文法を使えるようになりましょう。', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=900&auto=format&fit=crop' },
      { id: 's2', title: '導入', body: '例：雨が降ってきました。\n例：これから寒くなっていきます。\n二つの文の違いを考えましょう。', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=900&auto=format&fit=crop' },
      { id: 's3', title: '意味1：こちらへ近づく', body: '「〜てくる」は、動作や人・物が話し手の方へ近づくことを表します。\n例：友だちが走ってきました。', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=900&auto=format&fit=crop' },
      { id: 's4', title: '意味2：これから遠ざかる', body: '「〜ていく」は、動作や人・物が話し手から離れていくことを表します。\n例：鳥が空へ飛んでいきました。', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop' },
      { id: 's5', title: '意味3：変化の始まり', body: '「〜てくる」は、今までに変化が起き始めたことを表します。\n例：日本語が少し分かってきました。', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=900&auto=format&fit=crop' },
      { id: 's6', title: '意味4：これからの変化', body: '「〜ていく」は、今から未来へ変化が続くことを表します。\n例：日本語をもっと勉強していきます。', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop' },
      { id: 's7', title: '練習問題', body: '1. 子どもが家へ帰って（　）。\n2. これから人口が増えて（　）。\n3. だんだん暑くなって（　）。', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=900&auto=format&fit=crop' },
      { id: 's8', title: '会話練習', body: 'ペアで話しましょう。\nA：最近、何が変わってきましたか。\nB：生活が便利になってきました。', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=900&auto=format&fit=crop' },
      { id: 's9', title: 'まとめ', body: '〜てくる：こちらへ近づく・今までの変化\n〜ていく：離れる・これからの変化', image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=900&auto=format&fit=crop' },
    ],
  },
  {
    title: '初級漢字：書き順練習',
    category: 'kanji', categoryLabel: '漢字', level: '初級',
    author: '山田先生', rating: 4.6, downloads: 980,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=900&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=900&auto=format&fit=crop',
    description: '漢字の形、読み方、意味、書き順、例文、確認問題をまとめた初級向けテンプレートです。',
    tags: ['漢字', '初級', '書き順'],
    slidesData: [
      { id: 's1', title: '初級漢字：書き順練習', body: '今日の漢字：日・月・火・水・木\n読み方と書き方を練習しましょう。', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=900&auto=format&fit=crop' },
      { id: 's2', title: '漢字の見方', body: '漢字には「意味」「読み方」「書き順」があります。まず形をよく見ましょう。', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=900&auto=format&fit=crop' },
      { id: 's3', title: '日', body: '読み方：にち、ひ\n意味：太陽、一日\n例文：今日は日曜日です。', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=900&auto=format&fit=crop' },
      { id: 's4', title: '月', body: '読み方：げつ、つき\n意味：月、一か月\n例文：月がきれいです。', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop' },
      { id: 's5', title: '火', body: '読み方：か、ひ\n意味：火、火曜日\n例文：火に気をつけてください。', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=900&auto=format&fit=crop' },
      { id: 's6', title: '水', body: '読み方：すい、みず\n意味：水、水曜日\n例文：水を飲みます。', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop' },
      { id: 's7', title: '木', body: '読み方：もく、き\n意味：木、木曜日\n例文：庭に大きい木があります。', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=900&auto=format&fit=crop' },
      { id: 's8', title: '書く練習', body: 'ノートにそれぞれ5回書きましょう。\n書き終わったら、ペアで確認します。', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=900&auto=format&fit=crop' },
      { id: 's9', title: '確認テスト', body: '読み方を書きましょう。\n1. 月曜日　2. 水　3. 火曜日　4. 木', image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=900&auto=format&fit=crop' },
    ],
  },
  {
    title: 'JLPT N5語彙：教室の言葉',
    category: 'vocabulary', categoryLabel: '語彙', level: 'N5',
    author: 'ミンアン先生', rating: 4.7, downloads: 1455,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=900&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=900&auto=format&fit=crop',
    description: '教室でよく使うN5語彙を画像、例文、発音練習、ペア活動で学ぶテンプレートです。',
    tags: ['N5', '語彙', '画像'],
    slidesData: [
      { id: 's1', title: 'JLPT N5語彙：教室の言葉', body: '今日の目標：教室にある物の名前を日本語で言えるようになりましょう。', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=900&auto=format&fit=crop' },
      { id: 's2', title: '新しい言葉', body: '本、ノート、鉛筆、消しゴム、机、椅子、時計、黒板', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=900&auto=format&fit=crop' },
      { id: 's3', title: 'これは何ですか', body: '教師：これは何ですか。\n学生：それは本です。\nペアで練習しましょう。', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=900&auto=format&fit=crop' },
      { id: 's4', title: '助詞「の」', body: '私の本、先生の机、友だちのノート\n「だれの物か」を言うときに使います。', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop' },
      { id: 's5', title: '例文', body: 'これは私の鉛筆です。\nあれは先生の時計です。\n机の上に本があります。', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=900&auto=format&fit=crop' },
      { id: 's6', title: '発音練習', body: '本・ノート・鉛筆・消しゴム\n教師の後に続いて読みましょう。', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop' },
      { id: 's7', title: 'ゲーム', body: '先生が言った物を早く指さしましょう。\n正しくできたら1点です。', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=900&auto=format&fit=crop' },
      { id: 's8', title: 'まとめ', body: '今日覚えた言葉を3つ選んで、短い文を作りましょう。', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=900&auto=format&fit=crop' },
    ],
  },
  {
    title: 'N4会話：旅行の計画',
    category: 'conversation', categoryLabel: '会話', level: 'N4',
    author: 'Tuệ先生', rating: 4.5, downloads: 740,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop',
    description: '旅行の予定を立てる会話、希望の伝え方、理由説明、ロールプレイを練習するテンプレートです。',
    tags: ['会話', 'N4', 'ロールプレイ'],
    slidesData: [
      { id: 's1', title: 'N4会話：旅行の計画', body: '今日の目標：友だちと旅行の予定を相談できるようになりましょう。', image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=900&auto=format&fit=crop' },
      { id: 's2', title: 'ウォームアップ', body: 'どこへ旅行したいですか。\nだれと行きたいですか。\n何をしたいですか。', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=900&auto=format&fit=crop' },
      { id: 's3', title: '表現1：〜たいです', body: '京都へ行きたいです。\nおいしい料理を食べたいです。\n写真をたくさん撮りたいです。', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=900&auto=format&fit=crop' },
      { id: 's4', title: '表現2：〜と思います', body: '土曜日がいいと思います。\n電車で行くのが便利だと思います。', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=900&auto=format&fit=crop' },
      { id: 's5', title: '会話例', body: 'A：週末、どこへ行きたいですか。\nB：海へ行きたいです。\nA：いいですね。何をしますか。', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop' },
      { id: 's6', title: '理由を言う', body: '〜からです。\n例：海が好きだからです。\n例：写真を撮りたいからです。', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=900&auto=format&fit=crop' },
      { id: 's7', title: 'ロールプレイ', body: '二人で旅行の計画を作りましょう。\n場所、交通手段、時間、したいことを決めます。', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop' },
      { id: 's8', title: '発表', body: 'ペアで作った旅行計画をクラスで発表しましょう。', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=900&auto=format&fit=crop' },
      { id: 's9', title: '振り返り', body: '今日使った表現を3つ書きましょう。次の会話で使ってみましょう。', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=900&auto=format&fit=crop' },
    ],
  },
];

const defaultMaterials = [
  { title: 'N5語彙画像セット', type: 'PDF', level: 'N5', ownerName: 'ミンアン先生', fileUrl: '/materials/n5_vocab_image_set.pdf', previewUrl: '/materials/n5_vocab_image_set.pdf', mimeType: 'application/pdf', fileName: 'n5_vocab_image_set.pdf' },
  { title: '日常会話ロールカード', type: 'PDF', level: 'N4', ownerName: 'Tuệ先生', fileUrl: '/materials/daily_conversation_role_cards.pdf', previewUrl: '/materials/daily_conversation_role_cards.pdf', mimeType: 'application/pdf', fileName: 'daily_conversation_role_cards.pdf' },
  { title: '漢字書き順ワークシート', type: 'PDF', level: '初級', ownerName: '山田先生', fileUrl: '/materials/kanji_stroke_order_worksheet.pdf', previewUrl: '/materials/kanji_stroke_order_worksheet.pdf', mimeType: 'application/pdf', fileName: 'kanji_stroke_order_worksheet.pdf' },
  { title: 'N3文法例文リスト', type: 'PDF', level: 'N3', ownerName: '佐々木先生', fileUrl: '/materials/n3_grammar_sentence_list.pdf', previewUrl: '/materials/n3_grammar_sentence_list.pdf', mimeType: 'application/pdf', fileName: 'n3_grammar_sentence_list.pdf' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`);

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Template.deleteMany({});
    await Material.deleteMany({});
    console.log('Cleared existing data');

    // Tạo user demo
    const user = new User({
      username: 'teacher',
      name: 'Tuệ',
      email: 'teacher@example.com',
      password_hash: 'password',
      role: 'teacher',
      level: 'N3/N4',
      language: '日本語',
      preferences: { theme: 'light', language: 'ja' },
    });
    await user.save();
    console.log(`Created demo user: ${user.email} (username: ${user.username}) / password`);

    // Create admin user
    const admin = new User({
      username: 'admin',
      name: 'Administrator',
      email: 'admin@example.com',
      password_hash: 'Admin12345!',
      role: 'admin',
      level: 'N/A',
      language: '日本語',
      preferences: { theme: 'light', language: 'ja' },
    });
    await admin.save();
    console.log(`Created admin user: ${admin.email} (username: ${admin.username}) / Admin12345!`);

    // Tạo templates
    await Template.insertMany(templates);
    console.log(`Inserted ${templates.length} templates`);

    // Tạo materials
    await Material.insertMany(defaultMaterials);
    console.log(`Inserted ${defaultMaterials.length} materials`);

    console.log('\nSeed completed successfully!');
    console.log('Demo login: teacher@example.com / password');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
