import React from "react";
import { View, StyleSheet } from "react-native";
import Map from "@/components/Map";
import Navbar from "@/components/Navbar";
import SocialPanel from "@/components/SocialPanel";

export default function HomeScreen() {
  
  const handleOpenChat = () => {
    console.log("Open Chat UI");
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <Map />
      <SocialPanel onOpenChat={handleOpenChat} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
