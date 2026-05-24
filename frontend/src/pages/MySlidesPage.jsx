import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { apiGetMySlides, apiDeleteSlide, apiCloneSlide, apiCreateSlide } from '../api.js';
import { Copy, Download, Edit3, FileDown, FileUp, Plus, Search, Trash2 } from 'lucide-react';
import { Bi, biText } from '../i18n.jsx';

function formatDeckDate(deck) {
  const dateStr = deck.updatedAt || deck.createdAt;
  if (!dateStr) return '未保存';
  try {
    return new Date(dateStr).toLocaleString('ja-JP');
  } catch {
    return dateStr;
  }
}

function sanitizeFileName(name) {
  return String(name || 'slide').replace(/[\\/:*?"<>|]/g, '_');
}

function normalizeElementSlide(slide) {
  if (Array.isArray(slide.elements)) return slide.elements;
  const elements = [
    {
      id: `title_${slide.id || Date.now()}`,
      type: 'text',
      isTitle: true,
      x: 7,
      y: 7,
      w: 72,
      h: 12,
      content: slide.title || '無題のスライド',
      bold: true,
      fontSize: 32,
      align: 'left',
      color: '#201827',
    },
  ];
  if (slide.body) {
    elements.push({
      id: `body_${slide.id || Date.now()}`,
      type: 'text',
      x: 14,
      y: 28,
      w: 64,
      h: 24,
      content: slide.body,
      fontSize: 20,
      align: 'left',
      color: '#201827',
    });
  }
  if (slide.image) {
    elements.push({
      id: `image_${slide.id || Date.now()}`,
      type: 'image',
      x: 28,
      y: 58,
      w: 44,
      h: 28,
      src: slide.image,
    });
  }
  return elements;
}

function createDownloadSlideNode(slide) {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = '960px';
  wrapper.style.height = '540px';
  wrapper.style.background = '#ffffff';
  wrapper.style.overflow = 'hidden';
  wrapper.style.fontFamily = 'Inter, "Noto Sans JP", Arial, sans-serif';
  wrapper.style.color = '#201827';

  const bg = slide.backgroundImage || slide.background;
  if (bg) {
    wrapper.style.backgroundImage = `url("${bg}")`;
    wrapper.style.backgroundSize = 'cover';
    wrapper.style.backgroundPosition = 'center';
  }

  const elements = normalizeElementSlide(slide);
  elements.forEach(el => {
    const node = document.createElement(el.type === 'image' ? 'img' : 'div');
    node.style.position = 'absolute';
    node.style.left = `${Number(el.x || 0)}%`;
    node.style.top = `${Number(el.y || 0)}%`;
    node.style.width = `${Number(el.w || 30)}%`;
    node.style.height = `${Number(el.h || 12)}%`;
    node.style.boxSizing = 'border-box';

    if (el.type === 'image') {
      node.src = el.src || el.image || '';
      node.crossOrigin = 'anonymous';
      node.style.objectFit = 'cover';
      node.style.borderRadius = '10px';
    } else {
      node.textContent = el.content || el.text || '';
      node.style.whiteSpace = 'pre-wrap';
      node.style.fontSize = `${Number(el.fontSize || 20)}px`;
      node.style.fontWeight = el.bold ? '800' : '400';
      node.style.fontStyle = el.italic ? 'italic' : 'normal';
      node.style.textDecoration = el.underline ? 'underline' : 'none';
      node.style.textAlign = el.align || 'left';
      node.style.color = el.color || '#201827';
      node.style.padding = '10px';
    }
    wrapper.appendChild(node);
  });

  document.body.appendChild(wrapper);
  return wrapper;
}

function waitForNodeImages(node) {
  const images = Array.from(node.querySelectorAll('img'));
  return Promise.all(images.map(img => new Promise(resolve => {
    if (!img.src || img.complete) return resolve();
    img.onload = resolve;
    img.onerror = resolve;
  })));
}

function exportJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function MySlidesPage({ nav, profile, setProfile }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const importRef = useRef(null);

  // Fetch slides từ backend
  const fetchDecks = () => {
    setLoading(true);
    apiGetMySlides()
      .then(data => setDecks(data.slides || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const rows = useMemo(() => {
    let list = decks.map(d => ({ ...d, status: d.status || '保存済み' }));
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(d => `${d.title} ${d.status} ${formatDeckDate(d)}`.toLowerCase().includes(q));
    if (statusFilter !== 'all') list = list.filter(d => d.status === statusFilter);
    list.sort((a, b) => {
      if (sortBy === 'title') return String(a.title).localeCompare(String(b.title), 'ja');
      if (sortBy === 'slides') return (b.slides?.length || 0) - (a.slides?.length || 0);
      return String(a.updatedAt || '').localeCompare(String(b.updatedAt || ''));
    });
    // For "newest" sorting, sort descending by date:
    if (sortBy === 'newest') {
      list.reverse();
    }
    return list;
  }, [decks, query, statusFilter, sortBy]);

  async function remove(id) {
    if (!window.confirm(biText(profile, 'このスライドを削除しますか？', 'Bạn có muốn xóa bài trình chiếu này không?'))) return;
    try {
      await apiDeleteSlide(id);
      setDecks(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  async function copyDeck(id) {
    try {
      await apiCloneSlide(id);
      fetchDecks();
    } catch (err) {
      alert(err.message);
    }
  }

  async function downloadDeck(deck) {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const slides = deck.slides?.length ? deck.slides : [];
      if (slides.length === 0) {
        alert(biText(profile, 'スライドが空です。', 'Bài trình chiếu trống.'));
        return;
      }
      for (let i = 0; i < slides.length; i += 1) {
        const node = createDownloadSlideNode(slides[i]);
        try {
          await waitForNodeImages(node);
          const canvas = await html2canvas(node, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: false,
            imageTimeout: 2500,
            logging: false,
          });
          if (i > 0) pdf.addPage('a4', 'landscape');
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 297, 210);
        } finally {
          node.remove();
        }
      }
      pdf.save(`${sanitizeFileName(deck.title || 'slide')}.pdf`);
    } catch (error) {
      console.error(error);
      alert(biText(
        profile,
        'PDFの作成に失敗しました。画像URLが外部サイトの場合は、画像アップロードを使ってください。',
        'Tạo PDF thất bại. Nếu ảnh từ liên kết bên ngoài, vui lòng dùng ảnh tải lên.'
      ));
    }
  }

  function exportAll() {
    exportJson('smartslide_my_slides.json', decks);
  }

  async function importSlides(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result || '[]'));
        const imported = Array.isArray(data) ? data : [data];
        for (const item of imported) {
          await apiCreateSlide({
            title: item.title || 'Imported Slide',
            slides: item.slides || [],
            templateId: item.templateId || null
          });
        }
        fetchDecks();
        alert(biText(profile, 'スライドをインポートしました。', 'Đã nhập bài trình chiếu.'));
      } catch (err) {
        alert(biText(profile, 'ファイル形式が正しくありません。', 'Tệp không đúng định dạng.'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return <AppLayout nav={nav} active="slides" profile={profile} setProfile={setProfile}>
    <section className="page-head split-head myslides-head">
      <div>
        <h1><Bi jp="マイスライド" vi="Slide của tôi" profile={profile}/></h1>
        <p><Bi jp="作成・保存した教材スライドを管理できます。" vi="Quản lý các slide giáo án đã tạo và lưu." profile={profile}/></p>
      </div>
      <div className="myslides-head-actions">
        <input ref={importRef} type="file" accept=".json" hidden onChange={importSlides}/>
        <button className="outline" onClick={() => importRef.current?.click()}><FileUp size={16}/><Bi jp="インポート" vi="Import" profile={profile}/></button>
        <button className="outline" onClick={exportAll}><FileDown size={16}/><Bi jp="エクスポート" vi="Export" profile={profile}/></button>
        <button className="pink" onClick={() => nav('editor', { deckId: null })}><Plus size={16}/><Bi jp="新規作成" vi="Tạo mới" profile={profile}/></button>
      </div>
    </section>

    <section className="myslides-controls">
      <div className="myslides-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={biText(profile, 'スライドを検索', 'Tìm slide')} /></div>
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
        <option value="all">{biText(profile, 'すべての状態', 'Tất cả trạng thái')}</option>
        <option value="保存済み">{biText(profile, '保存済み', 'Đã lưu')}</option>
        <option value="サンプル">{biText(profile, 'サンプル', 'Mẫu')}</option>
      </select>
      <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
        <option value="newest">{biText(profile, '更新日順', 'Theo ngày cập nhật')}</option>
        <option value="title">{biText(profile, '名前順', 'Theo tên')}</option>
        <option value="slides">{biText(profile, 'ページ数順', 'Theo số trang')}</option>
      </select>
    </section>

    <section className="slide-table-wrap">
      <div className="slide-table-head">
        <span><Bi jp="スライド名" vi="Tên slide" profile={profile}/></span>
        <span><Bi jp="状態" vi="Trạng thái" profile={profile}/></span>
        <span><Bi jp="最終更新" vi="Cập nhật" profile={profile}/></span>
        <span><Bi jp="ページ数" vi="Số trang" profile={profile}/></span>
        <span><Bi jp="操作" vi="Thao tác" profile={profile}/></span>
      </div>
      {loading ? <div className="empty">読み込み中...</div> : (
        <>
          {rows.map(deck => <article className="slide-row" key={deck._id}>
            <button className="slide-row-title slide-row-link" onClick={() => nav('editor', { deckId: deck._id })}>
              <b>{deck.title}</b><small>{deck.slides?.[0]?.title || deck.title}</small>
            </button>
            <div><span className="status-pill saved">{deck.status}</span></div>
            <div className="muted">{formatDeckDate(deck)}</div>
            <div className="muted">{deck.slides?.length || 0}</div>
            <div className="row-actions icon-actions">
              <button className="outline icon-only" title={biText(profile, '編集', 'Sửa')} aria-label={biText(profile, '編集', 'Sửa')} onClick={() => nav('editor', { deckId: deck._id })}><Edit3 size={14}/></button>
              <button className="outline icon-only" title={biText(profile, 'ダウンロード', 'Tải')} aria-label={biText(profile, 'ダウンロード', 'Tải')} onClick={() => downloadDeck(deck)}><Download size={14}/></button>
              <button className="outline icon-only" title={biText(profile, 'コピー', 'Sao chép')} aria-label={biText(profile, 'コピー', 'Sao chép')} onClick={() => copyDeck(deck._id)}><Copy size={14}/></button>
              <button className="outline danger icon-only" title={biText(profile, '削除', 'Xóa')} aria-label={biText(profile, '削除', 'Xóa')} onClick={() => remove(deck._id)}><Trash2 size={14}/></button>
            </div>
          </article>)}
          {rows.length === 0 && <div className="empty"><Bi jp="条件に一致するスライドがありません。" vi="Không có bài trình chiếu phù hợp với điều kiện tìm kiếm." profile={profile}/></div>}
        </>
      )}
    </section>
  </AppLayout>
}
