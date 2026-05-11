import React from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { templates } from '../data/mockData.js';
import { ChevronLeft, Download, Star } from 'lucide-react';

export function TemplateDetailPage({ nav, templateId, profile }) {
  const t = templates.find(item => item.id === templateId);
  if (!t) return <AppLayout nav={nav} profile={profile}><div className="empty">該当なし</div></AppLayout>;
  return <AppLayout nav={nav} active="templates" profile={profile}><button className="back" onClick={() => nav('templates')}><ChevronLeft size={16}/>戻る</button>
    <section className="detail-card"><div className="preview"><img src={t.image} alt={t.title}/></div><div className="detail-info"><h1>{t.title}</h1><p>{t.description}</p><div className="meta large"><span><Star size={18}/> {t.rating}</span><span><Download size={18}/> {t.downloads}</span><span>{t.slidesData.length}枚</span></div><div className="chips">{t.tags.map(tag=><span key={tag}>{tag}</span>)}</div><button className="pink" onClick={() => nav('editor',{templateId:t.id, deckId:null})}>このテンプレートで作成</button></div></section>
  </AppLayout>
}
