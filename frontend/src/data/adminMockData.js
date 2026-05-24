export const ADMIN_STATS_FALLBACK = [
  { key: 'users', label: '総ユーザー数', vi: 'Tổng người dùng', value: 0, change: '+0%', tone: 'blue' },
  { key: 'templates', label: 'テンプレート', vi: 'Template', value: 0, change: '+0%', tone: 'pink' },
  { key: 'uploads', label: '総アップロード数', vi: 'Tổng upload', value: 0, change: '+0%', tone: 'green' },
  { key: 'activities', label: '今日のアクティビティ', vi: 'Hoạt động hôm nay', value: 0, change: '+0%', tone: 'purple' },
];

export const USER_GROWTH = [
  { month: 'Jan', value: 360 }, { month: 'Feb', value: 420 }, { month: 'Mar', value: 520 },
  { month: 'Apr', value: 690 }, { month: 'May', value: 980 }, { month: 'Jun', value: 1160 }, { month: 'Jul', value: 1320 },
];

export const UPLOAD_STATS = [
  { month: 'Jan', value: 1120 }, { month: 'Feb', value: 1480 }, { month: 'Mar', value: 1810 },
  { month: 'Apr', value: 2140 }, { month: 'May', value: 2680 }, { month: 'Jun', value: 3220 }, { month: 'Jul', value: 3740 },
];

export const TEMPLATE_CATEGORY_STATS = [
  { label: '教育', vi: 'Giáo dục', value: 34, color: '#f76f95' },
  { label: 'その他', vi: 'Khác', value: 11, color: '#f5a5c7' },
  { label: '文法', vi: 'Ngữ pháp', value: 14, color: '#f8c36a' },
  { label: '文化', vi: 'Văn hóa', value: 19, color: '#98dc90' },
  { label: 'ビジネス', vi: 'Kinh doanh', value: 21, color: '#6ec7e8' },
];

export const RECENT_ACTIVITIES_FALLBACK = [
  { type: 'user', title: '管理者ログイン', vi: 'Admin đăng nhập', detail: 'admin・just now', dot: '#ff6b9a' },
  { type: 'upload', title: 'テンプレート確認', vi: 'Kiểm tra template', detail: 'template list・ready', dot: '#22c55e' },
  { type: 'slide', title: 'スライド管理', vi: 'Quản lý slide', detail: 'presentations・ready', dot: '#3b82f6' },
];

export const INITIAL_ADMIN_USERS = [
  { id: 'demo-1', name: 'Nguyễn Văn A', email: 'nguyenvana@school.vn', role: 'teacher', status: 'active', uploads: 45, joined: '15/11/2024' },
  { id: 'demo-2', name: 'Trần Thị B', email: 'tranthib@university.edu', role: 'teacher', status: 'active', uploads: 32, joined: '22/9/2024' },
  { id: 'demo-3', name: 'Lê Văn C', email: 'levanc@gmail.com', role: 'teacher', status: 'active', uploads: 28, joined: '10/3/2024' },
  { id: 'demo-4', name: 'Phạm Thị D', email: 'phamthid@school.vn', role: 'teacher', status: 'inactive', uploads: 12, joined: '25/1/2024' },
  { id: 'demo-5', name: 'Hoàng Văn E', email: 'hoangvane@center.vn', role: 'teacher', status: 'active', uploads: 56, joined: '5/12/2023' },
  { id: 'demo-6', name: 'Vũ Thị F', email: 'vuthif@institute.edu', role: 'teacher', status: 'suspended', uploads: 8, joined: '14/2/2024' },
];

export const ADMIN_SETTINGS = {
  appName: 'SmartSlide JP',
  siteTitle: '日本語教材プラットフォーム',
  adminEmail: 'admin@smartslide.jp',
  toggles: { userRegistration: true, emailNotification: true, templateAutoApprove: false },
  maxFileSize: 100,
  allowedFormats: 'pptx, ppt, jpg, png, pdf',
  cacheDays: 30,
  version: 'v2.1.0',
  lastUpdate: 'Mar 30, 2025',
  systemStatus: '正常稼働',
};

export function statusLabel(status) {
  const map = {
    active: 'アクティブ',
    inactive: '非アクティブ',
    suspended: '一時停止',
    published: '公開済み',
    draft: '下書き',
    pending: '保留中',
    rejected: '却下',
  };
  return map[status] || status;
}
