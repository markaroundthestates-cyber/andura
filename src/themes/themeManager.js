import { themes } from './themes.js';

export { themes };

export function applyTheme(themeId) {
  const theme = themes[themeId] || themes.forge;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem('active-theme', theme.id);
  loadGoogleFonts(theme);
  document.documentElement.setAttribute('data-theme', theme.id);
}

export function getActiveTheme() {
  return localStorage.getItem('active-theme') || 'forge';
}

function loadGoogleFonts(theme) {
  const existingLink = document.getElementById('theme-fonts');
  if (existingLink) existingLink.remove();
  const link = document.createElement('link');
  link.id = 'theme-fonts';
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${theme.fonts}&display=swap`;
  document.head.appendChild(link);
}
