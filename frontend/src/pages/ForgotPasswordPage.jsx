import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Sparkles, Wand2 } from 'lucide-react';
import { Bi, biText } from '../i18n.jsx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage({ nav, profile }) {
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
      setMessage(biText(profile, 'メールアドレスが存在しない、または形式が正しくありません。', 'Địa chỉ email không tồn tại hoặc định dạng không đúng.'));
      return;
    }
    setKind('success');
    setMessage(biText(profile, 'パスワード再設定用のメールを送信しました。メールをご確認ください。', 'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.'));
  }

  return <div className="auth-page">
    <section className="hero rich-hero">
      <div className="hero-glow one" />
      <div className="hero-glow two" />
      <div className="hero-content">
        <div className="hero-badge"><Sparkles size={16}/> SmartSlide JP</div>
        <h1><Bi jp="アカウントを安全に復旧" vi="Khôi phục tài khoản an toàn" profile={profile}/></h1>
        <p><Bi jp="登録済みメールアドレスを入力すると、パスワード再設定の案内を送信します。" vi="Nhập địa chỉ email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu." profile={profile}/></p>
        <div className="hero-image-mosaic">
          <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=700&auto=format&fit=crop" alt="教材イメージ" />
          <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=700&auto=format&fit=crop" alt="授業イメージ" />
          <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=700&auto=format&fit=crop" alt="学習イメージ" />
        </div>
        <div className="hero-preview-card">
          <div className="mini-slide pink-mini"><BookOpen size={22}/><b><Bi jp="ログイン支援" vi="Hỗ trợ đăng nhập" profile={profile}/></b><span><Bi jp="メールで確認" vi="Xác nhận qua email" profile={profile}/></span></div>
          <div className="mini-slide blue-mini"><Wand2 size={22}/><b><Bi jp="安全" vi="An toàn" profile={profile}/></b><span><Bi jp="登録済みメールのみ" vi="Chỉ dùng email đã đăng ký" profile={profile}/></span></div>
          <div className="mini-slide green-mini"><CheckCircle2 size={22}/><b><Bi jp="再開" vi="Tiếp tục" profile={profile}/></b><span><Bi jp="すぐ授業準備へ" vi="Quay lại chuẩn bị bài" profile={profile}/></span></div>
        </div>
      </div>
    </section>
    <form className="auth-card" onSubmit={submit}>
      <h2><Bi jp="パスワード再設定" vi="Đặt lại mật khẩu" profile={profile}/></h2>
      <label><Bi jp="登録済みメール" vi="Email đã đăng ký" profile={profile}/></label><input name="email" type="email" placeholder="teacher@example.com" />
      {message && <p className={kind === 'success' ? 'success-message' : 'error'}>{message}</p>}
      <button className="pink full auth-submit"><Bi jp="再設定メールを送信" vi="Gửi email đặt lại" profile={profile}/></button>
      <button type="button" className="link" onClick={() => nav('login')}><Bi jp="ログイン画面へ" vi="Về màn hình đăng nhập" profile={profile}/></button>
    </form>
  </div>;
}
