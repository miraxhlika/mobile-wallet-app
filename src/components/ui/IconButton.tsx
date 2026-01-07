/**
 * `IconButton`
 *
 * Circular icon button used for quick actions.
 * Ensures adequate hit target and accessibility labels.
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
  md: { outer: "w-16", inner: "w-14 h-14" },
  lg: { outer: "w-20", inner: "w-16 h-16" },
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
          "items-center justify-center rounded-pill",
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
