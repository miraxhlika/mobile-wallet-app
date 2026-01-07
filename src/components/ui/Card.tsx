/**
 * `Card`
 *
 * Surface wrapper with consistent padding/radius and optional elevation.
 * Avoids hard-coded colors by using Tailwind tokens (bg-surface, border).
 */
import React, { memo } from "react";
import type { ViewProps } from "react-native";
import { Platform, View } from "react-native";

import { cn } from "./utils";

export type CardVariant = "default" | "elevated" | "subtle";

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  className?: string;
}

const VARIANT_CLASS: Record<CardVariant, string> = {
  default: "bg-surface rounded-md",
  elevated: "bg-surface-elevated rounded-md",
  subtle: "bg-surface/70 border border-border rounded-md",
};

function CardImpl({
  variant = "default",
  className,
  style,
  ...props
}: CardProps) {
  // NativeWind's `shadow-*` presets are fine, but for custom elevation parity
  // across platforms we add a minimal native shadow when elevated.
  const elevatedShadowStyle =
    variant === "elevated"
      ? Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 10 },
          },
          android: { elevation: 6 },
          default: {},
        })
      : undefined;

  return (
    <View
      {...props}
      style={[elevatedShadowStyle, style]}
      className={cn("p-4", VARIANT_CLASS[variant], className)}
    />
  );
}

export const Card = memo(CardImpl);


