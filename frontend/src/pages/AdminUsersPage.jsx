import React, { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { apiAdminCreateUser, apiAdminGetDashboardData, getLocalAdminUsers, setLocalAdminUsers } from '../api.js';
import { INITIAL_ADMIN_USERS, statusLabel } from '../data/adminMockData.js';
import { Filter, MoreVertical, Plus, Search } from 'lucide-react';
import { Bi, biText } from '../i18n.jsx';
import { AdminSelect } from '../components/AdminSelect.jsx';

const statusOptions = [
  { value: 'all', label: 'すべて' },
  { value: 'active', label: 'アクティブ' },
  { value: 'inactive', label: '非アクティブ' },
  { value: 'suspended', label: '一時停止' },
];

export function AdminUsersPage({ nav, profile, setProfile }) {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [menuId, setMenuId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    apiAdminGetDashboardData().then(res => {
      const merged = getLocalAdminUsers(res.me, res.users);
      setUsers(merged.length ? merged : INITIAL_ADMIN_USERS);
    }).catch(() => setUsers(getLocalAdminUsers(profile).length ? getLocalAdminUsers(profile) : INITIAL_ADMIN_USERS));
  }, []);

  function persist(next) {
    setUsers(next);
    setLocalAdminUsers(next);
  }

  async function addUser(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      role: String(data.get('role') || 'teacher'),
      password: String(data.get('password') || 'password123'),
    };
    try {
      const res = await apiAdminCreateUser(payload);
      const u = res.user;
      const next = [{
        id: u._id || Date.now(),
        name: u.name,
        email: u.email,
        role: u.role,
        status: 'active',
        uploads: 0,
        joined: new Date().toLocaleDateString('vi-VN'),
        fromBackend: true,
      }, ...users];
      persist(next);
      setNotice('バックエンドにユーザーを登録しました。 / Đã tạo user trên backend.');
    } catch (err) {
      const next = [{ id: Date.now(), ...payload, status: 'active', uploads: 0, joined: new Date().toLocaleDateString('vi-VN') }, ...users];
      persist(next);
      setNotice(`${err.message} / Backend tạo user không thành công, đã giữ tạm trên FE.`);
    }
    setShowAdd(false);
  }

  function updateStatus(id, nextStatus) {
    persist(users.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    setMenuId(null);
    setNotice('ユーザー状態を更新しました。 / Đã cập nhật trạng thái user.');
  }

  function removeUser(id) {
    if (!confirm(biText(profile, 'このユーザーを削除しますか。', 'Bạn có chắc muốn xóa người dùng này?'))) return;
    persist(users.filter(u => u.id !== id));
    setMenuId(null);
    setNotice('ユーザーをリストから削除しました。 / Đã xóa user khỏi danh sách FE.');
  }

  const filtered = useMemo(() => users.filter(u => {
    const q = query.toLowerCase().trim();
    const matchQuery = !q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q);
    const matchStatus = status === 'all' || u.status === status;
    return matchQuery && matchStatus;
  }), [users, query, status]);

  const counts = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  return <AdminLayout nav={nav} active="admin_users" profile={profile} setProfile={setProfile}>
    <section className="admin-page">
      <header className="admin-page-head split">
        <div>
          <h1><Bi jp="ユーザー管理" vi="Quản lý người dùng" profile={profile}/></h1>
          <p><Bi jp="既存の認証APIを使ってユーザー追加を行い、一覧を管理します。" vi="Thêm user bằng API auth hiện có và quản lý danh sách." profile={profile}/></p>
        </div>
        <button className="admin-primary" onClick={() => setShowAdd(true)}><Plus size={16}/><Bi jp="ユーザー追加" vi="Thêm người dùng" profile={profile}/></button>
      </header>
      {notice && <div className="admin-notice">{notice}</div>}

      <div className="admin-toolbar">
        <div className="admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={biText(profile, 'ユーザーを検索...', 'Tìm kiếm người dùng...')} /></div>
        <div className="admin-filter admin-filter-inline"><Filter size={16}/>
          <AdminSelect
            value={status}
            options={statusOptions}
            onChange={setStatus}
            className="compact"
          />
        </div>
      </div>

      <div className="admin-mini-stats">
        <div><span><Bi jp="総ユーザー数" vi="Tổng người dùng" profile={profile}/></span><b>{counts.total}</b></div>
        <div><span><Bi jp="アクティブ" vi="Đang hoạt động" profile={profile}/></span><b className="ok">{counts.active}</b></div>
        <div><span><Bi jp="非アクティブ" vi="Không hoạt động" profile={profile}/></span><b>{counts.inactive}</b></div>
        <div><span><Bi jp="一時停止" vi="Tạm dừng" profile={profile}/></span><b className="danger-text">{counts.suspended}</b></div>
      </div>

      <section className="admin-table-card">
        <table className="admin-table">
          <thead><tr><th><Bi jp="ユーザー" vi="Người dùng" profile={profile}/></th><th><Bi jp="メール" vi="Email" profile={profile}/></th><th><Bi jp="役割" vi="Vai trò" profile={profile}/></th><th><Bi jp="ステータス" vi="Trạng thái" profile={profile}/></th><th><Bi jp="アップロード数" vi="Số upload" profile={profile}/></th><th><Bi jp="参加日" vi="Ngày tham gia" profile={profile}/></th><th><Bi jp="アクション" vi="Thao tác" profile={profile}/></th></tr></thead>
          <tbody>{filtered.map(u => <tr key={u.id}>
            <td><div className="user-cell"><span>{String(u.name || u.email || 'U').slice(0,1).toUpperCase()}</span><b>{u.name}</b></div></td>
            <td>{u.email}</td><td>{u.role}</td>
            <td><span className={`status-badge ${u.status === 'active' ? 'green' : u.status === 'suspended' ? 'red' : 'gray'}`}>{statusLabel(u.status)}</span></td>
            <td>{u.uploads || 0}</td><td>{u.joined}</td>
            <td className="action-cell"><button onClick={() => setMenuId(menuId === u.id ? null : u.id)}><MoreVertical size={16}/></button>{menuId === u.id && <div className="admin-action-menu">
              <button onClick={() => updateStatus(u.id, 'active')}><Bi jp="アクティブにする" vi="Kích hoạt" profile={profile}/></button>
              <button onClick={() => updateStatus(u.id, 'suspended')}><Bi jp="一時停止" vi="Tạm dừng" profile={profile}/></button>
              <button onClick={() => updateStatus(u.id, 'inactive')}><Bi jp="非アクティブ" vi="Không hoạt động" profile={profile}/></button>
              <button onClick={() => removeUser(u.id)}><Bi jp="削除" vi="Xóa" profile={profile}/></button>
            </div>}</td>
          </tr>)}</tbody>
        </table>
        <div className="table-footer"><span>{biText(profile, `表示中 ${filtered.length} / ${users.length} ユーザー`, `Đang hiển thị ${filtered.length} / ${users.length} người dùng`)}</span><div><button disabled>前へ</button><button>次へ</button></div></div>
      </section>

      {showAdd && <div className="admin-modal-backdrop" onClick={() => setShowAdd(false)}>
        <form className="admin-modal" onClick={e=>e.stopPropagation()} onSubmit={addUser}>
          <h3><Bi jp="新しいユーザー追加" vi="Thêm người dùng mới" profile={profile}/></h3>
          <label><Bi jp="名前" vi="Tên" profile={profile}/></label><input name="name" required />
          <label>Email</label><input name="email" type="email" required />
          <label><Bi jp="初期パスワード" vi="Mật khẩu ban đầu" profile={profile}/></label><input name="password" defaultValue="password123" />
          <label><Bi jp="役割" vi="Vai trò" profile={profile}/></label><select name="role"><option value="teacher">teacher</option><option value="admin">admin</option><option value="student">student</option></select>
          <div className="modal-actions"><button type="button" onClick={() => setShowAdd(false)}><Bi jp="キャンセル" vi="Hủy" profile={profile}/></button><button className="admin-primary"><Bi jp="追加" vi="Thêm" profile={profile}/></button></div>
        </form>
      </div>}
    </section>
  </AdminLayout>;
}
