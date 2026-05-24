import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Sparkles, Wand2 } from 'lucide-react';
import { apiLogin, saveUser } from '../api.js';
import { Bi, biText } from '../i18n.jsx';
import { LanguageToggleButton } from '../components/LanguageToggleButton.jsx';

export function LoginPage({ nav, profile, setProfile }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Lấy thông tin tài khoản vừa đăng ký để tự động điền
  const regEmail = sessionStorage.getItem('reg_email') || '';
  const regPassword = sessionStorage.getItem('reg_password') || '';
  if (regEmail) {
    sessionStorage.removeItem('reg_email');
    sessionStorage.removeItem('reg_password');
  }

  const defaultEmail = regEmail || 'teacher@example.com';
  const defaultPassword = regPassword || 'password';

  async function submit(e){
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    if (!email || !password) return setError(biText(profile, 'メールアドレスとパスワードを入力してください。', 'Vui lòng nhập địa chỉ email và mật khẩu.'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(biText(profile, 'メールアドレスの形式が正しくありません。', 'Định dạng địa chỉ email không đúng.'));

    setLoading(true);
    setError('');
    try {
      const res = await apiLogin(email, password);
      setProfile(res.user);
      nav('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="auth-page">
    <div className="auth-language-switch-wrap">
      <LanguageToggleButton profile={profile} setProfile={setProfile} className="auth-language-switch" />
    </div>
    <section className="hero rich-hero">
      <div className="hero-glow one" />
      <div className="hero-glow two" />
      <div className="hero-content">
        <div className="auth-mark">
          <h1 className="auth-brand-title">SmartSlide JP</h1>
          <span className="auth-brand-underline" />
        </div>
        <p className="auth-page-kicker"><Bi jp="ログイン" vi="Đăng nhập" profile={profile}/></p>
        <h2><Bi jp="おかえりなさい" vi="Chào mừng quay lại" profile={profile}/></h2>
        <p><Bi jp="メールアドレスとパスワードでログインしてください。外部アカウントでもログインできます。" vi="Đăng nhập bằng địa chỉ email và mật khẩu. Bạn cũng có thể dùng tài khoản liên kết." profile={profile}/></p>
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
      <h2><Bi jp="ログイン" vi="Đăng nhập" profile={profile}/></h2>
      <label><Bi jp="メールアドレス" vi="Địa chỉ email" profile={profile}/></label>
      <input name="email" type="email" placeholder="teacher@example.com" defaultValue={defaultEmail} />
      <label><Bi jp="パスワード" vi="Mật khẩu" profile={profile}/></label>
      <input name="password" type="password" placeholder="••••••••" defaultValue={defaultPassword} />
      {error && <p className="error">{error}</p>}
      <div className="login-forgot-row">
        <button type="button" className="forgot-link" onClick={() => nav('forgot')}><Bi jp="パスワードを忘れた場合" vi="Quên mật khẩu" profile={profile}/></button>
      </div>
      <button className="pink full auth-submit" disabled={loading}>{loading ? 'ログイン中...' : <Bi jp="ログイン" vi="Đăng nhập" profile={profile}/>}</button>
      <div className="signup-link-center login-signup-center">
        <span><Bi jp="アカウントをお持ちでない場合" vi="Bạn chưa có tài khoản?" profile={profile}/></span>
        <button type="button" className="link auth-signup-link" onClick={() => nav('register')}><Bi jp="サインアップ" vi="Đăng ký" profile={profile}/></button>
      </div>
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
    </form>
  </div>
}
