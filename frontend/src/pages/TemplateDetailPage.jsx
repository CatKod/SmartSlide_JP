import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { apiGetTemplateDetail } from '../api.js';
import { ChevronLeft, Download, Star } from 'lucide-react';
import { Bi } from '../i18n.jsx';

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
  if (!t) return <AppLayout nav={nav} profile={profile}><div className="empty"><Bi jp="該当なし" vi="Không có kết quả" profile={profile}/></div></AppLayout>;

  return <AppLayout nav={nav} active="templates" profile={profile}><button className="back" onClick={() => nav('templates')}><ChevronLeft size={16}/><Bi jp="戻る" vi="Quay lại" profile={profile}/></button>
    <section className="detail-card"><div className="preview"><img src={t.image} alt={t.title}/></div><div className="detail-info"><h1>{t.title}</h1><p>{t.description}</p><div className="meta large"><span><Star size={18}/> {t.rating}</span><span><Download size={18}/> {t.downloads}</span><span>{(t.slidesData || []).length}<Bi jp="枚" vi="trang" profile={profile}/></span></div><div className="chips">{(t.tags || []).map(tag=><span key={tag}>{tag}</span>)}</div><button className="pink" onClick={() => nav('editor',{templateId: t._id, deckId:null})}><Bi jp="このテンプレートで作成" vi="Tạo bằng mẫu này" profile={profile}/></button></div></section>
  </AppLayout>
}
