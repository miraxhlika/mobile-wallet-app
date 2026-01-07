/**
 * `EmptyState`
 *
 * Reusable "nothing here yet" block with optional action.
 */
import React, { memo } from "react";
import type { ViewProps } from "react-native";
import { View } from "react-native";

import { AppText } from "./AppText";
import { Button, type ButtonProps } from "./Button";
import { cn } from "./utils";

export interface EmptyStateProps extends Omit<ViewProps, "children"> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: Pick<ButtonProps, "label" | "onPress" | "variant" | "loading" | "disabled">;
  className?: string;
}

function EmptyStateImpl({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <View
      {...props}
      className={cn("items-center justify-center py-10 px-6", className)}
      accessibilityRole="summary"
    >
      {icon ? <View className="mb-4">{icon}</View> : null}
      <AppText variant="title" className="text-center">
        {title}
      </AppText>
      {description ? (
        <AppText
          variant="body"
          className="mt-2 text-center text-text-secondary"
        >
          {description}
        </AppText>
      ) : null}
      {action ? (
        <View className="mt-6 w-full">
          <Button
            label={action.label}
            onPress={action.onPress}
            variant={action.variant ?? "primary"}
            loading={action.loading}
            disabled={action.disabled}
            fullWidth
          />
        </View>
      ) : null}
    </View>
  );
}

export const EmptyState = memo(EmptyStateImpl);


