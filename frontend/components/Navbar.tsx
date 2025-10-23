import React from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

interface NavbarProps {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  onCreateSoul: () => void;
}

export default function Navbar({
  searchText,
  setSearchText,
  onCreateSoul,
}: NavbarProps) {
  return (
    <View style={styles.navbar}>
      <TextInput
        style={styles.input}
        placeholder="Search..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <Button title="Create" onPress={onCreateSoul} />
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "white",
    elevation: 4,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginRight: 10,
    borderRadius: 8,
  },
});
