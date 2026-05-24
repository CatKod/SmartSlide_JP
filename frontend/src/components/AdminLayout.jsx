import React from 'react';
import { FileText, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import { Bi } from '../i18n.jsx';

const adminItems = [
  ['admin_dashboard', '管理ダッシュボード', 'Bảng điều khiển quản trị', LayoutDashboard],
  ['admin_users', 'ユーザー管理', 'Quản lý người dùng', Users],
  ['admin_templates', 'テンプレート管理', 'Quản lý template', FileText],
  ['admin_settings', 'システム設定', 'Cài đặt hệ thống', Settings],
];

export function AdminLayout({ children, nav, active, profile }) {
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <div className="admin-brand" onClick={() => nav('admin_dashboard')}>
        <div className="admin-brand-avatar">S</div>
        <div>
          <b>SmartSlide JP</b>
          <span><Bi jp="管理ダッシュボード" vi="Quản trị hệ thống" profile={profile}/></span>
        </div>
      </div>

      <nav className="admin-nav">
        {adminItems.map(([key, jp, vi, Icon]) => <button
          key={key}
          className={active === key ? 'admin-nav-item active' : 'admin-nav-item'}
          onClick={() => nav(key)}
        >
          <Icon size={17}/>
          <span><Bi jp={jp} vi={vi} profile={profile}/></span>
        </button>)}
      </nav>

      <button className="admin-logout" onClick={() => nav('login')}>
        <LogOut size={15}/>
        <Bi jp="ログアウト" vi="Đăng xuất" profile={profile}/>
      </button>
    </aside>
    <main className="admin-main">{children}</main>
  </div>;
}
