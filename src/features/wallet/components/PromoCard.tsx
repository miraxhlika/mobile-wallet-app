/**
 * `PromoCard`
 *
 * Marketing/promo card with CTA (e.g. "Get your card and use it anywhere").
 */
import React, { memo } from "react";
import { Image, Pressable, View } from "react-native";

import { cn } from "../../../components";

export interface PromoCardProps {
  title: string;
  subtitle?: string;
  buttonLabel: string;
  onPress: () => void;
  className?: string;
}

function PromoCardImpl({
  title,
  buttonLabel,
  onPress,
  className,
}: PromoCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={buttonLabel}
      className={cn(className)}
    >
      {/* Android note: `overflow-hidden` on Pressable doesn't reliably clip children.
          Wrap in a View to ensure all corners (including top) are clipped. */}
      <View className="overflow-hidden rounded-md">
        <Image
          source={require("../../../../assets/illustrations/card-promo.png")}
          resizeMode="cover"
          style={{ width: "100%", height: 140 }}
        />
      </View>
    </Pressable>
  );
}

export const PromoCard = memo(PromoCardImpl);
