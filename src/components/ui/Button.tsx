/**
 * `Button`
 *
 * Accessible pressable button with variants + sizes.
 * - Uses tokens: bg-primary, text-text-primary, border-border, etc.
 * - Adds a minimum tap target and forwards Pressable props.
 */
import React, { memo, useCallback, useMemo } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { ActivityIndicator, Pressable, View } from "react-native";

import { AppText } from "./AppText";
import { cn } from "./utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-surface border border-border",
  ghost: "bg-transparent",
  destructive: "bg-danger",
};

const TEXT_CLASS: Record<ButtonVariant, string> = {
  primary: "text-text-primary",
  secondary: "text-text-primary",
  ghost: "text-text-primary",
  destructive: "text-text-primary",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "px-4 py-2",
  md: "px-5 py-3",
  lg: "px-6 py-4",
};

function ButtonImpl({
  label,
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  className,
  textClassName,
  style,
  left,
  right,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const indicatorColor = useMemo(() => {
    // Keep it simple; all our variants use light text.
    return "#F5F7FF";
  }, []);

  const combinedStyle = useCallback(
    ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => {
      const userStyle =
        typeof style === "function" ? style({ pressed }) : style;
      return [{ opacity: pressed && !isDisabled ? 0.85 : 1 }, userStyle];
    },
    [isDisabled, style]
  );

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      style={combinedStyle}
      className={cn(
        "rounded-pill items-center justify-center",
        "min-h-[44px]",
        fullWidth && "w-full",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        isDisabled && "opacity-50",
        className
      )}
    >
      <View className="flex-row items-center justify-center gap-2">
        {left}
        {loading ? (
          <ActivityIndicator color={indicatorColor} />
        ) : (
          <AppText
            variant="label"
            className={cn(TEXT_CLASS[variant], textClassName)}
          >
            {label}
          </AppText>
        )}
        {right}
      </View>
    </Pressable>
  );
}

export const Button = memo(ButtonImpl);
