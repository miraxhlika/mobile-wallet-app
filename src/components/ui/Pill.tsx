/**
 * `Pill`
 *
 * Small rounded status label (Completed/Pending/Declined/etc.).
 */
import React, { memo } from "react";
import type { ViewProps } from "react-native";
import { View } from "react-native";

import { AppText } from "./AppText";
import { cn } from "./utils";

export type PillTone = "success" | "warning" | "danger" | "muted" | "info";

export interface PillProps extends Omit<ViewProps, "children"> {
  text: string;
  tone?: PillTone;
  className?: string;
  textClassName?: string;
}

const TONE_CLASS: Record<PillTone, string> = {
  success: "bg-success/20",
  warning: "bg-warning/20",
  danger: "bg-danger/20",
  muted: "bg-surface-elevated",
  info: "bg-primary/20",
};

const TONE_TEXT: Record<PillTone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  muted: "text-text-secondary",
  info: "text-primary",
};

function PillImpl({
  text,
  tone = "muted",
  className,
  textClassName,
  ...props
}: PillProps) {
  return (
    <View
      {...props}
      className={cn(
        "px-3 py-1 rounded-pill self-start",
        TONE_CLASS[tone],
        className
      )}
    >
      <AppText
        variant="caption"
        className={cn("font-semibold", TONE_TEXT[tone], textClassName)}
        numberOfLines={1}
      >
        {text}
      </AppText>
    </View>
  );
}

export const Pill = memo(PillImpl);


