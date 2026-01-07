/**
 * Mobile Wallet App Entry Point
 *
 * Main entry that sets up providers and root navigation.
 */
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

import { AppProviders } from "./src/providers";
import { RootNavigator } from "./src/navigation";

export default function App() {
  // `global.css` should only be loaded on web. Importing CSS on native can crash
  // under the New Architecture (Expo Go always enables it).
  if (Platform.OS === "web") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("./global.css");
  }

  return (
    <AppProviders>
      <StatusBar style="auto" />
      <RootNavigator />
    </AppProviders>
  );
}
