/**
 * Transaction Details Screen (Figma-ish composition)
 */

import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

import type { TransactionDetailsScreenProps } from "../../navigation/types";
import { AppText, Button, ErrorState, useToast } from "../../components";
import { useTransactionById } from "./hooks";
import { TransactionDetailsCard, TransactionDetailsHeader, formatDateMDY } from "./components";
import { transactionStatusColor, transactionStatusLabel } from "./components/status";

export function TransactionDetailsScreen({
  route,
}: TransactionDetailsScreenProps) {
  const { transactionId } = route.params;
  const { showToast } = useToast();

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

  const handleDownloadReceipt = useCallback(() => {
    showToast("Receipt download (TODO)", "info");
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#222222" }} edges={["bottom"]}>
      <View className="flex-1 bg-bg">
        <ScrollView contentContainerClassName="px-5 pt-6 pb-10 gap-5">
          <TransactionDetailsHeader
            direction={direction}
            amount={amountText}
            currency={transaction.currency}
            onCopyAmount={handleCopyAmount}
          />

          <TransactionDetailsCard
            rows={[
              {
                label: "Status",
                value: transactionStatusLabel(transaction.status),
                valueStyle: { color: transactionStatusColor(transaction.status) },
              },
              {
                label: "Transaction number",
                value: transaction.id,
                isCopyable: true,
              },
              { label: "Transaction type", value: transaction.type },
              {
                label: "Payment date",
                value: formatDateMDY(new Date(transaction.createdAt)),
              },
              { label: "Description", value: transaction.description },
            ]}
          />

          {transaction.metadata &&
          Object.keys(transaction.metadata).length > 0 ? (
            <TransactionDetailsCard
              title="Details"
              rows={Object.entries(transaction.metadata).map(([k, v]) => ({
                label: k.replace(/_/g, " "),
                value: String(v),
              }))}
            />
          ) : null}

          <Button
            label="Download receipt"
            onPress={handleDownloadReceipt}
            variant="secondary"
            fullWidth
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
