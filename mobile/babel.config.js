// Babel — Expo SDK 52 + NativeWind v4 + Reanimated 3.
//
// - `babel-preset-expo` with `jsxImportSource: 'nativewind'` rewrites JSX so
//   `className` props flow through NativeWind's styled runtime.
// - NativeWind's CSS-interop transform (its babel-plugin) + the JSX import-source
//   rewrite are added INLINE below instead of via the `nativewind/babel` preset.
//   Reason: nativewind@4.2.4 ships react-native-css-interop@0.2.4 whose
//   `babel.js` unconditionally adds `react-native-worklets/plugin` — a package
//   that only exists for Reanimated 4. On the Expo-pinned Reanimated 3.16
//   (which bundles its own worklet runtime) that module is absent, so the
//   stock preset crashes Metro ("Cannot find module 'react-native-worklets/
//   plugin'"). We replicate the preset's two real plugins and skip the
//   Reanimated-4-only one.
// - `react-native-reanimated/plugin` MUST be last (Reanimated requirement);
//   NativeWind v4 depends on Reanimated for its animation interop.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    plugins: [
      require('react-native-css-interop/dist/babel-plugin').default,
      [
        '@babel/plugin-transform-react-jsx',
        { runtime: 'automatic', importSource: 'react-native-css-interop' },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
