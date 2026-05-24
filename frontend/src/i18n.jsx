import React from 'react';

export function resolveLanguage(profileOrLanguage) {
  const language = typeof profileOrLanguage === 'string' ? profileOrLanguage : profileOrLanguage?.language;
  return language === 'Tiếng Việt' ? 'Tiếng Việt' : '日本語';
}

export function isVietnamese(profileOrLanguage) {
  return resolveLanguage(profileOrLanguage) === 'Tiếng Việt';
}

export function Bi({ jp, vi, profile, className = '' }) {
  return <span className={className}>{isVietnamese(profile) ? vi : jp}</span>;
}

export function biText(profile, jp, vi) {
  return isVietnamese(profile) ? vi : jp;
}

export function biLines(profile, jp, vi) {
  return isVietnamese(profile) ? vi : jp;
}
