// ===============================================================
// Affiche les onglets de connexion et d'inscription
// ===============================================================
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const AuthTabs = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "connexion" && styles.tabActive]}
        onPress={() => onTabChange("connexion")}
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
        style={[styles.tab, activeTab === "inscription" && styles.tabActive]}
        onPress={() => onTabChange("inscription")}
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
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#5B7EBD",
  },
  tabText: {
    fontSize: 16,
    color: "#999",
  },
  tabTextActive: {
    color: "#5B7EBD",
    fontWeight: "bold",
  },
});

export default AuthTabs;
