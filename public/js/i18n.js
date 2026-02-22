// WebArk Internationalization (i18n)
// Load individual locale files first, then this script

let currentLang = localStorage.getItem('webark-lang') || 'en';

function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('webark-lang', lang);
  applyTranslations();
}

function changeLanguage(lang) {
  setLanguage(lang);
}

function applyTranslations() {
  // Apply translations to elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  
  // Translate tab buttons
  const tabs = document.querySelectorAll('.tab-btn');
  if (tabs[0]) tabs[0].textContent = t('about');
  if (tabs[1]) tabs[1].textContent = t('archive');
  if (tabs[2]) tabs[2].textContent = t('crawl');
  if (tabs[3]) tabs[3].textContent = t('history');
  if (tabs[4]) tabs[4].textContent = t('settings');
  
  // Translate provider buttons
  document.querySelectorAll('.provider-btn').forEach(btn => {
    const provider = btn.dataset.provider;
    if (provider === 'wayback') btn.textContent = 'Wayback';
    else if (provider === 'archiveis') btn.textContent = 'archive.is';
    else if (provider === 'archiveph') btn.textContent = 'archive.ph';
    else if (provider === 'ghostarchive') btn.textContent = 'Ghost';
    else if (provider === 'archivevn') btn.textContent = 'ArchiveVN';
    else if (provider === 'textise') btn.textContent = 'Textise';
    else if (provider === 'memento') btn.textContent = 'Memento';
    else if (provider === 'local') btn.textContent = '📱 Local';
  });
}
