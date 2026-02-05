// ===============================================================
// Coordonne les onglets et les formulaires d'authentification
// ===============================================================
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthTabs from "../components/auth/AuthTabs";
import RegisterForm from "../components/auth/RegisterForm";
import LoginForm from "../components/auth/LoginForm";
import BackButton from "../components/common/BackButton";

const AuthScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("connexion");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.content}>
          <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {activeTab === "inscription" ? (
              <RegisterForm navigation={navigation} />
            ) : (
              <LoginForm navigation={navigation} />
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

export default AuthScreen;
