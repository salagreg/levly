// ================================================================
// OnboardingScreen - Onboarding premium Levly
// ================================================================

import React, { useRef, useState, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Path,
  Rect,
  Polygon,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient as SvgLinearGradient,
  Line,
} from "react-native-svg";
import { FONTS, COLORS } from "../config/theme";

const { width } = Dimensions.get("window");
const CX = width / 2;

// ================================================================
// SVG Slide 1 — Progression
// ================================================================
const IllustrationSlide1 = () => (
  <Svg width={width} height={280} viewBox={`0 0 ${width} 280`}>
    <Defs>
      <RadialGradient id="glow1" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="#5B7EBD" stopOpacity="0.15" />
        <Stop offset="100%" stopColor="#5B7EBD" stopOpacity="0" />
      </RadialGradient>
      <SvgLinearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#7B9FD4" />
        <Stop offset="100%" stopColor="#3D5A8A" />
      </SvgLinearGradient>
      <SvgLinearGradient id="bar2" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#9AB8E0" />
        <Stop offset="100%" stopColor="#5B7EBD" />
      </SvgLinearGradient>
      <SvgLinearGradient id="bar3" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#BDD0EC" />
        <Stop offset="100%" stopColor="#7B9FD4" />
      </SvgLinearGradient>
    </Defs>

    <Circle cx={CX} cy={140} r={130} fill="url(#glow1)" />

    <Rect
      x={CX - 100}
      y={185}
      width={38}
      height={55}
      rx={10}
      fill="url(#bar3)"
      opacity={0.6}
    />
    <Rect
      x={CX - 46}
      y={150}
      width={38}
      height={90}
      rx={10}
      fill="url(#bar2)"
      opacity={0.75}
    />
    <Rect
      x={CX + 8}
      y={110}
      width={38}
      height={130}
      rx={10}
      fill="url(#bar1)"
      opacity={0.9}
    />
    <Rect
      x={CX + 62}
      y={65}
      width={38}
      height={175}
      rx={10}
      fill="url(#bar1)"
    />

    <Path
      d={`M ${CX - 81} 178 L ${CX - 27} 143 L ${CX + 27} 103 L ${CX + 81} 52`}
      stroke="#EEF3FB"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity={0.9}
    />

    {[
      [CX - 81, 178],
      [CX - 27, 143],
      [CX + 27, 103],
    ].map(([cx, cy], i) => (
      <Circle key={i} cx={cx} cy={cy} r={6} fill="#fff" opacity={0.85} />
    ))}
    <Circle cx={CX + 81} cy={52} r={9} fill="#fff" />

    <Polygon
      points={`${CX + 81},28 ${CX + 86},42 ${CX + 100},42 ${CX + 89},51 ${
        CX + 93
      },65 ${CX + 81},56 ${CX + 69},65 ${CX + 73},51 ${CX + 62},42 ${
        CX + 76
      },42`}
      fill="#FCD34D"
    />

    <Circle cx={CX - 130} cy={75} r={18} fill="#5B7EBD" opacity={0.12} />
    <Circle cx={CX + 140} cy={210} r={24} fill="#3D5A8A" opacity={0.08} />
    <Circle cx={CX - 105} cy={230} r={10} fill="#7B9FD4" opacity={0.25} />
  </Svg>
);

