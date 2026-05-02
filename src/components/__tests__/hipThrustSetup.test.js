// Hip Thrust Setup tests — Foundation 4A (Batch B Task 5).
import { describe, it, expect, beforeEach } from 'vitest';
import { createHipThrustSetup, HIP_THRUST_FORM_GUIDE } from '../hipThrustSetup.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('Hip Thrust Setup — render', () => {
  it('renders root element with data-component', () => {
    const { element } = createHipThrustSetup();
    expect(element.getAttribute('data-component')).toBe('hipThrustSetup');
    expect(element.classList.contains('hip-thrust-setup')).toBe(true);
  });

  it('renders title', () => {
    const { element } = createHipThrustSetup();
    const title = element.querySelector('.hip-thrust-setup__title');
    expect(title.textContent).toBe('Hip Thrust pe aparat');
  });

  it('renders ROM + foot placeholder slots', () => {
    const { element } = createHipThrustSetup();
    const rom = element.querySelector('[data-slot="rom"]');
    const foot = element.querySelector('[data-slot="foot"]');
    expect(rom).not.toBeNull();
    expect(foot).not.toBeNull();
    // Pending image pilot — placeholder text required.
    expect(rom.textContent).toContain('Imagine în lucru');
    expect(foot.textContent).toContain('Imagine în lucru');
  });

  it('renders LOCKED form guide wording verbatim', () => {
    const { element } = createHipThrustSetup();
    const guide = element.querySelector('.hip-thrust-setup__guide');
    expect(guide.textContent).toBe(HIP_THRUST_FORM_GUIDE);
  });

  it('LOCKED guide contains all 4 fix elements per §1.5.2', () => {
    expect(HIP_THRUST_FORM_GUIDE).toContain('așezat pe sol');
    expect(HIP_THRUST_FORM_GUIDE).toContain('împingând puternic în călcâie');
    expect(HIP_THRUST_FORM_GUIDE).toContain('Cobori controlat');
    expect(HIP_THRUST_FORM_GUIDE).toContain('nu hiperextinde lombarii');
  });
});

describe('Hip Thrust Setup — weight input', () => {
  it('defaults to 0 when no initialKg', () => {
    const setup = createHipThrustSetup();
    expect(setup.getKg()).toBe(0);
  });

  it('respects initialKg', () => {
    const setup = createHipThrustSetup({ initialKg: 80 });
    expect(setup.getKg()).toBe(80);
  });

  it('rejects negative initialKg', () => {
    const setup = createHipThrustSetup({ initialKg: -10 });
    expect(setup.getKg()).toBe(0);
  });

  it('rejects absurd initialKg', () => {
    const setup = createHipThrustSetup({ initialKg: 5000 });
    expect(setup.getKg()).toBe(0);
  });

  it('setKg updates input', () => {
    const setup = createHipThrustSetup();
    setup.setKg(95);
    expect(setup.getKg()).toBe(95);
  });

  it('input has correct attributes', () => {
    const setup = createHipThrustSetup({ initialKg: 50 });
    const input = setup.element.querySelector('input');
    expect(input.type).toBe('number');
    expect(input.min).toBe('0');
    expect(input.step).toBe('2.5');
    expect(input.getAttribute('aria-label')).toBe('Greutate kg');
  });

  it('onChange fires when input changes', () => {
    let captured = null;
    const setup = createHipThrustSetup({
      initialKg: 80,
      onChange: (kg) => { captured = kg; },
    });
    const input = setup.element.querySelector('input');
    input.value = '90';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(captured).toBe(90);
  });

  it('dispose removes input listener', () => {
    let calls = 0;
    const setup = createHipThrustSetup({
      onChange: () => { calls++; },
    });
    const input = setup.element.querySelector('input');
    input.value = '50';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(calls).toBe(1);

    setup.dispose();
    input.value = '60';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(calls).toBe(1); // no further fires
  });
});
