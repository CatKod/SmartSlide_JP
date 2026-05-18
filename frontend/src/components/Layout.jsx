import React, { useRef, useState } from 'react';
import { BookOpen, Globe2, LayoutDashboard, Search, Settings, SlidersHorizontal, Upload, UserRound } from 'lucide-react';
import { Bi, biText } from '../i18n.jsx';

function createUploadedTemplate(file) {
  const now = Date.now();
  const slideTitles = ['表紙', '導入', '本文1', '本文2', '練習', 'まとめ', '確認'];
  return {
    id: `uploaded_tpl_${now}`,
    title: '新しいテンプレート',
    category: 'uploaded',
    categoryLabel: 'アップロード',
    level: 'カスタム',
    author: 'Tuệ先生',
    rating: 4.8,
    downloads: 0,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop',
    description: `アップロードされたファイル「${file.name}」から作成したテンプレートです。編集画面で文字・画像・背景・ページ順を自由に変更できます。`,
    tags: ['アップロード', 'カスタム', 'PPTX'],
    sourceFileName: file.name,
    uploadedAt: new Date().toLocaleString('ja-JP'),
    slidesData: slideTitles.map((title, index) => ({
      id: `uploaded_${now}_${index}`,
      title: index === 0 ? '新しいテンプレート' : title,
      body: index === 0
        ? 'アップロードしたテンプレートです。\n授業内容に合わせて編集してください。'
        : `${title}の内容をここに入力してください。`,
      image: index % 2 === 0
        ? 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=900&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=900&auto=format&fit=crop',
    })),
  };
}

function getUploadedTemplates() {
  try {
    return JSON.parse(localStorage.getItem('smartslide_uploaded_templates') || '[]');
  } catch {
    return [];
  }
}

function saveUploadedTemplates(templates) {
  localStorage.setItem('smartslide_uploaded_templates', JSON.stringify(templates));
  window.dispatchEvent(new CustomEvent('smartslide-template-uploaded', { detail: templates }));
}


export function AppLayout({ children, nav, active = 'templates', profile, setProfile, compactSidebar = false }) {
  const [keyword, setKeyword] = useState('');
  const uploadRef = useRef(null);
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

  function updateLanguage(language) {
    const next = { ...(profile || {}), language };
    localStorage.setItem('smartslide_profile', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('smartslide-language-change', { detail: next }));
    if (setProfile) setProfile(next);
  }

  function handleTemplateUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadedTemplate = createUploadedTemplate(file);
    const nextTemplates = [uploadedTemplate, ...getUploadedTemplates()];
    saveUploadedTemplates(nextTemplates);
    alert(`${file.name} をテンプレートとして追加しました。
Template mới đã được thêm vào danh sách.`);
    e.target.value = '';
    nav('templates', { uploadedTemplateId: uploadedTemplate.id });
  }

  return <div className={compactSidebar ? 'app-shell compact-sidebar' : 'app-shell'}>
    <aside className="sidebar">
      <div className="brand" onClick={() => nav('dashboard')}><span className="brand-full">SmartSlide JP</span><span className="brand-short">S</span></div>
      <nav>{items.map(([key,label,vi,Icon]) => <button key={key} className={active===key?'nav active':'nav'} onClick={() => nav(key)}><Icon size={17}/><span className="nav-label"><Bi jp={label} vi={vi} profile={profile}/></span></button>)}</nav>
    </aside>
    <main className="main">
      <header className="topbar">
        <form className="top-search-form" onSubmit={submitSearch}>
          <Search size={17} className="search-icon" />
          <input className="global-search" value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder={biText(profile, 'キーワード、文法、トピックで検索...', 'Tìm kiếm từ khóa, ngữ pháp, chủ đề...')} />
        </form>
        <input ref={uploadRef} type="file" accept=".json,.ppt,.pptx,.pdf" hidden onChange={handleTemplateUpload} />
        <button className="pink top-upload" onClick={() => uploadRef.current?.click()}><Upload size={16}/><Bi jp="テンプレートをアップロード" vi="Upload template" profile={profile}/></button>
        <div className="language-switch" title="Language">
          <Globe2 size={15}/>
          <select value={profile?.language || '日本語'} onChange={e=>updateLanguage(e.target.value)}>
            <option value="日本語">JP</option>
            <option value="日本語 + Tiếng Việt">JP + VI</option>
          </select>
        </div>
        <button className="avatar" onClick={() => nav('settings')} aria-label="プロフィール"><UserRound size={18}/></button>
      </header>
      {children}
    </main>
  </div>
}
