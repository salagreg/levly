// ================================================================
// Intégration de la navigation pour les écrans d'onboarding
// ================================================================

import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
