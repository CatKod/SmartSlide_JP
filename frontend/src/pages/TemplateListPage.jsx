import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { TemplateCard } from '../components/TemplateCard.jsx';
import { apiGetTemplates } from '../api.js';
import { templateCategories } from '../data/mockData.js';
import { getUploadedTemplates } from '../data/uploadedTemplates.js';
import { Bi, biText } from '../i18n.jsx';

export function TemplateListPage({ nav, initialKeyword = '', profile, setProfile }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [category, setCategory] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setVersion(v => v + 1);
    window.addEventListener('smartslide-template-uploaded', refresh);
    return () => window.removeEventListener('smartslide-template-uploaded', refresh);
  }, []);

  // Fetch templates từ backend
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const fetchCategory = category === 'uploaded' ? 'all' : category;
    apiGetTemplates({ keyword, category: fetchCategory })
      .then(data => {
        if (!cancelled) setTemplates(data.templates || []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [keyword, category]);

  const allTemplates = useMemo(() => {
    const localUploaded = getUploadedTemplates();
    const normalizedBackend = templates.map(t => ({ ...t, id: t._id }));
    return [...localUploaded, ...normalizedBackend];
  }, [templates, version]);

  const filtered = useMemo(() => {
    return allTemplates.filter(t => {
      if (category === 'uploaded') {
        const localIds = new Set(getUploadedTemplates().map(lt => lt.id));
        return localIds.has(t.id) && (!keyword || `${t.title} ${t.level} ${t.category} ${t.tags?.join(' ')}`.toLowerCase().includes(keyword.toLowerCase()));
      }
      const matchesCategory = category === 'all' || t.category === category;
      const target = `${t.title} ${t.level} ${t.category} ${(t.tags || []).join(' ')}`.toLowerCase();
      const matchesKeyword = !keyword || target.includes(keyword.toLowerCase());
      return matchesCategory && matchesKeyword;
    });
  }, [allTemplates, keyword, category]);

  const categoriesList = useMemo(() => {
    return [
      { value: 'all', label: biText(profile, 'すべて', 'Tất cả') },
      ...templateCategories,
      { value: 'uploaded', label: biText(profile, 'アップロード', 'Đã tải lên') }
    ];
  }, [profile]);

  return <AppLayout nav={nav} active="templates" profile={profile} setProfile={setProfile}>
    <section className="page-head">
      <h1><Bi jp="テンプレート一覧" vi="Danh sách mẫu" profile={profile}/></h1>
      <p><Bi jp="カテゴリで絞り込みながらテンプレートを確認できます。" vi="Bạn có thể lọc mẫu theo danh mục và xem trước." profile={profile}/></p>
    </section>
    <div className="filters template-filters">
      <input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder={biText(profile, 'テンプレート名で検索...', 'Tìm theo tên mẫu...')}/>
      <select value={category} onChange={e=>setCategory(e.target.value)}>
        {categoriesList.map(c => <option value={c.value} key={c.value}>{c.label}</option>)}
      </select>
    </div>
    {loading ? <div className="empty">読み込み中...</div> : (
      filtered.length ? (
        <div className="template-grid">
          {filtered.map(t => <TemplateCard key={t.id} template={t} profile={profile} onPreview={(id)=>nav('detail',{templateId:id})}/>)}
        </div>
      ) : (
        <div className="empty"><Bi jp="該当なし" vi="Không có kết quả phù hợp" profile={profile}/></div>
      )
    )}
  </AppLayout>
}
