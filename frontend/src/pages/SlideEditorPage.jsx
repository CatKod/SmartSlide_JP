import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { cloneSlides } from '../data/mockData.js';
import { apiGetSlide, apiGetTemplateDetail, apiCreateSlide, apiUpdateSlide, apiUploadImage } from '../api.js';
import { ImagePlus, Save, Type, Upload, Plus, Trash2, Download, Play, X, Undo2, Redo2 } from 'lucide-react';
import { Bi, biText } from '../i18n.jsx';

const TEXT_PLACEHOLDER = 'ここにテキストを入力してください';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=900&auto=format&fit=crop';
const HISTORY_LIMIT = 80;

const COLOR_PALETTE = [
  { jp: '自動', vi: 'Tự động', colors: ['#201827'] },
  { jp: 'テーマカラー', vi: 'Màu chủ đề', colors: ['#000000','#444444','#777777','#0f172a','#155e75','#ea580c','#166534','#0ea5e9','#a21caf','#4ade80'] },
  { jp: '標準カラー', vi: 'Màu chuẩn', colors: ['#dc2626','#ef4444','#f59e0b','#facc15','#84cc16','#22c55e','#06b6d4','#2563eb','#1e3a8a','#7c3aed'] },
  { jp: '淡い色', vi: 'Màu nhạt', colors: ['#fecaca','#fed7aa','#fef3c7','#d9f99d','#bbf7d0','#bae6fd','#bfdbfe','#ddd6fe','#fbcfe8','#e5e7eb'] },
];

function createTitleElement(title, index = 0) {
  return {
    id: `el_title_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'text',
    isTitle: true,
    x: 7,
    y: 7,
    w: 72,
    h: 12,
    content: title || '無題のスライド',
    bold: true,
    italic: false,
    underline: false,
    fontSize: 32,
    align: 'left',
    color: '#201827',
  };
}

function ensureTitleElement(slide, elements, index = 0) {
  const slideTitle = slide.title || '無題のスライド';
  const titleIndex = elements.findIndex(el =>
    el.isTitle ||
    (el.type === 'text' && String(el.content || '').trim() === String(slideTitle).trim() && Number(el.x) <= 14 && Number(el.y) <= 24)
  );
  if (titleIndex >= 0) {
    return elements.map((el, i) => i === titleIndex ? {
      ...createTitleElement(slideTitle, index),
      ...el,
      isTitle: true,
      content: el.content || slideTitle,
      bold: el.bold ?? true,
      fontSize: el.fontSize || 32,
    } : el);
  }
  return [createTitleElement(slideTitle, index), ...elements];
}

function createBlankSlides() {
  return [{
    id: `s_blank_${Date.now()}`,
    title: 'こんにちは',
    elements: [{
      id: `el_text_konnichiwa_${Date.now()}`,
      type: 'text',
      isTitle: true,
      x: 7,
      y: 7,
      w: 72,
      h: 12,
      content: 'こんにちは',
      bold: true,
      italic: false,
      underline: false,
      fontSize: 32,
      align: 'left',
      color: '#201827',
    }],
  }];
}

function normalizeSlide(slide, index = 0) {
  if (slide.elements) {
    const normalizedElements = slide.elements.map((el, elIndex) => ({
      fontSize: 18,
      align: 'left',
      bold: false,
      italic: false,
      underline: false,
      color: '#201827',
      ...el,
      id: el.id || `el_${Date.now()}_${index}_${elIndex}`,
    }));
    return {
      ...slide,
      backgroundImage: slide.backgroundImage || '',
      elements: ensureTitleElement(slide, normalizedElements, index),
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
      color: '#201827',
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
  return { ...slide, backgroundImage: slide.backgroundImage || '', elements: ensureTitleElement(slide, elements, index), body: '', image: '' };
}

function normalizeSlides(slides) {
  return slides.map((slide, index) => normalizeSlide(slide, index));
}

function cloneHistorySlides(slides) {
  return JSON.parse(JSON.stringify(slides || []));
}

function createHistorySnapshot(state) {
  return {
    slides: cloneHistorySlides(state.slides),
    active: state.active,
    selectedId: state.selectedId,
    slideName: state.slideName,
  };
}

function sameHistorySnapshot(a, b) {
  if (!a || !b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

function SlideView({ slide, className = '' }) {
  if (!slide) return null;
  return <div
    className={`presentation-slide ${className} ${slide.backgroundImage ? 'has-slide-background' : ''}`}
    style={slide.backgroundImage ? { backgroundImage: `linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)), url(${slide.backgroundImage})` } : undefined}
  >
    {(slide.elements || []).map(el => <div
      key={el.id}
      className={`presentation-element ${el.type === 'text' ? 'text-element' : 'image-element'}`}
      style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%` }}
    >
      {el.type === 'text' ? <div
        className="presentation-text"
        style={{
          fontWeight: el.bold ? 800 : 400,
          fontStyle: el.italic ? 'italic' : 'normal',
          textDecoration: el.underline ? 'underline' : 'none',
          fontSize: `${el.fontSize || 18}px`,
          textAlign: el.align || 'left',
          color: el.color || '#201827',
          lineHeight: el.lineHeight || 1.55,
        }}
      >{el.content}</div> : <img src={el.src || DEFAULT_IMAGE} alt="スライド" />}
    </div>)}
  </div>;
}

