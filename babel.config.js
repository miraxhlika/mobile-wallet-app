module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      // NativeWind v4 uses react-native-css-interop under the hood.
      // Its Babel integration is a *preset* (it returns { plugins: [...] }).
      "nativewind/babel",
    ],
  };
};
