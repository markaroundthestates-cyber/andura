import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderSettingsPage } from '../settings.js';

describe('settings — Aparate lipsa section (Bundle 3A)', () => {
  let root;
  beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
    document.body.appendChild(root);
  });
  afterEach(() => {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    document
      .querySelectorAll('.andura-modal-overlay, #aparate-lipsa-modal')
      .forEach((el) => el.remove());
  });

  it('renders andura-settings-aparate-lipsa section', () => {
    renderSettingsPage({ root, doc: document });
    expect(root.querySelector('.andura-settings-aparate-lipsa')).not.toBeNull();
  });

  it('section contains h2 "Aparate lipsa" header', () => {
    renderSettingsPage({ root, doc: document });
    const h2 = root.querySelector('.andura-settings-aparate-lipsa h2');
    expect(h2).not.toBeNull();
    expect(h2.textContent).toBe('Aparate lipsa');
  });

  it('section contains button labeled "Aparate lipsa"', () => {
    renderSettingsPage({ root, doc: document });
    const btn = root.querySelector('.andura-settings-aparate-lipsa button');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Aparate lipsa');
  });

  it('Aparate lipsa section appears between Email change and Recovery email lost', () => {
    renderSettingsPage({ root, doc: document });
    const sections = Array.from(root.querySelectorAll('section.andura-settings-section'));
    const emailIdx = sections.findIndex((s) =>
      s.classList.contains('andura-settings-email-change')
    );
    const aparateIdx = sections.findIndex((s) =>
      s.classList.contains('andura-settings-aparate-lipsa')
    );
    const recoveryIdx = sections.findIndex((s) =>
      s.classList.contains('andura-settings-recovery-email')
    );
    expect(emailIdx).toBeGreaterThan(-1);
    expect(aparateIdx).toBeGreaterThan(-1);
    expect(recoveryIdx).toBeGreaterThan(-1);
    expect(aparateIdx).toBeGreaterThan(emailIdx);
    expect(aparateIdx).toBeLessThan(recoveryIdx);
  });
});
