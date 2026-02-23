// ===============================================================
// Appels d'API backend
// ===============================================================
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config/api";

// Connexion
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      mot_de_passe: password,
    });

    await AsyncStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    console.error("Erreur login:", error);
    throw error;
  }
};

// Inscription
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      prenom: userData.prenom,
      nom: userData.nom,
      date_de_naissance: userData.date_de_naissance,
      email: userData.email,
      mot_de_passe: userData.mot_de_passe,
    });

    await AsyncStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    console.error("Erreur register:", error);
    throw error;
  }
};

// Déconnexion
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
  }
};

// Récupérer le token stocké
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    return null;
  }
};
