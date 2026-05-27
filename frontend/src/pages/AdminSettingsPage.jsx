import React, { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { ADMIN_SETTINGS } from '../data/adminMockData.js';
import { apiGetMe, apiUpdateMe, apiLogout } from '../api.js';
import { Bell, Database, Download, LogOut, RefreshCw, Save, ShieldCheck, SlidersHorizontal, Trash2, UploadCloud, UserPlus } from 'lucide-react';
import { Bi } from '../i18n.jsx';

function getInitialSettings() {
  try {
    const saved = JSON.parse(sessionStorage.getItem('smartslide_admin_settings') || 'null');
    if (saved) return { ...ADMIN_SETTINGS, ...saved, toggles: { ...ADMIN_SETTINGS.toggles, ...(saved.toggles || {}) } };
  } catch {}
  return { ...ADMIN_SETTINGS, toggles: { ...ADMIN_SETTINGS.toggles } };
}

export function AdminSettingsPage({ nav, profile, setProfile }) {
  const [settings, setSettings] = useState(getInitialSettings);
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

  const enabledToggleCount = useMemo(() => {
    return Object.values(settings.toggles || {}).filter(Boolean).length;
  }, [settings.toggles]);

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
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartslide-admin-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    setNotice('データベース設定をバックアップしました。 / Đã tải file backup cài đặt.');
  }

  async function logout() {
    try { await apiLogout(); } catch {}
    setProfile?.(null);
    nav('login');
  }

  return <AdminLayout nav={nav} active="admin_settings" profile={profile} setProfile={setProfile}>
    <section className="admin-page system-settings-page">
      <header className="admin-page-head split system-settings-head">
        <div>
          <h1><Bi jp="システム設定" vi="Cài đặt hệ thống" profile={profile}/></h1>
          <p><Bi jp="アプリ情報、ユーザー権限、アップロード制限、保守操作を一か所で管理します。" vi="Quản lý thông tin ứng dụng, quyền người dùng, giới hạn upload và thao tác bảo trì tại một nơi." profile={profile}/></p>
        </div>
        <button className="admin-primary" onClick={save}><Save size={16}/><Bi jp="保存" vi="Lưu thay đổi" profile={profile}/></button>
      </header>

      {notice && <div className="admin-notice">{notice}</div>}

      <div className="system-settings-summary">
        <article>
          <ShieldCheck size={18}/>
          <span><Bi jp="稼働状態" vi="Trạng thái" profile={profile}/></span>
          <b>{settings.systemStatus}</b>
        </article>
        <article>
          <SlidersHorizontal size={18}/>
          <span><Bi jp="機能ON" vi="Tính năng bật" profile={profile}/></span>
          <b>{enabledToggleCount}/3</b>
        </article>
        <article>
          <UploadCloud size={18}/>
          <span><Bi jp="最大アップロード" vi="Upload tối đa" profile={profile}/></span>
          <b>{settings.maxFileSize} MB</b>
        </article>
        <article>
          <Database size={18}/>
          <span>Version</span>
          <b>{settings.version}</b>
        </article>
      </div>

      <div className="system-settings-grid">
        <section className="admin-card system-settings-panel general-panel">
          <div className="settings-panel-title">
            <SlidersHorizontal size={18}/>
            <div>
              <h2><Bi jp="一般設定" vi="Cài đặt chung" profile={profile}/></h2>
              <p><Bi jp="管理画面とサイト表示に使う基本情報です。" vi="Thông tin nền tảng dùng cho giao diện quản trị và website." profile={profile}/></p>
            </div>
          </div>

          <div className="settings-field-grid">
            <label>
              <span><Bi jp="アプリ名" vi="Tên ứng dụng" profile={profile}/></span>
              <input value={settings.appName} onChange={e=>update('appName', e.target.value)} />
            </label>
            <label>
              <span><Bi jp="サイトタイトル" vi="Tiêu đề website" profile={profile}/></span>
              <input value={settings.siteTitle} onChange={e=>update('siteTitle', e.target.value)} />
            </label>
            <label className="wide">
              <span><Bi jp="管理者メール" vi="Email quản trị" profile={profile}/></span>
              <input type="email" value={settings.adminEmail} onChange={e=>update('adminEmail', e.target.value)} />
            </label>
          </div>
        </section>

        <section className="admin-card system-settings-panel quick-panel">
          <div className="settings-panel-title">
            <RefreshCw size={18}/>
            <div>
              <h2><Bi jp="クイックアクション" vi="Thao tác nhanh" profile={profile}/></h2>
              <p><Bi jp="保守・同期・バックアップ操作。" vi="Các thao tác bảo trì, đồng bộ và sao lưu." profile={profile}/></p>
            </div>
          </div>
          <div className="settings-action-list">
            <button onClick={save}><Save size={16}/><span><Bi jp="設定を保存" vi="Lưu cài đặt" profile={profile}/></span></button>
            <button onClick={clearCache}><Trash2 size={16}/><span><Bi jp="キャッシュクリア" vi="Xóa cache" profile={profile}/></span></button>
            <button onClick={backup}><Download size={16}/><span><Bi jp="バックアップをダウンロード" vi="Tải backup dữ liệu" profile={profile}/></span></button>
            <button onClick={() => setNotice('同期が完了しました。 / Đã đồng bộ hệ thống.')}><RefreshCw size={16}/><span><Bi jp="同期リセット" vi="Đồng bộ lại" profile={profile}/></span></button>
            <button className="danger-action-button" onClick={logout}><LogOut size={16}/><span><Bi jp="ログアウト" vi="Đăng xuất" profile={profile}/></span></button>
          </div>
        </section>

        <section className="admin-card system-settings-panel">
          <div className="settings-panel-title">
            <UserPlus size={18}/>
            <div>
              <h2><Bi jp="ユーザー設定" vi="Cài đặt người dùng" profile={profile}/></h2>
              <p><Bi jp="登録、通知、テンプレート承認を管理します。" vi="Đăng ký, thông báo và duyệt mẫu." profile={profile}/></p>
            </div>
          </div>
          <div className="settings-toggle-list">
            <Toggle label="ユーザー登録を許可" vi="Cho phép đăng ký" descriptionJp="新しいユーザーが自分でアカウントを作成できます。" descriptionVi="Người dùng mới có thể tự tạo tài khoản." checked={settings.toggles.userRegistration} onChange={v=>update('toggles.userRegistration', v)} profile={profile}/>
            <Toggle label="メール通知" vi="Thông báo email" descriptionJp="重要なイベントをメールで通知します。" descriptionVi="Gửi email cho các sự kiện quan trọng." checked={settings.toggles.emailNotification} onChange={v=>update('toggles.emailNotification', v)} profile={profile}/>
            <Toggle label="テンプレート自動承認" vi="Tự động duyệt template" descriptionJp="新しいテンプレートを管理者承認なしで公開します。" descriptionVi="Template mới được xuất bản mà không cần admin duyệt." checked={settings.toggles.templateAutoApprove} onChange={v=>update('toggles.templateAutoApprove', v)} profile={profile}/>
          </div>
        </section>

        <section className="admin-card system-settings-panel">
          <div className="settings-panel-title">
            <UploadCloud size={18}/>
            <div>
              <h2><Bi jp="アップロード設定" vi="Cài đặt upload" profile={profile}/></h2>
              <p><Bi jp="ファイルサイズと許可形式を管理します。" vi="Dung lượng và định dạng được phép." profile={profile}/></p>
            </div>
          </div>
          <div className="settings-field-grid single">
            <label>
              <span><Bi jp="最大ファイルサイズ (MB)" vi="Dung lượng tối đa (MB)" profile={profile}/></span>
              <input type="number" min="1" value={settings.maxFileSize} onChange={e=>update('maxFileSize', e.target.value)} />
            </label>
            <label>
              <span><Bi jp="許可ファイル形式" vi="Định dạng cho phép" profile={profile}/></span>
              <input value={settings.allowedFormats} onChange={e=>update('allowedFormats', e.target.value)} />
            </label>
          </div>
        </section>

        <section className="admin-card system-settings-panel system-info-panel">
          <div className="settings-panel-title">
            <Bell size={18}/>
            <div>
              <h2><Bi jp="システム情報" vi="Thông tin hệ thống" profile={profile}/></h2>
              <p><Bi jp="現在の運用情報です。" vi="Thông tin vận hành hiện tại." profile={profile}/></p>
            </div>
          </div>
          <div className="settings-info-list">
            <p><span>Version</span><b>{settings.version}</b></p>
            <p><span>Last update</span><b>{settings.lastUpdate}</b></p>
            <p><span>Status</span><b className="ok">{settings.systemStatus}</b></p>
          </div>
        </section>
      </div>
    </section>
  </AdminLayout>;
}

function Toggle({ label, vi, descriptionJp, descriptionVi, checked, onChange, profile }) {
  return <div className="setting-toggle-card">
    <div>
      <b><Bi jp={label} vi={vi} profile={profile}/></b>
      <span><Bi jp={descriptionJp} vi={descriptionVi} profile={profile}/></span>
    </div>
    <button className={checked ? 'toggle-switch on' : 'toggle-switch'} onClick={() => onChange(!checked)} type="button" aria-pressed={checked}><i/></button>
  </div>;
}
