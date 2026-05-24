import React, { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { apiGetTemplates, deleteLocalTemplate, getDeletedLocalTemplates, getLocalTemplateOverrides, setLocalTemplateOverride } from '../api.js';
import { Filter, MoreVertical, Plus, Search } from 'lucide-react';
import { Bi, biText } from '../i18n.jsx';
import { statusLabel } from '../data/adminMockData.js';

const categoryOptions = ['すべて', 'grammar', 'kanji', 'vocabulary', 'conversation', 'business', 'culture'];
const statusOptions = ['すべて', 'published', 'draft', 'pending', 'rejected'];

export function AdminTemplatesPage({ nav, profile }) {
  const [templates, setTemplates] = useState([]);
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [category, setCategory] = useState('すべて');
  const [status, setStatus] = useState('すべて');
  const [menuId, setMenuId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState('');

  function loadTemplates() {
    apiGetTemplates().then(res => {
      const deleted = getDeletedLocalTemplates();
      const overrides = getLocalTemplateOverrides();
      const next = (res.templates || [])
        .filter(t => !deleted.includes(t._id || t.id))
        .map(t => ({ ...t, id: t._id || t.id, status: 'published', ...overrides[t._id || t.id], fromBackend: true }));
      const localAdded = JSON.parse(sessionStorage.getItem('smartslide_admin_local_templates') || '[]');
      setTemplates([...localAdded, ...next]);
    }).catch(err => {
      setNotice(`${err.message} / Backend template API không phản hồi.`);
      setTemplates(JSON.parse(sessionStorage.getItem('smartslide_admin_local_templates') || '[]'));
    });
  }

  useEffect(() => { loadTemplates(); }, []);

  function addTemplate(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next = {
      id: `local-${Date.now()}`,
      title: data.get('title'),
      category: data.get('category'),
      categoryLabel: data.get('category'),
      author: data.get('author'),
      downloads: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop',
      fromBackend: false,
    };
    const local = [next, ...JSON.parse(sessionStorage.getItem('smartslide_admin_local_templates') || '[]')];
    sessionStorage.setItem('smartslide_admin_local_templates', JSON.stringify(local));
    setTemplates([next, ...templates]);
    setShowAdd(false);
    setNotice('テンプレートをFE管理リストに追加しました。Backendにはテンプレート作成APIがないため一時保存です。 / Đã thêm template tạm trên FE.');
  }

  function updateStatus(id, nextStatus) {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
    setLocalTemplateOverride(id, { status: nextStatus });
    setMenuId(null);
    setNotice('テンプレート状態を更新しました。 / Đã cập nhật trạng thái template.');
  }

  function removeTemplate(id) {
    if (!confirm(biText(profile, 'このテンプレートを削除しますか。', 'Bạn có chắc muốn xóa template này?'))) return;
    deleteLocalTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    setMenuId(null);
    setNotice('テンプレートを管理画面から非表示にしました。 / Đã ẩn template khỏi màn quản trị.');
  }

  const filtered = useMemo(() => templates.filter(t => {
    const q = query.toLowerCase().trim();
    const matchQuery = !q || `${t.title} ${t.category} ${t.author}`.toLowerCase().includes(q);
    const matchCategory = category === 'すべて' || t.category === category || t.categoryLabel === category;
    const matchStatus = status === 'すべて' || t.status === status;
    return matchQuery && matchCategory && matchStatus;
  }), [templates, query, category, status]);

  const counts = {
    total: templates.length,
    published: templates.filter(t => t.status === 'published').length,
    pending: templates.filter(t => t.status === 'pending').length,
    downloads: templates.reduce((sum, t) => sum + Number(t.downloads || 0), 0),
  };

  return <AdminLayout nav={nav} active="admin_templates" profile={profile}>
    <section className="admin-page">
      <header className="admin-page-head split">
        <div>
          <h1><Bi jp="テンプレート管理" vi="Quản lý template" profile={profile}/></h1>
          <p><Bi jp="バックエンドのテンプレート一覧を取得して管理します。" vi="Lấy danh sách template từ backend và quản lý tại giao diện admin." profile={profile}/></p>
        </div>
        <button className="admin-primary" onClick={() => setShowAdd(true)}><Plus size={16}/><Bi jp="テンプレート追加" vi="Thêm template" profile={profile}/></button>
      </header>
      {notice && <div className="admin-notice">{notice}</div>}

      <div className="admin-toolbar">
        <div className="admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={biText(profile, 'テンプレートを検索...', 'Tìm kiếm template...')} /></div>
        <button className="admin-filter-button" onClick={() => setFilterOpen(v=>!v)}><Filter size={16}/><Bi jp="フィルタリング" vi="Lọc" profile={profile}/></button>
        {filterOpen && <div className="admin-filter-popover">
          <label><Bi jp="カテゴリ" vi="Danh mục" profile={profile}/></label><select value={category} onChange={e=>setCategory(e.target.value)}>{categoryOptions.map(o => <option key={o}>{o}</option>)}</select>
          <label><Bi jp="ステータス" vi="Trạng thái" profile={profile}/></label><select value={status} onChange={e=>setStatus(e.target.value)}>{statusOptions.map(o => <option key={o}>{o === 'すべて' ? o : statusLabel(o)}</option>)}</select>
        </div>}
      </div>

      <div className="admin-mini-stats">
        <div><span><Bi jp="総テンプレート数" vi="Tổng template" profile={profile}/></span><b>{counts.total}</b></div>
        <div><span><Bi jp="公開済み" vi="Đã xuất bản" profile={profile}/></span><b className="ok">{counts.published}</b></div>
        <div><span><Bi jp="レビュー保留中" vi="Chờ duyệt" profile={profile}/></span><b className="warn">{counts.pending}</b></div>
        <div><span><Bi jp="総ダウンロード数" vi="Tổng tải xuống" profile={profile}/></span><b className="pink-text">{counts.downloads.toLocaleString()}</b></div>
      </div>

      <section className="admin-table-card">
        <table className="admin-table template-admin-table">
          <thead><tr><th><Bi jp="テンプレート" vi="Template" profile={profile}/></th><th><Bi jp="カテゴリ" vi="Danh mục" profile={profile}/></th><th><Bi jp="作成者" vi="Người tạo" profile={profile}/></th><th><Bi jp="ダウンロード数" vi="Lượt tải" profile={profile}/></th><th><Bi jp="ステータス" vi="Trạng thái" profile={profile}/></th><th><Bi jp="作成日" vi="Ngày tạo" profile={profile}/></th><th><Bi jp="アクション" vi="Thao tác" profile={profile}/></th></tr></thead>
          <tbody>{filtered.map(t => <tr key={t.id}>
            <td><div className="template-cell"><img src={t.image || t.thumbnailUrl}/><b>{t.title}</b></div></td>
            <td><span className="category-pill">{t.categoryLabel || t.category}</span></td>
            <td>{t.author || '-'}</td><td>⇩ {Number(t.downloads || 0).toLocaleString()}</td>
            <td><span className={`status-badge ${t.status === 'published' ? 'green' : t.status === 'pending' ? 'yellow' : t.status === 'rejected' ? 'red' : 'gray'}`}>{statusLabel(t.status)}</span></td>
            <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
            <td className="action-cell"><button onClick={() => setMenuId(menuId === t.id ? null : t.id)}><MoreVertical size={16}/></button>{menuId === t.id && <div className="admin-action-menu">
              <button onClick={() => updateStatus(t.id, 'published')}><Bi jp="承認" vi="Duyệt" profile={profile}/></button>
              <button onClick={() => updateStatus(t.id, 'pending')}><Bi jp="保留" vi="Chờ duyệt" profile={profile}/></button>
              <button onClick={() => updateStatus(t.id, 'rejected')}><Bi jp="却下" vi="Từ chối" profile={profile}/></button>
              <button onClick={() => removeTemplate(t.id)}><Bi jp="削除" vi="Xóa" profile={profile}/></button>
            </div>}</td>
          </tr>)}</tbody>
        </table>
      </section>

      {showAdd && <div className="admin-modal-backdrop" onClick={() => setShowAdd(false)}>
        <form className="admin-modal" onClick={e=>e.stopPropagation()} onSubmit={addTemplate}>
          <h3><Bi jp="新しいテンプレート追加" vi="Thêm template mới" profile={profile}/></h3>
          <label><Bi jp="テンプレート名" vi="Tên template" profile={profile}/></label><input name="title" required />
          <label><Bi jp="カテゴリ" vi="Danh mục" profile={profile}/></label><select name="category">{categoryOptions.filter(x=>x!=='すべて').map(o=><option key={o}>{o}</option>)}</select>
          <label><Bi jp="作成者" vi="Người tạo" profile={profile}/></label><input name="author" required />
          <div className="modal-actions"><button type="button" onClick={() => setShowAdd(false)}><Bi jp="キャンセル" vi="Hủy" profile={profile}/></button><button className="admin-primary"><Bi jp="追加" vi="Thêm" profile={profile}/></button></div>
        </form>
      </div>}
    </section>
  </AdminLayout>;
}
