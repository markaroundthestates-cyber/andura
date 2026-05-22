// ══ WEBVIEW DETECTION — §15-H3 audit fix (cross-browser compatibility) ════
// Detects in-app browsers (Facebook, Instagram, Twitter/X, TikTok, Snapchat)
// where Magic Link auth flow breaks: link click → opens default browser
// (Chrome) → localStorage scope different → user lands fresh w/o auth state.
//
// Strategy: surface banner on Auth screen asking user to open in Chrome.
// Detection patterns sourced from real-world userAgent samples (Meta WebView
// includes FBAN/FBAV, Instagram includes Instagram/, Twitter/X TwitterAndroid
// or com.twitter.android package, modern X app uses XApp/ token).
//
// Implementation note: NOT exhaustive — userAgent strings can be spoofed.
// Best-effort detection for the most common scenarios. False negatives OK
// (user proceeds normally); false positives display unnecessary banner
// (annoying but not breaking).

export type WebViewSource = 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'snapchat' | null;

/**
 * Detect if running inside a known in-app browser WebView.
 * Returns the platform name or null if browser is standalone Chrome/Firefox/etc.
 */
export function detectWebView(userAgent: string = typeof navigator !== 'undefined' ? navigator.userAgent : ''): WebViewSource {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  if (ua.includes('fban/') || ua.includes('fbav/') || ua.includes('fb_iab')) return 'facebook';
  if (ua.includes('instagram')) return 'instagram';
  // §MED-2 audit fix — anchor twitter token (avoid Chrome UA with random
  // "twitter" word + "android" false positive); add X rebrand patterns:
  // com.twitter.android package id + modern XApp/ token.
  if (ua.includes('twitterandroid') || ua.includes('com.twitter.android') || ua.includes('xapp/')) return 'twitter';
  if (ua.includes('musical_ly') || ua.includes('tiktok')) return 'tiktok';
  if (ua.includes('snapchat')) return 'snapchat';
  return null;
}

/**
 * Human-readable label for banner copy. NO_DIACRITICS rule applied.
 */
export function webViewLabel(source: WebViewSource): string {
  switch (source) {
    case 'facebook': return 'Facebook';
    case 'instagram': return 'Instagram';
    case 'twitter': return 'Twitter / X';
    case 'tiktok': return 'TikTok';
    case 'snapchat': return 'Snapchat';
    default: return '';
  }
}
