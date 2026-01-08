/**
 * Cards Screen
 *
 * Placeholder screen for card-related actions (order/manage cards).
 */

import React from "react";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Card, EmptyState, Button } from "../../components";

export function CardsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#222222" }} edges={["bottom"]}>
      <View className="flex-1 bg-bg px-5 pt-4">
        <AppText variant="title">Cards</AppText>

        <View className="mt-4 gap-4">
          <Card variant="elevated" className="gap-3">
            <AppText variant="body" className="text-text-secondary">
              Your card
            </AppText>
            <EmptyState
              icon={
                <Image
                  source={require("../../../assets/icons/money-bag.png")}
                  resizeMode="contain"
                  style={{ width: 44, height: 44 }}
                />
              }
              title="No cards yet"
              description="Order a card to pay online and in stores."
              className="py-8"
            />
            <Button label="Order card" onPress={() => {}} />
          </Card>

          <Card variant="elevated" className="gap-2">
            <AppText variant="body" className="text-text-secondary">
              Coming next
            </AppText>
            <AppText variant="body" className="text-text-secondary">
              Freeze/unfreeze, view PIN, and manage limits.
            </AppText>
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
}


