/**
 * Home Screen (Figma-ish composition)
 *
 * Composed from feature UI pieces:
 * - BalanceHeader
 * - QuickActionsRow
 * - PromoCard
 * - TransactionsPreviewCard
 * - BankDetailsSheet
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import type { HomeScreenProps } from "../../navigation/types";
import { AppText, ErrorState, HIT_SLOP_44, Pill } from "../../components";
import { useInfiniteTransactions } from "../transactions";
import { useBalances } from "./hooks";
import { useSettingsStore } from "./store";
import {
  BalanceHeader,
  BankDetailsSheet,
  PromoCard,
  QuickActionsRow,
  TransactionsPreviewCard,
} from "./components";

const MOCK_BANK_DETAILS = {
  accountName: "Native Teams Limited",
  swift: "SCBLDEFX",
  accountNumber: "1234512345",
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [bankDetailsOpen, setBankDetailsOpen] = useState(false);
  const selectedCurrency = useSettingsStore((s) => s.selectedCurrency);
  const setSelectedCurrency = useSettingsStore((s) => s.setSelectedCurrency);

  const {
    balances,
    isLoading: balancesLoading,
    error: balancesError,
    refetch: refetchBalances,
  } = useBalances();

  const {
    transactions,
    isLoading: txLoading,
    refetch: refetchTransactions,
  } = useInfiniteTransactions();

  const isRefreshing = balancesLoading || txLoading;

  const handleRefresh = useCallback(() => {
    refetchBalances();
    refetchTransactions();
  }, [refetchBalances, refetchTransactions]);

  const currencyOptions = useMemo(() => {
    const fromBalances = balances.map((b) => b.currency).filter(Boolean);
    const unique = Array.from(new Set(fromBalances));
    // Fallback if balances haven't loaded yet.
    return unique.length ? unique : ["EUR", "USD", "GBP"];
  }, [balances]);

  const mainBalance = useMemo(() => {
    return (
      balances.find((b) => b.currency === selectedCurrency) ??
      balances.find((b) => b.currency === "EUR") ??
      balances[0]
    );
  }, [balances, selectedCurrency]);

  const currencyCode = mainBalance?.currency ?? "EUR";
  const amount = mainBalance?.available ?? "0.00";

  return (
    <SafeAreaView
      // Important: SafeAreaView adds inset padding. If it has no backgroundColor,
      // the inset areas show the navigator's default background (often white),
      // which looks like Tailwind styles "aren't applying".
      style={{ flex: 1, backgroundColor: "#222222" }}
      edges={["top", "bottom"]}
    >
      <StatusBar style="light" />
      <View className="flex-1 bg-bg">
        <View className="px-5 pt-3">
          <Image
            source={require("../../../assets/icons/logo-nt.png")}
            resizeMode="contain"
            style={{ width: 28, height: 28 }}
            accessibilityLabel="Native Teams"
          />
        </View>
        <ScrollView
          contentContainerClassName="px-5 pt-4 pb-10 gap-6"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          {/* Currency selector */}
          {currencyOptions.length > 1 ? (
            <View className="flex-row flex-wrap justify-center gap-2">
              {currencyOptions.map((c) => {
                const active = c === currencyCode;
                return (
                  <Pressable
                    key={c}
                    onPress={() => void setSelectedCurrency(c)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select currency ${c}`}
                    accessibilityState={{ selected: active }}
                    hitSlop={HIT_SLOP_44}
                  >
                    <Pill text={c} tone={active ? "info" : "muted"} />
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <BalanceHeader
            currencyCode={currencyCode}
            amount={amount}
            onInfoPress={() => setBankDetailsOpen(true)}
          />

          {balancesLoading && balances.length === 0 ? (
            <View className="items-center py-6">
              <ActivityIndicator />
              <AppText variant="caption" className="mt-2 text-text-secondary">
                Loading...
              </AppText>
            </View>
          ) : null}

          {balancesError ? (
            <ErrorState
              title="Failed to load balances"
              description={balancesError.message}
              action={{ label: "Try again", onPress: () => refetchBalances() }}
            />
          ) : null}

          <QuickActionsRow
            onAdd={() => navigation.navigate("AddFunds")}
            onSend={() => navigation.navigate("SendPayoutForm")}
            onDetails={() => setBankDetailsOpen(true)}
          />

          <PromoCard
            title="Get your card and use it anywhere"
            buttonLabel="Order card"
            onPress={() => navigation.navigate("Cards")}
          />

          <TransactionsPreviewCard
            transactions={transactions}
            onPressSeeAll={() => navigation.navigate("Transactions")}
            onPressItem={(id) =>
              navigation.navigate("TransactionDetails", { transactionId: id })
            }
          />
        </ScrollView>

        <BankDetailsSheet
          visible={bankDetailsOpen}
          onClose={() => setBankDetailsOpen(false)}
          accountName={MOCK_BANK_DETAILS.accountName}
          swift={MOCK_BANK_DETAILS.swift}
          accountNumber={MOCK_BANK_DETAILS.accountNumber}
        />
      </View>
    </SafeAreaView>
  );
}
