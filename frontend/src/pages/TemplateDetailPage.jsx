import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { apiGetTemplateDetail } from '../api.js';
import { ChevronLeft, Download, Star } from 'lucide-react';

export function TemplateDetailPage({ nav, templateId, profile }) {
  const [t, setT] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!templateId) return;
    setLoading(true);
    apiGetTemplateDetail(templateId)
      .then(data => setT(data.template))
      .catch(() => setT(null))
      .finally(() => setLoading(false));
  }, [templateId]);

  if (loading) return <AppLayout nav={nav} profile={profile}><div className="empty">読み込み中...</div></AppLayout>;
  if (!t) return <AppLayout nav={nav} profile={profile}><div className="empty">該当なし</div></AppLayout>;

  return <AppLayout nav={nav} active="templates" profile={profile}><button className="back" onClick={() => nav('templates')}><ChevronLeft size={16}/>戻る</button>
    <section className="detail-card"><div className="preview"><img src={t.image} alt={t.title}/></div><div className="detail-info"><h1>{t.title}</h1><p>{t.description}</p><div className="meta large"><span><Star size={18}/> {t.rating}</span><span><Download size={18}/> {t.downloads}</span><span>{(t.slidesData || []).length}枚</span></div><div className="chips">{(t.tags || []).map(tag=><span key={tag}>{tag}</span>)}</div><button className="pink" onClick={() => nav('editor',{templateId: t._id, deckId:null})}>このテンプレートで作成</button></div></section>
  </AppLayout>
}
