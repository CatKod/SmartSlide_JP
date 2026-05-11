import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { apiGetTemplates, apiGetMySlides, apiGetMaterials } from '../api.js';
import { BookOpen, Clock3, Download, LayoutTemplate, Plus, Star } from 'lucide-react';

export function DashboardPage({ nav, profile }) {
  const [templates, setTemplates] = useState([]);
  const [slideCount, setSlideCount] = useState(0);
  const [materialCount, setMaterialCount] = useState(0);
  const [hasRecent, setHasRecent] = useState(false);

  // Fetch stats từ backend
  useEffect(() => {
    apiGetTemplates().then(d => setTemplates(d.templates || [])).catch(() => {});
    apiGetMySlides().then(d => {
      const s = d.slides || [];
      setSlideCount(s.length);
      setHasRecent(s.length > 0);
    }).catch(() => {});
    apiGetMaterials().then(d => setMaterialCount((d.materials || []).length)).catch(() => {});
  }, []);

  return <AppLayout nav={nav} active="dashboard" profile={profile}>
    <section className="dashboard-hero">
      <div><p className="eyebrow">今日の授業準備</p><h1>{profile.name}先生、こんにちは！</h1><p>テンプレートを選んで、すぐに教材スライドを作成できます。</p></div>
      <button className="pink" onClick={() => nav('editor', { deckId: null })}><Plus size={16}/> 新しいスライド</button>
    </section>
    <section className="stats-grid">
      <div className="stat-card"><LayoutTemplate/><span>テンプレート</span><b>{templates.length}</b></div>
      <div className="stat-card"><BookOpen/><span>マイスライド</span><b>{slideCount}</b></div>
      <div className="stat-card"><Download/><span>共有教材</span><b>{materialCount}</b></div>
      <div className="stat-card"><Clock3/><span>最近の保存</span><b>{hasRecent ? 'あり' : 'なし'}</b></div>
    </section>
    <section className="two-column">
      <div className="panel"><h2>おすすめテンプレート</h2>{templates.slice(0,3).map(t => <button className="list-row" key={t._id} onClick={() => nav('detail',{templateId:t._id})}><img src={t.image}/><span><b>{t.title}</b><small>{t.categoryLabel}・{t.level}</small></span><em><Star size={14}/> {t.rating}</em></button>)}</div>
      <div className="panel"><h2>次にやること</h2><div className="todo checked">テンプレート検索画面の確認</div><div className="todo">スライドを1件保存してマイスライドで確認</div><div className="todo">共有教材の検索・ダウンロード確認</div><div className="todo">設定画面でプロフィールを保存</div></div>
    </section>
  </AppLayout>
}
