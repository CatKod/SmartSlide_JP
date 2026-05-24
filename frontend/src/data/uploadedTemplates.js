export function getUploadedTemplates() {
  try {
    return JSON.parse(localStorage.getItem('smartslide_uploaded_templates') || '[]');
  } catch {
    return [];
  }
}

export function getAllTemplates(baseTemplates) {
  return [...getUploadedTemplates(), ...baseTemplates];
}
