/**
 * API client module - kết nối Frontend với Backend
 * Base URL: http://localhost:5000/api
 */
const API_BASE = 'http://localhost:5000/api';

// Lấy token từ sessionStorage
export function getToken() {
  return sessionStorage.getItem('smartslide_token') || '';
}

export function setToken(token) {
  sessionStorage.setItem('smartslide_token', token);
}

export function clearToken() {
  sessionStorage.removeItem('smartslide_token');
  sessionStorage.removeItem('smartslide_user');
}

export function saveUser(user) {
  sessionStorage.setItem('smartslide_user', JSON.stringify(user));
}

export function getUser() {
  const u = sessionStorage.getItem('smartslide_user');
  return u ? JSON.parse(u) : null;
}

// Helper fetch với auth header
async function apiFetch(path, options = {}) {
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // Không set Content-Type cho FormData (browser tự set boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    throw new Error('認証切れ。再ログインしてください。');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'エラーが発生しました');
  return data;
}

// ===== Auth =====
export async function apiLogin(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  saveUser(data.user);
  return data;
}

export async function apiRegister({ username, name, email, password, role }) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, name, email, password, ...(role ? { role } : {}) }),
  });
  return data;
}

export async function apiLogout() {
  try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
  clearToken();
}

// ===== Users =====
export async function apiGetMe() {
  return apiFetch('/users/me');
}

