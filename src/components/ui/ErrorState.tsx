/**
 * `ErrorState`
 *
 * Reusable error block with a retry action.
 */
import React, { memo } from "react";
import type { ViewProps } from "react-native";
import { View } from "react-native";

import { AppText } from "./AppText";
import { Button, type ButtonProps } from "./Button";
import { cn } from "./utils";

export interface ErrorStateProps extends Omit<ViewProps, "children"> {
  title?: string;
  description?: string;
  action?: Pick<ButtonProps, "label" | "onPress" | "loading" | "disabled">;
  className?: string;
}

function ErrorStateImpl({
  title = "Something went wrong",
  description,
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <View
      {...props}
      className={cn("items-center justify-center py-10 px-6", className)}
      accessibilityRole="alert"
    >
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
            loading={action.loading}
            disabled={action.disabled}
            variant="destructive"
            fullWidth
          />
        </View>
      ) : null}
    </View>
  );
}

export const ErrorState = memo(ErrorStateImpl);


