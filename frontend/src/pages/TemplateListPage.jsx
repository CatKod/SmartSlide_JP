import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { TemplateCard } from '../components/TemplateCard.jsx';
import { apiGetTemplates } from '../api.js';
import { templateCategories } from '../data/mockData.js';
import { Bi, biText } from '../i18n.jsx';

export function TemplateListPage({ nav, initialKeyword = '', profile }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [category, setCategory] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch templates từ backend
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGetTemplates({ keyword, category })
      .then(data => { if (!cancelled) setTemplates(data.templates || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [keyword, category]);

  return <AppLayout nav={nav} active="templates" profile={profile}><section className="page-head"><h1><Bi jp="テンプレートを探す" vi="Tìm mẫu slide" profile={profile}/></h1><p><Bi jp="授業に合うテンプレートを検索してプレビューできます。" vi="Tìm và xem trước mẫu slide phù hợp với bài giảng." profile={profile}/></p></section>
    <div className="filters"><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder={biText(profile, 'キーワードで検索', 'Tìm theo từ khóa')}/><select value={category} onChange={e=>setCategory(e.target.value)}>{templateCategories.map(c => <option value={c.value} key={c.value}>{c.label}</option>)}</select></div>
    {loading ? <div className="empty">読み込み中...</div> : templates.length ? <div className="template-grid">{templates.map(t => <TemplateCard key={t._id} template={{...t, id: t._id}} profile={profile} onPreview={(id)=>nav('detail',{templateId:id})}/>)}</div> : <div className="empty"><Bi jp="該当なし" vi="Không có kết quả phù hợp" profile={profile}/></div>}
  </AppLayout>
}
