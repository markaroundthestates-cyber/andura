# PWA-only components NOT ported (Wave 2b)

- `InstallPrompt` — N/A on native (no `beforeinstallprompt`; install = App/Play Store). Skipped permanently.
- `OfflineBanner` — deferred to W-Final, will use `@react-native-community/netinfo` instead of `navigator.onLine`.
