import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { cloneSlides } from '../data/mockData.js';
import { apiGetSlide, apiGetTemplateDetail, apiCreateSlide, apiUpdateSlide, apiUploadImage } from '../api.js';
import { ImagePlus, Save, Type, Upload, Plus, Trash2, Download } from 'lucide-react';

const TEXT_PLACEHOLDER = 'ここにテキストを入力してください';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=900&auto=format&fit=crop';

function createBlankSlides() {
  return [{
    id: `s_blank_${Date.now()}`,
    title: 'Konnichiwa',
    elements: [{
      id: `el_text_konnichiwa_${Date.now()}`,
      type: 'text',
      x: 12,
      y: 22,
      w: 54,
      h: 18,
      content: 'Konnichiwa',
      bold: true,
      italic: false,
      underline: false,
      fontSize: 32,
      align: 'left',
    }],
  }];
}

// loadSavedDeck giờ là async, được gọi trong useEffect
function loadSavedDeck(deckId) {
  return null; // placeholder - actual loading happens in useEffect
}

function normalizeSlide(slide, index = 0) {
  if (slide.elements) {
    return {
      ...slide,
      backgroundImage: slide.backgroundImage || '',
      elements: slide.elements.map((el, elIndex) => ({
        fontSize: 18,
        align: 'left',
        bold: false,
        italic: false,
        underline: false,
        ...el,
        id: el.id || `el_${Date.now()}_${index}_${elIndex}`,
      })),
    };
  }
  const elements = [];
  if (slide.body) {
    elements.push({
      id: `el_text_${Date.now()}_${index}`,
      type: 'text',
      x: 8,
      y: 24,
      w: 72,
      h: 22,
      content: slide.body,
      bold: false,
      italic: false,
      underline: false,
      fontSize: 18,
      align: 'left',
    });
  }
  if (slide.image) {
    elements.push({
      id: `el_img_${Date.now()}_${index}`,
      type: 'image',
      x: 8,
      y: 50,
      w: 55,
      h: 34,
      src: slide.image,
    });
  }
  return { ...slide, backgroundImage: slide.backgroundImage || '', elements, body: '', image: '' };
}

function normalizeSlides(slides) {
  return slides.map((slide, index) => normalizeSlide(slide, index));
}

