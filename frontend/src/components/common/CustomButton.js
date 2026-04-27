import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FONTS, COLORS } from "../../config/theme";

const CustomButton = ({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "secondary" && styles.buttonSecondary,
        (disabled || loading) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "secondary" && styles.buttonTextSecondary,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonDisabled: {
    backgroundColor: COLORS.lighter,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
  buttonTextSecondary: {
    color: COLORS.primary,
  },
});

export default CustomButton;
