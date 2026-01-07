/**
 * `TransactionRow`
 *
 * Shared transaction list cell used on Home preview and Transactions list.
 * Memoized to avoid unnecessary re-renders in lists.
 */
import React, { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import type { TransactionStatus, TransactionType } from "../../../types";
import { AppText, Card, cn } from "../../../components";
import { transactionStatusColor, transactionStatusLabel } from "./status";

export interface TransactionRowProps {
  id: string;
  title: string;
  date: string;
  amount: string;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  onPress: (id: string) => void;
  className?: string;
  /**
   * If false, hides the status completely (used on Wallet preview per design).
   * Defaults to true.
   */
  showStatus?: boolean;
  /**
   * Controls outer container chrome.
   * - card: renders a Card wrapper (legacy behavior)
   * - plain: renders a transparent row (used inside section cards)
   */
  container?: "card" | "plain";
}

function isCredit(type: TransactionType) {
  return type === "credit" || type === "refund";
}

function TransactionRowImpl({
  id,
  title,
  date,
  amount,
  currency,
  type,
  status,
  onPress,
  className,
  showStatus = true,
  container = "card",
}: TransactionRowProps) {
  const handlePress = useCallback(() => onPress(id), [id, onPress]);
  const positive = isCredit(type);
  const amountClass = "text-text-primary font-semibold";
  const sign = positive ? "+" : "-";

  const Inner = (
    <View className={cn("flex-row items-center justify-between", className)}>
      <View className="flex-1 pr-4">
        <AppText variant="body" numberOfLines={1}>
          {title}
        </AppText>
        <View className="mt-2 flex-row items-center gap-2">
          <AppText variant="caption" className="text-text-secondary">
            {date}
          </AppText>
        </View>
      </View>
      <View className="items-end">
        <AppText
          variant="body"
          className={amountClass}
          style={status === "failed" ? { textDecorationLine: "line-through" } : undefined}
        >
          {sign}
          {amount} {currency}
        </AppText>
        {showStatus ? (
          <Text
            className={cn("mt-1 text-label font-semibold")}
            style={{ color: transactionStatusColor(status) }}
          >
            {transactionStatusLabel(status)}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Transaction: ${title}`}
    >
      {container === "card" ? (
        <Card variant="default" className={cn("p-0", undefined)}>
          <View className="p-4">{Inner}</View>
        </Card>
      ) : (
        Inner
      )}
    </Pressable>
  );
}

export const TransactionRow = memo(TransactionRowImpl);


