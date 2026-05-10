import { describe, it, expect, beforeEach } from 'vitest';
import { USER_DEFAULTS, getUserConfig, updateUserConfig } from '../user.js';

beforeEach(() => {
  localStorage.removeItem('sf.userConfig');
});

describe('getUserConfig', () => {
  it('returns USER_DEFAULTS when no localStorage override', () => {
    const cfg = getUserConfig();
    expect(cfg).toEqual(USER_DEFAULTS);
    expect(cfg.bio.height).toBe(183);
    expect(cfg.targets.kcal).toBe(2000);
    expect(cfg.firebase.userPath).toBe('users/daniel');
  });

  it('merges localStorage override over defaults', () => {
    localStorage.setItem('sf.userConfig', JSON.stringify({ bio: { height: 180 } }));
    const cfg = getUserConfig();
    expect(cfg.bio.height).toBe(180);
    expect(cfg.targets.kcal).toBe(2000); // default preserved
  });

  it('falls back to defaults on malformed localStorage JSON', () => {
    localStorage.setItem('sf.userConfig', 'not-valid-json');
    const cfg = getUserConfig();
    expect(cfg).toEqual(USER_DEFAULTS);
  });
});

describe('updateUserConfig', () => {
  it('persists patch to localStorage and returns updated config', () => {
    const updated = updateUserConfig({ bio: { height: 175, age: 28 } });
    expect(updated.bio.height).toBe(175);
    expect(updated.bio.age).toBe(28);
    const stored = JSON.parse(localStorage.getItem('sf.userConfig'));
    expect(stored.bio.height).toBe(175);
  });

  it('subsequent getUserConfig reflects persisted update', () => {
    updateUserConfig({ targets: { kcal: 2000 } });
    const cfg = getUserConfig();
    expect(cfg.targets.kcal).toBe(2000);
  });
});
