// ================================================================
// StoreScreen - Store de récompenses
// ================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, COLORS } from "../config/theme";

// ================================================================
// Données
// ================================================================
const DONS = [
  {
    id: "d1",
    emoji: "🌍",
    name: "WWF France",
    description:
      "Protège les espèces menacées et préserve les écosystèmes naturels.",
    tokens: 200,
    impact: "2€ reversés",
    color: "#34A853",
    url: "https://don.wwf.fr",
  },
  {
    id: "d2",
    emoji: "🏥",
    name: "Croix-Rouge",
    description: "Aide les personnes vulnérables en France et dans le monde.",
    tokens: 300,
    impact: "3€ reversés",
    color: "#E53E3E",
    url: "https://don.croix-rouge.fr",
  },
  {
    id: "d3",
    emoji: "🦁",
    name: "Sea Shepherd",
    description: "Défend et protège les océans et la vie marine.",
    tokens: 250,
    impact: "2.5€ reversés",
    color: "#2B6CB0",
    url: "https://www.seashepherd.fr/faire-un-don",
  },
  {
    id: "d4",
    emoji: "🌱",
    name: "GoodPlanet",
    description:
      "Agis pour le climat et la biodiversité avec des projets concrets.",
    tokens: 150,
    impact: "1.5€ reversés",
    color: "#38A169",
    url: "https://www.goodplanet.org/fr/faire-un-don",
  },
];

const REDUCTIONS = [
  {
    id: "r1",
    emoji: "🏋️",
    name: "Decathlon",
    description: "Réduction sur tout le matériel sport",
    tokens: 500,
    reduction: "-20%",
    color: "#0082C3",
    coming: true,
  },
  {
    id: "r2",
    emoji: "👟",
    name: "Nike",
    description: "Offres exclusives sur les collections running",
    tokens: 800,
    reduction: "-15%",
    color: "#111111",
    coming: true,
  },
  {
    id: "r3",
    emoji: "🧘",
    name: "Headspace",
    description: "1 mois de méditation guidée offert",
    tokens: 1000,
    reduction: "1 mois offert",
    color: "#F97316",
    coming: true,
  },
  {
    id: "r4",
    emoji: "🌿",
    name: "Calm",
    description: "Accès premium à toutes les méditations",
    tokens: 900,
    reduction: "1 mois offert",
    color: "#4A90D9",
    coming: true,
  },
  {
    id: "r5",
    emoji: "⌚",
    name: "Garmin",
    description: "Remise sur les montres connectées sport",
    tokens: 1500,
    reduction: "-10%",
    color: "#1C1C1E",
    coming: true,
  },
];

// ================================================================
// Card Don
// ================================================================
const DonCard = ({ don, userTokens }: { don: any; userTokens: number }) => {
  const canAfford = userTokens >= don.tokens;

  const handleDon = () => {
    Linking.openURL(don.url);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[styles.cardEmoji, { backgroundColor: `${don.color}18` }]}>
          <Text style={styles.emojiText}>{don.emoji}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{don.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {don.description}
          </Text>
          <View style={styles.impactRow}>
            <Ionicons name="heart" size={12} color={don.color} />
            <Text style={[styles.impactText, { color: don.color }]}>
              {don.impact}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <View style={styles.tokenCost}>
          <Text style={styles.tokenCostText}>🪙 {don.tokens}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: canAfford ? don.color : COLORS.lighter },
          ]}
          onPress={handleDon}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.actionBtnText,
              { color: canAfford ? "#fff" : COLORS.medium },
            ]}
          >
            {canAfford ? "Donner" : "Insuffisant"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ================================================================
// Card Réduction
// ================================================================
const ReductionCard = ({ item }: { item: any }) => (
  <View style={[styles.card, styles.cardDisabled]}>
    <View style={styles.cardLeft}>
      <View style={[styles.cardEmoji, { backgroundColor: `${item.color}18` }]}>
        <Text style={styles.emojiText}>{item.emoji}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: COLORS.light }]}>
          {item.name}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.reductionBadge}>
          <Text style={styles.reductionText}>{item.reduction}</Text>
        </View>
      </View>
    </View>
    <View style={styles.cardRight}>
      <View style={styles.tokenCost}>
        <Text style={[styles.tokenCostText, { color: COLORS.light }]}>
          🪙 {item.tokens}
        </Text>
      </View>
      <View style={styles.comingSoonBtn}>
        <Text style={styles.comingSoonText}>Bientôt</Text>
      </View>
    </View>
  </View>
);

// ================================================================
// Écran principal
// ================================================================
const StoreScreen = ({
  visible,
  onClose,
  userTokens = 0,
}: {
  visible: boolean;
  onClose: () => void;
  userTokens?: number;
}) => {
  const [activeTab, setActiveTab] = useState<"dons" | "reductions">("dons");
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* ── Header ── */}
        <View style={styles.topSection}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Store</Text>
          </View>

          {/* Solde tokens */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Ton solde</Text>
            <Text style={styles.balanceValue}>
              {userTokens.toLocaleString("fr-FR")} tokens
            </Text>
          </View>
        </View>

        {/* ── Bottom sheet ── */}
        <View style={styles.bottomSheet}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "dons" && styles.tabActive]}
              onPress={() => setActiveTab("dons")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "dons" && styles.tabTextActive,
                ]}
              >
                Dons
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "reductions" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("reductions")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "reductions" && styles.tabTextActive,
                ]}
              >
                Réductions
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "dons" ? (
              <>
                <Text style={styles.sectionDesc}>
                  Utilise tes tokens pour soutenir des causes qui te tiennent à
                  cœur. Chaque don compte.
                </Text>
                {DONS.map((don) => (
                  <DonCard key={don.id} don={don} userTokens={userTokens} />
                ))}
              </>
            ) : (
              <>
                <Text style={styles.sectionDesc}>
                  Des partenariats exclusifs arrivent bientôt. Accumule tes
                  tokens dès maintenant !
                </Text>
                {REDUCTIONS.map((item) => (
                  <ReductionCard key={item.id} item={item} />
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    position: "relative",
  },
  circle1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(91,126,189,0.08)",
    top: -40,
    right: -40,
  },
  circle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(91,126,189,0.06)",
    bottom: -20,
    left: -20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: FONTS.extrabold,
    color: COLORS.dark,
  },
  balanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lighter,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.medium,
  },
  balanceValue: {
    fontSize: 18,
    fontFamily: FONTS.extrabold,
    color: COLORS.dark,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 16,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.medium,
  },
  tabTextActive: {
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
  scrollContent: {
    padding: 20,
    gap: 12,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.medium,
    lineHeight: 20,
    marginBottom: 4,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.lighter,
    gap: 12,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  cardEmoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emojiText: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardName: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.medium,
    lineHeight: 16,
    marginBottom: 6,
  },
  impactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  impactText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
  },
  reductionBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.lighter,
  },
  reductionText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  cardRight: {
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  tokenCost: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.lighter,
  },
  tokenCostText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  comingSoonBtn: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lighter,
  },
  comingSoonText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: COLORS.medium,
  },
});

export default StoreScreen;
