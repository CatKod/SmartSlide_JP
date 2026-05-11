import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { apiGetMaterials, apiUploadMaterial, apiDeleteMaterial, getToken } from '../api.js';
import { Download, Search, Upload, X, Trash2 } from 'lucide-react';

function isPreviewable(material) {
  return material.mime?.includes('pdf') || material.mime?.startsWith('image/') || material.mime?.startsWith('text/') || material.previewText;
}

export function SharedMaterialsPage({ nav, profile }) {
  const [keyword, setKeyword] = useState('');
  const [notice, setNotice] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGetMaterials()
      .then(d => { if (!cancelled) setMaterials(d.materials || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => materials.filter(m => `${m.title} ${m.type} ${m.level} ${m.ownerName}`.toLowerCase().includes(keyword.toLowerCase())), [materials, keyword]);

  async function downloadMaterial(material) {
    try {
      const url = `http://localhost:5000/api/materials/${material._id}/download`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!response.ok) throw new Error('download failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = material.fileName || `${material.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      setNotice(`${material.title}をダウンロードしました。`);
    } catch (error) {
      console.error(error);
      setNotice('ダウンロードに失敗しました。もう一度お試しください。');
    }
  }


  async function deleteMaterial(material) {
    if (!window.confirm(`${material.title}を削除しますか。`)) return;
    try {
      await apiDeleteMaterial(material._id);
      setMaterials(prev => prev.filter(item => item._id !== material._id));
      if (preview?._id === material._id) setPreview(null);
      setNotice(`${material.title}を削除しました。`);
    } catch (err) {
      setNotice('削除に失敗しました: ' + err.message);
    }
  }

  async function uploadMaterial(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setNotice(`${file.name}をアップロード中...`);
    try {
      // Gọi API upload
      const res = await apiUploadMaterial(file, file.name.replace(/\.[^/.]+$/, ''), '共有');
      // Lấy lại danh sách material (hoặc thêm luôn res vào danh sách)
      const listData = await apiGetMaterials();
      setMaterials(listData.materials || []);
      setNotice(`${file.name}をアップロードしました。`);
    } catch (err) {
      setNotice('アップロードに失敗しました: ' + err.message);
    }
    event.target.value = '';
  }

  return <AppLayout nav={nav} active="shared" profile={profile}>
    <section className="page-head material-head">
      <div>
        <h1>共有教材</h1>
        <p>チーム内で共有されたPDF教材を検索・プレビュー・ダウンロードできます。</p>
      </div>
      <div className="head-actions">
        <button className="pink" onClick={() => fileInputRef.current?.click()}><Upload size={16}/>教材をアップロード</button>
        <input ref={fileInputRef} type="file" onChange={uploadMaterial} hidden />
      </div>
    </section>

    <div className="filters"><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="共有教材を検索" /></div>
    {notice && <div className="notice spaced">{notice}</div>}

    <section className="panel material-panel">
      {loading ? <div className="empty">読み込み中...</div> : rows.map(m => <div className="material-row" key={m._id}>
        <button className="material-icon clickable" title="プレビュー" onClick={() => setPreview(m)}><Search size={18}/></button>
        <div>
          <b>{m.title}</b>
          <p>{m.type}・{m.level}・{m.ownerName}</p>
        </div>
        <div className="material-actions">
          <button className="outline" onClick={() => setPreview(m)}><Search size={14}/>プレビュー</button>
          <button className="outline" onClick={()=>downloadMaterial(m)}><Download size={14}/>ダウンロード</button>
          <button className="outline danger material-delete" onClick={()=>deleteMaterial(m)}><Trash2 size={14}/>削除</button>
        </div>
      </div>)}
      {!loading && !rows.length && <div className="empty compact">該当なし</div>}
    </section>

    {preview && <div className="modal-backdrop" onMouseDown={() => setPreview(null)}>
      <div className="preview-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="preview-head">
          <div><h2>{preview.title}</h2><p>{preview.type}・{preview.level}・{preview.ownerName}</p></div>
          <button className="icon-button" onClick={() => setPreview(null)}><X size={20}/></button>
        </div>
        <div className="preview-body">
          {preview.mimeType?.includes('pdf') && <iframe title={preview.title} src={`http://localhost:5000/api/materials/${preview._id}/preview`}></iframe>}
          {preview.mimeType?.startsWith('image/') && <img src={`http://localhost:5000${preview.fileUrl}`} alt={preview.title} />}
          {preview.mimeType?.startsWith('text/') && <iframe title={preview.title} src={`http://localhost:5000/api/materials/${preview._id}/preview`}></iframe>}
          {!preview.mimeType?.includes('pdf') && !preview.mimeType?.startsWith('image/') && !preview.mimeType?.startsWith('text/') && <div className="empty compact">このファイル形式はブラウザでプレビューできません。ダウンロードして確認してください。</div>}
        </div>
        <div className="preview-foot">
          <button className="outline" onClick={()=>downloadMaterial(preview)}><Download size={14}/>ダウンロード</button>
          <button className="pink" onClick={() => setPreview(null)}>閉じる</button>
        </div>
      </div>
    </div>}
  </AppLayout>
}
