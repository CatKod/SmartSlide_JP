import React from 'react';
import { Download, Star } from 'lucide-react';

export function TemplateCard({ template, onPreview }) {
  return <article className="template-card">
    <img src={template.image} alt={template.title} />
    <div className="card-body">
      <div className="chips"><span>{template.level}</span><span>{template.categoryLabel}</span></div>
      <h3>{template.title}</h3>
      <p>{template.author}</p>
      <div className="meta"><span><Star size={14}/> {template.rating}</span><span><Download size={14}/> {template.downloads}</span></div>
      <button className="outline" onClick={() => onPreview(template.id)}>プレビュー</button>
    </div>
  </article>
}
