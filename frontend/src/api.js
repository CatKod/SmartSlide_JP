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

export async function apiRegister({ username, name, email, password }) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, name, email, password }),
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

// ===== AI Assistant =====
export async function apiCallAIChat(prompt) {
  return apiFetch('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

