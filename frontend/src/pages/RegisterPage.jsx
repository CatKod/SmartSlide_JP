import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Sparkles, Wand2 } from 'lucide-react';
import { apiRegister } from '../api.js';

export function RegisterPage({ nav }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    const confirmPassword = String(data.get('confirmPassword') || '');
    if(!name || !email || !password || !confirmPassword) return setMessage('必須項目を入力してください。');
    if(password !== confirmPassword) return setMessage('パスワードが一致しません。');

    setLoading(true);
    setMessage('');
    try {
      const username = email.split('@')[0];
      await apiRegister({ username, name, email, password });
      alert('登録しました。ログインしてください。');
      nav('login');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="auth-page">
    <section className="hero rich-hero">
      <div className="hero-glow one" />
      <div className="hero-glow two" />
      <div className="hero-content">
        <div className="hero-badge"><Sparkles size={16}/> SmartSlide JP</div>
        <h1>教材作成をもっと速く、もっと楽しく</h1>
        <p>テンプレート、共有教材、保存済みスライドを活用して授業準備の時間を短縮できます。</p>
        <div className="hero-image-mosaic">
          <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=700&auto=format&fit=crop" alt="教材イメージ" />
          <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=700&auto=format&fit=crop" alt="授業イメージ" />
          <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=700&auto=format&fit=crop" alt="学習イメージ" />
        </div>
        <div className="hero-preview-card">
          <div className="mini-slide pink-mini"><BookOpen size={22}/><b>テンプレート</b><span>すぐ使える教材</span></div>
          <div className="mini-slide blue-mini"><Wand2 size={22}/><b>編集</b><span>本文・画像を変更</span></div>
          <div className="mini-slide green-mini"><CheckCircle2 size={22}/><b>保存</b><span>マイスライドへ追加</span></div>
        </div>
      </div>
    </section>
    <form className="auth-card" onSubmit={submit}>
      <h2>新規アカウント作成</h2><label>名前</label><input name="name" placeholder="Tuệ先生" />
      <label>メール</label><input name="email" type="email" placeholder="teacher@example.com" />
      <label>パスワード</label><input name="password" type="password" placeholder="8文字以上" />
      <label>パスワード確認</label><input name="confirmPassword" type="password" placeholder="もう一度入力してください" />
      {message && <p className="error">{message}</p>}
      <button className="pink full auth-submit" disabled={loading}>{loading ? '登録中...' : '登録する'}</button><button type="button" className="link" onClick={() => nav('login')}>ログイン画面へ</button>
    </form>
  </div>
}
