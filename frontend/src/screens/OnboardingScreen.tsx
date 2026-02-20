// ================================================================
// OnboardingScreen - Écran avec pagination et swipe
// ================================================================

import React, { useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { router } from "expo-router";
import OnboardingSlide from "../components/onboarding/OnboardingSlide";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    icon: "trending-up" as const,
    iconColor: "#FFFFFF",
    iconBgColor: "#8B5CF6",
    title: "Transformez vos habitudes en succès",
    description:
      "Levly vous aide à développer vos routines quotidiennes et à les maintenir sur le long terme grâce à un système de gamification motivant.",
  },
  {
    id: "2",
    icon: "radio-button-on" as const,
    iconColor: "#FFFFFF",
    iconBgColor: "#10B981",
    title: "Suivez vos progrès en temps réel",
    description:
      "Connectez vos applications préférées et suivez automatiquement le temps consacré à votre développement personnel.",
  },
  {
    id: "3",
    icon: "trophy" as const,
    iconColor: "#FFFFFF",
    iconBgColor: "#F59E0B",
    title: "Gagnez des récompenses",
    description:
      "Accumulez des tokens à chaque routine complétée et augmentez votre série de jours consécutifs. Plus vous êtes constant, plus vous gagnez !",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
      });
    } else {
      // Dernier slide → aller vers auth
      router.replace("/auth");
    }
  };

  const handleSkip = () => {
    router.replace("/auth");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.container}>
      {/* Bouton Passer */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <OnboardingSlide {...item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={{ flex: 1 }}
      />

      {/* Footer : Pagination + Bouton */}
      <View style={styles.footer}>
        {/* Points de pagination */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Bouton Suivant */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1
              ? "Prêt pour l'aventure !"
              : "Suivant"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: "#5B7EBD",
    width: 30,
  },
  dotInactive: {
    backgroundColor: "#D1D5DB",
  },
  nextButton: {
    backgroundColor: "#5B7EBD",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
