import React, { useMemo, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { defaultSlides } from '../data/mockData.js';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Bi } from '../i18n.jsx';

function coverText(slide, profile) {
  const text = slide?.elements?.find(el => el.type === 'text')?.content || slide?.body || (profile?.language === '日本語 + Tiếng Việt' ? '本文なし / Chưa có nội dung' : '本文なし');
  return text.slice(0, 80);
}

export function MySlidesPage({ nav, profile }) {
  const [version, setVersion] = useState(0);
  const decks = useMemo(() => JSON.parse(localStorage.getItem('smartslide_saved_decks') || '[]'), [version]);
  function remove(id) {
    localStorage.setItem('smartslide_saved_decks', JSON.stringify(decks.filter(d => d.id !== id)));
    setVersion(v => v + 1);
  }
  const demoDeck = { id:'demo', title:'N3文法：〜てくる', updatedAt:'デモデータ', slides: defaultSlides };
  const rows = decks.length ? decks : [demoDeck];
  return <AppLayout nav={nav} active="slides" profile={profile}>
    <section className="page-head split-head"><div><h1><Bi jp="マイスライド" vi="Slide của tôi" profile={profile}/></h1><p><Bi jp="作成・保存した教材スライドを管理できます。" vi="Quản lý các slide giáo án đã tạo và lưu." profile={profile}/></p></div><button className="pink" onClick={() => nav('editor', { deckId: null })}><Plus size={16}/><Bi jp="新規作成" vi="Tạo mới" profile={profile}/></button></section>
    <section className="deck-grid">{rows.map(deck => <article className="deck-card" key={deck.id}>
      <div className="deck-cover"><b>{deck.slides?.[0]?.title || deck.title}</b><p>{coverText(deck.slides?.[0], profile)}</p></div>
      <h3>{deck.title}</h3><p>{deck.slides?.length || 0}<Bi jp="枚" vi="trang" profile={profile}/>・{deck.updatedAt}</p>
      <div className="card-actions"><button className="outline" onClick={() => nav('editor', { deckId: deck.id === 'demo' ? null : deck.id })}><Edit3 size={14}/><Bi jp="編集" vi="Chỉnh sửa" profile={profile}/></button>{deck.id !== 'demo' && <button className="outline danger" onClick={() => remove(deck.id)}><Trash2 size={14}/><Bi jp="削除" vi="Xóa" profile={profile}/></button>}</div>
    </article>)}</section>
  </AppLayout>
}
