import React, { useRef, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { apiUpdateMe, saveUser, apiLogout } from '../api.js';
import { Camera, KeyRound, Save, LogOut } from 'lucide-react';
import { Bi, biText, resolveLanguage } from '../i18n.jsx';

export function SettingsPage({ nav, profile, setProfile }) {
  const avatarInputRef = useRef(null);
  const [form, setForm] = useState(() => ({
    name: profile?.name || '',
    email: profile?.email || '',
    title: profile?.title || '日本語教師',
    level: profile?.level || 'N3/N4',
    language: resolveLanguage(profile?.language),
    avatarUrl: profile?.avatarUrl || '',
  }));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState('');

  function update(field, value) {
    setForm(p => ({ ...p, [field]: value }));
  }

  function updatePassword(field, value) {
    setPasswordForm(p => ({ ...p, [field]: value }));
  }

  function changeAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setNotice(biText(profile, 'JPG、PNG、GIF形式の画像を選択してください。', 'Vui lòng chọn ảnh JPG, PNG hoặc GIF.'));
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice(biText(profile, '画像サイズは5MB未満にしてください。', 'Dung lượng ảnh phải dưới 5MB.'));
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      update('avatarUrl', reader.result);
      setNotice('');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  async function saveProfile() {
    setLoading(true);
    setNotice('');
    try {
      const res = await apiUpdateMe({
        name: form.name,
        email: form.email,
        level: form.level,
        language: form.language,
        title: form.title,
        avatarUrl: form.avatarUrl,
      });
      const updatedUser = res.user;
      saveUser(updatedUser);
      setProfile(updatedUser);
      window.dispatchEvent(new CustomEvent('smartslide-language-change', { detail: updatedUser }));
      setNotice(biText(profile, 'プロフィールを保存しました。', 'Đã lưu thông tin hồ sơ.'));
    } catch (err) {
      setNotice(err.message);
    } finally {
      setLoading(false);
    }
  }

  function savePassword() {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordNotice(biText(profile, 'すべてのパスワード項目を入力してください。', 'Vui lòng nhập đầy đủ các trường mật khẩu.'));
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordNotice(biText(profile, '新しいパスワードは8文字以上で入力してください。', 'Mật khẩu mới cần có ít nhất 8 ký tự.'));
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordNotice(biText(profile, '新しいパスワードが一致しません。', 'Mật khẩu mới không khớp.'));
      return;
    }

    localStorage.setItem('smartslide_password_updated_at', new Date().toISOString());
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordNotice(biText(profile, 'パスワードを更新しました。', 'Đã cập nhật mật khẩu.'));
  }

  async function handleLogout() {
    if (window.confirm(biText(profile, 'ログアウトしますか？', 'Bạn có chắc chắn muốn đăng xuất không?'))) {
      await apiLogout();
      nav('login');
    }
  }

  return <AppLayout nav={nav} active="settings" profile={profile} setProfile={setProfile}>
    <section className="page-head account-page-head">
      <h1><Bi jp="アカウント設定" vi="Cài đặt tài khoản" profile={profile}/></h1>
      <p><Bi jp="プロフィール情報とセキュリティを管理します。" vi="Quản lý thông tin hồ sơ và bảo mật." profile={profile}/></p>
    </section>

    <div className="account-settings">
      <section className="account-panel">
        <h2><Bi jp="プロフィール情報" vi="Thông tin hồ sơ" profile={profile}/></h2>
        {notice && <div className="notice compact-notice">{notice}</div>}

        <div className="account-avatar-row">
          <div className="account-avatar-preview">
            {form.avatarUrl ? <img src={form.avatarUrl} alt="" /> : <span>{(form.name || 'S').slice(0, 1).toUpperCase()}</span>}
            <button
              type="button"
              className="avatar-camera"
              onClick={() => avatarInputRef.current?.click()}
              aria-label={biText(profile, '画像を変更', 'Đổi ảnh')}
              title={biText(profile, '画像を変更', 'Đổi ảnh')}
            >
              <Camera size={13}/>
            </button>
          </div>
          <div className="avatar-upload-copy">
            <input ref={avatarInputRef} className="hidden-file" type="file" accept="image/jpeg,image/png,image/gif" onChange={changeAvatar} />
            <button type="button" className="outline avatar-change-btn" onClick={() => avatarInputRef.current?.click()}>
              <Bi jp="画像を変更" vi="Đổi ảnh" profile={profile}/>
            </button>
            <p><Bi jp="JPG、GIF、またはPNG。最大5MB。" vi="JPG, GIF hoặc PNG. Tối đa 5MB." profile={profile}/></p>
          </div>
        </div>

        <div className="account-divider" />

        <div className="account-form-grid">
          <label>
            <span><Bi jp="フルネーム" vi="Họ và tên" profile={profile}/></span>
            <input value={form.name} onChange={e => update('name', e.target.value)} />
          </label>
          <label>
            <span><Bi jp="メールアドレス" vi="Địa chỉ email" profile={profile}/></span>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} />
          </label>
          <label>
            <span><Bi jp="役職/タイトル" vi="Vai trò / Chức danh" profile={profile}/></span>
            <input value={form.title} onChange={e => update('title', e.target.value)} />
          </label>
          <label>
            <span><Bi jp="主な授業レベル" vi="Cấp độ giảng dạy chính" profile={profile}/></span>
            <input value={form.level} onChange={e => update('level', e.target.value)} />
          </label>
          <label>
            <span><Bi jp="表示言語" vi="Ngôn ngữ hiển thị" profile={profile}/></span>
            <select value={form.language} onChange={e => update('language', e.target.value)}>
              <option>日本語</option>
              <option>Tiếng Việt</option>
            </select>
          </label>
        </div>

        <div className="account-actions">
          <button className="pink" type="button" onClick={saveProfile} disabled={loading}>
            <Save size={15}/>
            {loading ? <Bi jp="保存中..." vi="Đang lưu..." profile={profile}/> : <Bi jp="変更を保存" vi="Lưu thay đổi" profile={profile}/>}
          </button>
        </div>
      </section>

      <section className="account-panel">
        <h2><Bi jp="パスワードを変更" vi="Đổi mật khẩu" profile={profile}/></h2>
        {passwordNotice && <div className="notice compact-notice">{passwordNotice}</div>}
        <div className="account-form-grid password-grid">
          <label>
            <span><Bi jp="現在のパスワード" vi="Mật khẩu hiện tại" profile={profile}/></span>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={e => updatePassword('currentPassword', e.target.value)}
              placeholder={biText(profile, '現在のパスワードを入力してください', 'Nhập mật khẩu hiện tại')}
            />
          </label>
          <label>
            <span><Bi jp="新しいパスワード" vi="Mật khẩu mới" profile={profile}/></span>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={e => updatePassword('newPassword', e.target.value)}
              placeholder={biText(profile, '新しいパスワードを入力してください', 'Nhập mật khẩu mới')}
            />
          </label>
          <label>
            <span><Bi jp="新しいパスワードを確認" vi="Xác nhận mật khẩu mới" profile={profile}/></span>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={e => updatePassword('confirmPassword', e.target.value)}
              placeholder={biText(profile, '新しいパスワードを確認してください', 'Nhập lại mật khẩu mới')}
            />
          </label>
        </div>
        <div className="account-actions">
          <button className="outline password-update-btn" type="button" onClick={savePassword}><KeyRound size={15}/><Bi jp="パスワードを更新" vi="Cập nhật mật khẩu" profile={profile}/></button>
        </div>
      </section>

      <section className="account-panel" style={{ border: '1px solid #fee2e2', background: '#fffbeb' }}>
        <h2 style={{ color: '#b91c1c' }}><Bi jp="ログアウト" vi="Đăng xuất tài khoản" profile={profile}/></h2>
        <p style={{ color: '#7f1d1d', fontSize: '13px', margin: '4px 0 16px' }}>
          <Bi jp="現在のデバイスから安全にログアウトします。" vi="Đăng xuất an toàn khỏi tài khoản của bạn trên thiết bị này." profile={profile}/>
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              height: '36px',
              padding: '0 16px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              border: '1px solid #dc2626',
              background: '#fff',
              color: '#dc2626',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
          >
            <LogOut size={15}/>
            <Bi jp="ログアウト" vi="Đăng xuất" profile={profile}/>
          </button>
        </div>
      </section>
    </div>
  </AppLayout>
}
