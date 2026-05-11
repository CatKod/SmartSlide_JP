import React, { useMemo, useRef, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { sharedMaterials } from '../data/mockData.js';
import { Download, Search, Upload, X, Trash2 } from 'lucide-react';

function isPreviewable(material) {
  return material.mime?.includes('pdf') || material.mime?.startsWith('image/') || material.mime?.startsWith('text/') || material.previewText;
}

export function SharedMaterialsPage({ nav, profile }) {
  const [keyword, setKeyword] = useState('');
  const [notice, setNotice] = useState('');
  const [uploadedMaterials, setUploadedMaterials] = useState([]);
  const [preview, setPreview] = useState(null);
  const [deletedMaterialIds, setDeletedMaterialIds] = useState([]);
  const fileInputRef = useRef(null);

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
      setNotice(`${material.title}をダウンロードしました。`);
    } catch (error) {
      console.error(error);
      setNotice('ダウンロードに失敗しました。もう一度お試しください。');
    }
  }


  function deleteMaterial(material) {
    if (!window.confirm(`${material.title}を削除しますか。`)) return;
    if (material.uploaded) {
      if (material.url?.startsWith('blob:')) URL.revokeObjectURL(material.url);
      setUploadedMaterials(prev => prev.filter(item => item.id !== material.id));
    } else {
      setDeletedMaterialIds(prev => [...prev, material.id]);
    }
    if (preview?.id === material.id) setPreview(null);
    setNotice(`${material.title}を削除しました。`);
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
        setNotice(`${file.name}をアップロードしました。`);
      };
      reader.readAsText(file, 'utf-8');
    } else {
      setUploadedMaterials(prev => [baseMaterial, ...prev]);
      setNotice(`${file.name}をアップロードしました。`);
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
      {rows.map(m => <div className="material-row" key={m.id}>
        <button className="material-icon clickable" title="プレビュー" onClick={() => setPreview(m)}><Search size={18}/></button>
        <div>
          <b>{m.title}</b>
          <p>{m.type}・{m.level}・{m.owner}{m.uploaded ? '・アップロード済み' : ''}</p>
        </div>
        <div className="material-actions">
          <button className="outline" onClick={() => setPreview(m)}><Search size={14}/>プレビュー</button>
          <button className="outline" onClick={()=>downloadMaterial(m)}><Download size={14}/>ダウンロード</button>
          <button className="outline danger material-delete" onClick={()=>deleteMaterial(m)}><Trash2 size={14}/>削除</button>
        </div>
      </div>)}
      {!rows.length && <div className="empty compact">該当なし</div>}
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
          {!isPreviewable(preview) && <div className="empty compact">このファイル形式はブラウザでプレビューできません。ダウンロードして確認してください。</div>}
        </div>
        <div className="preview-foot">
          <button className="outline" onClick={()=>downloadMaterial(preview)}><Download size={14}/>ダウンロード</button>
          <button className="pink" onClick={() => setPreview(null)}>閉じる</button>
        </div>
      </div>
    </div>}
  </AppLayout>
}
