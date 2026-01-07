/**
 * UI utilities for NativeWind components.
 *
 * - `cn`: small className joiner (no extra deps).
 * - `HIT_SLOP_44`: ensures ~44x44 minimum tap target for small icon buttons.
 */
import type { Insets } from "react-native";

export function cn(
  ...classes: Array<string | null | undefined | false>
): string {
  return classes.filter(Boolean).join(" ");
}

export const HIT_SLOP_44: Insets = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10,
};


