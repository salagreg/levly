import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import CustomInput from "../common/CustomInput";
import CustomButton from "../common/CustomButton";
import authService from "../../services/authService";
import validation from "../../utils/validation";

const RegisterForm = ({ navigation }) => {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    date_de_naissance: "",
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

  const handleRegister = async () => {
    const validationResult = validation.validateRegisterForm(formData);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    try {
      setLoading(true);

      const userData = {
        prenom: formData.prenom,
        nom: formData.nom,
        date_de_naissance: formData.date_de_naissance,
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
      };

      const response = await authService.register(userData);

      Alert.alert("Succès", "Inscription réussie !");
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
        label="Prénom"
        value={formData.prenom}
        onChangeText={(value) => handleInputChange("prenom", value)}
        placeholder="Votre prénom"
      />
      {errors.prenom && <Text style={styles.errorText}>{errors.prenom}</Text>}

      <CustomInput
        label="Nom"
        value={formData.nom}
        onChangeText={(value) => handleInputChange("nom", value)}
        placeholder="Votre nom"
      />
      {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}

      <CustomInput
        label="Date de naissance"
        value={formData.date_de_naissance}
        onChangeText={(value) => handleInputChange("date_de_naissance", value)}
        placeholder="JJ/MM/AAAA"
      />
      {errors.date_de_naissance && (
        <Text style={styles.errorText}>{errors.date_de_naissance}</Text>
      )}

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

      <CustomButton
        title="S'inscrire"
        onPress={handleRegister}
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
  linkText: {
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default RegisterForm;
