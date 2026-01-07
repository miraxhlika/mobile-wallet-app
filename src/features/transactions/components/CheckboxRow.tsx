/**
 * `CheckboxRow`
 *
 * Accessible checkbox row for filter sheets.
 */
import React, { memo, useCallback } from "react";
import { Pressable, View } from "react-native";

import { AppText, cn, HIT_SLOP_44 } from "../../../components";

export interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  className?: string;
}

function CheckboxRowImpl({ label, checked, onToggle, className }: CheckboxRowProps) {
  const handleToggle = useCallback(() => onToggle(), [onToggle]);

  return (
    <Pressable
      onPress={handleToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      hitSlop={HIT_SLOP_44}
      className={cn("flex-row items-center justify-between py-4", className)}
    >
      <AppText variant="body">{label}</AppText>
      <View
        className={cn(
          "h-5 w-5 items-center justify-center rounded-sm border border-border",
          checked && "bg-primary border-primary"
        )}
      >
        {checked ? <AppText variant="caption">✓</AppText> : null}
      </View>
    </Pressable>
  );
}

export const CheckboxRow = memo(CheckboxRowImpl);


