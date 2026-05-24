import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { apiGetMaterials, apiUploadMaterial, apiDeleteMaterial, getToken } from '../api.js';
import { Download, Search, Upload, X, Trash2 } from 'lucide-react';
import { Bi, biText, isVietnamese } from '../i18n.jsx';

function isPreviewable(material) {
  return isPdf(material) || isImage(material) || isText(material) || material.previewText;
}

function materialMime(material) {
  return material?.mimeType || material?.mime || '';
}

function materialFileName(material) {
  return `${material?.fileName || material?.fileUrl || material?.title || ''}`;
}

function isPdf(material) {
  return materialMime(material).includes('pdf') || /\.pdf$/i.test(materialFileName(material));
}

function isImage(material) {
  return materialMime(material).startsWith('image/');
}

function isText(material) {
  return materialMime(material).startsWith('text/') || /\.(txt|md|csv)$/i.test(materialFileName(material));
}

function materialPreviewEndpoint(material) {
  return `http://localhost:5000/api/materials/${material._id}/preview`;
}

export function SharedMaterialsPage({ nav, profile, setProfile }) {
  const [keyword, setKeyword] = useState('');
  const [notice, setNotice] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const fileInputRef = useRef(null);
  const bi = isVietnamese(profile);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGetMaterials()
      .then(d => { if (!cancelled) setMaterials(d.materials || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!preview) {
      setPreviewObjectUrl('');
      setPreviewError('');
      setPreviewLoading(false);
      return undefined;
    }

    if (isImage(preview)) {
      setPreviewObjectUrl(`http://localhost:5000${preview.fileUrl}`);
      setPreviewError('');
      setPreviewLoading(false);
      return undefined;
    }

    if (!isPreviewable(preview)) {
      setPreviewObjectUrl('');
      setPreviewError('');
      setPreviewLoading(false);
      return undefined;
    }

    let cancelled = false;
    let objectUrl = '';
    setPreviewObjectUrl('');
    setPreviewError('');
    setPreviewLoading(true);

    fetch(materialPreviewEndpoint(preview), { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(async response => {
        if (!response.ok) {
          const error = new Error('preview failed');
          error.status = response.status;
          throw error;
        }
        return response.blob();
      })
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setPreviewObjectUrl(objectUrl);
      })
      .catch(error => {
        console.error(error);
        if (!cancelled) {
          const isMissingFile = error.status === 404;
          setPreviewError(biText(
            profile,
            isMissingFile
              ? 'ファイルがサーバー上に見つかりません。もう一度アップロードしてください。'
              : 'プレビューを読み込めませんでした。ダウンロードして確認してください。',
            isMissingFile
              ? 'Không tìm thấy file trên server. Vui lòng tải lên lại file PDF.'
              : 'Không tải được bản xem trước. Vui lòng tải xuống để kiểm tra.'
          ));
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [preview, profile]);

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
      setNotice(bi ? `${material.title}をダウンロードしました。\nĐã tải xuống ${material.title}.` : `${material.title}をダウンロードしました。`);
    } catch (error) {
      console.error(error);
      setNotice(bi ? 'ダウンロードに失敗しました。もう一度お試しください。\nTải xuống thất bại. Vui lòng thử lại.' : 'ダウンロードに失敗しました。もう一度お試しください。');
    }
  }

  async function deleteMaterial(material) {
    if (!window.confirm(bi ? `${material.title}を削除しますか。\nBạn có muốn xóa ${material.title} không?` : `${material.title}を削除しますか。`)) return;
    try {
      await apiDeleteMaterial(material._id);
      setMaterials(prev => prev.filter(item => item._id !== material._id));
      if (preview?._id === material._id) setPreview(null);
      setNotice(bi ? `${material.title}を削除しました。\nĐã xóa ${material.title}.` : `${material.title}を削除しました。`);
    } catch (err) {
      setNotice('削除に失敗しました: ' + err.message);
    }
  }

  async function uploadMaterial(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setNotice(bi ? `${file.name}をアップロード中...\nĐang tải lên ${file.name}...` : `${file.name}をアップロード中...`);
    try {
      // Gọi API upload
      const res = await apiUploadMaterial(file, file.name.replace(/\.[^/.]+$/, ''), '共有');
      // Lấy lại danh sách material (hoặc thêm luôn res vào danh sách)
      const listData = await apiGetMaterials();
      setMaterials(listData.materials || []);
      setNotice(bi ? `${file.name}をアップロードしました。\nĐã tải lên ${file.name}.` : `${file.name}をアップロードしました。`);
    } catch (err) {
      setNotice('アップロードに失敗しました: ' + err.message);
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
      {loading ? <div className="empty">読み込み中...</div> : rows.map(m => <div className="material-row" key={m._id}>
        <button className="material-icon clickable" title="プレビュー" onClick={() => setPreview(m)}><Search size={18}/></button>
        <div>
          <b>{m.title}</b>
          <p>{m.type}・{m.level}・{m.ownerName}</p>
        </div>
        <div className="material-actions">
          <button className="outline" onClick={() => setPreview(m)}><Search size={14}/><Bi jp="プレビュー" vi="Xem trước" profile={profile}/></button>
          <button className="outline" onClick={()=>downloadMaterial(m)}><Download size={14}/><Bi jp="ダウンロード" vi="Tải xuống" profile={profile}/></button>
          <button className="outline danger material-delete" onClick={()=>deleteMaterial(m)}><Trash2 size={14}/><Bi jp="削除" vi="Xóa" profile={profile}/></button>
        </div>
      </div>)}
      {!loading && !rows.length && <div className="empty compact"><Bi jp="該当なし" vi="Không có kết quả" profile={profile}/></div>}
    </section>

    {preview && <div className="modal-backdrop" onMouseDown={() => setPreview(null)}>
      <div className="preview-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="preview-head">
          <div><h2>{preview.title}</h2><p>{preview.type}・{preview.level}・{preview.ownerName}</p></div>
          <button className="icon-button" onClick={() => setPreview(null)}><X size={20}/></button>
        </div>
        <div className="preview-body">
          {previewLoading && <div className="empty compact"><Bi jp="プレビューを読み込み中..." vi="Đang tải bản xem trước..." profile={profile}/></div>}
          {previewError && <div className="empty compact">{previewError}</div>}
          {!previewLoading && !previewError && isPdf(preview) && previewObjectUrl && <iframe title={preview.title} src={`${previewObjectUrl}#toolbar=1&navpanes=0`}></iframe>}
          {!previewLoading && !previewError && isImage(preview) && previewObjectUrl && <img src={previewObjectUrl} alt={preview.title} />}
          {!previewLoading && !previewError && isText(preview) && previewObjectUrl && <iframe title={preview.title} src={previewObjectUrl}></iframe>}
          {!previewLoading && !previewError && !isPreviewable(preview) && <div className="empty compact"><Bi jp="このファイル形式はブラウザでプレビューできません。ダウンロードして確認してください。" vi="Định dạng này không xem trước được trên trình duyệt. Vui lòng tải xuống để kiểm tra." profile={profile}/></div>}
        </div>
        <div className="preview-foot">
          <button className="outline" onClick={()=>downloadMaterial(preview)}><Download size={14}/><Bi jp="ダウンロード" vi="Tải xuống" profile={profile}/></button>
          <button className="pink" onClick={() => setPreview(null)}><Bi jp="閉じる" vi="Đóng" profile={profile}/></button>
        </div>
      </div>
    </div>}
  </AppLayout>
}
