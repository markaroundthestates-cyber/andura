// ══ MEDICAL SAFETY DISCLAIMER + T&C MANDATORY ACCEPT GATE ════════════════════
//
// LOCK 4 Medical Safety Disclaimer + T&C Mandatory Accept Onboarding Gate
// per wiki/concepts/medical-safety-disclaimer-t-c-mandatory LOCK V1 2026-05-14.
//
// Pre-onboarding-T0 first-launch gate per Daniel CEO directive verbatim
// chat birou 2026-05-14: "Disclaimer la inceput... si atat conteaza".
//
// Pure-function module — render full-screen overlay, fire opts.onAccept()
// callback on accept, persist localStorage flag Tier 0 parity ADR 020 §1.4.
// Idempotent: if flag already set, skip render + fire callback synchronous.
//
// Engine-layer-zero-touch invariant — anti-paternalism preserved (app NU
// recommends accidentari vs app NU restrictioneaza autonomy user). Engine
// intelligence conservative defaults preserved via existing Periodization +
// Calibration Tiers + RIR Matrix + Demographic Prior cold-start.

import './styles.css';
import { T_AND_C_TEXT_RO } from './tcText.js';

export const MEDICAL_DISCLAIMER_ACCEPTED_KEY = 'wv2-medical-disclaimer-accepted';
export const MEDICAL_DISCLAIMER_VERSION = 'v1';

const DISCLAIMER_TEXT_RO =
  'Andura este o aplicatie informativa, NU consultatie medicala. ' +
  'Antrenamentele sunt facute pe riscul tau. Inainte sa incepi orice ' +
  'program de antrenament, consulta un medic. Andura NU isi asuma ' +
  'responsabilitatea pentru accidentari sau probleme medicale rezultate ' +
  'din folosirea aplicatiei.';

const CHECKBOX_LABEL_RO =
  'Am citit si accept termenii si conditiile + disclaimerul medical';

const HEADER_TITLE_RO = 'Bun venit la Andura';
const TC_LINK_LABEL_RO = 'Vezi termenii si conditiile complete';
const CONTINUE_BUTTON_LABEL_RO = 'Continui';
const TC_MODAL_TITLE_RO = 'Termeni si Conditii';
const TC_MODAL_CLOSE_LABEL_RO = 'Inchide';

function readAcceptedFlag() {
  try {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem(MEDICAL_DISCLAIMER_ACCEPTED_KEY)
      : null;
  } catch {
    return null;
  }
}

function writeAcceptedFlag() {
  try {
    if (typeof localStorage === 'undefined') return;
    const stamp = new Date().toISOString() + '|' + MEDICAL_DISCLAIMER_VERSION;
    localStorage.setItem(MEDICAL_DISCLAIMER_ACCEPTED_KEY, stamp);
  } catch { /* storage full — soft fail, callback still fires */ }
}

export function isMedicalDisclaimerAccepted() {
  return readAcceptedFlag() !== null;
}

// Test/admin escape hatch — clear flag (used by tests + dev tools).
export function clearMedicalDisclaimerAcceptance() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(MEDICAL_DISCLAIMER_ACCEPTED_KEY);
    }
  } catch { /* swallow */ }
}

function buildTCModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'medical-disclaimer-tc-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', TC_MODAL_TITLE_RO);

  const card = document.createElement('div');
  card.className = 'medical-disclaimer-tc-modal-card';

  const title = document.createElement('h2');
  title.className = 'medical-disclaimer-tc-modal-title';
  title.textContent = TC_MODAL_TITLE_RO;

  const body = document.createElement('div');
  body.className = 'medical-disclaimer-tc-modal-body';
  body.textContent = T_AND_C_TEXT_RO;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'medical-disclaimer-tc-modal-close';
  closeBtn.textContent = TC_MODAL_CLOSE_LABEL_RO;
  closeBtn.addEventListener('click', () => {
    backdrop.remove();
  });

  card.appendChild(title);
  card.appendChild(body);
  card.appendChild(closeBtn);
  backdrop.appendChild(card);
  return backdrop;
}

/**
 * Render the medical safety disclaimer + T&C mandatory accept gate.
 *
 * Idempotent: if user already accepted (localStorage flag set), skip render
 * and fire opts.onAccept() synchronously. If already rendered (overlay in
 * DOM), no-op (no double-render).
 *
 * @param {{ onAccept?: () => void }} opts
 *   onAccept — fires after user checks the checkbox AND clicks "Continui".
 */
export function showMedicalDisclaimerGate(opts = {}) {
  const onAccept = typeof opts.onAccept === 'function' ? opts.onAccept : null;

  if (isMedicalDisclaimerAccepted()) {
    if (onAccept) onAccept();
    else console.warn('[medical-disclaimer] no onAccept callback provided');
    return;
  }

  if (document.getElementById('medical-disclaimer-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'medical-disclaimer-overlay';
  overlay.className = 'medical-disclaimer-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', HEADER_TITLE_RO);

  const card = document.createElement('div');
  card.className = 'medical-disclaimer-card';

  const header = document.createElement('h1');
  header.className = 'medical-disclaimer-header';
  header.textContent = HEADER_TITLE_RO;

  const text = document.createElement('p');
  text.className = 'medical-disclaimer-text';
  text.textContent = DISCLAIMER_TEXT_RO;

  const tcLink = document.createElement('button');
  tcLink.type = 'button';
  tcLink.className = 'medical-disclaimer-tc-link';
  tcLink.textContent = TC_LINK_LABEL_RO;
  tcLink.addEventListener('click', () => {
    document.body.appendChild(buildTCModal());
  });

  const checkboxRow = document.createElement('label');
  checkboxRow.className = 'medical-disclaimer-checkbox-row';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'medical-disclaimer-checkbox';
  checkbox.className = 'medical-disclaimer-checkbox';

  const checkboxLabel = document.createElement('span');
  checkboxLabel.className = 'medical-disclaimer-checkbox-label';
  checkboxLabel.textContent = CHECKBOX_LABEL_RO;

  checkboxRow.appendChild(checkbox);
  checkboxRow.appendChild(checkboxLabel);

  const continueBtn = document.createElement('button');
  continueBtn.type = 'button';
  continueBtn.id = 'medical-disclaimer-continue';
  continueBtn.className = 'medical-disclaimer-continue';
  continueBtn.textContent = CONTINUE_BUTTON_LABEL_RO;
  continueBtn.disabled = true;

  checkbox.addEventListener('change', () => {
    continueBtn.disabled = !checkbox.checked;
  });

  continueBtn.addEventListener('click', () => {
    if (continueBtn.disabled) return;
    writeAcceptedFlag();
    overlay.remove();
    if (onAccept) onAccept();
    else console.warn('[medical-disclaimer] no onAccept callback provided');
  });

  // Backdrop tap dismiss BLOCKED — mandatory accept (no close-without-accept).
  // Escape key dismiss BLOCKED — mandatory accept.
  overlay.addEventListener('click', (e) => {
    // Click on overlay backdrop itself (not card or descendants) = blocked.
    if (e.target === overlay) e.stopPropagation();
  });
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  card.appendChild(header);
  card.appendChild(text);
  card.appendChild(tcLink);
  card.appendChild(checkboxRow);
  card.appendChild(continueBtn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}
