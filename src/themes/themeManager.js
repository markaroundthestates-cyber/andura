import { themes } from './themes.js';

export { themes };

export function applyTheme(themeId) {
  const theme = themes[themeId] || themes.forge;
  const root = document.documentElement;
  root.removeAttribute('data-theme');
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem('active-theme', theme.id);
  loadGoogleFonts(theme);
  injectThemeAnimations(theme.id);
  root.setAttribute('data-theme', theme.id);
  setTimeout(() => {
    if (window.renderDash) window.renderDash();
    if (window.renderCoachIdle) window.renderCoachIdle();
  }, 0);
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

function injectThemeAnimations(themeId) {
  const existing = document.getElementById('theme-animations');
  if (existing) existing.remove();
  const style = document.createElement('style');
  style.id = 'theme-animations';

  const animations = {
    forge: `
      @keyframes forgeGlow {
        0%, 100% { box-shadow: 0 0 8px rgba(255,107,26,0.3), 0 0 20px rgba(255,170,0,0.15); }
        50% { box-shadow: 0 0 18px rgba(255,107,26,0.6), 0 0 40px rgba(255,170,0,0.3); }
      }
      [data-theme="forge"] .hero-stats { animation: forgeGlow 3s ease-in-out infinite; }
      [data-theme="forge"] .btn-start:focus, [data-theme="forge"] .btn-done:focus { animation: forgeGlow 2s ease-in-out infinite; }
    `,
    zen: `
      @keyframes zenBreath {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.82; }
      }
      [data-theme="zen"] .card { animation: zenBreath 4s ease-in-out infinite; }
    `,
    anime: `
      @keyframes animeFlicker {
        0%, 100% { box-shadow: 0 0 6px rgba(0,240,255,0.4), 0 0 14px rgba(0,240,255,0.2); }
        33% { box-shadow: 0 0 12px rgba(0,240,255,0.7), 0 0 28px rgba(0,240,255,0.4); }
        66% { box-shadow: 0 0 4px rgba(0,240,255,0.3), 0 0 10px rgba(0,240,255,0.15); }
      }
      [data-theme="anime"] .nb.active { animation: animeFlicker 1.8s ease-in-out infinite; }
      [data-theme="anime"] .rpe-btn.sel { animation: animeFlicker 1.5s ease-in-out infinite; }
    `,
  };

  style.textContent = animations[themeId] || '';
  document.head.appendChild(style);
}
