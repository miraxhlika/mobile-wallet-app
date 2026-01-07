/**
 * Transaction Details Screen (Figma-ish composition)
 */

import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

import type { TransactionDetailsScreenProps } from "../../navigation/types";
import { AppText, Button, Card, ErrorState, HIT_SLOP_44, useToast } from "../../components";
import { ChevronLeftIcon } from "../../components/icons";
import { useTransactionById } from "./hooks";
import { TransactionDetailsCard, TransactionDetailsHeader, formatDateTimeMDY } from "./components";
import { transactionStatusColor, transactionStatusLabel } from "./components/status";
import { useBalances } from "../wallet/hooks";

function capitalize(input: string): string {
  return input.length ? input[0]!.toUpperCase() + input.slice(1) : input;
}

function maskAccount(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 4) return `•••• ${digits.slice(-4)}`;
  if (value.length <= 4) return value;
  return `•••• ${value.slice(-4)}`;
}

export function TransactionDetailsScreen({
  navigation,
  route,
}: TransactionDetailsScreenProps) {
  const { transactionId } = route.params;
  const { showToast } = useToast();
  const [compactTitle, setCompactTitle] = useState(false);
  const { balances } = useBalances();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: compactTitle ? "Transaction details" : "",
      headerLeft: () => (
        <Pressable
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate("MainTabs", { screen: "Home" });
          }}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={HIT_SLOP_44}
          className="px-4 py-3"
        >
          <ChevronLeftIcon size={26} color="#EFF0F4" />
        </Pressable>
      ),
    });
  }, [compactTitle, navigation]);

  const {
    data: transaction,
    isLoading,
    error,
    refetch,
  } = useTransactionById(transactionId);

  const isCredit =
    transaction?.type === "credit" || transaction?.type === "refund";
  const direction = isCredit ? "income" : "expense";

  const amountText = useMemo(() => {
    if (!transaction) return "";
    const sign = isCredit ? "+" : "-";
    return `${sign}${transaction.amount}`;
  }, [isCredit, transaction]);

  const handleCopyAmount = useCallback(async () => {
    if (!transaction) return;
    await Clipboard.setStringAsync(`${amountText} ${transaction.currency}`);
    showToast("Amount copied", "success");
  }, [amountText, showToast, transaction]);

  const handleRepeatPayout = useCallback(() => {
    showToast("Repeat payout (TODO)", "info");
  }, [showToast]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#222222" }} edges={["bottom"]}>
        <View className="flex-1 bg-bg items-center justify-center">
          <ActivityIndicator />
          <AppText variant="caption" className="mt-2 text-text-secondary">
            Loading transaction...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !transaction) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#222222" }} edges={["bottom"]}>
        <View className="flex-1 bg-bg">
          <ErrorState
            title="Failed to load transaction"
            description={error?.message || "Transaction not found"}
            action={{ label: "Try again", onPress: () => refetch() }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const provider =
    transaction.metadata && typeof transaction.metadata["provider"] === "string"
      ? (transaction.metadata["provider"] as string)
      : undefined;

  const method =
    provider === "bank" || provider === "card" ? capitalize(provider) : undefined;

  const fees =
    transaction.metadata && typeof transaction.metadata["fees"] === "object" && transaction.metadata["fees"] !== null
      ? (transaction.metadata["fees"] as Record<string, unknown>)
      : undefined;

  const counterpartyName =
    transaction.metadata && typeof transaction.metadata["counterpartyName"] === "string"
      ? (transaction.metadata["counterpartyName"] as string)
      : transaction.metadata && typeof transaction.metadata["beneficiaryName"] === "string"
      ? (transaction.metadata["beneficiaryName"] as string)
      : transaction.metadata && typeof transaction.metadata["recipientName"] === "string"
      ? (transaction.metadata["recipientName"] as string)
      : transaction.metadata && typeof transaction.metadata["payerName"] === "string"
      ? (transaction.metadata["payerName"] as string)
      : undefined;

  const counterpartyAccountRaw =
    transaction.metadata && typeof transaction.metadata["counterpartyAccount"] === "string"
      ? (transaction.metadata["counterpartyAccount"] as string)
      : transaction.metadata && typeof transaction.metadata["beneficiaryAccount"] === "string"
      ? (transaction.metadata["beneficiaryAccount"] as string)
      : transaction.metadata && typeof transaction.metadata["recipientAccount"] === "string"
      ? (transaction.metadata["recipientAccount"] as string)
      : transaction.metadata && typeof transaction.metadata["payerAccount"] === "string"
      ? (transaction.metadata["payerAccount"] as string)
      : transaction.metadata && typeof transaction.metadata["iban"] === "string"
      ? (transaction.metadata["iban"] as string)
      : transaction.metadata && typeof transaction.metadata["accountNumber"] === "string"
      ? (transaction.metadata["accountNumber"] as string)
      : undefined;

  const counterpartyAccount =
    counterpartyAccountRaw ? maskAccount(counterpartyAccountRaw) : undefined;

  const availableBalance =
    balances.find((b) => b.currency === transaction.currency)?.available;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#222222" }} edges={["bottom"]}>
      <View className="flex-1 bg-bg">
        <ScrollView
          contentContainerClassName="px-5 pt-4 pb-10 gap-5"
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            const next = y > 24;
            if (next !== compactTitle) setCompactTitle(next);
          }}
          scrollEventThrottle={16}
        >
          <AppText variant="title" className="text-text-primary">
            Transaction details
          </AppText>

          <Card variant="elevated" className="p-5">
            <TransactionDetailsHeader
              direction={direction}
              amount={amountText}
              currency={transaction.currency}
              onCopyAmount={handleCopyAmount}
            />
          </Card>

          <TransactionDetailsCard
            showDividers={false}
            rows={[
              { label: "Wallet", value: transaction.currency },
              {
                label: "Transaction type",
                value: direction === "income" ? "Income" : "Expense",
              },
              ...(counterpartyName
                ? [
                    {
                      label: direction === "income" ? "Payer name" : "Beneficiary name",
                      value: counterpartyName,
                    },
                  ]
                : []),
              {
                label: "Status",
                value: transactionStatusLabel(transaction.status),
                valueStyle: { color: transactionStatusColor(transaction.status) },
              },
              {
                label: "Transaction number",
                value: `#${transaction.id}`,
                isCopyable: true,
                onCopy: () => showToast("Transaction number copied", "success"),
              },
              {
                label: "Payment date",
                value: formatDateTimeMDY(new Date(transaction.createdAt)),
              },
              ...(availableBalance
                ? [
                    {
                      label: "Current balance",
                      value: `${availableBalance} ${transaction.currency}`,
                    },
                  ]
                : []),
              ...(method ? [{ label: "Method", value: method }] : []),
              ...(counterpartyAccount
                ? [
                    {
                      label: "Account",
                      value: counterpartyAccount,
                    },
                  ]
                : []),
              ...(fees && Object.keys(fees).length > 0
                ? Object.entries(fees).map(([k, v]) => ({
                    label: `Fee ${k.replace(/_/g, " ")}`,
                    value: String(v),
                  }))
                : []),
              { label: "Details", value: transaction.description },
            ]}
          />

          <Button
            label="Repeat payout"
            onPress={handleRepeatPayout}
            variant="secondary"
            fullWidth
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
