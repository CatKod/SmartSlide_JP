import React, { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { apiAdminGetDashboardData } from '../api.js';
import { RECENT_ACTIVITIES_FALLBACK, TEMPLATE_CATEGORY_STATS, UPLOAD_STATS, USER_GROWTH } from '../data/adminMockData.js';
import { FileText, TrendingUp, Upload, Users, Zap } from 'lucide-react';
import { Bi } from '../i18n.jsx';

const statIcons = { users: Users, templates: FileText, uploads: Upload, activities: Zap };

export function AdminDashboardPage({ nav, profile }) {
  const [data, setData] = useState({ templates: [], materials: [], slides: [], me: profile });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    apiAdminGetDashboardData()
      .then(res => { if (alive) setData(res); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const stats = useMemo(() => [
    { key: 'users', label: '総ユーザー数', vi: 'Tổng người dùng', value: 1, change: '+0%', tone: 'blue' },
    { key: 'templates', label: 'テンプレート', vi: 'Template', value: data.templates.length, change: '+8.2%', tone: 'pink' },
    { key: 'uploads', label: '総アップロード数', vi: 'Tổng upload', value: data.materials.length + data.slides.length, change: '+23.1%', tone: 'green' },
    { key: 'activities', label: '今日のアクティビティ', vi: 'Hoạt động hôm nay', value: data.slides.length, change: '+5.7%', tone: 'purple' },
  ], [data]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    data.templates.forEach(t => { counts[t.categoryLabel || t.category || 'その他'] = (counts[t.categoryLabel || t.category || 'その他'] || 0) + 1; });
    const total = Math.max(1, data.templates.length);
    return Object.entries(counts).slice(0, 5).map(([label, count], i) => ({
      label,
      vi: label,
      value: Math.round((count / total) * 100),
      color: TEMPLATE_CATEGORY_STATS[i]?.color || '#f76f95',
    }));
  }, [data.templates]);

  const recent = useMemo(() => {
    const templates = data.templates.slice(0, 2).map(t => ({ title: 'テンプレート確認', vi: 'Kiểm tra template', detail: `${t.title}・backend`, dot: '#22c55e' }));
    const materials = data.materials.slice(0, 2).map(m => ({ title: '教材アップロード', vi: 'Upload tài liệu', detail: `${m.title}・backend`, dot: '#3b82f6' }));
    return [...templates, ...materials, ...RECENT_ACTIVITIES_FALLBACK].slice(0, 5);
  }, [data]);

  return <AdminLayout nav={nav} active="admin_dashboard" profile={profile}>
    <section className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1><Bi jp="管理ダッシュボード" vi="Bảng điều khiển quản trị" profile={profile}/></h1>
          <p><Bi jp={loading ? 'バックエンドからデータを読み込み中...' : 'バックエンドのデータをもとに管理状況を確認します。'} vi={loading ? 'Đang tải dữ liệu từ backend...' : 'Theo dõi trạng thái quản trị dựa trên dữ liệu backend.'} profile={profile}/></p>
        </div>
      </header>

      <div className="admin-stat-grid">
        {stats.map(stat => {
          const Icon = statIcons[stat.key] || TrendingUp;
          return <article className="admin-stat-card" key={stat.key}>
            <div>
              <span><Bi jp={stat.label} vi={stat.vi} profile={profile}/></span>
              <strong>{Number(stat.value || 0).toLocaleString()}</strong>
              <small>{stat.change}</small>
            </div>
            <div className={`admin-stat-icon ${stat.tone}`}><Icon size={22}/></div>
          </article>;
        })}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-card chart-card large-chart">
          <h2><Bi jp="ユーザー成長" vi="Tăng trưởng người dùng" profile={profile}/></h2>
          <div className="line-chart">
            <svg viewBox="0 0 700 300" role="img">
              <defs><linearGradient id="adminLineFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff7aa2" stopOpacity="0.26"/><stop offset="100%" stopColor="#ff7aa2" stopOpacity="0"/></linearGradient></defs>
              {[0,1,2,3,4].map(i => <line key={i} x1="48" x2="674" y1={42+i*52} y2={42+i*52} stroke="#edf0f4"/>)}
              <path d="M60 238 L160 220 L260 198 L360 160 L460 108 L560 74 L660 44" fill="none" stroke="#ff7aa2" strokeWidth="4" strokeLinecap="round"/>
              <path d="M60 238 L160 220 L260 198 L360 160 L460 108 L560 74 L660 44 L660 270 L60 270 Z" fill="url(#adminLineFill)"/>
              {USER_GROWTH.map((p, i) => <g key={p.month}><circle cx={60+i*100} cy={[238,220,198,160,108,74,44][i]} r="5" fill="#ff7aa2"/><text x={60+i*100} y="292" textAnchor="middle" fill="#9aa3af" fontSize="14">{p.month}</text></g>)}
            </svg>
            <div className="chart-caption"><Bi jp="総ユーザー数" vi="Tổng số người dùng" profile={profile}/></div>
          </div>
        </section>

        <section className="admin-card chart-card">
          <h2><Bi jp="アップロード統計" vi="Thống kê upload" profile={profile}/></h2>
          <div className="bar-chart">{UPLOAD_STATS.map(item => <div className="bar-item" key={item.month}><div className="bar" style={{ height: `${Math.max(28, item.value / 40)}px` }} /><span>{item.month}</span></div>)}</div>
          <div className="chart-caption"><Bi jp="総アップロード数" vi="Tổng upload" profile={profile}/></div>
        </section>

        <section className="admin-card pie-card">
          <h2><Bi jp="テンプレートカテゴリー" vi="Danh mục template" profile={profile}/></h2>
          <div className="admin-pie-wrap">
            <div className="admin-pie" />
            <div className="pie-legend">{(categoryCounts.length ? categoryCounts : TEMPLATE_CATEGORY_STATS).map(item => <div key={item.label}><i style={{ background: item.color }}/><span><Bi jp={`${item.label} ${item.value}%`} vi={`${item.vi} ${item.value}%`} profile={profile}/></span></div>)}</div>
          </div>
        </section>

        <section className="admin-card activity-card">
          <h2><Bi jp="最近の活動" vi="Hoạt động gần đây" profile={profile}/></h2>
          <div className="activity-list">{recent.map((item, idx) => <article key={`${item.title}-${idx}`} className="activity-item"><i style={{ background: item.dot }}/><div><b><Bi jp={item.title} vi={item.vi} profile={profile}/></b><span>{item.detail}</span></div></article>)}</div>
        </section>
      </div>
    </section>
  </AdminLayout>;
}
