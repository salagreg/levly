// ===============================================================
// Composant du bouton de retour
// ===============================================================
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft } from "lucide-react-native";

const BackButton = ({ onPress, color = "#5B7EBD", size = 24 }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ChevronLeft color={color} size={size} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
  },
});

export default BackButton;
