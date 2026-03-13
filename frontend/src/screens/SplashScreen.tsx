// ================================================================
// SplashScreen - Écran de démarrage avec logo
// ================================================================

import React, { useEffect } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const { width } = Dimensions.get("window");

export default function SplashScreenComponent() {
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.hideAsync();
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } finally {
        router.replace("/onboarding/step1");
      }
    }

    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/icone_appli_levly.png")}
        style={styles.splashImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5B7EBD",
    justifyContent: "center",
    alignItems: "center",
  },
  splashImage: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: 28,
  },
});
