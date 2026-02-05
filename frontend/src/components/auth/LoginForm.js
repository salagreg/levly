// ===============================================================
// Formulaire de connexion pour les utilisateurs existants
// ===============================================================
import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import CustomInput from "../common/CustomInput";
import CustomButton from "../common/CustomButton";
import authService from "../../services/authService";
import validation from "../../utils/validation";

const LoginForm = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: "",
    mot_de_passe: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
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

      const response = await authService.login(
        formData.email,
        formData.mot_de_passe
      );

      Alert.alert("Succès", "Connexion réussie !");
      navigation.navigate("Dashboard");
    } catch (error) {
      Alert.alert("Erreur", error);
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

      <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>

      <CustomButton
        title="Se connecter"
        onPress={handleLogin}
        loading={loading}
      />

      <Text style={styles.linkText}>Continuer sans inscription</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  forgotPassword: {
    color: "#5B7EBD",
    textAlign: "right",
    marginBottom: 20,
    fontSize: 14,
  },
  linkText: {
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default LoginForm;
