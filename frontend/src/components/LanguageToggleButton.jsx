import React from 'react';
import { Globe2 } from 'lucide-react';
import { saveUser } from '../api.js';
import { biText, isVietnamese } from '../i18n.jsx';

export function LanguageToggleButton({ profile, setProfile, className = '' }) {
  const isVi = isVietnamese(profile);

  function toggleLanguage() {
    const next = { ...(profile || {}), language: isVi ? '日本語' : 'Tiếng Việt' };
    saveUser(next);
    window.dispatchEvent(new CustomEvent('smartslide-language-change', { detail: next }));
    if (setProfile) setProfile(next);
  }

  return (
    <button
      type="button"
      className={`language-switch ${className}`.trim()}
      title={biText(profile, '表示言語を切り替え', 'Chuyển đổi ngôn ngữ hiển thị')}
      onClick={toggleLanguage}
    >
      <Globe2 size={15} />
      <span className="language-switch-label">日本語 / Tiếng Việt</span>
      <strong>{isVi ? 'VI' : 'JP'}</strong>
    </button>
  );
}