// ================================================================
// SVG Slide 3 — Récompenses
// ================================================================
const IllustrationSlide3 = () => (
  <Svg width={width} height={280} viewBox={`0 0 ${width} 280`}>
    <Defs>
      <RadialGradient id="glow3" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="#5B7EBD" stopOpacity="0.18" />
        <Stop offset="100%" stopColor="#5B7EBD" stopOpacity="0" />
      </RadialGradient>
      <SvgLinearGradient id="trophy" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#7B9FD4" />
        <Stop offset="100%" stopColor="#3D5A8A" />
      </SvgLinearGradient>
    </Defs>

    <Circle cx={CX} cy={140} r={130} fill="url(#glow3)" />

    <Path
      d={`M ${CX - 38} 65 L ${CX - 38} 155 Q ${CX - 38} 182 ${CX} 182 Q ${
        CX + 38
      } 182 ${CX + 38} 155 L ${CX + 38} 65 Z`}
      fill="url(#trophy)"
    />
    <Path
      d={`M ${CX - 38} 88 Q ${CX - 70} 88 ${CX - 70} 120 Q ${CX - 70} 150 ${
        CX - 38
      } 150`}
      stroke="#7B9FD4"
      strokeWidth={9}
      fill="none"
      strokeLinecap="round"
    />
    <Path
      d={`M ${CX + 38} 88 Q ${CX + 70} 88 ${CX + 70} 120 Q ${CX + 70} 150 ${
        CX + 38
      } 150`}
      stroke="#7B9FD4"
      strokeWidth={9}
      fill="none"
      strokeLinecap="round"
    />

    <Rect x={CX - 16} y={182} width={32} height={18} rx={4} fill="#5B7EBD" />
    <Rect x={CX - 32} y={197} width={64} height={10} rx={5} fill="#7B9FD4" />

    <Polygon
      points={`${CX},88 ${CX + 9},108 ${CX + 30},108 ${CX + 14},122 ${
        CX + 20
      },142 ${CX},130 ${CX - 20},142 ${CX - 14},122 ${CX - 30},108 ${
        CX - 9
      },108`}
      fill="#EEF3FB"
      opacity={0.95}
    />

    <Circle cx={CX - 92} cy={105} r={20} fill="#FCD34D" opacity={0.9} />
    <Circle cx={CX + 98} cy={95} r={16} fill="#FCD34D" opacity={0.8} />
    <Circle cx={CX - 82} cy={205} r={13} fill="#F59E0B" opacity={0.65} />
    <Circle cx={CX + 88} cy={200} r={17} fill="#FCD34D" opacity={0.75} />

    <Polygon
      points={`${CX - 125},45 ${CX - 120},58 ${CX - 107},58 ${CX - 117},67 ${
        CX - 113
      },80 ${CX - 125},71 ${CX - 137},80 ${CX - 133},67 ${CX - 143},58 ${
        CX - 130
      },58`}
      fill="#FCD34D"
      opacity={0.55}
    />
    <Polygon
      points={`${CX + 122},165 ${CX + 126},174 ${CX + 135},174 ${
        CX + 128
      },180 ${CX + 130},189 ${CX + 122},184 ${CX + 114},189 ${CX + 116},180 ${
        CX + 109
      },174 ${CX + 118},174`}
      fill="#F59E0B"
      opacity={0.65}
    />

    <Rect
      x={CX - 142}
      y={155}
      width={8}
      height={8}
      rx={2}
      fill="#7B9FD4"
      opacity={0.6}
    />
    <Rect
      x={CX + 132}
      y={68}
      width={8}
      height={8}
      rx={2}
      fill="#BDD0EC"
      opacity={0.7}
    />
    <Rect
      x={CX - 112}
      y={245}
      width={6}
      height={6}
      rx={1}
      fill="#FC4C02"
      opacity={0.5}
    />
    <Rect
      x={CX + 102}
      y={235}
      width={6}
      height={6}
      rx={1}
      fill="#5B7EBD"
      opacity={0.55}
    />
  </Svg>
);

