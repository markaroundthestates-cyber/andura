import { describe, it, expect, beforeEach } from 'vitest';
import { renderSettingsPage } from '../settings.js';

describe('Settings page render — Auth Phase 2 Batch 2', () => {
  let root;
  beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  it('renders Setări heading', () => {
    renderSettingsPage({ root, doc: document });
    expect(root.querySelector('h1').textContent).toBe('Setări');
  });

  it('renders 4 sections (email change + recovery + delete + logout)', () => {
    renderSettingsPage({ root, doc: document });
    const sections = root.querySelectorAll('section');
    expect(sections.length).toBe(4);
  });

  it('logout section has button cu wording "Deconectare"', () => {
    renderSettingsPage({ root, doc: document });
    const section = root.querySelector('.andura-settings-logout');
    expect(section).not.toBeNull();
    const btn = section.querySelector('.andura-button-logout');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Deconectare');
  });

  it('email change section has button', () => {
    renderSettingsPage({ root, doc: document });
    const section = root.querySelector('.andura-settings-email-change');
    expect(section.querySelector('button')).not.toBeNull();
  });

  it('recovery email lost section has button cu wording exact', () => {
    renderSettingsPage({ root, doc: document });
    const section = root.querySelector('.andura-settings-recovery-email');
    const btn = section.querySelector('button');
    expect(btn.textContent).toBe('Mi-am pierdut accesul la email');
  });

  it('delete account section has danger button', () => {
    renderSettingsPage({ root, doc: document });
    const section = root.querySelector('.andura-settings-delete-account');
    const btn = section.querySelector('button.andura-button-danger');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Șterge cont definitiv');
  });

  it('null root no-throw', () => {
    expect(() => renderSettingsPage({ root: null, doc: document })).not.toThrow();
  });
});
