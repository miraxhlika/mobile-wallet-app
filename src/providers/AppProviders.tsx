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
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import type { LinkingOptions } from "@react-navigation/native";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { QueryProvider } from "./QueryProvider";
import { ToastProvider } from "../components";
import { useAuthStore } from "../features/auth";
import { useSettingsStore } from "../features/wallet";
import { login } from "../services/api";
import type { RootStackParamList } from "../navigation/types";

interface AppProvidersProps {
  children: React.ReactNode;
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Important: this is what shows through rounded tab bar corners.
    background: "#222222",
    card: "#222222",
    text: "#EFF0F4",
    border: "rgba(255,255,255,0.10)",
    primary: "#FF2C55",
    notification: "#FF2C55",
  },
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["wallet://"],
  config: {
    screens: {
      // Deep link: wallet://tx/{id} -> TransactionDetails({ transactionId: id })
      TransactionDetails: "tx/:transactionId",
      // Keep other screens defined for completeness (optional)
      MainTabs: {
        screens: {
          Home: "home",
          Cards: "cards",
          Info: "info",
        },
      },
      Transactions: "transactions",
      SendPayoutForm: "send",
      SendPayoutReview: "send/review",
      SendPayoutSuccess: "send/success",
      AddFunds: "add-funds",
      Limits: "limits",
    },
  },
};

/**
 * Hydration wrapper to load persisted state before rendering the app
 */
function HydrationGate({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    async function hydrate() {
      await Promise.all([hydrateAuth(), hydrateSettings()]);

      // No login UI in this project: when no token exists, bootstrap a mock token
      // via the mock server's login endpoint.
      const currentToken = useAuthStore.getState().token;
      if (!currentToken) {
        try {
          const tokens = await login("user@example.com", "password123");
          await setToken(tokens.accessToken);
        } catch {
          // If login fails (e.g., API unreachable), proceed anyway.
          // The API client will still attach a fallback `mock_*` token.
        }
      }

      setIsReady(true);
    }
    hydrate();
  }, [hydrateAuth, hydrateSettings, setToken]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF2C55" />
      </View>
    );
  }

  return <>{children}</>;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryProvider>
          <NavigationContainer theme={navTheme} linking={linking}>
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
    backgroundColor: "#222222",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222222",
  },
});
