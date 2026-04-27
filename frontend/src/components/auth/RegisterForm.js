import React, { useState, useRef } from "react";
import { FONTS, COLORS } from "../../config/theme";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { register } from "../../services/authService";
import CustomInput from "../common/CustomInput";
import CustomButton from "../common/CustomButton";
import validation from "../../utils/validation";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// ================================================================
// Génération des données
// ================================================================
const DAYS = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

// ================================================================
// Colonne du picker
// ================================================================
const PickerColumn = ({ items, selectedIndex, onSelect, width }) => {
  const scrollRef = useRef(null);

  const handleScroll = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < items.length) {
      onSelect(index);
    }
  };

  const scrollToIndex = (index) => {
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
  };

  return (
    <View style={[styles.column, { width }]}>
      {/* Ligne de sélection */}
      <View style={styles.selectionLine} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        onScrollEndDrag={handleScroll}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
        onLayout={() => {
          scrollRef.current?.scrollTo({
            y: selectedIndex * ITEM_HEIGHT,
            animated: false,
          });
        }}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => {
              onSelect(index);
              scrollToIndex(index);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.itemText,
                index === selectedIndex && styles.itemTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// ================================================================
// RegisterForm principal
// ================================================================
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    mot_de_passe: "",
  });

  const [dayIndex, setDayIndex] = useState(0);
  const [monthIndex, setMonthIndex] = useState(0);
  const [yearIndex, setYearIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
    setDateSelected(true);
    if (errors.date_de_naissance) {
      setErrors((prev) => ({ ...prev, date_de_naissance: "" }));
    }
  };

  const formatDateDisplay = () => {
    const day = DAYS[dayIndex];
    const month = String(monthIndex + 1).padStart(2, "0");
    const year = YEARS[yearIndex];
    return `${day}/${month}/${year}`;
  };

  const formatDateForAPI = () => {
    const day = DAYS[dayIndex];
    const month = String(monthIndex + 1).padStart(2, "0");
    const year = YEARS[yearIndex];
    return `${year}-${month}-${day}`;
  };

  const handleRegister = async () => {
    const newErrors = {};

    if (!formData.prenom?.trim())
      newErrors.prenom = "Le prénom est obligatoire";
    if (!formData.nom?.trim()) newErrors.nom = "Le nom est obligatoire";
    if (!dateSelected)
      newErrors.date_de_naissance = "La date de naissance est obligatoire";
    if (!validation.isValidEmail(formData.email))
      newErrors.email = "Email invalide";
    if (!validation.isValidPassword(formData.mot_de_passe))
      newErrors.mot_de_passe = "Minimum 8 caractères";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await register({
        prenom: formData.prenom,
        nom: formData.nom,
        date_de_naissance: formatDateForAPI(),
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
      });

      await AsyncStorage.setItem("prenom", response.user.prenom);
      router.replace("/sync");
    } catch (error) {
      Alert.alert("Erreur", error.message || "Erreur lors de l'inscription");
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

      {/* ── Date de naissance ── */}
      <Text style={styles.label}>Date de naissance</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(!showDatePicker)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.dateText, !dateSelected && styles.datePlaceholder]}
        >
          {dateSelected ? formatDateDisplay() : "JJ/MM/AAAA"}
        </Text>
      </TouchableOpacity>
      {errors.date_de_naissance && (
        <Text style={styles.errorText}>{errors.date_de_naissance}</Text>
      )}

      {showDatePicker && (
        <View style={styles.pickerWrapper}>
          <View style={styles.pickerColumns}>
            <PickerColumn
              items={DAYS}
              selectedIndex={dayIndex}
              onSelect={setDayIndex}
              width={60}
            />
            <PickerColumn
              items={MONTHS}
              selectedIndex={monthIndex}
              onSelect={setMonthIndex}
              width={130}
            />
            <PickerColumn
              items={YEARS}
              selectedIndex={yearIndex}
              onSelect={setYearIndex}
              width={80}
            />
          </View>
          <View style={styles.pickerButtons}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDateConfirm}>
              <Text style={styles.confirmText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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

      <CustomButton
        title="S'inscrire"
        onPress={handleRegister}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 32,
  },
  label: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.medium,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  dateButton: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.lighter,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 14,
  },
  dateText: {
    fontSize: 15,
    color: "#1A2B4A",
  },
  datePlaceholder: {
    color: "#9AAED4",
  },
  pickerWrapper: {
    backgroundColor: "#F5F8FE",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: "#E0E8F4",
    overflow: "hidden",
  },
  pickerColumns: {
    flexDirection: "row",
    height: PICKER_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  column: {
    height: PICKER_HEIGHT,
    overflow: "hidden",
  },
  selectionLine: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#C8D7EE",
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: 15,
    color: "#9AAED4",
  },
  itemTextSelected: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2B4A",
  },
  pickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#E0E8F4",
  },
  cancelText: {
    fontSize: 16,
    color: "#9AAED4",
    fontWeight: "500",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5B7EBD",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  linkText: {
    color: "#9AAED4",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});

export default RegisterForm;
