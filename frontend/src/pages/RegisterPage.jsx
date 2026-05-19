import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Sparkles, Wand2 } from 'lucide-react';
import { apiRegister } from '../api.js';
import { Bi, biText } from '../i18n.jsx';

export function RegisterPage({ nav, profile }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function submit(e){
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    const confirmPassword = String(data.get('confirmPassword') || '');

    if (!name) return setMessage(biText(profile, '氏名を入力してください。', 'Vui lòng nhập họ và tên.'));
    if (!email) return setMessage(biText(profile, 'メールアドレスを入力してください。', 'Vui lòng nhập địa chỉ email.'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMessage(biText(profile, 'メールアドレスの形式が正しくありません。', 'Định dạng địa chỉ email không đúng.'));
    if (password.length < 8) return setMessage(biText(profile, 'パスワードは8文字以上で設定してください。', 'Mật khẩu cần có ít nhất 8 ký tự.'));
    if (password !== confirmPassword) return setMessage(biText(profile, 'パスワードが一致しません。', 'Mật khẩu không khớp.'));
    if (!agreed) return setMessage(biText(profile, '利用規約とプライバシーポリシーに同意してください。', 'Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật.'));

    setLoading(true);
    setMessage('');
    try {
      const username = email.split('@')[0];
      await apiRegister({ username, name, email, password });
      sessionStorage.setItem('reg_email', email);
      sessionStorage.setItem('reg_password', password);
      alert(biText(profile, '登録しました。ログインしてください。', 'Đã đăng ký. Vui lòng đăng nhập.'));
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
        <div className="auth-mark">
          <h1 className="auth-brand-title">SmartSlide JP</h1>
          <span className="auth-brand-underline" />
        </div>
        <div className="hero-badge"><Sparkles size={16}/> <Bi jp="日本語授業サポート" vi="Hỗ trợ lớp tiếng Nhật" profile={profile}/></div>
        <h2><Bi jp="ベトナム của 日本語教師を支援" vi="Hỗ trợ giáo viên tiếng Nhật tại Việt Nam" profile={profile}/></h2>
        <p><Bi jp="テンプレートから教材スライドをすばやく作成できます。授業準備、共有教材、マイスライドを一つの画面で管理しましょう。" vi="Tạo bài trình chiếu giảng dạy nhanh từ mẫu có sẵn. Quản lý chuẩn bị bài, tài liệu chung và bài của bạn trong một màn hình." profile={profile}/></p>
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
      <h2><Bi jp="アカウント作成" vi="Tạo tài khoản" profile={profile}/></h2>
      <p className="register-subtitle"><Bi jp="アカウントを作成して、教材スライドの管理を始めましょう。" vi="Tạo tài khoản để bắt đầu quản lý bài trình chiếu giảng dạy." profile={profile}/></p>

      <label><Bi jp="フルネーム" vi="Họ và tên" profile={profile}/></label>
      <input name="name" placeholder="田中先生" />

      <label><Bi jp="メールアドレス" vi="Địa chỉ email" profile={profile}/></label>
      <input name="email" type="email" placeholder="teacher@example.com" />

      <label><Bi jp="パスワード" vi="Mật khẩu" profile={profile}/></label>
      <input name="password" type="password" placeholder="••••••••" />
      <small className="password-hint"><Bi jp="8文字以上で入力してください" vi="Vui lòng nhập ít nhất 8 ký tự" profile={profile}/></small>

      <label><Bi jp="パスワード確認" vi="Xác nhận mật khẩu" profile={profile}/></label>
      <input name="confirmPassword" type="password" placeholder="••••••••" />

      <div className="checkbox-agree">
        <input
          type="checkbox"
          id="agree"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <label htmlFor="agree">
          <Bi jp="同意します" vi="Tôi đồng ý với" profile={profile}/><span className="agree-links"><button type="button" className="text-link"><Bi jp="利用規約" vi="Điều khoản sử dụng" profile={profile}/></button><Bi jp="と" vi="và" profile={profile}/><button type="button" className="text-link"><Bi jp="プライバシーポリシー" vi="Chính sách bảo mật" profile={profile}/></button></span>
        </label>
      </div>

      {message && <p className="error">{message}</p>}
      <button className="pink full auth-submit" disabled={loading}>{loading ? '登録中...' : <Bi jp="アカウント作成" vi="Tạo tài khoản" profile={profile}/>}</button>

      <div className="social-login">
        <button type="button" className="social-btn google-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <g>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </g>
          </svg>
          <Bi jp="Google" vi="Google" profile={profile}/>
        </button>
        <button type="button" className="social-btn facebook-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <Bi jp="Facebook" vi="Facebook" profile={profile}/>
        </button>
      </div>

      <div className="signup-link-center">
        <span><Bi jp="すでにアカウントをお持ちですか？" vi="Bạn đã có tài khoản?" profile={profile}/></span>
        <button type="button" className="link" onClick={() => nav('login')}><Bi jp="ログイン" vi="Đăng nhập" profile={profile}/></button>
      </div>
    </form>
  </div>
}
