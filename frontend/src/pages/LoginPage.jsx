import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Sparkles, Wand2 } from 'lucide-react';

export function LoginPage({ nav }) {
  const [error, setError] = useState('');
  function submit(e){
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if(!data.get('email') || !data.get('password')) return setError('メールアドレスまたはパスワードを入力してください。');
    nav('dashboard');
  }
  return <div className="auth-page">
    <section className="hero rich-hero">
      <div className="hero-glow one" />
      <div className="hero-glow two" />
      <div className="hero-content">
        <div className="hero-badge"><Sparkles size={16}/> 日本語授業サポート</div>
        <h1>ベトナムの日本語教師を支援</h1>
        <p>テンプレートから教材スライドをすばやく作成できます。授業準備、共有教材、マイスライドを一つの画面で管理しましょう。</p>
        <div className="hero-image-mosaic">
          <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=700&auto=format&fit=crop" alt="教材イメージ" />
          <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=700&auto=format&fit=crop" alt="授業イメージ" />
          <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=700&auto=format&fit=crop" alt="学習イメージ" />
        </div>
        <div className="hero-preview-card">
          <div className="mini-slide pink-mini"><BookOpen size={22}/><b>N3 文法</b><span>例文・練習問題</span></div>
          <div className="mini-slide blue-mini"><Wand2 size={22}/><b>AI補助</b><span>教材作成を効率化</span></div>
          <div className="mini-slide green-mini"><CheckCircle2 size={22}/><b>共有</b><span>チームで再利用</span></div>
        </div>
      </div>
    </section>
    <form className="auth-card" onSubmit={submit}>
      <h2>おかえりなさい！</h2><label>メール</label><input name="email" type="email" placeholder="teacher@example.com" defaultValue="teacher@example.com" />
      <label>パスワード</label><input name="password" type="password" placeholder="パスワード" defaultValue="12345678" />
      {error && <p className="error">{error}</p>}
      <button className="pink full">ログイン</button><button type="button" className="link" onClick={() => nav('register')}>新規アカウント作成</button>
    </form>
  </div>
}
