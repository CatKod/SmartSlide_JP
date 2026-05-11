import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { MySlidesPage } from './pages/MySlidesPage.jsx';
import { SharedMaterialsPage } from './pages/SharedMaterialsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { TemplateListPage } from './pages/TemplateListPage.jsx';
import { TemplateDetailPage } from './pages/TemplateDetailPage.jsx';
import { SlideEditorPage } from './pages/SlideEditorPage.jsx';
import './styles.css';

const defaultProfile = { name: 'Tuệ', email: 'teacher@example.com', level: 'N3/N4', language: '日本語' };

function App() {
  const [route, setRoute] = useState('login');
  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl_001');
  const [editingDeckId, setEditingDeckId] = useState(null);
  const [globalKeyword, setGlobalKeyword] = useState('');
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('smartslide_profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const page = useMemo(() => {
    const nav = (next, payload = {}) => {
      if (payload.templateId) setSelectedTemplateId(payload.templateId);
      if (next === 'editor' && Object.prototype.hasOwnProperty.call(payload, 'deckId') && payload.deckId === null && !payload.templateId) {
        setSelectedTemplateId(null);
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'deckId')) setEditingDeckId(payload.deckId);
      if (next === 'editor' && !Object.prototype.hasOwnProperty.call(payload, 'deckId')) setEditingDeckId(null);
      if (typeof payload.keyword === 'string') setGlobalKeyword(payload.keyword);
      setRoute(next);
    };

    const layoutProps = { nav, profile };

    if (route === 'login') return <LoginPage nav={nav} />;
    if (route === 'register') return <RegisterPage nav={nav} />;
    if (route === 'dashboard') return <DashboardPage {...layoutProps} />;
    if (route === 'slides') return <MySlidesPage {...layoutProps} />;
    if (route === 'shared') return <SharedMaterialsPage {...layoutProps} />;
    if (route === 'settings') return <SettingsPage {...layoutProps} setProfile={setProfile} />;
    if (route === 'detail') return <TemplateDetailPage {...layoutProps} templateId={selectedTemplateId} />;
    if (route === 'editor') return <SlideEditorPage {...layoutProps} templateId={selectedTemplateId} deckId={editingDeckId} />;
    return <TemplateListPage {...layoutProps} initialKeyword={globalKeyword} />;
  }, [route, selectedTemplateId, editingDeckId, globalKeyword, profile]);

  return page;
}

createRoot(document.getElementById('root')).render(<App />);
