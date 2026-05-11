import React, { useMemo, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { TemplateCard } from '../components/TemplateCard.jsx';
import { templates, templateCategories } from '../data/mockData.js';

export function TemplateListPage({ nav, initialKeyword = '', profile }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [category, setCategory] = useState('all');
  const filtered = useMemo(() => templates.filter(t => {
    const text = `${t.title} ${t.categoryLabel} ${t.level} ${t.tags.join(' ')} ${t.author}`.toLowerCase();
    return (category === 'all' || t.category === category) && text.includes(keyword.toLowerCase());
  }), [keyword, category]);
  return <AppLayout nav={nav} active="templates" profile={profile}><section className="page-head"><h1>テンプレートを探す</h1><p>授業に合うテンプレートを検索してプレビューできます。</p></section>
    <div className="filters"><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="キーワードで検索"/><select value={category} onChange={e=>setCategory(e.target.value)}>{templateCategories.map(c => <option value={c.value} key={c.value}>{c.label}</option>)}</select></div>
    {filtered.length ? <div className="template-grid">{filtered.map(t => <TemplateCard key={t.id} template={t} onPreview={(id)=>nav('detail',{templateId:id})}/>)}</div> : <div className="empty">該当なし</div>}
  </AppLayout>
}
