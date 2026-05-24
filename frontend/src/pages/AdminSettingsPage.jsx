import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { ADMIN_SETTINGS } from '../data/adminMockData.js';
import { apiGetMe, apiUpdateMe } from '../api.js';
import { Database, RefreshCw, Save, Trash2 } from 'lucide-react';
import { Bi } from '../i18n.jsx';

export function AdminSettingsPage({ nav, profile, setProfile }) {
  const [settings, setSettings] = useState(() => JSON.parse(sessionStorage.getItem('smartslide_admin_settings') || 'null') || ADMIN_SETTINGS);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    apiGetMe().then(res => {
      setSettings(prev => ({
        ...prev,
        adminEmail: res.user.email || prev.adminEmail,
        appName: prev.appName,
      }));
    }).catch(() => {});
  }, []);

  function update(path, value) {
    setSettings(prev => {
      const next = { ...prev, toggles: { ...prev.toggles } };
      if (path.startsWith('toggles.')) next.toggles[path.split('.')[1]] = value;
      else next[path] = value;
      return next;
    });
  }

  async function save() {
    sessionStorage.setItem('smartslide_admin_settings', JSON.stringify(settings));
    try {
      const res = await apiUpdateMe({ email: settings.adminEmail });
      setProfile?.(res.user);
      setNotice('設定を保存し、管理者メールをバックエンドへ更新しました。 / Đã lưu cài đặt và cập nhật email admin lên backend.');
    } catch (err) {
      setNotice(`${err.message} / Cài đặt hệ thống đã được lưu tạm trên FE.`);
    }
  }

  function clearCache() {
    sessionStorage.removeItem('smartslide_admin_template_overrides');
    sessionStorage.removeItem('smartslide_admin_deleted_templates');
    setNotice('システムキャッシュを削除しました。 / Đã xóa cache hệ thống.');
  }

  function backup() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'smartslide-admin-settings.json'; a.click(); URL.revokeObjectURL(url);
    setNotice('データベース設定をバックアップしました。 / Đã tải file backup cài đặt.');
  }

  return <AdminLayout nav={nav} active="admin_settings" profile={profile}>
    <section className="admin-page">
      <header className="admin-page-head">
        <h1><Bi jp="設定" vi="Cài đặt" profile={profile}/></h1>
        <p><Bi jp="システム設定と機能管理" vi="Quản lý cài đặt và chức năng hệ thống" profile={profile}/></p>
      </header>
      {notice && <div className="admin-notice">{notice}</div>}

      <div className="settings-grid">
        <section className="admin-card settings-card">
          <h2><Bi jp="一般設定" vi="Cài đặt chung" profile={profile}/></h2>
          <label><Bi jp="アプリ名" vi="Tên ứng dụng" profile={profile}/></label><input value={settings.appName} onChange={e=>update('appName', e.target.value)} />
          <label><Bi jp="サイトタイトル" vi="Tiêu đề website" profile={profile}/></label><input value={settings.siteTitle} onChange={e=>update('siteTitle', e.target.value)} />
          <label><Bi jp="管理者メール" vi="Email quản trị" profile={profile}/></label><input value={settings.adminEmail} onChange={e=>update('adminEmail', e.target.value)} />
        </section>

        <section className="admin-card settings-card quick-actions">
          <h2><Bi jp="クイックアクション" vi="Thao tác nhanh" profile={profile}/></h2>
          <button onClick={save}><Save size={16}/><Bi jp="設定を保存" vi="Lưu cài đặt" profile={profile}/></button>
          <button onClick={clearCache}><Trash2 size={16}/><Bi jp="キャッシュクリア" vi="Xóa cache" profile={profile}/></button>
          <button onClick={backup}><Database size={16}/><Bi jp="データベースダウンロード" vi="Tải backup dữ liệu" profile={profile}/></button>
          <button onClick={() => setNotice('同期が完了しました。 / Đã đồng bộ hệ thống.')}><RefreshCw size={16}/><Bi jp="同期リセット" vi="Đồng bộ lại" profile={profile}/></button>
        </section>

        <section className="admin-card settings-card">
          <h2><Bi jp="ユーザー設定" vi="Cài đặt người dùng" profile={profile}/></h2>
          <Toggle label="ユーザー登録を許可" vi="Cho phép đăng ký" checked={settings.toggles.userRegistration} onChange={v=>update('toggles.userRegistration', v)} profile={profile}/>
          <Toggle label="メール通知" vi="Thông báo email" checked={settings.toggles.emailNotification} onChange={v=>update('toggles.emailNotification', v)} profile={profile}/>
          <Toggle label="テンプレート自動承認" vi="Tự động duyệt template" checked={settings.toggles.templateAutoApprove} onChange={v=>update('toggles.templateAutoApprove', v)} profile={profile}/>
        </section>

        <section className="admin-card settings-card">
          <h2><Bi jp="アップロード設定" vi="Cài đặt upload" profile={profile}/></h2>
          <label><Bi jp="最大ファイルサイズ (MB)" vi="Dung lượng tối đa (MB)" profile={profile}/></label><input type="number" value={settings.maxFileSize} onChange={e=>update('maxFileSize', e.target.value)} />
          <label><Bi jp="許可ファイル形式" vi="Định dạng cho phép" profile={profile}/></label><input value={settings.allowedFormats} onChange={e=>update('allowedFormats', e.target.value)} />
        </section>

        <section className="admin-card settings-card system-info">
          <h2><Bi jp="システム情報" vi="Thông tin hệ thống" profile={profile}/></h2>
          <p><span>Version</span><b>{settings.version}</b></p>
          <p><span>Last update</span><b>{settings.lastUpdate}</b></p>
          <p><span>Status</span><b className="ok">{settings.systemStatus}</b></p>
        </section>
      </div>
    </section>
  </AdminLayout>;
}

function Toggle({ label, vi, checked, onChange, profile }) {
  return <div className="setting-toggle"><span><Bi jp={label} vi={vi} profile={profile}/></span><button className={checked ? 'toggle-switch on' : 'toggle-switch'} onClick={() => onChange(!checked)} type="button"><i/></button></div>;
}
