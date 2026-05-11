import React, { useMemo, useState } from 'react';
import { AppLayout } from '../components/Layout.jsx';
import { defaultSlides } from '../data/mockData.js';
import { Edit3, Plus, Trash2 } from 'lucide-react';

function firstText(slide) {
  const text = slide?.elements?.find(el => el.type === 'text')?.content || slide?.body || '本文なし';
  return text.length > 70 ? `${text.slice(0, 70)}...` : text;
}

export function MySlidesPage({ nav, profile }) {
  const [refresh, setRefresh] = useState(0);
  const decks = useMemo(() => JSON.parse(localStorage.getItem('smartslide_saved_decks') || '[]'), [refresh]);
  function remove(id) {
    const next = decks.filter(d => d.id !== id);
    localStorage.setItem('smartslide_saved_decks', JSON.stringify(next));
    setRefresh(v => v + 1);
  }
  const demoDeck = { id:'demo', title:'N3文法：〜てくる', updatedAt:'デモデータ', slides: defaultSlides };
  const visibleDecks = decks.length ? decks : [demoDeck];
  return <AppLayout nav={nav} active="slides" profile={profile}>
    <section className="page-head split-head"><div><h1>マイスライド</h1><p>作成・保存した教材スライドを管理できます。</p></div><button className="pink" onClick={() => nav('editor', { deckId: null })}><Plus size={16}/> 新規作成</button></section>
    <div className="deck-grid">
      {visibleDecks.map(deck => <article className="deck-card" key={deck.id}>
        <div className="deck-cover"><b>{deck.slides?.[0]?.title || deck.title}</b><p>{firstText(deck.slides?.[0])}</p></div>
        <h3>{deck.title}</h3><p>{deck.slides?.length || 0}枚・{deck.updatedAt}</p>
        <div className="card-actions"><button className="outline" onClick={() => nav('editor', { deckId: deck.id === 'demo' ? null : deck.id })}><Edit3 size={14}/>編集</button>{deck.id !== 'demo' && <button className="outline danger" onClick={() => remove(deck.id)}><Trash2 size={14}/>削除</button>}</div>
      </article>)}
    </div>
  </AppLayout>
}
