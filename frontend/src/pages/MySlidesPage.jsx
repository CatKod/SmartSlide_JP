import React, { useMemo, useRef, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { defaultSlides } from '../data/mockData.js';
import { Copy, Download, Edit3, FileDown, FileUp, Plus, Search, Trash2 } from 'lucide-react';
import { Bi, biText } from '../i18n.jsx';

function deckDate(deck) {
  return deck.updatedAt || deck.createdAt || '未保存';
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

export function MySlidesPage({ nav, profile, setProfile }) {
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const importRef = useRef(null);
  const decks = useMemo(() => JSON.parse(localStorage.getItem('smartslide_saved_decks') || '[]'), [version]);
  const demoDeck = { id:'demo', title:'N3文法：〜てくる', updatedAt:'デモデータ', status:'サンプル', slides: defaultSlides };
  const baseRows = decks.length ? decks : [demoDeck];
  const rows = useMemo(() => {
    let list = baseRows.map(d => ({ ...d, status: d.status || (d.id === 'demo' ? 'サンプル' : '保存済み') }));
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(d => `${d.title} ${d.status} ${deckDate(d)}`.toLowerCase().includes(q));
    if (statusFilter !== 'all') list = list.filter(d => d.status === statusFilter);
    list.sort((a,b) => {
      if (sortBy === 'title') return String(a.title).localeCompare(String(b.title), 'ja');
      if (sortBy === 'slides') return (b.slides?.length || 0) - (a.slides?.length || 0);
      return String(deckDate(b)).localeCompare(String(deckDate(a)), 'ja');
    });
    return list;
  }, [baseRows, query, statusFilter, sortBy]);

  function persist(next) {
    localStorage.setItem('smartslide_saved_decks', JSON.stringify(next));
    setVersion(v => v + 1);
  }
  function remove(id) {
    persist(decks.filter(d => d.id !== id));
  }
  function copyDeck(deck) {
    if (deck.id === 'demo') {
      const copied = { ...deck, id: `deck_${Date.now()}`, title: `${deck.title} コピー`, status: '保存済み', updatedAt: new Date().toLocaleString('ja-JP') };
      persist([copied, ...decks]);
      return;
    }
    const copied = { ...deck, id: `deck_${Date.now()}`, title: `${deck.title} コピー`, status: '保存済み', updatedAt: new Date().toLocaleString('ja-JP') };
    persist([copied, ...decks]);
  }
  async function downloadDeck(deck) {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const slides = deck.slides?.length ? deck.slides : defaultSlides;
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
      alert(profile?.language === '日本語 + Tiếng Việt'
        ? 'PDFの作成に失敗しました。画像URLが外部サイトの場合は、画像アップロードを使ってください。\nKhông thể tạo PDF. Nếu ảnh là link ngoài, hãy dùng ảnh upload từ máy.'
        : 'PDFの作成に失敗しました。画像URLが外部サイトの場合は、画像アップロードを使ってください。');
    }
  }
  function exportAll() {
    exportJson('smartslide_my_slides.json', decks);
  }
  function importSlides(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || '[]'));
        const imported = Array.isArray(data) ? data : [data];
        const normalized = imported.map((d, i) => ({ ...d, id: d.id || `import_${Date.now()}_${i}`, status: d.status || '保存済み', updatedAt: new Date().toLocaleString('ja-JP') }));
        persist([...normalized, ...decks]);
        alert(profile?.language === '日本語 + Tiếng Việt' ? 'スライドをインポートしました。\nĐã import slide.' : 'スライドをインポートしました。');
      } catch {
        alert(profile?.language === '日本語 + Tiếng Việt' ? 'ファイル形式が正しくありません。\nFile không đúng định dạng.' : 'ファイル形式が正しくありません。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return <AppLayout nav={nav} active="slides" profile={profile} setProfile={setProfile}>
    <section className="page-head split-head myslides-head">
      <div><h1><Bi jp="マイスライド" vi="Slide của tôi" profile={profile}/></h1><p><Bi jp="作成・保存した教材スライドを管理できます。" vi="Quản lý các slide giáo án đã tạo và lưu." profile={profile}/></p></div>
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
      {rows.map(deck => <article className="slide-row" key={deck.id}>
        <div className="slide-row-title"><b>{deck.title}</b><small>{deck.slides?.[0]?.title || deck.title}</small></div>
        <div><span className={deck.status === '保存済み' ? 'status-pill saved' : 'status-pill sample'}>{deck.status}</span></div>
        <div className="muted">{deckDate(deck)}</div>
        <div className="muted">{deck.slides?.length || 0}</div>
        <div className="row-actions">
          <button className="outline" onClick={() => nav('editor', { deckId: deck.id === 'demo' ? null : deck.id })}><Edit3 size={14}/><Bi jp="編集" vi="Sửa" profile={profile}/></button>
          <button className="outline" onClick={() => downloadDeck(deck)}><Download size={14}/><Bi jp="DL" vi="Tải" profile={profile}/></button>
          <button className="outline" onClick={() => copyDeck(deck)}><Copy size={14}/><Bi jp="コピー" vi="Sao chép" profile={profile}/></button>
          {deck.id !== 'demo' && <button className="outline danger" onClick={() => remove(deck.id)}><Trash2 size={14}/><Bi jp="削除" vi="Xóa" profile={profile}/></button>}
        </div>
      </article>)}
      {rows.length === 0 && <div className="empty"><Bi jp="条件に一致するスライドがありません。" vi="Không có slide phù hợp với điều kiện tìm kiếm." profile={profile}/></div>}
    </section>
  </AppLayout>
}
