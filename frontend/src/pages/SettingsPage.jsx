import React, { useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { apiUpdateMe, saveUser } from '../api.js';
import { Save } from 'lucide-react';
import { Bi, biText } from '../i18n.jsx';

export function SettingsPage({ nav, profile, setProfile }) {
  const [form, setForm] = useState(profile);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value){ setForm(p => ({...p, [field]: value})); }
  async function save(){
    setLoading(true);
    setNotice('');
    try {
      const res = await apiUpdateMe({
        name: form.name,
        email: form.email,
        level: form.level,
        language: form.language,
      });
      const updatedUser = res.user;
      saveUser(updatedUser);
      setProfile(updatedUser);
      setNotice(form.language === '日本語 + Tiếng Việt' ? '設定を保存しました。\nĐã lưu cài đặt. Tên trên Dashboard cũng được cập nhật.' : '設定を保存しました。ダッシュボードの名前も更新されます。');
    } catch (err) {
      setNotice(err.message);
    } finally {
      setLoading(false);
    }
  }

  return <AppLayout nav={nav} active="settings" profile={form}>
    <section className="page-head"><h1><Bi jp="設定" vi="Cài đặt" profile={form}/></h1><p><Bi jp="プロフィールと授業作成の基本情報を設定できます。" vi="Bạn có thể thiết lập hồ sơ và thông tin cơ bản khi tạo bài giảng." profile={form}/></p></section>
    <section className="settings-card">
      {notice && <div className="notice compact-notice">{notice}</div>}
      <label><Bi jp="名前" vi="Tên" profile={form}/></label><input value={form.name} onChange={e=>update('name', e.target.value)} />
      <label><Bi jp="メール" vi="Email" profile={form}/></label><input type="email" value={form.email} onChange={e=>update('email', e.target.value)} />
      <label><Bi jp="主な授業レベル" vi="Cấp độ giảng dạy chính" profile={form}/></label><input value={form.level} onChange={e=>update('level', e.target.value)} />
      <label><Bi jp="表示言語" vi="Ngôn ngữ hiển thị" profile={form}/></label><select value={form.language} onChange={e=>update('language', e.target.value)}><option>日本語</option><option>日本語 + Tiếng Việt</option></select>
      <button className="pink" onClick={save} disabled={loading}><Save size={16}/>{loading ? '保存中...' : <Bi jp="保存する" vi="Lưu" profile={form}/>}</button>
    </section>
  </AppLayout>
}
