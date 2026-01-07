/**
 * `CopyRow`
 *
 * Generic "label + value + copy" row, used in bank details and transaction details.
 */
import React, { memo, useCallback } from "react";
import { Pressable, View } from "react-native";
import * as Clipboard from "expo-clipboard";

import { AppText, cn, HIT_SLOP_44 } from "../ui";

export interface CopyRowProps {
  label: string;
  value: string;
  onCopied?: (value: string) => void;
  className?: string;
  accessibilityLabel?: string;
}

function CopyRowImpl({
  label,
  value,
  onCopied,
  className,
  accessibilityLabel,
}: CopyRowProps) {
  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(value);
    onCopied?.(value);
  }, [onCopied, value]);

  return (
    <View className={cn("flex-row items-center justify-between py-3", className)}>
      <View className="flex-1 pr-3">
        <AppText variant="caption" className="text-text-secondary">
          {label}
        </AppText>
        <AppText variant="body" className="mt-1">
          {value}
        </AppText>
      </View>
      <Pressable
        onPress={handleCopy}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `Copy ${label}`}
        hitSlop={HIT_SLOP_44}
        className="rounded-pill bg-surface-elevated px-3 py-2"
      >
        <AppText variant="label">⧉</AppText>
      </Pressable>
    </View>
  );
}

export const CopyRow = memo(CopyRowImpl);