// ================================================================
// Slide 2 — Sync avec vraies icônes qui lévitent
// ================================================================
const IllustrationSlide2 = () => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;
  const anim4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -10,
            duration: 1400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ])
      );

    makeLoop(anim1, 0).start();
    makeLoop(anim2, 350).start();
    makeLoop(anim3, 700).start();
    makeLoop(anim4, 1050).start();
  }, []);

  const ORBIT_R = 100;
  const CENTER_X = width / 2;
  const CENTER_Y = 140;

  const appIcons = [
    {
      anim: anim1,
      angle: -90,
      logo: require("../../assets/images/logo_strava.png"),
    },
    {
      anim: anim2,
      angle: 0,
      logo: require("../../assets/images/logo_garmin.png"),
    },
    {
      anim: anim3,
      angle: 90,
      logo: require("../../assets/images/logo_headspace.png"),
    },
    {
      anim: anim4,
      angle: 180,
      logo: require("../../assets/images/logo_googlefit.png"),
    },
  ];

  return (
    <View
      style={{
        width,
        height: 280,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={width}
        height={280}
        viewBox={`0 0 ${width} 280`}
        style={{ position: "absolute" }}
      >
        <Defs>
          <RadialGradient id="glow2" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#5B7EBD" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#5B7EBD" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Circle cx={CENTER_X} cy={CENTER_Y} r={130} fill="url(#glow2)" />
        <Circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={ORBIT_R}
          stroke="#5B7EBD"
          strokeWidth={1}
          fill="none"
          opacity={0.2}
          strokeDasharray="6,6"
        />
        <Circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={60}
          stroke="#5B7EBD"
          strokeWidth={1}
          fill="none"
          opacity={0.15}
        />

        {appIcons.map((app, i) => {
          const rad = (app.angle * Math.PI) / 180;
          const x2 = CENTER_X + ORBIT_R * Math.cos(rad);
          const y2 = CENTER_Y + ORBIT_R * Math.sin(rad);
          const x1inner = CENTER_X + 38 * Math.cos(rad);
          const y1inner = CENTER_Y + 38 * Math.sin(rad);
          return (
            <Line
              key={i}
              x1={x1inner}
              y1={y1inner}
              x2={x2}
              y2={y2}
              stroke="#5B7EBD"
              strokeWidth={1.5}
              opacity={0.3}
              strokeDasharray="4,4"
            />
          );
        })}
      </Svg>

      {/* Logo Levly au centre */}
      <View style={styles2.centerLogo}>
        <Image
          source={require("../../assets/images/icone_appli_levly.png")}
          style={styles2.centerLogoImg}
          resizeMode="contain"
        />
      </View>

      {/* Icônes apps qui lévitent */}
      {appIcons.map((app, i) => {
        const rad = (app.angle * Math.PI) / 180;
        const x = CENTER_X + ORBIT_R * Math.cos(rad) - 26;
        const y = CENTER_Y + ORBIT_R * Math.sin(rad) - 26;
        return (
          <Animated.View
            key={i}
            style={[
              styles2.appIcon,
              {
                left: x,
                top: y,
                transform: [{ translateY: app.anim }],
              },
            ]}
          >
            <Image
              source={app.logo}
              style={styles2.appIconImg}
              resizeMode="contain"
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles2 = StyleSheet.create({
  centerLogo: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5B7EBD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    left: width / 2 - 36,
    top: 140 - 36,
  },
  centerLogoImg: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  appIcon: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  appIconImg: {
    width: 52,
    height: 52,
  },
});

// ================================================================
// Données des slides
// ================================================================
const slides = [
  {
    id: "1",
    illustration: <IllustrationSlide1 />,
    title: "Transforme tes\nhabitudes",
    description:
      "Développe tes routines quotidiennes et maintiens-les sur le long terme grâce à un système de gamification motivant.",
  },
  {
    id: "2",
    illustration: <IllustrationSlide2 />,
    title: "Sync\nautomatique",
    description:
      "Connecte tes apps préférées. Tes activités sont détectées automatiquement.             Zéro friction, zéro saisie manuelle.",
  },
  {
    id: "3",
    illustration: <IllustrationSlide3 />,
    title: "Gagne des\nrécompenses",
    description:
      "Accumule des tokens à chaque activité validée. Plus tu es constant, plus tu gagnes. Dépasse tes objectifs pour des bonus !",
  },
];

// ================================================================
// Composant Slide
// ================================================================
const Slide = ({ item }: { item: (typeof slides)[0] }) => (
  <View style={styles.slide}>
    <View style={styles.illustrationContainer}>{item.illustration}</View>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  </View>
);

// ================================================================
// Écran principal
// ================================================================
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
      ></TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={{ flex: 1 }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
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

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
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
    backgroundColor: COLORS.background,
  },
  bgCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(91,126,189,0.07)",
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(91,126,189,0.05)",
    bottom: 100,
    left: -60,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: COLORS.medium,
  },
  slide: {
    width,
    flex: 1,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  title: {
    fontSize: 36,
    fontFamily: FONTS.extrabold,
    color: COLORS.dark,
    lineHeight: 42,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.medium,
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: COLORS.lighter,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});
