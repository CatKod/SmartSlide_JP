import React from 'react';

export function isBilingual(profileOrLanguage) {
  const language = typeof profileOrLanguage === 'string' ? profileOrLanguage : profileOrLanguage?.language;
  return language === '日本語 + Tiếng Việt';
}

export function Bi({ jp, vi, profile, className = '' }) {
  if (!isBilingual(profile)) return <>{jp}</>;
  return <span className={`bi-text ${className}`.trim()}><span>{jp}</span><small>{vi}</small></span>;
}

export function biText(profile, jp, vi) {
  return isBilingual(profile) ? `${jp} / ${vi}` : jp;
}

export function biLines(profile, jp, vi) {
  return isBilingual(profile) ? `${jp}\n${vi}` : jp;
}
