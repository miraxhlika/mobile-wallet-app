/**
 * `TransactionDetailsHeader`
 *
 * Top summary block on transaction details: direction + big amount + optional copy.
 */
import React, { memo, useCallback } from "react";
import { Pressable, View } from "react-native";

import { AppText, HIT_SLOP_44, Pill } from "../../../components";
import { CheckIcon, CopyIcon } from "../../../components/icons";

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

  const [didCopy, setDidCopy] = React.useState(false);
  const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(() => onCopyAmount?.(), [onCopyAmount]);

  React.useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

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
            onPress={() => {
              handleCopy();
              setDidCopy(true);
              if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
              resetTimerRef.current = setTimeout(() => setDidCopy(false), 3000);
            }}
            accessibilityRole="button"
            accessibilityLabel={didCopy ? "Amount copied" : "Copy amount"}
            hitSlop={HIT_SLOP_44}
            className="p-2"
          >
            {didCopy ? (
              <CheckIcon size={20} color="#EFF0F4" />
            ) : (
              <CopyIcon size={20} color="#EFF0F4" />
            )}
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