export function SlideEditorPage({ nav, templateId, deckId, profile }) {
  const [currentDeckId, setCurrentDeckId] = useState(deckId || null);
  const [slides, setSlides] = useState(() => normalizeSlides(createBlankSlides()));
  const [active, setActive] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const slideDragRef = useRef(null);

  // Load slide/template data từ backend
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (deckId) {
          // Mở slide đã lưu
          const data = await apiGetSlide(deckId);
          if (!cancelled && data.slide) {
            setCurrentDeckId(data.slide._id);
            setSlides(normalizeSlides(data.slide.slides || []));
          }
        } else if (templateId) {
          // Tạo mới từ template
          const data = await apiGetTemplateDetail(templateId);
          if (!cancelled && data.template) {
            setSlides(normalizeSlides(cloneSlides(data.template.slidesData || [])));
            setCurrentDeckId(null);
          }
        } else {
          // Slide trắng
          if (!cancelled) {
            setSlides(normalizeSlides(createBlankSlides()));
            setCurrentDeckId(null);
          }
        }
      } catch (err) {
        if (!cancelled) setNotice('データの読み込みに失敗しました。');
      }
      if (!cancelled) {
        setActive(0);
        setSelectedId(null);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [deckId, templateId]);

  useEffect(() => {
    function move(e) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const drag = dragRef.current;
      if (drag) {
        const nextX = ((e.clientX - rect.left - drag.offsetX) / rect.width) * 100;
        const nextY = ((e.clientY - rect.top - drag.offsetY) / rect.height) * 100;
        updateElement(drag.id, {
          x: Math.max(0, Math.min(100 - drag.w, nextX)),
          y: Math.max(0, Math.min(100 - drag.h, nextY)),
        });
      }
      const resize = resizeRef.current;
      if (resize) {
        const dx = ((e.clientX - resize.startX) / rect.width) * 100;
        const dy = ((e.clientY - resize.startY) / rect.height) * 100;
        updateElement(resize.id, {
          w: Math.max(8, Math.min(100 - resize.x, resize.w + dx)),
          h: Math.max(6, Math.min(100 - resize.y, resize.h + dy)),
        });
      }
    }
    function up() { dragRef.current = null; resizeRef.current = null; }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [active]);

  useEffect(() => {
    function keydown(e) {
      if (!selectedId) return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = tag === 'textarea' || tag === 'input';
      if (!isTyping && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        deleteSelected();
      }
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [selectedId, active]);

  const current = slides[active] || slides[0];
  const selectedElement = current?.elements?.find(el => el.id === selectedId) || null;

  function updateSlide(field, value) {
    setSlides(s => s.map((slide, i) => i === active ? { ...slide, [field]: value } : slide));
  }

  function updateElement(id, patch) {
    setSlides(s => s.map((slide, i) => i !== active ? slide : {
      ...slide,
      elements: (slide.elements || []).map(el => el.id === id ? { ...el, ...patch } : el),
    }));
  }

  function addSlide() {
    const next = {
      id: `s_${Date.now()}`,
      title: '新しいスライド',
      elements: [{
        id: `el_text_${Date.now()}`,
        type: 'text',
        x: 10,
        y: 26,
        w: 48,
        h: 18,
        content: TEXT_PLACEHOLDER,
        bold: false,
        italic: false,
        underline: false,
        fontSize: 18,
        align: 'left',
      }],
    };
    setSlides(s => [...s, next]);
    setActive(slides.length);
    setSelectedId(next.elements[0].id);
  }

  function deleteSlide(index = active) {
    if (slides.length <= 1) {
      setNotice('スライドは少なくとも1枚必要です。');
      return;
    }
    setSlides(prev => prev.filter((_, i) => i !== index));
    setActive(prev => {
      if (index < prev) return prev - 1;
      if (index === prev) return Math.max(0, Math.min(prev, slides.length - 2));
      return prev;
    });
    setSelectedId(null);
    setNotice('スライドを削除しました。スライド番号を更新しました。');
  }

  function reorderSlides(from, to) {
    if (from === null || from === undefined || to === null || to === undefined || from === to) return;
    if (from < 0 || to < 0 || from >= slides.length || to >= slides.length) return;
    setSlides(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setActive(prev => {
      if (prev === from) return to;
      if (from < prev && to >= prev) return prev - 1;
      if (from > prev && to <= prev) return prev + 1;
      return prev;
    });
    setSelectedId(null);
    setNotice('スライドの順番を変更しました。番号は上から順に更新されます。');
  }

  function addText() {
    const id = `el_text_${Date.now()}`;
    const el = { id, type: 'text', x: 12, y: 30, w: 45, h: 16, content: TEXT_PLACEHOLDER, bold: false, italic: false, underline: false, fontSize: 18, align: 'left' };
    updateSlide('elements', [...(current.elements || []), el]);
    setSelectedId(id);
    setNotice('テキストボックスを追加しました。ドラッグして位置を変更できます。');
  }

  function appendImage(src) {
    if (!src) return;
    const id = `el_img_${Date.now()}`;
    const count = (current.elements || []).filter(el => el.type === 'image').length;
    const el = { id, type: 'image', x: 10 + (count % 4) * 4, y: 48 + (count % 3) * 4, w: 42, h: 30, src };
    updateSlide('elements', [...(current.elements || []), el]);
    setSelectedId(id);
    setNotice('画像を追加しました。複数の画像を自由に配置できます。');
  }

  function addImageByUrl() {
    const url = window.prompt('画像リンクを入力してください。例：https://...');
    appendImage(url);
  }

  async function uploadImage(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      // Upload ảnh lên backend, nhận URL
      const res = await apiUploadImage(file);
      appendImage(`http://localhost:5000${res.url}`);
    } catch {
      // Fallback: dùng DataURL nếu upload thất bại
      const reader = new FileReader();
      reader.onload = () => appendImage(String(reader.result));
      reader.readAsDataURL(file);
    }
  }

  function toggleFormat(key) {
    if (!selectedElement || selectedElement.type !== 'text') {
      setNotice('先にテキストボックスを選択してください。');
      return;
    }
    updateElement(selectedElement.id, { [key]: !selectedElement[key] });
  }

  function setTextFormat(patch) {
    if (!selectedElement || selectedElement.type !== 'text') {
      setNotice('先にテキストボックスを選択してください。');
      return;
    }
    updateElement(selectedElement.id, patch);
  }

  function deleteSelected() {
    if (!selectedId) {
      setNotice('削除するテキストまたは画像を選択してください。');
      return;
    }
    setSlides(s => s.map((slide, i) => i !== active ? slide : {
      ...slide,
      elements: (slide.elements || []).filter(el => el.id !== selectedId),
    }));
    setSelectedId(null);
    setNotice('選択した要素を削除しました。');
  }


  function setSelectedImageAsBackground() {
    if (!selectedElement || selectedElement.type !== 'image') {
      setNotice('背景に設定する画像を選択してください。');
      return;
    }
    const imageSrc = selectedElement.src || DEFAULT_IMAGE;
    setSlides(s => s.map((slide, i) => i !== active ? slide : {
      ...slide,
      backgroundImage: imageSrc,
      elements: (slide.elements || []).filter(el => el.id !== selectedElement.id),
    }));
    setSelectedId(null);
    setNotice('選択した画像をこのスライドの背景に設定しました。');
  }

  function clearSlideBackground() {
    updateSlide('backgroundImage', '');
    setNotice('このスライドの背景画像を解除しました。');
  }

  function startResize(e, el) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(el.id);
    resizeRef.current = {
      id: el.id,
      x: el.x,
      y: el.y,
      w: el.w,
      h: el.h,
      startX: e.clientX,
      startY: e.clientY,
    };
  }

  function startDrag(e, el) {
    if (e.target.tagName === 'TEXTAREA' || e.target.dataset.resize || e.target.dataset.delete) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setSelectedId(el.id);
    dragRef.current = {
      id: el.id,
      w: el.w,
      h: el.h,
      offsetX: e.clientX - rect.left - (el.x / 100) * rect.width,
      offsetY: e.clientY - rect.top - (el.y / 100) * rect.height,
    };
  }

  async function save() {
    setSaving(true);
    setNotice('保存中...');
    try {
      const title = slides[0]?.title || '無題のスライド';
      if (currentDeckId) {
        // 既存スライドを更新
        await apiUpdateSlide(currentDeckId, { title, slides, templateId: templateId || null });
        setNotice('既存のスライドを更新しました。');
      } else {
        // 新規作成
        const res = await apiCreateSlide({ title, slides, templateId: templateId || null });
        setCurrentDeckId(res.slide._id);
        setNotice('新しいスライドとして保存しました。');
      }
    } catch (err) {
      setNotice('保存に失敗しました: ' + err.message);
    } finally {
      setSaving(false);
    }
  }


  async function waitForImages(node) {
    const images = Array.from(node.querySelectorAll('img'));
    await Promise.all(images.map(img => new Promise(resolve => {
      if (img.complete) return resolve();
      img.onload = resolve;
      img.onerror = resolve;
    })));
  }

  function createExportSlideNode(slide) {
    const node = document.createElement('div');
    node.className = 'export-slide-node';
    node.style.cssText = 'position:fixed;left:-10000px;top:0;width:1280px;height:720px;background:white;overflow:hidden;border:1px solid #eee;font-family:Inter, Noto Sans JP, Arial, sans-serif;';

    if (slide.backgroundImage) {
      const bg = document.createElement('img');
      bg.src = slide.backgroundImage;
      bg.crossOrigin = 'anonymous';
      bg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;opacity:1;z-index:0;';
      node.appendChild(bg);
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:absolute;inset:0;background:rgba(255,255,255,.18);z-index:0;';
      node.appendChild(overlay);
    }

    const title = document.createElement('div');
    title.textContent = slide.title || '無題のスライド';
    title.style.cssText = 'position:absolute;left:7%;top:7%;width:86%;font-size:44px;font-weight:800;color:#201827;line-height:1.25;white-space:pre-wrap;z-index:1;';
    node.appendChild(title);

    (slide.elements || []).forEach(el => {
      const box = document.createElement('div');
      box.style.cssText = `position:absolute;left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;overflow:hidden;border-radius:14px;z-index:2;`;
      if (el.type === 'text') {
        box.textContent = el.content || '';
        box.style.fontSize = `${Math.max(10, Number(el.fontSize || 18)) * 1.35}px`;
        box.style.fontWeight = el.bold ? '800' : '400';
        box.style.fontStyle = el.italic ? 'italic' : 'normal';
        box.style.textDecoration = el.underline ? 'underline' : 'none';
        box.style.textAlign = el.align || 'left';
        box.style.lineHeight = '1.55';
        box.style.padding = '14px';
        box.style.whiteSpace = 'pre-wrap';
        box.style.color = '#201827';
        box.style.background = '#ffffffd9';
        box.style.border = '1px solid #eadce5';
      } else if (el.type === 'image') {
        const image = document.createElement('img');
        image.src = el.src || DEFAULT_IMAGE;
        image.crossOrigin = 'anonymous';
        image.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;border-radius:14px;';
        box.appendChild(image);
      }
      node.appendChild(box);
    });
    document.body.appendChild(node);
    return node;
  }

  async function renderSlideToImage(slide) {
    const html2canvas = (await import('html2canvas')).default;
    const node = createExportSlideNode(slide);
    try {
      await waitForImages(node);
      const canvas = await html2canvas(node, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 3000,
        logging: false,
      });
      return canvas.toDataURL('image/png');
    } finally {
      node.remove();
    }
  }

  async function exportDeck() {
    try {
      setNotice(exportFormat === 'pdf' ? 'PDFを作成しています...' : 'PowerPointを作成しています...');
      const title = (slides[0]?.title || 'SmartSlide').replace(/[\\/:*?"<>|]/g, '_');
      const slideImages = [];
      for (const slide of slides) {
        slideImages.push(await renderSlideToImage(slide));
      }

      if (exportFormat === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        slideImages.forEach((image, index) => {
          if (index > 0) pdf.addPage('a4', 'landscape');
          pdf.addImage(image, 'PNG', 0, 0, 297, 210);
        });
        pdf.save(`${title}.pdf`);
        setNotice('PDFをダウンロードしました。');
        return;
      }

      const pptxgenModule = await import('pptxgenjs');
      const pptxgen = pptxgenModule.default || pptxgenModule;
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = profile?.name || 'SmartSlide JP';
      pptx.subject = 'SmartSlide JP exported slide deck';
      pptx.title = slides[0]?.title || 'SmartSlide JP';
      slideImages.forEach(image => {
        const pptSlide = pptx.addSlide();
        pptSlide.background = { color: 'FFFFFF' };
        pptSlide.addImage({ data: image, x: 0, y: 0, w: 13.333, h: 7.5 });
      });
      await pptx.writeFile({ fileName: `${title}.pptx` });
      setNotice('PowerPointをダウンロードしました。');
    } catch (error) {
      console.error(error);
      setNotice('出力に失敗しました。画像URLが外部サイトの場合は、画像アップロードを使うと安定します。');
    }
  }

  if (!current) return null;

  return <AppLayout nav={nav} active="slides" profile={profile}>
    <section className="editor">
      <aside className="slide-list">
        <button className="outline full" onClick={addSlide}><Plus size={15}/>スライド追加</button>
        <p className="slide-order-hint">スライドをドラッグして順番を変更できます。不要なページはゴミ箱で削除できます。</p>
        {slides.map((s, i) => <div
          key={s.id}
          className={i === active ? 'thumb active' : 'thumb'}
          draggable
          onClick={() => { setActive(i); setSelectedId(null); }}
          onDragStart={e => { slideDragRef.current = i; e.dataTransfer.effectAllowed = 'move'; }}
          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
          onDrop={e => { e.preventDefault(); reorderSlides(slideDragRef.current, i); slideDragRef.current = null; }}
          onDragEnd={() => { slideDragRef.current = null; }}
          title="ドラッグして順番を変更"
        >
          <span>{i + 1}</span>
          <b>{s.title}</b>
          <button
            className="slide-delete-btn"
            title="このスライドを削除"
            onClick={e => { e.stopPropagation(); deleteSlide(i); }}
          >
            <Trash2 size={14} />
          </button>
        </div>)}
      </aside>
      <main className="canvas-wrap">
        <div className="editor-toolbar">
          <button onClick={addText}><Type size={16}/>テキスト追加</button>
          <button onClick={addImageByUrl}><ImagePlus size={16}/>画像リンク</button>
          <button onClick={() => fileInputRef.current?.click()}><Upload size={16}/>画像アップロード</button>
          <button className="icon-tool" onClick={deleteSelected} disabled={!selectedElement}><Trash2 size={16}/>削除</button>
          <button className={selectedElement?.bold ? 'active-tool format-one' : 'format-one'} onClick={() => toggleFormat('bold')} disabled={selectedElement?.type !== 'text'}><b>B</b></button>
          <button className={selectedElement?.italic ? 'active-tool format-one' : 'format-one'} onClick={() => toggleFormat('italic')} disabled={selectedElement?.type !== 'text'}><i>I</i></button>
          <button className={selectedElement?.underline ? 'active-tool format-one' : 'format-one'} onClick={() => toggleFormat('underline')} disabled={selectedElement?.type !== 'text'}><u>U</u></button>
          <select className="font-size-select" value={selectedElement?.fontSize || 18} onChange={e => setTextFormat({ fontSize: Number(e.target.value) })} disabled={selectedElement?.type !== 'text'}>
            {[10,11,12,14,16,18,20,22,24,26,28,32,36,40,44,48,56,64].map(size => <option key={size} value={size}>{size}</option>)}
          </select>
          <button className={selectedElement?.align === 'left' ? 'active-tool align-tool' : 'align-tool'} onClick={() => setTextFormat({ align: 'left' })} disabled={selectedElement?.type !== 'text'}>左</button>
          <button className={selectedElement?.align === 'center' ? 'active-tool align-tool' : 'align-tool'} onClick={() => setTextFormat({ align: 'center' })} disabled={selectedElement?.type !== 'text'}>中</button>
          <button className={selectedElement?.align === 'right' ? 'active-tool align-tool' : 'align-tool'} onClick={() => setTextFormat({ align: 'right' })} disabled={selectedElement?.type !== 'text'}>右</button>
          <button onClick={save} disabled={saving}><Save size={16}/>{saving ? '保存中...' : '保存'}</button>
          <button onClick={() => nav('slides')}>マイスライドへ</button>
          <div className="export-tools">
            <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} aria-label="出力形式">
              <option value="pdf">PDF</option>
              <option value="pptx">PPTX</option>
            </select>
            <button className="download-deck" onClick={exportDeck}><Download size={16}/>スライド出力</button>
          </div>
          <input ref={fileInputRef} className="hidden-file" type="file" accept="image/*" onChange={uploadImage} />
        </div>
        {notice && <div className="notice">{notice}</div>}
        <div
          className={`design-canvas ${current.backgroundImage ? 'has-slide-background' : ''}`}
          ref={canvasRef}
          style={current.backgroundImage ? { backgroundImage: `linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)), url(${current.backgroundImage})` } : undefined}
          onMouseDown={() => setSelectedId(null)}
        >
          <input className="slide-title design-title" value={current.title} onChange={e => updateSlide('title', e.target.value)} onMouseDown={e => e.stopPropagation()} />
          {(current.elements || []).map(el => <div
            key={el.id}
            className={`design-element ${el.type === 'text' ? 'text-element' : 'image-element'} ${selectedId === el.id ? 'selected' : ''}`}
            style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%` }}
            onMouseDown={e => { e.stopPropagation(); startDrag(e, el); }}
            onClick={e => { e.stopPropagation(); setSelectedId(el.id); }}
          >
            {el.type === 'text' ? <textarea
              value={el.content}
              onChange={e => updateElement(el.id, { content: e.target.value })}
              style={{
                fontWeight: el.bold ? 800 : 400,
                fontStyle: el.italic ? 'italic' : 'normal',
                textDecoration: el.underline ? 'underline' : 'none',
                fontSize: `${el.fontSize || 18}px`,
                textAlign: el.align || 'left',
              }}
              onMouseDown={e => e.stopPropagation()}
              onFocus={() => setSelectedId(el.id)}
            /> : <img src={el.src || DEFAULT_IMAGE} alt="挿入画像" draggable="false" />}
            {selectedId === el.id && <button className="element-delete" data-delete="1" onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); deleteSelected(); }}>×</button>}
            {selectedId === el.id && <span className="resize-handle" data-resize="1" onMouseDown={e => startResize(e, el)} />}
          </div>)}
        </div>
      </main>
      <aside className="property-panel">
        <h3>プロパティ</h3>
        {selectedElement ? <>
          <p className="selected-label">選択中：{selectedElement.type === 'text' ? 'テキスト' : '画像'}</p>
          <button className="outline full danger-action" onClick={deleteSelected}><Trash2 size={15}/>選択中の要素を削除</button>
          {selectedElement.type === 'image' && <><label>画像リンク</label><input value={selectedElement.src || ''} onChange={e => updateElement(selectedElement.id, { src: e.target.value })} placeholder="https://..." /></>}
          {selectedElement.type === 'text' && <><label>テキスト内容</label><textarea value={selectedElement.content || ''} onChange={e => updateElement(selectedElement.id, { content: e.target.value })} /><label>文字サイズ</label><input type="number" min="10" max="96" value={selectedElement.fontSize || 18} onChange={e => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })} /><label>文字揃え</label><select className="property-select" value={selectedElement.align || 'left'} onChange={e => updateElement(selectedElement.id, { align: e.target.value })}><option value="left">左揃え</option><option value="center">中央揃え</option><option value="right">右揃え</option></select></>}
          <label>位置・サイズ</label><p className="hint">ドラッグで移動、右下の丸いハンドルで拡大・縮小できます。</p>
        </> : <p className="hint">テキストまたは画像をクリックして編集します。</p>}
        <label>メモ</label><textarea placeholder="発表者ノート" />
        {selectedElement?.type === 'image' && <button className="pink full background-action" onClick={setSelectedImageAsBackground}>この画像を背景に設定</button>}
        {current.backgroundImage && <button className="outline full background-action" onClick={clearSlideBackground}>背景画像を解除</button>}
      </aside>
    </section>
  </AppLayout>;
}
