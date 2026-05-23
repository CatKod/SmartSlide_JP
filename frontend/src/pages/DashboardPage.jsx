import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { apiGetTemplates, apiGetMySlides, apiGetMaterials } from '../api.js';
import { BookOpen, Clock3, Download, LayoutTemplate, Plus, Star } from 'lucide-react';
import { Bi, biText, isVietnamese } from '../i18n.jsx';

export function DashboardPage({ nav, profile, setProfile }) {
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

  return <AppLayout nav={nav} active="dashboard" profile={profile} setProfile={setProfile}>
    <section className="dashboard-hero">
      <div className="dashboard-hero-copy">
        <p className="eyebrow"><Bi jp="ホームページ" vi="Trang chủ" profile={profile}/></p>
        <h1>{biText(profile, `${profile.name || '先生'}さん、おかえりなさい`, `Chào mừng ${profile.name || 'thầy/cô'} quay lại`)}</h1>
        <p><Bi jp="テンプレートを選んで、すぐに教材スライドを作成できます。" vi="Chọn mẫu để tạo bài trình chiếu giảng dạy nhanh chóng." profile={profile}/></p>
      </div>
      <button className="pink dashboard-new-btn" onClick={() => nav('editor', { deckId: null })}><Plus size={16}/> <Bi jp="スライド作成" vi="Tạo bài trình chiếu" profile={profile}/></button>
    </section>
    <section className="stats-grid">
      <div className="stat-card"><LayoutTemplate/><span><Bi jp="テンプレート" vi="Mẫu bài trình chiếu" profile={profile}/></span><b>{templates.length}</b></div>
      <div className="stat-card"><BookOpen/><span><Bi jp="マイスライド" vi="Bài trình chiếu" profile={profile}/></span><b>{slideCount}</b></div>
      <div className="stat-card"><Download/><span><Bi jp="共有教材" vi="Tài liệu chung" profile={profile}/></span><b>{materialCount}</b></div>
      <div className="stat-card"><Clock3/><span><Bi jp="最近の保存" vi="Lưu gần đây" profile={profile}/></span><b>{hasRecent ? (isVietnamese(profile) ? 'Có' : 'あり') : (isVietnamese(profile) ? 'Không' : 'なし')}</b></div>
    </section>
    <section className="two-column">
      <div className="panel"><h2><Bi jp="おすすめテンプレート" vi="Mẫu đề xuất" profile={profile}/></h2>{templates.slice(0,3).map(t => <button className="list-row" key={t._id} onClick={() => nav('detail',{templateId:t._id})}><img src={t.image}/><span><b>{t.title}</b><small>{t.categoryLabel}・{t.level}</small></span><em><Star size={14}/> {t.rating}</em></button>)}</div>
      <div className="panel"><h2><Bi jp="次にやること" vi="Việc cần làm tiếp theo" profile={profile}/></h2><div className="todo checked"><Bi jp="テンプレート検索画面の確認" vi="Kiểm tra màn hình tìm kiếm mẫu" profile={profile}/></div><div className="todo"><Bi jp="スライドを1件保存してマイスライドで確認" vi="Lưu 1 bài trình chiếu và kiểm tra trong mục của tôi" profile={profile}/></div><div className="todo"><Bi jp="共有教材の検索・ダウンロード確認" vi="Kiểm tra tìm kiếm và tải tài liệu chung" profile={profile}/></div><div className="todo"><Bi jp="設定画面でプロフィールを保存" vi="Lưu hồ sơ trong phần cài đặt" profile={profile}/></div></div>
    </section>
  </AppLayout>
}
