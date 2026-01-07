/**
 * Mobile Wallet App Entry Point
 *
 * Main entry that sets up providers and root navigation.
 */
import React from "react";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";

import { AppProviders } from "./src/providers";
import { RootNavigator } from "./src/navigation";

// NativeWind v4 (Expo) entrypoint. Importing here ensures Metro/nativewind picks it up
// and `className` works on native + web.
import "./global.css";

// RN 0.81+ deprecates its built-in SafeAreaView; some dependencies may still reference it.
// We already use `react-native-safe-area-context` in app code; silence the noisy warning in dev.
if (__DEV__) {
  LogBox.ignoreLogs([
    "SafeAreaView has been deprecated and will be removed in a future release.",
  ]);
}

export default function App() {
  if (__DEV__) console.log("[nativewind] App mounted");

  return (
    <AppProviders>
      <StatusBar style="auto" />
      <RootNavigator />
    </AppProviders>
  );
}
