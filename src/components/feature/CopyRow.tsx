/**
 * `CopyRow`
 *
 * Generic "label + value + copy" row, used in bank details and transaction details.
 */
import React, { memo, useCallback } from "react";
import { Pressable, View } from "react-native";
import * as Clipboard from "expo-clipboard";

import { AppText, cn, HIT_SLOP_44 } from "../ui";
import { CheckIcon, CopyIcon } from "../icons";

export interface CopyRowProps {
  label: string;
  value: string;
  onCopied?: (value: string) => void;
  className?: string;
  accessibilityLabel?: string;
  confirmDurationMs?: number;
}

function CopyRowImpl({
  label,
  value,
  onCopied,
  className,
  accessibilityLabel,
  confirmDurationMs = 3000,
}: CopyRowProps) {
  const [didCopy, setDidCopy] = React.useState(false);
  const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(value);
    onCopied?.(value);
    setDidCopy(true);

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setDidCopy(false), confirmDurationMs);
  }, [confirmDurationMs, onCopied, value]);

  React.useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  return (
    <View className={cn("flex-row items-center justify-between py-4", className)}>
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
        accessibilityLabel={
          accessibilityLabel ?? (didCopy ? `${label} copied` : `Copy ${label}`)
        }
        hitSlop={HIT_SLOP_44}
        className="p-2"
      >
        {didCopy ? (
          <CheckIcon size={20} color="#EFF0F4" />
        ) : (
          <CopyIcon size={20} color="#EFF0F4" />
        )}
      </Pressable>
    </View>
  );
}

export const CopyRow = memo(CopyRowImpl);


