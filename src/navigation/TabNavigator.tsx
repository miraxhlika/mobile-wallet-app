/**
 * Bottom Tab Navigator
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";

import type { TabParamList } from "./types";
import { HomeScreen } from "../features/wallet/HomeScreen";
import { CardsScreen } from "../features/cards/CardsScreen";
import { InfoScreen } from "../features/info/InfoScreen";
import {
  WalletTabIcon,
  CardTabIcon,
  SettingsTabIcon,
} from "../components/icons";

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#222222" },
        headerTintColor: "#EFF0F4",
        tabBarActiveTintColor: "#EFF0F4",
        tabBarInactiveTintColor: "#9E9FA6",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          title: "Wallet",
          tabBarLabel: "Wallet",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <WalletTabIcon
                size={22}
                color={focused ? "#EFF0F4" : "#9E9FA6"}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Cards"
        component={CardsScreen}
        options={{
          title: "",
          tabBarLabel: "Cards",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <CardTabIcon size={22} color={focused ? "#EFF0F4" : "#9E9FA6"} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Info"
        component={InfoScreen}
        options={{
          title: "",
          tabBarLabel: "Settings",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <SettingsTabIcon
                size={22}
                color={focused ? "#EFF0F4" : "#9E9FA6"}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#434447",
    borderTopColor: "rgba(255,255,255,0.10)",
    paddingTop: 10,
    paddingBottom: 10,
    height: 78,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: "hidden",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
