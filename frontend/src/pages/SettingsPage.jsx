import React, { useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { Save } from 'lucide-react';
import { Bi } from '../i18n.jsx';

export function SettingsPage({ nav, profile, setProfile }) {
  const [form, setForm] = useState(profile);
  const [notice, setNotice] = useState('');
  function update(field, value){ setForm(p => ({...p, [field]: value})); }
  function save(){
    const next = { ...profile, ...form, language: profile.language || '日本語' };
    localStorage.setItem('smartslide_profile', JSON.stringify(next));
    setProfile(next);
    setNotice(profile.language === '日本語 + Tiếng Việt' ? '設定を保存しました。\nĐã lưu cài đặt. Tên trên Dashboard cũng được cập nhật.' : '設定を保存しました。ダッシュボードの名前も更新されます。');
  }
  return <AppLayout nav={nav} active="settings" profile={profile} setProfile={setProfile}>
    <section className="page-head"><h1><Bi jp="設定" vi="Cài đặt" profile={profile}/></h1><p><Bi jp="プロフィールと授業作成の基本情報を設定できます。" vi="Bạn có thể thiết lập hồ sơ và thông tin cơ bản khi tạo bài giảng." profile={profile}/></p></section>
    <section className="settings-card">
      {notice && <div className="notice compact-notice">{notice}</div>}
      <label><Bi jp="名前" vi="Tên" profile={profile}/></label><input value={form.name} onChange={e=>update('name', e.target.value)} />
      <label><Bi jp="メール" vi="Email" profile={profile}/></label><input type="email" value={form.email} onChange={e=>update('email', e.target.value)} />
      <label><Bi jp="主な授業レベル" vi="Cấp độ giảng dạy chính" profile={profile}/></label><input value={form.level} onChange={e=>update('level', e.target.value)} />
      <p className="settings-language-note"><Bi jp="表示言語は画面上部の言語切替で変更できます。" vi="Ngôn ngữ hiển thị được đổi ở thanh trên cùng." profile={profile}/></p>
      <button className="pink" onClick={save}><Save size={16}/><Bi jp="保存する" vi="Lưu" profile={profile}/></button>
    </section>
  </AppLayout>
}
