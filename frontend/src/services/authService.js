import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config/api";

const authService = {
  // Inscription
  register: async (userData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData
      );

      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Erreur lors de l'inscription";
    }
  },

  // Connexion
  login: async (email, mot_de_passe) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        mot_de_passe,
      });

      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Erreur lors de la connexion";
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  },

  // Récupérer le token stocké
  getToken: async () => {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      return null;
    }
  },
};

export default authService;
