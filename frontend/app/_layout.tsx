// ================================================================
// app/_layout.tsx - Navigation principale
// ================================================================

import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

// Empêcher le splash de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
