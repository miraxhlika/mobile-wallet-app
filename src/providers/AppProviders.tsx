/**
 * Root providers wrapper.
 *
 * Combines all providers in the correct order:
 * 1. SafeAreaProvider (outermost for safe area context)
 * 2. QueryProvider (React Query)
 * 3. ToastProvider (toast notifications)
 * 4. NavigationContainer (navigation)
 */

import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { QueryProvider } from "./QueryProvider";
import { ToastProvider } from "../components";
import { useAuthStore } from "../features/auth";
import { useSettingsStore } from "../features/wallet";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Hydration wrapper to load persisted state before rendering the app
 */
function HydrationGate({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);

  useEffect(() => {
    async function hydrate() {
      await Promise.all([hydrateAuth(), hydrateSettings()]);
      setIsReady(true);
    }
    hydrate();
  }, [hydrateAuth, hydrateSettings]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <>{children}</>;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryProvider>
          <NavigationContainer>
            <ToastProvider>
              <HydrationGate>{children}</HydrationGate>
            </ToastProvider>
          </NavigationContainer>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
