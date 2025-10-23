import React from "react";
import { View, Text, Image, StyleSheet, Platform } from "react-native";

export default function Navbar() {
  return (
    <View style={styles.navbar}>
      <View style={styles.content}>
        <Image
          source={require("../assets/images/criip.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>criip</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    right: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10, // <-- make sure it's above the Map
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    letterSpacing: 0.5,
  },
});
