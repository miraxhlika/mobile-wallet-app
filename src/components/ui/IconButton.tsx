/**
 * `IconButton`
 *
 * Quick action button (icon + label).
 * Designed to match the Figma-ish rounded-square buttons on the Wallet home screen.
 */
import React, { memo, useCallback, useMemo } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { Pressable, View } from "react-native";

import { AppText } from "./AppText";
import { cn, HIT_SLOP_44 } from "./utils";

export type IconButtonVariant = "primary" | "secondary" | "surface";
export type IconButtonSize = "md" | "lg";

export interface IconButtonProps extends Omit<PressableProps, "children"> {
  icon: React.ReactNode;
  label?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  className?: string;
  iconContainerClassName?: string;
  labelClassName?: string;
}

const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-surface border border-border",
  surface: "bg-surface-elevated",
};

const SIZE_CLASS: Record<IconButtonSize, { outer: string; inner: string }> = {
  // Outer width keeps label centered; inner is the visible button.
  md: { outer: "w-20", inner: "w-16 h-16" }, // 80 / 64
  lg: { outer: "w-22", inner: "w-18 h-18" }, // 88 / 72
};

function IconButtonImpl({
  icon,
  label,
  variant = "primary",
  size = "md",
  disabled,
  className,
  iconContainerClassName,
  labelClassName,
  style,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: IconButtonProps) {
  const combinedStyle = useCallback(
    ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => {
      const userStyle =
        typeof style === "function" ? style({ pressed }) : style;
      return [{ opacity: pressed && !disabled ? 0.85 : 1 }, userStyle];
    },
    [disabled, style]
  );

  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label ?? "Action"}
      accessibilityHint={accessibilityHint}
      hitSlop={HIT_SLOP_44}
      style={combinedStyle}
      className={cn(
        "items-center justify-start",
        SIZE_CLASS[size].outer,
        className
      )}
    >
      <View
        className={cn(
          "items-center justify-center rounded-[20px]",
          SIZE_CLASS[size].inner,
          VARIANT_CLASS[variant],
          disabled && "opacity-50",
          iconContainerClassName
        )}
      >
        {icon}
      </View>
      {label ? (
        <AppText
          variant="caption"
          className={cn("mt-2 text-text-secondary", labelClassName)}
          numberOfLines={1}
        >
          {label}
        </AppText>
      ) : null}
    </Pressable>
  );
}

export const IconButton = memo(IconButtonImpl);
