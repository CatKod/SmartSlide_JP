import React from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { templates } from '../data/mockData.js';
import { getAllTemplates } from '../data/uploadedTemplates.js';
import { ChevronLeft, Download, Star } from 'lucide-react';
import { Bi } from '../i18n.jsx';

export function TemplateDetailPage({ nav, templateId, profile, setProfile }) {
  const allTemplates = getAllTemplates(templates);
  const t = allTemplates.find(item => item.id === templateId) || allTemplates[0];
  if (!t) return <AppLayout nav={nav} profile={profile} setProfile={setProfile}><div className="empty"><Bi jp="該当なし" vi="Không có kết quả" profile={profile}/></div></AppLayout>;
  return <AppLayout nav={nav} active="templates" profile={profile} setProfile={setProfile}><button className="back" onClick={() => nav('templates')}><ChevronLeft size={16}/><Bi jp="戻る" vi="Quay lại" profile={profile}/></button>
    <section className="detail-card"><div className="preview"><img src={t.image} alt={t.title}/></div><div className="detail-info"><h1>{t.title}</h1><p>{t.description}</p><div className="meta large"><span><Star size={18}/> {t.rating}</span><span><Download size={18}/> {t.downloads}</span><span>{t.slidesData.length}<Bi jp="枚" vi="trang" profile={profile}/></span></div><div className="chips">{t.tags.map(tag=><span key={tag}>{tag}</span>)}</div><button className="pink" onClick={() => nav('editor',{templateId:t.id, deckId:null})}><Bi jp="このテンプレートで作成" vi="Tạo bằng mẫu này" profile={profile}/></button></div></section>
  </AppLayout>
}
