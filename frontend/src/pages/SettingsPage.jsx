import React, { useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { apiUpdateMe, saveUser } from '../api.js';
import { Save } from 'lucide-react';

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
      setNotice('設定を保存しました。ダッシュボードの名前も更新されます。');
    } catch (err) {
      setNotice(err.message);
    } finally {
      setLoading(false);
    }
  }

  return <AppLayout nav={nav} active="settings" profile={form}>
    <section className="page-head"><h1>設定</h1><p>プロフィールと授業作成の基本情報を設定できます。</p></section>
    <section className="settings-card">
      {notice && <div className="notice compact-notice">{notice}</div>}
      <label>名前</label><input value={form.name} onChange={e=>update('name', e.target.value)} />
      <label>メール</label><input type="email" value={form.email} onChange={e=>update('email', e.target.value)} />
      <label>主な授業レベル</label><input value={form.level} onChange={e=>update('level', e.target.value)} />
      <label>表示言語</label><select value={form.language} onChange={e=>update('language', e.target.value)}><option>日本語</option></select>
      <button className="pink" onClick={save} disabled={loading}><Save size={16}/>{loading ? '保存中...' : '保存する'}</button>
    </section>
  </AppLayout>
}
