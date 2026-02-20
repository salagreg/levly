// ================================================================
// SplashScreen - Écran de démarrage avec logo
// ================================================================

import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent() {
  useEffect(() => {
    async function prepare() {
      try {
        console.log("🚀 SplashScreen monté !");

        // D'abord cacher le splash natif
        await SplashScreen.hideAsync();
        console.log("✅ Splash natif caché");

        // PUIS attendre 2 secondes sur notre écran
        console.log("⏳ Attente 2 secondes...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log("✅ 2 secondes écoulées !");
      } finally {
        console.log("🔄 Navigation vers onboarding...");
        router.replace("/onboarding/step1");
      }
    }

    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/splash_screen.png")}
        style={styles.splashImage}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B3A6B",
  },
  splashImage: {
    width: "100%",
    height: "100%",
  },
});