export async function apiUpdateMe(updates) {
  return apiFetch('/users/me', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function apiGetUsers() {
  return apiFetch('/users');
}

// ===== Templates =====
export async function apiGetTemplates({ keyword, category, level } = {}) {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  if (category && category !== 'all') params.set('category', category);
  if (level) params.set('level', level);
  return apiFetch(`/templates?${params.toString()}`);
}

export async function apiGetTemplateDetail(id) {
  return apiFetch(`/templates/${id}`);
}

// ===== Slides (Presentations) =====
export async function apiGetMySlides() {
  return apiFetch('/slides/my');
}

export async function apiCreateSlide({ title, slides, templateId }) {
  return apiFetch('/slides', {
    method: 'POST',
    body: JSON.stringify({ title, slides, templateId }),
  });
}

export async function apiCreateBlankSlide() {
  return apiFetch('/slides/blank', { method: 'POST' });
}

export async function apiCreateFromTemplate(templateId) {
  return apiFetch(`/slides/from-template/${templateId}`, { method: 'POST' });
}

export async function apiGetSlide(id) {
  return apiFetch(`/slides/${id}`);
}

export async function apiUpdateSlide(id, { title, slides, templateId }) {
  return apiFetch(`/slides/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, slides, templateId }),
  });
}

export async function apiDeleteSlide(id) {
  return apiFetch(`/slides/${id}`, { method: 'DELETE' });
}

export async function apiCloneSlide(id) {
  return apiFetch(`/slides/${id}/clone`, { method: 'POST' });
}

// ===== Uploads =====
export async function apiUploadImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  return apiFetch('/uploads/images', { method: 'POST', body: fd });
}

export async function apiUploadMaterial(file, title, level) {
  const fd = new FormData();
  fd.append('file', file);
  if (title) fd.append('title', title);
  if (level) fd.append('level', level);
  return apiFetch('/materials', { method: 'POST', body: fd });
}

// ===== Materials =====
export async function apiGetMaterials({ keyword, type, level } = {}) {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  if (type) params.set('type', type);
  if (level) params.set('level', level);
  return apiFetch(`/materials?${params.toString()}`);
}

export async function apiDeleteMaterial(id) {
  return apiFetch(`/materials/${id}`, { method: 'DELETE' });
}


// ===== Admin FE helpers =====
// Các helper dưới đây chỉ dùng những endpoint backend đã tồn tại.
// Backend hiện chưa có endpoint admin chuyên biệt như GET /users hoặc PUT /templates,
// nên UI admin sẽ lấy dữ liệu thật từ templates/materials/slides/me và lưu thao tác quản trị chưa có API bằng localStorage.

export async function apiAdminBootstrapLogin(email, password) {
  // Cho phép FE tạo tài khoản admin demo bằng endpoint /auth/register hiện có nếu BE chưa seed admin.
  // Không sửa backend; chỉ tận dụng role=admin đã được route register hỗ trợ.
  try {
    return await apiLogin(email, password);
  } catch (loginErr) {
    if (email === 'admin@example.com') {
      try {
        await apiRegister({ username: 'admin', name: 'Admin', email, password, role: 'admin' });
        return await apiLogin(email, password);
      } catch (registerErr) {
        throw loginErr;
      }
    }
    throw loginErr;
  }
}

export async function apiAdminGetDashboardData() {
  const [templatesRes, materialsRes, slidesRes, meRes, usersRes] = await Promise.allSettled([
    apiGetTemplates(),
    apiGetMaterials(),
    apiGetMySlides(),
    apiGetMe(),
    apiGetUsers(),
  ]);

  const templates = templatesRes.status === 'fulfilled' ? (templatesRes.value.templates || []) : [];
  const materials = materialsRes.status === 'fulfilled' ? (materialsRes.value.materials || []) : [];
  const slides = slidesRes.status === 'fulfilled' ? (slidesRes.value.slides || []) : [];
  const me = meRes.status === 'fulfilled' ? meRes.value.user : getUser();
  const users = usersRes.status === 'fulfilled' ? (usersRes.value.users || []) : [];
  const userTotal = usersRes.status === 'fulfilled' ? Number(usersRes.value.total || users.length) : users.length;
  const userCounts = usersRes.status === 'fulfilled' ? (usersRes.value.counts || {}) : {};

  return { templates, materials, slides, me, users, userTotal, userCounts };
}

export async function apiAdminCreateUser({ name, email, role = 'teacher', password = 'password123' }) {
  const usernameBase = String(email || '').split('@')[0] || `user_${Date.now()}`;
  const username = `${usernameBase}_${Date.now().toString().slice(-5)}`;
  return apiRegister({ username, name, email, password, role });
}

export function getLocalAdminUsers(currentUser, backendUsers = []) {
  const saved = sessionStorage.getItem('smartslide_admin_users_cache');
  const cached = saved ? JSON.parse(saved) : [];
  const backend = backendUsers.map(user => ({
    id: user._id || user.id,
    name: user.name || user.username || user.email,
    email: user.email,
    role: user.role || 'teacher',
    status: user.status || 'active',
    uploads: Number(user.uploads || 0),
    joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
    fromBackend: true,
  }));
  const current = !backend.length && currentUser ? [{
    id: currentUser._id || currentUser.id || 'me',
    name: currentUser.name || currentUser.username || 'Admin',
    email: currentUser.email || 'admin@example.com',
    role: currentUser.role || 'admin',
    status: 'active',
    uploads: 0,
    joined: currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
    fromBackend: true,
  }] : [];
  const merged = [...backend, ...current, ...cached];
  return merged.filter((u, index, arr) => arr.findIndex(x => x.email === u.email) === index);
}

export function setLocalAdminUsers(users) {
  const localOnly = users.filter(u => !u.fromBackend);
  sessionStorage.setItem('smartslide_admin_users_cache', JSON.stringify(localOnly));
}

export function getLocalTemplateOverrides() {
  return JSON.parse(sessionStorage.getItem('smartslide_admin_template_overrides') || '{}');
}

export function setLocalTemplateOverride(id, patch) {
  const overrides = getLocalTemplateOverrides();
  overrides[id] = { ...(overrides[id] || {}), ...patch };
  sessionStorage.setItem('smartslide_admin_template_overrides', JSON.stringify(overrides));
  return overrides;
}

export function deleteLocalTemplate(id) {
  const deleted = JSON.parse(sessionStorage.getItem('smartslide_admin_deleted_templates') || '[]');
  if (!deleted.includes(id)) deleted.push(id);
  sessionStorage.setItem('smartslide_admin_deleted_templates', JSON.stringify(deleted));
}

export function getDeletedLocalTemplates() {
  return JSON.parse(sessionStorage.getItem('smartslide_admin_deleted_templates') || '[]');
}
