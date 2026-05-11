import React, { useState } from 'react';
import { BookOpen, LayoutDashboard, LogOut, Search, Settings, SlidersHorizontal, UserRound } from 'lucide-react';

export function AppLayout({ children, nav, active = 'templates', profile }) {
  const [keyword, setKeyword] = useState('');
  const items = [
    ['dashboard', 'ダッシュボード', LayoutDashboard],
    ['slides', 'マイスライド', BookOpen],
    ['templates', 'テンプレート', Search],
    ['shared', '共有教材', SlidersHorizontal],
    ['settings', '設定', Settings],
  ];

  function submitSearch(e) {
    e.preventDefault();
    nav('templates', { keyword });
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand" onClick={() => nav('dashboard')}><span>SmartSlide JP</span></div>
      <nav>{items.map(([key,label,Icon]) => <button key={key} className={active===key?'nav active':'nav'} onClick={() => nav(key)}><Icon size={17}/>{label}</button>)}</nav>
    </aside>
    <main className="main">
      <header className="topbar">
        <form className="top-search-form" onSubmit={submitSearch}>
          <input className="global-search" value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="キーワード、教材、テンプレートで検索" />
        </form>
        <button className="pink" onClick={() => nav('editor', { deckId: null })}>+ 新しいスライドを作成</button>
        <button className="avatar" onClick={() => nav('settings')} aria-label="プロフィール"><UserRound size={18}/></button>
        {profile?.name && <span className="top-name">{profile.name}先生</span>}
        <button className="logout" onClick={() => nav('login')}><LogOut size={16}/>ログアウト</button>
      </header>
      {children}
    </main>
  </div>
}
