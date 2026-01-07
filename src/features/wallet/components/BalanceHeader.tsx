/**
 * `BalanceHeader`
 *
 * Wallet header block: currency label + optional info button + large amount.
 */
import React, { memo } from "react";
import { Pressable, View } from "react-native";

import { AppText, cn, HIT_SLOP_44 } from "../../../components";
import { InfoCircleIcon } from "../../../components/icons";

export interface BalanceHeaderProps {
  currencyCode: string;
  amount: string;
  onInfoPress?: () => void;
  className?: string;
}

function BalanceHeaderImpl({
  currencyCode,
  amount,
  onInfoPress,
  className,
}: BalanceHeaderProps) {
  return (
    <View className={cn("items-center", className)}>
      <View className="flex-row items-center gap-2">
        <AppText variant="caption" className="text-text-secondary">
          {currencyCode} balance
        </AppText>
        {onInfoPress ? (
          <Pressable
            onPress={onInfoPress}
            accessibilityRole="button"
            accessibilityLabel="Balance info"
            hitSlop={HIT_SLOP_44}
            className="p-1"
          >
            <InfoCircleIcon size={16} color="#9E9FA6" />
          </Pressable>
        ) : null}
      </View>
      <AppText variant="display" className="mt-2">
        {amount} {currencyCode}
      </AppText>
    </View>
  );
}

export const BalanceHeader = memo(BalanceHeaderImpl);