function PresentationOverlay({ slides, index, setIndex, close, profile }) {
  const currentSlide = slides[index] || slides[0];
  function handleClick(e) {
    if (e.target.closest('.presentation-exit')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isRight = e.clientX > rect.left + rect.width / 2;
    setIndex(prev => isRight ? Math.min(slides.length - 1, prev + 1) : Math.max(0, prev - 1));
  }
  return <div className="presentation-overlay" onClick={handleClick}>
    <SlideView slide={currentSlide} />
    <div className="presentation-counter">{index + 1} / {slides.length}</div>
    <button className="presentation-exit" onClick={close}><X size={18}/> <Bi jp="終了" vi="Thoát" profile={profile}/></button>
  </div>;
}

export function SlideEditorPage({ nav, templateId, deckId, profile, setProfile }) {
  const [currentDeckId, setCurrentDeckId] = useState(deckId || null);
  const [slides, setSlides] = useState(() => normalizeSlides(createBlankSlides()));
  const [slideName, setSlideName] = useState('新しいスライド');
  const [active, setActive] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('info');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [saving, setSaving] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [colorPaletteOpen, setColorPaletteOpen] = useState(false);
  const [presentationIndex, setPresentationIndex] = useState(0);
  const [history, setHistory] = useState({ past: [], future: [] });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const slideDragRef = useRef(null);
  const historyRef = useRef({ slides, active, selectedId, slideName });
  const continuousEditRef = useRef(null);
  const noticeTimerRef = useRef(null);
  const notify = (jp, vi, type = 'info') => {
    const text = biText(profile, jp, vi);
    setNotice(text);
    setNoticeType(type);
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
    // auto-hide for both info and success
    if (type === 'info' || type === 'success') {
      noticeTimerRef.current = setTimeout(() => {
        setNotice('');
        setNoticeType('');
        noticeTimerRef.current = null;
        // reset canvas / stage scroll to top-left
        try {
          if (stageRef.current && typeof stageRef.current.scrollTo === 'function') {
            stageRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          } else if (canvasRef.current && canvasRef.current.scrollIntoView) {
            canvasRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (e) {
          // ignore
        }
      }, 1500);
    }
  };

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    historyRef.current = { slides, active, selectedId, slideName };
  }, [slides, active, selectedId, slideName]);

  // Load slide/template data từ backend
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (deckId) {
          const data = await apiGetSlide(deckId);
          if (!cancelled && data.slide) {
            setCurrentDeckId(data.slide._id);
            setSlides(normalizeSlides(data.slide.slides || []));
            setSlideName(data.slide.title || '新しいスライド');
          }
        } else if (templateId) {
          const data = await apiGetTemplateDetail(templateId);
          if (!cancelled && data.template) {
            setSlides(normalizeSlides(cloneSlides(data.template.slidesData || [])));
            setSlideName(data.template.title || '新しいスライド');
            setCurrentDeckId(null);
          }
        } else {
          if (!cancelled) {
            setSlides(normalizeSlides(createBlankSlides()));
            setSlideName('新しいスライド');
            setCurrentDeckId(null);
          }
        }
      } catch (err) {
        if (!cancelled) notify('データの読み込みに失敗しました。', 'Tải dữ liệu thất bại.', 'info');
      }
      if (!cancelled) {
        setActive(0);
        setSelectedId(null);
        setHistory({ past: [], future: [] });
        continuousEditRef.current = null;
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
        if (!drag.recorded) {
          recordHistory();
          drag.recorded = true;
        }
        const nextX = ((e.clientX - rect.left - drag.offsetX) / rect.width) * 100;
        const nextY = ((e.clientY - rect.top - drag.offsetY) / rect.height) * 100;
        updateElement(drag.id, {
          x: Math.max(0, Math.min(100 - drag.w, nextX)),
          y: Math.max(0, Math.min(100 - drag.h, nextY)),
        }, { remember: false });
      }
      const resize = resizeRef.current;
      if (resize) {
        if (!resize.recorded) {
          recordHistory();
          resize.recorded = true;
        }
        const dx = ((e.clientX - resize.startX) / rect.width) * 100;
        const dy = ((e.clientY - resize.startY) / rect.height) * 100;
        updateElement(resize.id, {
          w: Math.max(8, Math.min(100 - resize.x, resize.w + dx)),
          h: Math.max(6, Math.min(100 - resize.y, resize.h + dy)),
        }, { remember: false });
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
      const key = e.key.toLowerCase();
      const isShortcut = e.ctrlKey || e.metaKey;
      if (isShortcut && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoEdit();
        return;
      }
      if (isShortcut && ((key === 'z' && e.shiftKey) || key === 'y')) {
        e.preventDefault();
        redoEdit();
        return;
      }

      // Hỗ trợ chuyển slide bằng phím mũi tên lên/xuống khi không gõ chữ
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = tag === 'textarea' || tag === 'input';
      if (!isTyping) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActive(prev => Math.max(0, prev - 1));
          setSelectedId(null);
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActive(prev => Math.min(slides.length - 1, prev + 1));
          setSelectedId(null);
          return;
        }
      }

      if (!selectedId) return;
      if (!isTyping && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        deleteSelected();
      }
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [selectedId, active, history, slides]);

  // Tự động cuộn slide đang hoạt động vào vùng nhìn thấy của thanh bên
  useEffect(() => {
    const activeThumb = document.querySelector('.slide-list-items .thumb.active');
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active]);

  useEffect(() => {
    if (!presenting) return;
    function keydown(e) {
      if (e.key === 'Escape') {
        setPresenting(false);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setPresentationIndex(index => Math.min(slides.length - 1, index + 1));
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setPresentationIndex(index => Math.max(0, index - 1));
      }
    }
    function fullscreenChange() {
      if (!document.fullscreenElement) setPresenting(false);
    }
    document.addEventListener('fullscreenchange', fullscreenChange);
    window.addEventListener('keydown', keydown);
    return () => {
      window.removeEventListener('keydown', keydown);
      document.removeEventListener('fullscreenchange', fullscreenChange);
    };
  }, [presenting, slides.length]);

  const current = slides[active] || slides[0];
  const selectedElement = current?.elements?.find(el => el.id === selectedId) || null;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const topbarLeft = (
    <div className="topbar-deck-name-wrap">
      <span className="topbar-deck-name-label"><Bi jp="スライド名: " vi="Tên bài trình chiếu: " profile={profile}/></span>
      <input
        className="topbar-deck-name-input"
        value={slideName}
        onChange={e => { beginContinuousHistory('deck-name'); setSlideName(e.target.value); }}
        onBlur={() => endContinuousHistory('deck-name')}
        placeholder={biText(profile, '新しいスライド', 'Bài trình chiếu mới')}
      />
    </div>
  );

  function getCurrentHistorySnapshot() {
    return createHistorySnapshot(historyRef.current);
  }

  function restoreHistorySnapshot(snapshot) {
    const nextSlides = cloneHistorySlides(snapshot.slides);
    const nextActive = Math.max(0, Math.min(snapshot.active || 0, nextSlides.length - 1));
    historyRef.current = {
      slides: nextSlides,
      active: nextActive,
      selectedId: snapshot.selectedId || null,
      slideName: snapshot.slideName,
    };
    setSlides(nextSlides);
    setActive(nextActive);
    setSelectedId(snapshot.selectedId || null);
    setSlideName(snapshot.slideName);
    setColorPaletteOpen(false);
  }

  function recordHistory() {
    continuousEditRef.current = null;
    const snapshot = getCurrentHistorySnapshot();
    setHistory(prev => {
      const last = prev.past[prev.past.length - 1];
      if (sameHistorySnapshot(last, snapshot)) return { ...prev, future: [] };
      return {
        past: [...prev.past, snapshot].slice(-HISTORY_LIMIT),
        future: [],
      };
    });
  }

  function beginContinuousHistory(scope) {
    if (continuousEditRef.current === scope) return;
    const snapshot = getCurrentHistorySnapshot();
    continuousEditRef.current = scope;
    setHistory(prev => {
      const last = prev.past[prev.past.length - 1];
      if (sameHistorySnapshot(last, snapshot)) return prev;
      return {
        past: [...prev.past, snapshot].slice(-HISTORY_LIMIT),
        future: [],
      };
    });
  }

  function endContinuousHistory(scope) {
    if (!scope || continuousEditRef.current === scope) continuousEditRef.current = null;
  }

  function undoEdit() {
    if (!history.past.length) return;
    continuousEditRef.current = null;
    const previous = history.past[history.past.length - 1];
    const currentSnapshot = getCurrentHistorySnapshot();
    setHistory({
      past: history.past.slice(0, -1),
      future: [currentSnapshot, ...history.future].slice(0, HISTORY_LIMIT),
    });
    restoreHistorySnapshot(previous);
    notify('元に戻しました。', 'Đã hoàn tác.');
  }

  function redoEdit() {
    if (!history.future.length) return;
    continuousEditRef.current = null;
    const next = history.future[0];
    const currentSnapshot = getCurrentHistorySnapshot();
    setHistory({
      past: [...history.past, currentSnapshot].slice(-HISTORY_LIMIT),
      future: history.future.slice(1),
    });
    restoreHistorySnapshot(next);
    notify('やり直しました。', 'Đã làm lại.');
  }

  function updateSlide(field, value, options = {}) {
    if (options.remember !== false) recordHistory();
    setSlides(s => s.map((slide, i) => i === active ? { ...slide, [field]: value } : slide));
  }

  function updateElement(id, patch, options = {}) {
    if (options.remember !== false) recordHistory();
    setSlides(s => s.map((slide, i) => {
      if (i !== active) return slide;
      let nextTitle = slide.title;
      const nextElements = (slide.elements || []).map(el => {
        if (el.id !== id) return el;
        const nextEl = { ...el, ...patch };
        if (nextEl.isTitle && Object.prototype.hasOwnProperty.call(patch, 'content')) {
          nextTitle = patch.content || '無題のスライド';
        }
        return nextEl;
      });
      return { ...slide, title: nextTitle, elements: nextElements };
    }));
  }

  function addSlide() {
    recordHistory();
    const next = {
      id: `s_${Date.now()}`,
      title: '新しいスライド',
      elements: [createTitleElement('新しいスライド')],
    };
    const insertIndex = Math.min(active + 1, slides.length);
    setSlides(s => {
      const nextSlides = [...s];
      nextSlides.splice(insertIndex, 0, next);
      return nextSlides;
    });
    setActive(insertIndex);
    setSelectedId(next.elements[0].id);
  }

  function deleteSlide(index = active) {
    if (slides.length <= 1) {
      notify('スライドは少なくとも1枚必要です。', 'Cần ít nhất 1 slide.');
      return;
    }
    recordHistory();
    setSlides(prev => prev.filter((_, i) => i !== index));
    setActive(prev => {
      if (index < prev) return prev - 1;
      if (index === prev) return Math.max(0, Math.min(prev, slides.length - 2));
      return prev;
    });
    setSelectedId(null);
    notify('スライドを削除しました。スライド番号を更新しました。', 'Đã xóa slide. Số thứ tự slide đã được cập nhật.');
  }

  function reorderSlides(from, to) {
    if (from === null || from === undefined || to === null || to === undefined || from === to) return;
    if (from < 0 || to < 0 || from >= slides.length || to >= slides.length) return;
    recordHistory();
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
    notify('スライドの順番を変更しました。番号は上から順に更新されます。', 'Đã thay đổi thứ tự slide. Số thứ tự được cập nhật từ trên xuống.');
  }

  function addText() {
    const id = `el_text_${Date.now()}`;
    const el = { id, type: 'text', x: 12, y: 30, w: 45, h: 16, content: TEXT_PLACEHOLDER, bold: false, italic: false, underline: false, fontSize: 18, align: 'left', color: '#201827' };
    updateSlide('elements', [...(current.elements || []), el]);
    setSelectedId(id);
    notify('テキストボックスを追加しました。ドラッグして位置を変更できます。', 'Đã thêm hộp văn bản. Có thể kéo để đổi vị trí.');
  }

  function appendImage(src) {
    if (!src) return;
    const id = `el_img_${Date.now()}`;
    const count = (current.elements || []).filter(el => el.type === 'image').length;
    const el = { id, type: 'image', x: 10 + (count % 4) * 4, y: 48 + (count % 3) * 4, w: 42, h: 30, src };
    updateSlide('elements', [...(current.elements || []), el]);
    setSelectedId(id);
    notify('画像を追加しました。複数の画像を自由に配置できます。', 'Đã thêm hình ảnh. Có thể tự do sắp xếp nhiều hình ảnh.');
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
      const res = await apiUploadImage(file);
      appendImage(`http://localhost:5000${res.url}`);
    } catch {
      const reader = new FileReader();
      reader.onload = () => appendImage(String(reader.result));
      reader.readAsDataURL(file);
    }
  }

  function toggleFormat(key) {
    if (!selectedElement || selectedElement.type !== 'text') {
      notify('先にテキストボックスを選択してください。', 'Vui lòng chọn hộp văn bản trước.');
      return;
    }
    updateElement(selectedElement.id, { [key]: !selectedElement[key] });
  }

  function cycleLineHeight() {
    if (!selectedElement || selectedElement.type !== 'text') {
      notify('先にテキストボックスを選択してください。', 'Vui lòng chọn hộp văn bản trước.');
      return;
    }
    const options = [1, 1.15, 1.35, 1.55, 1.75, 2];
    const current = Number(selectedElement.lineHeight || 1.55);
    let idx = options.findIndex(o => Math.abs(o - current) < 0.03);
    if (idx === -1) idx = options.indexOf(1.55);
    const next = options[(idx + 1) % options.length];
    setTextFormat({ lineHeight: next });
    notify('行間を変更しました。', 'Đã thay đổi khoảng cách dòng。', 'success');
  }

  function setTextFormat(patch) {
    if (!selectedElement || selectedElement.type !== 'text') {
      notify('先にテキストボックスを選択してください。', 'Vui lòng chọn hộp văn bản trước.');
      return;
    }
    updateElement(selectedElement.id, patch);
  }

  function applyTextColor(color) {
    setTextFormat({ color });
    setColorPaletteOpen(false);
    notify('文字色を変更しました。', 'Đã đổi màu chữ.');
  }

  function deleteSelected() {
    if (!selectedId) {
      notify('削除するテキストまたは画像を選択してください。', 'Vui lòng chọn văn bản hoặc hình ảnh cần xóa.');
      return;
    }
    if (selectedElement?.isTitle) {
      notify('タイトルは削除できません。内容、色、サイズ、位置は自由に変更できます。', 'Không thể xóa tiêu đề. Bạn vẫn có thể đổi nội dung, màu, kích thước và vị trí.');
      return;
    }
    recordHistory();
    setSlides(s => s.map((slide, i) => i !== active ? slide : {
      ...slide,
      elements: (slide.elements || []).filter(el => el.id !== selectedId),
    }));
    setSelectedId(null);
    notify('選択した要素を削除しました。', 'Đã xóa đối tượng đã chọn.');
  }

  function setSelectedImageAsBackground() {
    if (!selectedElement || selectedElement.type !== 'image') {
      notify('背景に設定する画像を選択してください。', 'Vui lòng chọn hình ảnh để đặt làm nền.');
      return;
    }
    const imageSrc = selectedElement.src || DEFAULT_IMAGE;
    recordHistory();
    setSlides(s => s.map((slide, i) => i !== active ? slide : {
      ...slide,
      backgroundImage: imageSrc,
      elements: (slide.elements || []).filter(el => el.id !== selectedElement.id),
    }));
    setSelectedId(null);
    notify('選択した画像をこのスライドの背景に設定しました。', 'Đã đặt hình ảnh đã chọn làm nền cho slide này.');
  }

  function clearSlideBackground() {
    updateSlide('backgroundImage', '');
    notify('このスライドの背景画像を解除しました。', 'Đã gỡ ảnh nền của slide này.');
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
      recorded: false,
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
      recorded: false,
    };
  }

  function startPresentation() {
    setPresentationIndex(active);
    setPresenting(true);
    setTimeout(() => {
      const node = document.querySelector('.presentation-overlay');
      if (node?.requestFullscreen) node.requestFullscreen().catch(() => {});
    }, 0);
  }

  function closePresentation() {
    setPresenting(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  async function save() {
    setSaving(true);
    notify('保存中...', 'Đang lưu...', 'success');
    try {
      const title = slideName || slides[0]?.title || '無題のスライド';
      if (currentDeckId) {
        await apiUpdateSlide(currentDeckId, { title, slides, templateId: templateId || null });
        notify('既存のスライドを更新しました。', 'Đã cập nhật bài trình chiếu hiện có.', 'success');
      } else {
        const res = await apiCreateSlide({ title, slides, templateId: templateId || null });
        setCurrentDeckId(res.slide._id);
        notify('新しいスライドとして保存しました。', 'Đã lưu thành bài trình chiếu mới.', 'success');
      }
    } catch (err) {
      notify('保存に失敗しました: ' + err.message, 'Lưu thất bại: ' + err.message, 'info');
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
        box.style.color = el.color || '#201827';
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
      notify(
        exportFormat === 'pdf' ? 'PDFを作成しています...' : 'PowerPointを作成しています...',
        exportFormat === 'pdf' ? 'Đang tạo PDF...' : 'Đang tạo PowerPoint...'
      );
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
        notify('PDFをダウンロードしました。', 'Đã tải PDF xuống.');
        return;
      }

      const pptxgenModule = await import('pptxgenjs');
      const pptxgen = pptxgenModule.default || pptxgenModule;
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = profile?.name || 'SmartSlide JP';
      pptx.subject = 'SmartSlide JP スライド出力';
      pptx.title = slides[0]?.title || 'SmartSlide JP';
      slideImages.forEach(image => {
        const pptSlide = pptx.addSlide();
        pptSlide.background = { color: 'FFFFFF' };
        pptSlide.addImage({ data: image, x: 0, y: 0, w: 13.333, h: 7.5 });
      });
      await pptx.writeFile({ fileName: `${title}.pptx` });
      notify('PowerPointをダウンロードしました。', 'Đã tải PowerPoint xuống.');
    } catch (error) {
      console.error(error);
      notify('出力に失敗しました。画像URLが外部サイトの場合は、画像アップロードを使うと安定します。', 'Xuất thất bại. Nếu ảnh dùng URL bên ngoài, hãy dùng ảnh tải lên để ổn định hơn.');
    }
  }

  if (!current) return null;

  return <AppLayout nav={nav} active="slides" profile={profile} setProfile={setProfile} compactSidebar editorTopbar topbarLeft={topbarLeft}>
    <div className="editor-page">
      <section className="editor-workspace">
        <aside className="slide-list editor-panel">
          <div className="panel-heading">
            <div className="panel-heading-copy">
              <p className="panel-heading-kicker"><Bi jp="スライド一覧" vi="Danh sách slide" profile={profile}/></p>
              <h2 className="editor-page-title"><Bi jp="ページ" vi="Trang" profile={profile}/></h2>
              <p className="editor-page-subtitle"><Bi jp="ページを並べ替えて、1枚ずつ編集できます。" vi="Sắp xếp trang và chỉnh từng slide một." profile={profile}/></p>
            </div>
            <div className="panel-heading-actions">
              <button className="outline full add-slide-btn" onClick={addSlide}><Plus size={15}/><Bi jp="追加" vi="Thêm" profile={profile}/></button>
            </div>
          </div>
          
          <div className="slide-list-items">
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
          </div>
        </aside>
        <main className="canvas-wrap editor-panel editor-canvas-panel">
          <div className="editor-toolbar editor-toolbar-canva">
            <div className="toolbar-row toolbar-row-top">
              <div className="toolbar-group toolbar-group-text">
                <button onClick={addText}><Type size={16}/><Bi jp="テキスト追加" vi="Thêm văn bản" profile={profile}/></button>
                <button className={selectedElement?.bold ? 'active-tool format-one' : 'format-one'} onClick={() => toggleFormat('bold')} disabled={selectedElement?.type !== 'text'}><b>B</b></button>
                <button className={selectedElement?.italic ? 'active-tool format-one' : 'format-one'} onClick={() => toggleFormat('italic')} disabled={selectedElement?.type !== 'text'}><i>I</i></button>
                <button className={selectedElement?.underline ? 'active-tool format-one' : 'format-one'} onClick={() => toggleFormat('underline')} disabled={selectedElement?.type !== 'text'}><u>U</u></button>
                <select className="font-size-select" value={selectedElement?.fontSize || 18} onChange={e => setTextFormat({ fontSize: Number(e.target.value) })} disabled={selectedElement?.type !== 'text'}>
                  {[10,11,12,14,16,18,20,22,24,26,28,32,36,40,44,48,56,64].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
                <div className="color-tool-wrap">
                  <button
                    type="button"
                    className="text-color-tool palette-toggle"
                    title={biText(profile, '文字色', 'Màu chữ')}
                    disabled={selectedElement?.type !== 'text'}
                    onClick={() => {
                      if (selectedElement?.type !== 'text') return notify('先にテキストボックスを選択してください。', 'Vui lòng chọn hộp văn bản trước.');
                      setColorPaletteOpen(open => !open);
                    }}
                  >
                    <span style={{ color: selectedElement?.color || '#201827' }}>A</span>
                    <b className="color-preview" style={{ backgroundColor: selectedElement?.color || '#201827' }}></b>
                  </button>
                  {colorPaletteOpen && selectedElement?.type === 'text' && <div className="color-palette-panel">
                    {COLOR_PALETTE.map(group => <div className="color-group" key={group.jp}>
                      <p><Bi jp={group.jp} vi={group.vi} profile={profile}/></p>
                      <div className="color-grid">
                        {group.colors.map(color => <button
                          key={color}
                          className={color.toLowerCase() === (selectedElement?.color || '').toLowerCase() ? 'color-swatch selected' : 'color-swatch'}
                          style={{ backgroundColor: color }}
                          title={color}
                          onClick={() => applyTextColor(color)}
                        />)}
                      </div>
                    </div>)}
                    <div className="custom-color-row">
                      <label>
                        <Bi jp="その他の色" vi="Màu khác" profile={profile}/>
                        <input type="color" value={selectedElement?.color || '#201827'} onChange={e => applyTextColor(e.target.value)} />
                      </label>
                    </div>
                  </div>}
                </div>
                <button className={selectedElement?.align === 'left' ? 'active-tool align-tool' : 'align-tool'} onClick={() => setTextFormat({ align: 'left' })} disabled={selectedElement?.type !== 'text'}>左</button>
                <button className={selectedElement?.align === 'center' ? 'active-tool align-tool' : 'align-tool'} onClick={() => setTextFormat({ align: 'center' })} disabled={selectedElement?.type !== 'text'}>中</button>
                <button className={selectedElement?.align === 'right' ? 'active-tool align-tool' : 'align-tool'} onClick={() => setTextFormat({ align: 'right' })} disabled={selectedElement?.type !== 'text'}>右</button>
                <input
                  type="number"
                  className="line-height-input"
                  step="0.05"
                  min="0.5"
                  max="3"
                  value={selectedElement?.lineHeight ?? 1.55}
                  disabled={selectedElement?.type !== 'text'}
                  onChange={e => setTextFormat({ lineHeight: Number(e.target.value) })}
                  title={biText(profile, '行間を入力', 'Nhập khoảng cách dòng')}
                />
              </div>
            </div>
            <div className="toolbar-row toolbar-row-bottom">
              <div className="toolbar-group toolbar-group-media">
                <button onClick={addImageByUrl}><ImagePlus size={16}/><Bi jp="画像リンク" vi="Link ảnh" profile={profile}/></button>
                <button onClick={() => fileInputRef.current?.click()}><Upload size={16}/><Bi jp="画像アップロード" vi="Tải ảnh lên" profile={profile}/></button>
                <button className="icon-tool" onClick={deleteSelected} disabled={!selectedElement}><Trash2 size={16}/><Bi jp="削除" vi="Xóa" profile={profile}/></button>
                <div className="undo-redo-tools" aria-label={biText(profile, '編集履歴', 'Lịch sử chỉnh sửa')}>
                  <button
                    type="button"
                    className="history-tool"
                    onClick={undoEdit}
                    disabled={!canUndo}
                    title={biText(profile, '元に戻す (Ctrl+Z)', 'Hoàn tác (Ctrl+Z)')}
                  >
                    <Undo2 size={16}/>
                    <Bi jp="元に戻す" vi="Hoàn tác" profile={profile}/>
                  </button>
                  <button
                    type="button"
                    className="history-tool"
                    onClick={redoEdit}
                    disabled={!canRedo}
                    title={biText(profile, 'やり直す (Ctrl+Shift+Z / Ctrl+Y)', 'Làm lại (Ctrl+Shift+Z / Ctrl+Y)')}
                  >
                    <Redo2 size={16}/>
                    <Bi jp="やり直す" vi="Làm lại" profile={profile}/>
                  </button>
                </div>
                <button className="presentation-btn outline" onClick={startPresentation}><Play size={16}/><Bi jp="プレゼン" vi="Trình chiếu" profile={profile}/></button>
              </div>
              <div className="toolbar-group toolbar-group-actions">
                <div className="export-tools">
                  <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} aria-label="出力形式">
                    <option value="pdf">PDF</option>
                    <option value="pptx">PPTX</option>
                  </select>
                  <button className="download-deck" onClick={exportDeck}><Download size={16}/><Bi jp="スライド出力" vi="Xuất bài trình chiếu" profile={profile}/></button>
                </div>
                <button className="pink save-deck" onClick={save} disabled={saving}><Save size={16}/>{saving ? biText(profile, '保存中...', 'Đang lưu...') : <Bi jp="保存" vi="Lưu" profile={profile}/>}</button>
              </div>
            </div>
            <input ref={fileInputRef} className="hidden-file" type="file" accept="image/*" onChange={uploadImage} />
          </div>
          <div className={`notice editor-notice ${noticeType || ''}`} style={{ display: notice ? 'block' : 'none' }}>{notice}</div>
          <div className="canvas-stage" ref={stageRef}>
            <div className="canvas-stage-inner">
              <div
                className={`design-canvas ${current.backgroundImage ? 'has-slide-background' : ''}`}
                ref={canvasRef}
                style={current.backgroundImage ? { backgroundImage: `linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)), url(${current.backgroundImage})` } : undefined}
                onMouseDown={() => setSelectedId(null)}
              >
                {(current.elements || []).map(el => <div
                  key={el.id}
                  className={`design-element ${el.type === 'text' ? 'text-element' : 'image-element'} ${selectedId === el.id ? 'selected' : ''}`}
                  style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%` }}
                  onMouseDown={e => { e.stopPropagation(); startDrag(e, el); }}
                  onClick={e => { e.stopPropagation(); setSelectedId(el.id); }}
                >
                  {el.type === 'text' ? <textarea
                    value={el.content}
                    onChange={e => {
                      beginContinuousHistory(`text:${el.id}`);
                      updateElement(el.id, { content: e.target.value }, { remember: false });
                    }}
                    style={{
                      fontWeight: el.bold ? 800 : 400,
                      fontStyle: el.italic ? 'italic' : 'normal',
                      textDecoration: el.underline ? 'underline' : 'none',
                      fontSize: `${el.fontSize || 18}px`,
                      textAlign: el.align || 'left',
                                  color: el.color || '#201827',
                                  lineHeight: el.lineHeight || 1.55,
                    }}
                    onMouseDown={e => e.stopPropagation()}
                    onFocus={() => setSelectedId(el.id)}
                    onBlur={() => endContinuousHistory(`text:${el.id}`)}
                  /> : <img src={el.src || DEFAULT_IMAGE} alt="挿入画像" draggable="false" />}
                  {selectedId === el.id && !el.isTitle && <button className="element-delete" data-delete="1" onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); deleteSelected(); }}>×</button>}
                  {selectedId === el.id && <span className="resize-handle" data-resize="1" onMouseDown={e => startResize(e, el)} />}
                </div>)}
              </div>
            </div>
          </div>
        </main>

        {presenting && <PresentationOverlay
          slides={slides}
          index={presentationIndex}
          setIndex={setPresentationIndex}
          close={closePresentation}
          profile={profile}
        />}
      </section>
    </div>
  </AppLayout>;
}
