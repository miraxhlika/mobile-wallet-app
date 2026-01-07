/**
 * `TransactionDetailsHeader`
 *
 * Top summary block on transaction details: direction + big amount + optional copy.
 */
import React, { memo, useCallback } from "react";
import { Pressable, View } from "react-native";

import { AppText, HIT_SLOP_44, Pill } from "../../../components";

export interface TransactionDetailsHeaderProps {
  direction: "income" | "expense";
  amount: string;
  currency: string;
  onCopyAmount?: () => void;
}

function TransactionDetailsHeaderImpl({
  direction,
  amount,
  currency,
  onCopyAmount,
}: TransactionDetailsHeaderProps) {
  const title = direction === "income" ? "Income" : "Expense";

  const handleCopy = useCallback(() => onCopyAmount?.(), [onCopyAmount]);

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Pill
          text={title}
          tone="muted"
          textVariant="label"
          className="px-4 py-2"
        />
        {onCopyAmount ? (
          <Pressable
            onPress={handleCopy}
            accessibilityRole="button"
            accessibilityLabel="Copy amount"
            hitSlop={HIT_SLOP_44}
            className="rounded-pill bg-surface-elevated px-3 py-2"
          >
            <AppText variant="label">⧉</AppText>
          </Pressable>
        ) : null}
      </View>
      <AppText variant="display" className="text-text-primary">
        {amount} {currency}
      </AppText>
    </View>
  );
}

export const TransactionDetailsHeader = memo(TransactionDetailsHeaderImpl);


