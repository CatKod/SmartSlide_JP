import React, { useMemo, useRef, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { sharedMaterials } from '../data/mockData.js';
import { Download, Search, Upload, X, Trash2 } from 'lucide-react';
import { Bi, biText } from '../i18n.jsx';

function isPreviewable(material) {
  return material.mime?.includes('pdf') || material.mime?.startsWith('image/') || material.mime?.startsWith('text/') || material.previewText;
}

export function SharedMaterialsPage({ nav, profile, setProfile }) {
  const [keyword, setKeyword] = useState('');
  const [notice, setNotice] = useState('');
  const [uploadedMaterials, setUploadedMaterials] = useState([]);
  const [preview, setPreview] = useState(null);
  const [deletedMaterialIds, setDeletedMaterialIds] = useState([]);
  const fileInputRef = useRef(null);
  const bi = profile?.language === '日本語 + Tiếng Việt';

  const allMaterials = useMemo(() => [...uploadedMaterials, ...sharedMaterials].filter(m => !deletedMaterialIds.includes(m.id)), [uploadedMaterials, deletedMaterialIds]);
  const rows = useMemo(() => allMaterials.filter(m => `${m.title} ${m.type} ${m.level} ${m.owner}`.toLowerCase().includes(keyword.toLowerCase())), [allMaterials, keyword]);

  async function downloadMaterial(material) {
    try {
      const response = await fetch(encodeURI(material.url));
      if (!response.ok) throw new Error('download failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = material.filename || `${material.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      setNotice(bi ? `${material.title}をダウンロードしました。\nĐã tải xuống ${material.title}.` : `${material.title}をダウンロードしました。`);
    } catch (error) {
      console.error(error);
      setNotice(bi ? 'ダウンロードに失敗しました。もう一度お試しください。\nTải xuống thất bại. Vui lòng thử lại.' : 'ダウンロードに失敗しました。もう一度お試しください。');
    }
  }

  function deleteMaterial(material) {
    if (!window.confirm(bi ? `${material.title}を削除しますか。\nBạn có muốn xóa ${material.title} không?` : `${material.title}を削除しますか。`)) return;
    if (material.uploaded) {
      if (material.url?.startsWith('blob:')) URL.revokeObjectURL(material.url);
      setUploadedMaterials(prev => prev.filter(item => item.id !== material.id));
    } else {
      setDeletedMaterialIds(prev => [...prev, material.id]);
    }
    if (preview?.id === material.id) setPreview(null);
    setNotice(bi ? `${material.title}を削除しました。\nĐã xóa ${material.title}.` : `${material.title}を削除しました。`);
  }

  function uploadMaterial(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const baseMaterial = {
      id: `upload_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      type: file.type.includes('pdf') ? 'PDF' : file.type.startsWith('image/') ? '画像' : file.type.startsWith('text/') ? 'テキスト' : 'ファイル',
      level: '共有',
      owner: `${profile.name}先生`,
      filename: file.name,
      url: objectUrl,
      mime: file.type || 'application/octet-stream',
      uploaded: true,
    };

    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedMaterials(prev => [{ ...baseMaterial, previewText: String(reader.result || '') }, ...prev]);
        setNotice(bi ? `${file.name}をアップロードしました。\nĐã tải lên ${file.name}.` : `${file.name}をアップロードしました。`);
      };
      reader.readAsText(file, 'utf-8');
    } else {
      setUploadedMaterials(prev => [baseMaterial, ...prev]);
      setNotice(bi ? `${file.name}をアップロードしました。\nĐã tải lên ${file.name}.` : `${file.name}をアップロードしました。`);
    }
    event.target.value = '';
  }

  return <AppLayout nav={nav} active="shared" profile={profile} setProfile={setProfile}>
    <section className="page-head material-head">
      <div>
        <h1><Bi jp="共有教材" vi="Tài liệu cộng đồng" profile={profile}/></h1>
        <p><Bi jp="共有された資料を検索・プレビュー・ダウンロードできます。" vi="Bạn có thể tìm kiếm, xem trước và tải xuống tài liệu được chia sẻ." profile={profile}/></p>
      </div>
      <div className="head-actions">
        <button className="pink" onClick={() => fileInputRef.current?.click()}><Upload size={16}/><Bi jp="アップロード" vi="Tải lên" profile={profile}/></button>
        <input ref={fileInputRef} type="file" onChange={uploadMaterial} hidden />
      </div>
    </section>

    <div className="filters shared-filters">
      <input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder={biText(profile, 'コミュニティスライドを検索', 'Tìm tài liệu cộng đồng...')} />
      <select><option>{biText(profile, 'すべてのレベル', 'Tất cả cấp độ')}</option><option>N1</option><option>N2</option><option>N3</option><option>N4</option><option>N5</option></select>
      <select><option>{biText(profile, 'すべての種類', 'Tất cả loại')}</option><option>{biText(profile, 'スライド', 'Bài trình chiếu')}</option><option>PDF</option></select>
      <select><option>{biText(profile, '人気順', 'Theo độ phổ biến')}</option><option>{biText(profile, '新着順', 'Mới nhất')}</option></select>
    </div>
    {notice && <div className="notice spaced">{notice}</div>}

    <section className="panel material-panel">
      {rows.map(m => <div className="material-row" key={m.id}>
        <button className="material-icon clickable" title="プレビュー" onClick={() => setPreview(m)}><Search size={18}/></button>
        <div>
          <b>{m.title}</b>
          <p>{m.type}・{m.level}・{m.owner}{m.uploaded ? (bi ? '・アップロード済み / Đã tải lên' : '・アップロード済み') : ''}</p>
        </div>
        <div className="material-actions">
          <button className="outline" onClick={() => setPreview(m)}><Search size={14}/><Bi jp="プレビュー" vi="Xem trước" profile={profile}/></button>
          <button className="outline" onClick={()=>downloadMaterial(m)}><Download size={14}/><Bi jp="ダウンロード" vi="Tải xuống" profile={profile}/></button>
          <button className="outline danger material-delete" onClick={()=>deleteMaterial(m)}><Trash2 size={14}/><Bi jp="削除" vi="Xóa" profile={profile}/></button>
        </div>
      </div>)}
      {!rows.length && <div className="empty compact"><Bi jp="該当なし" vi="Không có kết quả" profile={profile}/></div>}
    </section>

    {preview && <div className="modal-backdrop" onMouseDown={() => setPreview(null)}>
      <div className="preview-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="preview-head">
          <div><h2>{preview.title}</h2><p>{preview.type}・{preview.level}・{preview.owner}</p></div>
          <button className="icon-button" onClick={() => setPreview(null)}><X size={20}/></button>
        </div>
        <div className="preview-body">
          {preview.mime?.includes('pdf') && <iframe title={preview.title} src={preview.url}></iframe>}
          {preview.mime?.startsWith('image/') && <img src={preview.url} alt={preview.title} />}
          {(preview.mime?.startsWith('text/') || preview.previewText) && <pre>{preview.previewText}</pre>}
          {!isPreviewable(preview) && <div className="empty compact"><Bi jp="このファイル形式はブラウザでプレビューできません。ダウンロードして確認してください。" vi="Định dạng này không xem trước được trên trình duyệt. Vui lòng tải xuống để kiểm tra." profile={profile}/></div>}
        </div>
        <div className="preview-foot">
          <button className="outline" onClick={()=>downloadMaterial(preview)}><Download size={14}/><Bi jp="ダウンロード" vi="Tải xuống" profile={profile}/></button>
          <button className="pink" onClick={() => setPreview(null)}><Bi jp="閉じる" vi="Đóng" profile={profile}/></button>
        </div>
      </div>
    </div>}
  </AppLayout>
}
