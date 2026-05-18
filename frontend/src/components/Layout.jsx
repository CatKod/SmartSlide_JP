import React, { useState } from 'react';
import { BookOpen, LayoutDashboard, LogOut, Search, Settings, SlidersHorizontal, UserRound } from 'lucide-react';
import { Bi, biText } from '../i18n.jsx';

export function AppLayout({ children, nav, active = 'templates', profile, compactSidebar = false }) {
  const [keyword, setKeyword] = useState('');
  const items = [
    ['dashboard', 'ダッシュボード', 'Bảng điều khiển', LayoutDashboard],
    ['slides', 'マイスライド', 'Slide của tôi', BookOpen],
    ['templates', 'テンプレート', 'Mẫu slide', Search],
    ['shared', '共有教材', 'Tài liệu chung', SlidersHorizontal],
    ['settings', '設定', 'Cài đặt', Settings],
  ];

  function submitSearch(e) {
    e.preventDefault();
    nav('templates', { keyword });
  }

  return <div className={compactSidebar ? 'app-shell compact-sidebar' : 'app-shell'}>
    <aside className="sidebar">
      <div className="brand" onClick={() => nav('dashboard')}><span className="brand-full">SmartSlide JP</span><span className="brand-short">S</span></div>
      <nav>{items.map(([key,label,vi,Icon]) => <button key={key} className={active===key?'nav active':'nav'} onClick={() => nav(key)}><Icon size={17}/><span className="nav-label"><Bi jp={label} vi={vi} profile={profile}/></span></button>)}</nav>
    </aside>
    <main className="main">
      <header className="topbar">
        <form className="top-search-form" onSubmit={submitSearch}>
          <input className="global-search" value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder={biText(profile, 'キーワード、教材、テンプレートで検索', 'Tìm theo từ khóa, tài liệu, mẫu slide')} />
        </form>
        <button className="pink" onClick={() => nav('editor', { deckId: null })}>+ <Bi jp="新しいスライドを作成" vi="Tạo slide mới" profile={profile}/></button>
        <button className="avatar" onClick={() => nav('settings')} aria-label="プロフィール"><UserRound size={18}/></button>
        {profile?.name && <span className="top-name">{profile.name}先生</span>}
        <button className="logout" onClick={() => nav('login')}><LogOut size={16}/><Bi jp="ログアウト" vi="Đăng xuất" profile={profile}/></button>
      </header>
      {children}
    </main>
  </div>
}
