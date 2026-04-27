import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { login } from "../../services/authService";
import CustomInput from "../common/CustomInput";
import CustomButton from "../common/CustomButton";
import validation from "../../utils/validation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FONTS, COLORS } from "../../config/theme";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    mot_de_passe: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogin = async () => {
    const validationResult = validation.validateLoginForm(formData);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }
    try {
      setLoading(true);
      const response = await login(formData.email, formData.mot_de_passe);
      await AsyncStorage.setItem("prenom", response.user.prenom);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Erreur",
        error.response?.data?.message || "Erreur lors de la connexion"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomInput
        label="Email"
        value={formData.email}
        onChangeText={(value) => handleInputChange("email", value)}
        placeholder="votre@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <CustomInput
        label="Mot de passe"
        value={formData.mot_de_passe}
        onChangeText={(value) => handleInputChange("mot_de_passe", value)}
        placeholder="••••••••"
        secureTextEntry={true}
      />
      {errors.mot_de_passe && (
        <Text style={styles.errorText}>{errors.mot_de_passe}</Text>
      )}

      <TouchableOpacity style={styles.forgotWrapper}>
        <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      <CustomButton
        title="Se connecter"
        onPress={handleLogin}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: -10,
    marginBottom: 10,
  },
  forgotWrapper: {
    alignItems: "flex-end",
    marginBottom: 8,
    marginTop: -4,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },
});

export default LoginForm;
