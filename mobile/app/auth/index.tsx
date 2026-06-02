// ══ AUTH (route '/auth' + '/auth/reactivate') — Magic Link email entry ════
// RN twin of src/react/routes/screens/Auth.tsx. ALL the brain is preserved
// verbatim: sendMagicLink + buildGoogleSignInUrl wiring, Google login-mode-only,
// the signup consent gate, the magic-link sent state, the skip-auth test-drive +
// dev mock login, the ?error= verify-failure surface, and the login/signup mode
// switch. Markup -> View/Text/Pressable/TextInput; lucide-react -> -native.
//
// RN deltas (web-only APIs swapped, behavior kept):
//  - The magic-link continueUrl is the app deep link Linking.createURL(
//    '/auth-callback') (= andura://auth-callback) so Firebase round-trips to the
//    installed app instead of the web origin. (See FLAG in auth-callback.tsx for
//    the Daniel-side deep-link config that makes the OS actually open the app.)
//  - The Google OAuth client id reads EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID (the RN
//    twin of the web VITE_ env var). Empty -> the Google button stays hidden
//    (graceful degradation pre-Daniel-setup), same as web.
//  - import.meta.env.DEV -> __DEV__ for the dev mock-login button.
//  - location.state.mode / ?error= -> useLocalSearchParams (expo-router).
//  - The FB/IG in-app WebView warning is web-PWA only (a native app is not a
//    webview) -> dropped here; the i18n auth.webview.* keys stay used by the PWA.
//  - The legal modal -> RN Modal; the consent links route to the real /terms +
//    /privacy screens. The live-text external links open via Linking.openURL.

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mail,
  FlaskConical,
  ArrowLeft,
  X,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../../src/react/stores/appStore';
import { sendMagicLink, buildGoogleSignInUrl } from '../../../src/auth.js';
import { PulseMark } from '../../components/pulse/PulseMark';
import { dark } from '../../lib/tokens';
import { t, tArray } from '../../../src/i18n/index.js';

