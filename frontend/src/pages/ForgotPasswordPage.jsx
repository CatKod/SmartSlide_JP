import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Sparkles, Wand2 } from 'lucide-react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage({ nav }) {
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState('');

  function submit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '').trim();
    const users = JSON.parse(localStorage.getItem('smartslide_users') || '[]');
    const knownEmails = ['teacher@example.com', ...users.map(user => user.email)].map(v => String(v).toLowerCase());
    if (!EMAIL_PATTERN.test(email) || !knownEmails.includes(email.toLowerCase())) {
      setKind('error');
      setMessage('メールアドレスが存在しない、または形式が正しくありません。');
      return;
    }
    setKind('success');
    setMessage('パスワード再設定用のメールを送信しました。メールをご確認ください。');
  }

  return <div className="auth-page">
    <section className="hero rich-hero">
      <div className="hero-glow one" />
      <div className="hero-glow two" />
      <div className="hero-content">
        <div className="hero-badge"><Sparkles size={16}/> SmartSlide JP</div>
        <h1>アカウントを安全に復旧</h1>
        <p>登録済みメールアドレスを入力すると、パスワード再設定の案内を送信します。</p>
        <div className="hero-image-mosaic">
          <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=700&auto=format&fit=crop" alt="教材イメージ" />
          <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=700&auto=format&fit=crop" alt="授業イメージ" />
          <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=700&auto=format&fit=crop" alt="学習イメージ" />
        </div>
        <div className="hero-preview-card">
          <div className="mini-slide pink-mini"><BookOpen size={22}/><b>ログイン支援</b><span>メールで確認</span></div>
          <div className="mini-slide blue-mini"><Wand2 size={22}/><b>安全</b><span>登録済みメールのみ</span></div>
          <div className="mini-slide green-mini"><CheckCircle2 size={22}/><b>再開</b><span>すぐ授業準備へ</span></div>
        </div>
      </div>
    </section>
    <form className="auth-card" onSubmit={submit}>
      <h2>パスワード再設定</h2>
      <label>登録済みメール</label><input name="email" type="email" placeholder="teacher@example.com" />
      {message && <p className={kind === 'success' ? 'success-message' : 'error'}>{message}</p>}
      <button className="pink full auth-submit">再設定メールを送信</button>
      <button type="button" className="link" onClick={() => nav('login')}>ログイン画面へ</button>
    </form>
  </div>;
}
