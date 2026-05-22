import React from 'react';
import { Download, Star } from 'lucide-react';
import { Bi } from '../i18n.jsx';

export function TemplateCard({ template, onPreview, profile }) {
  return <article className="template-card">
    <img src={template.image} alt={template.title}/>
    <div className="card-body">
      <div className="chips">{template.tags.map(t => <span key={t}>{t}</span>)}</div>
      <h3>{template.title}</h3>
      <p>{template.teacher}</p>
      <div className="meta"><span><Star size={14}/> {template.rating}</span><span><Download size={14}/> {template.downloads}</span></div>
      <button className="outline" onClick={() => onPreview(template.id)}><Bi jp="プレビュー" vi="Xem trước" profile={profile}/></button>
    </div>
  </article>
}