// EXPO_PUBLIC_* env vars are inlined by Metro at build (the RN twin of Vite's
// import.meta.env). Daniel configures the Google OAuth client id once pre-launch;
// graceful degradation: the button hides when it's missing.
const GOOGLE_OAUTH_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || '';

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function Auth(): React.JSX.Element {
  const params = useLocalSearchParams<{ mode?: string; error?: string }>();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setSkipAuth = useAppStore((s) => s.setSkipAuth);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // AuthCallback redirects verify-failures to /auth?error=<reason>. Surface a
  // generic message (the raw reason is a Firebase code Gigel can't parse).
  // Cleared once the user edits the email so it doesn't linger.
  const [showVerifyError, setShowVerifyError] = useState(params.error != null);
  // Splash/Auth pass mode='signup' so the user lands on the create-account path;
  // absent -> 'login' (default).
  const initialMode = params.mode === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [consent, setConsent] = useState(false);
  const [legalDoc, setLegalDoc] = useState<'terms' | 'privacy' | null>(null);

  // Signup-only consent gate: no submit without the explicit checkbox.
  const consentRequiredUnmet = mode === 'signup' && !consent;

  async function handleSend(): Promise<void> {
    if (!isValidEmail(email) || sending || consentRequiredUnmet) return;
    setSending(true);
    setError(null);
    // Native: round-trip the magic link to the app deep link, NOT the web origin
    // (_origin() has no window in RN -> would point at andura.local).
    const continueUrl = Linking.createURL('/auth-callback');
    const result = await sendMagicLink(email, continueUrl);
    setSending(false);
    if (result.ok) setSent(true);
    else setError(result.error || 'network_error');
  }

  function handleMockLogin(): void {
    setAuthenticated(true);
    router.replace('/onboarding/1');
  }

  // Skip-auth "test drive" — Maria 65 friction-low entry: try the app local-only
  // without a Magic Link. Data stays Tier 0.
  function handleSkipAuth(): void {
    setSkipAuth(true);
    router.replace('/onboarding/1');
  }

  // Google OAuth via Firebase signInWithIdp REST. buildGoogleSignInUrl returns a
  // Google OAuth 2 URL; the user redirects, lands back on /auth-callback with the
  // #id_token fragment, AuthCallback exchanges it.
  async function handleGoogleSignIn(): Promise<void> {
    if (!GOOGLE_OAUTH_CLIENT_ID) return;
    try {
      const continueUrl = Linking.createURL('/auth-callback');
      const url = buildGoogleSignInUrl(GOOGLE_OAUTH_CLIENT_ID, continueUrl);
      await Linking.openURL(url);
    } catch {
      setError('google_oauth_init_failed');
    }
  }

  const showGoogle = GOOGLE_OAUTH_CLIENT_ID !== '';
  const showMockLogin = __DEV__;
  const sendDisabled = !isValidEmail(email) || sending || consentRequiredUnmet;

  return (
    <SafeAreaView className="flex-1 bg-paper" style={{ backgroundColor: dark.paper }} testID="auth">
      {/* Back button to splash (inline, matching the centered Auth body). */}
      <Pressable
        onPress={() => router.replace('/')}
        accessibilityRole="button"
        accessibilityLabel={t('auth.backAriaLabel')}
        testID="auth-back-splash"
        style={{ position: 'absolute', top: 12, left: 12, padding: 8, zIndex: 10 }}
      >
        <ArrowLeft size={20} color={dark.ink2} />
      </Pressable>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ width: '100%', maxWidth: 384, alignSelf: 'center' }}>
          {/* Pulse header — brand mark + gradient title (renders in accent; see
              Splash FIDELITY FLAG re gradient text). */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <PulseMark size={60} />
          </View>
          <Text
            className="font-display font-bold"
            style={{ color: dark.brick, fontSize: 30, marginBottom: 8, textAlign: 'center' }}
          >
            {sent ? t('auth.sent.title') : mode === 'signup' ? t('auth.signupTitle') : t('auth.loginTitle')}
          </Text>
          <Text className="text-ink2" style={{ fontSize: 14, marginBottom: 24, textAlign: 'center', lineHeight: 20 }}>
            {sent
              ? t('auth.sent.openHint')
              : mode === 'signup'
                ? t('auth.signupSubtitle')
                : t('auth.loginSubtitle')}
          </Text>

          {sent ? (
            <View
              className="bg-paper-2 border border-line"
              style={{ borderRadius: 22, padding: 24, alignItems: 'center' }}
              testID="auth-sent"
            >
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: dark.paper, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Mail size={28} color={dark.brick} />
              </View>
              <Text className="text-ink2" style={{ fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                {t('auth.sent.bodyPrefix')} <Text className="font-semibold text-ink">{email}</Text>{t('auth.sent.bodySuffix')}
              </Text>
              {mode === 'signup' && (
                <Text testID="auth-sent-signup-note" className="text-ink3" style={{ fontSize: 12, marginBottom: 16, textAlign: 'center' }}>
                  {t('auth.sent.signupNote')}
                </Text>
              )}
              <Pressable onPress={() => setSent(false)} testID="auth-back" accessibilityRole="button">
                <Text className="text-ink2" style={{ fontSize: 14, textDecorationLine: 'underline' }}>
                  {t('auth.sent.changeEmailCta')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text className="text-ink2 font-medium" style={{ fontSize: 14, marginBottom: 8 }}>
                {t('auth.emailLabel')}
              </Text>
              <TextInput
                value={email}
                onChangeText={(v) => { setEmail(v); setShowVerifyError(false); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                placeholder={t('auth.emailPlaceholderRo')}
                placeholderTextColor={dark.ink3}
                testID="auth-email-input"
                accessibilityLabel={t('auth.emailLabel')}
                className="bg-paper-2 border border-line-strong text-ink"
                style={{ width: '100%', padding: 16, marginBottom: 16, borderRadius: 22, fontSize: 16, color: dark.ink }}
              />

              {mode === 'signup' && (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16 }} testID="auth-consent">
                  <Pressable
                    onPress={() => setConsent((c) => !c)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: consent }}
                    testID="auth-consent-checkbox"
                    style={{
                      marginTop: 2,
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: consent ? dark.brick : dark.lineStrong,
                      backgroundColor: consent ? dark.brick : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {consent && <Text style={{ color: dark.onAccent, fontSize: 12, fontWeight: '700' }}>✓</Text>}
                  </Pressable>
                  <Text className="text-ink2" style={{ flex: 1, fontSize: 12, lineHeight: 18 }}>
                    {t('auth.consent.labelPrefix')}{' '}
                    <Text
                      onPress={() => router.push('/terms')}
                      testID="auth-consent-terms-link"
                      className="text-brick"
                      style={{ textDecorationLine: 'underline' }}
                    >
                      {t('auth.consent.termsLink')}
                    </Text>{' '}
                    {t('auth.consent.conjunction')}{' '}
                    <Text
                      onPress={() => router.push('/privacy')}
                      testID="auth-consent-privacy-link"
                      className="text-brick"
                      style={{ textDecorationLine: 'underline' }}
                    >
                      {t('auth.consent.privacyLink')}
                    </Text>
                    {t('auth.consent.labelSuffix')}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={() => { void handleSend(); }}
                disabled={sendDisabled}
                testID="auth-send"
                accessibilityRole="button"
                className="bg-brick"
                style={{ width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center', opacity: sendDisabled ? 0.5 : 1 }}
              >
                <Text className="font-semibold" style={{ fontSize: 16, color: dark.onAccent }}>
                  {sending
                    ? t('auth.sendingLabel')
                    : mode === 'signup'
                      ? t('auth.sendCtaSignup')
                      : t('auth.sendCtaLogin')}
                </Text>
              </Pressable>

              {showGoogle && mode === 'login' && (
                <>
                  <Divider testID="auth-divider-google" />
                  <Pressable
                    onPress={() => { void handleGoogleSignIn(); }}
                    testID="auth-google"
                    accessibilityRole="button"
                    className="bg-paper-2 border border-line-strong"
                    style={{ width: '100%', paddingVertical: 16, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <GoogleGlyph />
                    <Text className="font-semibold text-ink" style={{ fontSize: 16 }}>{t('auth.googleCta')}</Text>
                  </Pressable>
                </>
              )}

              {(error || showVerifyError) && (
                <Text
                  testID="auth-error"
                  accessibilityRole="alert"
                  className="text-brick-dark"
                  style={{ marginTop: 12, fontSize: 14, textAlign: 'center' }}
                >
                  {showVerifyError ? t('auth.errorVerify') : t('auth.errorGeneric')}
                </Text>
              )}

              {mode === 'login' ? (
                <Pressable
                  onPress={() => { setMode('signup'); setError(null); }}
                  testID="auth-to-signup"
                  accessibilityRole="button"
                  style={{ width: '100%', marginTop: 16, paddingVertical: 8, alignItems: 'center' }}
                >
                  <Text className="font-semibold" style={{ fontSize: 14, color: dark.aquaInk }}>
                    {t('auth.toSignupCta')}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => { setMode('login'); setConsent(false); setError(null); }}
                  testID="auth-to-login"
                  accessibilityRole="button"
                  style={{ width: '100%', marginTop: 12, paddingVertical: 8, alignItems: 'center' }}
                >
                  <Text className="text-ink2" style={{ fontSize: 14 }}>
                    {t('auth.toLoginPrefix')} <Text className="text-brick" style={{ textDecorationLine: 'underline' }}>{t('auth.toLoginAction')}</Text>
                  </Text>
                </Pressable>
              )}

              {mode === 'login' && (
                <>
                  <Divider testID="auth-divider-skip" />
                  <Pressable
                    onPress={handleSkipAuth}
                    testID="auth-skip"
                    accessibilityRole="button"
                    className="bg-paper-2 border border-line-strong"
                    style={{ width: '100%', marginTop: 12, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <FlaskConical size={16} color={dark.ink2} />
                    <Text className="text-ink2" style={{ fontSize: 14 }}>{t('auth.skip.cta')}</Text>
                  </Pressable>
                  <Text testID="auth-skip-risk-note" className="text-ink3" style={{ marginTop: 8, fontSize: 12, lineHeight: 18, textAlign: 'center' }}>
                    {t('auth.skip.riskNote')}
                  </Text>

                  {showMockLogin && (
                    <Pressable onPress={handleMockLogin} testID="auth-mock" accessibilityRole="button" style={{ width: '100%', marginTop: 12, paddingVertical: 8, alignItems: 'center' }}>
                      <Text className="text-ink2" style={{ fontSize: 12, textDecorationLine: 'underline' }}>{t('auth.mockLoginCta')}</Text>
                    </Pressable>
                  )}
                </>
              )}
            </>
          )}

          {/* Terms + privacy footer (login implicit-consent path; signup gates on
              the explicit checkbox above so the footer is hidden there). */}
          {mode === 'login' && (
            <Text testID="auth-terms-footer" className="text-ink3" style={{ marginTop: 24, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
              {t('auth.termsFooter.prefix')}{' '}
              <Text onPress={() => setLegalDoc('terms')} testID="auth-terms-link" style={{ textDecorationLine: 'underline' }}>
                {t('auth.termsFooter.terms')}
              </Text>{' '}
              {t('auth.termsFooter.conjunction')}{' '}
              <Text onPress={() => setLegalDoc('privacy')} testID="auth-privacy-link" style={{ textDecorationLine: 'underline' }}>
                {t('auth.termsFooter.privacy')}
              </Text>
              {t('auth.termsFooter.suffix')}
            </Text>
          )}
        </View>
      </ScrollView>

      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </SafeAreaView>
  );
}

function Divider({ testID }: { testID: string }): React.JSX.Element {
  return (
    <View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 12 }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: dark.line }} />
      <Text className="font-mono uppercase text-ink3" style={{ fontSize: 11, letterSpacing: 1 }}>{t('auth.dividerOr')}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: dark.line }} />
    </View>
  );
}

function GoogleGlyph(): React.JSX.Element {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </Svg>
  );
}

// Legal doc modal — key points only (full SSOT = Cont screens + andura.app/terms).
function LegalModal({ doc, onClose }: { doc: 'terms' | 'privacy' | null; onClose: () => void }): React.JSX.Element | null {
  if (!doc) return null;
  const isTerms = doc === 'terms';
  const bullets = tArray(isTerms ? 'auth.legal.terms.bullets' : 'auth.legal.privacy.bullets');
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="auth-legal-backdrop"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      >
        <Pressable
          testID="auth-legal-modal"
          accessibilityViewIsModal
          onPress={(e) => e.stopPropagation()}
          className="bg-paper"
          style={{ width: '100%', maxWidth: 448, maxHeight: '80%', borderRadius: 22, padding: 24 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text className="font-bold text-ink" style={{ fontSize: 16 }}>
              {isTerms ? t('auth.legal.terms.title') : t('auth.legal.privacy.title')}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('auth.legal.closeAriaLabel')} testID="auth-legal-close" style={{ padding: 4 }}>
              <X size={20} color={dark.ink2} />
            </Pressable>
          </View>

          <ScrollView>
            <Text className="text-ink2" style={{ fontSize: 14, lineHeight: 22, marginBottom: 10 }}>
              {isTerms ? t('auth.legal.terms.intro') : t('auth.legal.privacy.intro')}
            </Text>
            {bullets.map((line, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <Text className="text-ink2" style={{ fontSize: 14 }}>{'•'}</Text>
                <Text className="text-ink2" style={{ flex: 1, fontSize: 14, lineHeight: 22 }}>{line}</Text>
              </View>
            ))}
            <Text className="text-ink2" style={{ fontSize: 12, marginTop: 16, lineHeight: 18 }}>
              {t('auth.legal.fullTextLabel')}{' '}
              <Text
                onPress={() => { void Linking.openURL('https://andura.app/terms'); }}
                testID="auth-legal-live-link"
                className="text-brick"
                style={{ textDecorationLine: 'underline' }}
              >
                {t('auth.legal.fullTextLink')}
              </Text>
              {!isTerms && (
                <Text className="text-ink2">
                  {' '}{t('auth.legal.gdprPrefix')}{' '}
                  <Text onPress={() => { void Linking.openURL('mailto:privacy@andura.app'); }} className="text-brick" style={{ textDecorationLine: 'underline' }}>
                    {t('auth.legal.gdprEmail')}
                  </Text>
                </Text>
              )}
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
