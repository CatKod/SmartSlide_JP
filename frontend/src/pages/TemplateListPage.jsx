import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { TemplateCard } from '../components/TemplateCard.jsx';
import { templateCategories, templates } from '../data/mockData.js';
import { getAllTemplates } from '../data/uploadedTemplates.js';
import { Bi, biText } from '../i18n.jsx';

export function TemplateListPage({ nav, initialKeyword = '', profile, setProfile }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [category, setCategory] = useState('all');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setVersion(v => v + 1);
    window.addEventListener('smartslide-template-uploaded', refresh);
    return () => window.removeEventListener('smartslide-template-uploaded', refresh);
  }, []);
  const allTemplates = useMemo(() => getAllTemplates(templates), [version]);
  const filtered = useMemo(() => allTemplates.filter(t => {
    const target = `${t.title} ${t.teacher} ${t.level} ${t.category} ${t.tags.join(' ')}`.toLowerCase();
    return (!keyword || target.includes(keyword.toLowerCase())) && (category === 'all' || t.category === category);
  }), [keyword, category, allTemplates]);
  return <AppLayout nav={nav} active="templates" profile={profile} setProfile={setProfile}>
    <section className="page-head">
      <h1><Bi jp="テンプレート一覧" vi="Danh sách mẫu" profile={profile}/></h1>
      <p><Bi jp="カテゴリで絞り込みながらテンプレートを確認できます。" vi="Bạn có thể lọc mẫu theo danh mục và xem trước." profile={profile}/></p>
    </section>
    <div className="filters template-filters">
      <input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder={biText(profile, 'テンプレート名で検索...', 'Tìm theo tên mẫu...')}/>
      <select value={category} onChange={e=>setCategory(e.target.value)}>
        {[{ value: 'all', label: biText(profile, 'すべて', 'Tất cả') }, ...templateCategories, { value: 'uploaded', label: biText(profile, 'アップロード', 'Đã tải lên') }].map(c => <option value={c.value} key={c.value}>{c.label}</option>)}
      </select>
    </div>
    {filtered.length ? <div className="template-grid">{filtered.map(t => <TemplateCard key={t.id} template={t} profile={profile} onPreview={(id)=>nav('detail',{templateId:id})}/>)}</div> : <div className="empty"><Bi jp="該当なし" vi="Không có kết quả phù hợp" profile={profile}/></div>}
  </AppLayout>
}
