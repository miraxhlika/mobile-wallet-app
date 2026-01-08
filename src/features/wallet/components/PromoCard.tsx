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
  const promoImage = require("../../../../assets/illustrations/card-promo.png");

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={buttonLabel}
      className={cn("w-full", className)}
      style={{ width: "100%" }}
    >
      {/* Android note: `overflow-hidden` on Pressable doesn't reliably clip children.
          Clip inside a non-Pressable surface instead. */}
      <View
        className="w-full overflow-hidden rounded-md"
        style={{
          width: "100%",
          height: 170,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <Image
          source={promoImage}
          resizeMode="cover"
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "none",
            transform: [{ scale: 1.13 }],
          }}
        />
      </View>
    </Pressable>
  );
}

export const PromoCard = memo(PromoCardImpl);
