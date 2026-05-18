import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { apiGetMySlides, apiDeleteSlide } from '../api.js';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Bi } from '../i18n.jsx';

function coverText(slide, profile) {
  const text = slide?.elements?.find(el => el.type === 'text')?.content || slide?.body || (profile?.language === '日本語 + Tiếng Việt' ? '本文なし / Chưa có nội dung' : '本文なし');
  return text.slice(0, 80);
}

export function MySlidesPage({ nav, profile }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch slides từ backend
  useEffect(() => {
    setLoading(true);
    apiGetMySlides()
      .then(data => setDecks(data.slides || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function remove(id) {
    if (!confirm('このスライドを削除しますか？')) return;
    try {
      await apiDeleteSlide(id);
      setDecks(prev => prev.filter(d => d._id !== id));
    } catch {}
  }

  return <AppLayout nav={nav} active="slides" profile={profile}>
    <section className="page-head split-head"><div><h1><Bi jp="マイスライド" vi="Slide của tôi" profile={profile}/></h1><p><Bi jp="作成・保存した教材スライドを管理できます。" vi="Quản lý các slide giáo án đã tạo và lưu." profile={profile}/></p></div><button className="pink" onClick={() => nav('editor', { deckId: null })}><Plus size={16}/><Bi jp="新規作成" vi="Tạo mới" profile={profile}/></button></section>
    {loading ? <div className="empty">読み込み中...</div> :
    <div className="deck-grid">
      {decks.length === 0 && <div className="empty">スライドがありません。新規作成してください。</div>}
      {decks.map(deck => <article className="deck-card" key={deck._id}>
        <div className="deck-cover"><b>{deck.slides?.[0]?.title || deck.title}</b><p>{coverText(deck.slides?.[0], profile)}</p></div>
        <h3>{deck.title}</h3><p>{deck.slides?.length || 0}<Bi jp="枚" vi="trang" profile={profile}/>・{new Date(deck.updatedAt).toLocaleString('ja-JP')}</p>
        <div className="card-actions"><button className="outline" onClick={() => nav('editor', { deckId: deck._id })}><Edit3 size={14}/><Bi jp="編集" vi="Chỉnh sửa" profile={profile}/></button><button className="outline danger" onClick={() => remove(deck._id)}><Trash2 size={14}/><Bi jp="削除" vi="Xóa" profile={profile}/></button></div>
      </article>)}
    </div>}
  </AppLayout>
}
