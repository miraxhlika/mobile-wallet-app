/**
 * `AppText`
 *
 * Typography wrapper for consistent text styles via NativeWind tokens.
 * Respects dynamic type (allowFontScaling=true by default).
 */
import React, { memo } from "react";
import type { TextProps } from "react-native";
import { Text } from "react-native";

import { cn } from "./utils";

export type AppTextVariant =
  | "display"
  | "title"
  | "body"
  | "label"
  | "caption";

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  className?: string;
}

const VARIANT_CLASS: Record<AppTextVariant, string> = {
  display: "text-display text-text-primary",
  title: "text-title text-text-primary",
  body: "text-body text-text-primary",
  label: "text-label text-text-primary",
  caption: "text-caption text-text-secondary",
};

function AppTextImpl({
  variant = "body",
  className,
  allowFontScaling = true,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      allowFontScaling={allowFontScaling}
      className={cn(VARIANT_CLASS[variant], className)}
    />
  );
}

export const AppText = memo(AppTextImpl);


