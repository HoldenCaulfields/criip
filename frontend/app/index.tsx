import React from "react";
import { View, StyleSheet } from "react-native";
import Map from "@/components/Map";
import Navbar from "@/components/Navbar";
import SocialPanel from "@/components/SocialPanel";

export default function HomeScreen() {
  
  return (
    <View style={styles.container}>
      <Navbar />
      <Map />
      {/* <SocialPanel /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
