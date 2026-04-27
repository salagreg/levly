import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { FONTS, COLORS } from "../../config/theme";

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.light}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || "none"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.medium,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.lighter,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
});

export default CustomInput;
