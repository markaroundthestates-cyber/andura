// §15-H3 audit fix — WebView detect helper tests.

import { describe, it, expect } from 'vitest';
import { detectWebView, webViewLabel } from '../../lib/webviewDetect';

describe('detectWebView — userAgent pattern recognition', () => {
  it('returns null for standard Chrome Android', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    expect(detectWebView(ua)).toBeNull();
  });

  it('returns null for standard Firefox', () => {
    const ua = 'Mozilla/5.0 (Android 13; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0';
    expect(detectWebView(ua)).toBeNull();
  });

  it('detects Facebook WebView via FBAN/FBAV markers', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 [FB_IAB/FB4A;FBAV/443.0.0.30.111;]';
    expect(detectWebView(ua)).toBe('facebook');
  });

  it('detects Facebook WebView via FBAV/ marker only', () => {
    const ua = 'Mozilla/5.0 ... FBAV/443.0.0.30.111';
    expect(detectWebView(ua)).toBe('facebook');
  });

  it('detects Instagram WebView via Instagram marker', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 Instagram 311.0.0.34.118';
    expect(detectWebView(ua)).toBe('instagram');
  });

  it('detects Twitter Android WebView', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 13) ... TwitterAndroid';
    expect(detectWebView(ua)).toBe('twitter');
  });

  it('detects TikTok WebView via musical_ly marker', () => {
    const ua = 'Mozilla/5.0 ... musical_ly_30.0.0';
    expect(detectWebView(ua)).toBe('tiktok');
  });

  it('detects Snapchat WebView', () => {
    const ua = 'Mozilla/5.0 ... Snapchat/12.0.0';
    expect(detectWebView(ua)).toBe('snapchat');
  });

  it('returns null for empty userAgent', () => {
    expect(detectWebView('')).toBeNull();
  });

  it('case-insensitive matching', () => {
    expect(detectWebView('Mozilla ... INSTAGRAM 1.0')).toBe('instagram');
  });
});

describe('webViewLabel — human-readable platform names', () => {
  it('returns label for each known platform', () => {
    expect(webViewLabel('facebook')).toBe('Facebook');
    expect(webViewLabel('instagram')).toBe('Instagram');
    expect(webViewLabel('twitter')).toBe('Twitter / X');
    expect(webViewLabel('tiktok')).toBe('TikTok');
    expect(webViewLabel('snapchat')).toBe('Snapchat');
  });

  it('returns empty string for null source', () => {
    expect(webViewLabel(null)).toBe('');
  });
});
