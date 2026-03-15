// ===============================================================
// AuthScreen - Écran d'authentification
// ===============================================================
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import RegisterForm from "../components/auth/RegisterForm";
import LoginForm from "../components/auth/LoginForm";

const BLUE = "#5B7EBD";

const AuthScreen = () => {
  const [activeTab, setActiveTab] = useState("connexion");

  return (
    <View style={{ flex: 1, backgroundColor: BLUE }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Zone bleue — logo + titre */}
          <View style={styles.topSection}>
            <Image
              source={require("../../assets/images/icone_appli_levly.png")}
              style={styles.logo}
            />
          </View>

          {/* Zone blanche arrondie en bas */}
          <View style={styles.bottomSheet}>
            {/* Onglets Connexion / Inscription */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "connexion" && styles.tabActive,
                ]}
                onPress={() => setActiveTab("connexion")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "connexion" && styles.tabTextActive,
                  ]}
                >
                  Connexion
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "inscription" && styles.tabActive,
                ]}
                onPress={() => setActiveTab("inscription")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "inscription" && styles.tabTextActive,
                  ]}
                >
                  Inscription
                </Text>
              </TouchableOpacity>
            </View>

            {/* Formulaire */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
            >
              {activeTab === "inscription" ? <RegisterForm /> : <LoginForm />}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Zone bleue du haut
  topSection: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 40,
    gap: 8,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "400",
  },

  // Feuille blanche
  bottomSheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 8,
    shadowColor: "#1A3A6B",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },

  // Onglets
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF6",
    marginHorizontal: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#B0C4DE",
  },
  tabTextActive: {
    color: BLUE,
    fontWeight: "700",
  },

  // Formulaire
  formContent: {
    paddingBottom: 40,
  },
});

export default AuthScreen;
