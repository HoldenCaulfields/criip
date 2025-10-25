import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Platform, Pressable, Animated } from "react-native";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleMenuPress = () => {
    console.log("Menu clicked! Current state:", menuOpen);
    setMenuOpen(!menuOpen);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      <Animated.View style={[styles.navbar, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.content}>
          {/* Logo & Brand */}
          <View style={styles.leftSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/criip.png")}
                style={styles.logo}
              />
              <View style={styles.liveBadge}>
                <View style={styles.liveIndicator} />
              </View>
            </View>
            <View style={styles.brandInfo}>
              <Text style={styles.title}>criip</Text>
              <Text style={styles.tagline}>discover • share • connect</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2.4K</Text>
              <Text style={styles.statLabel}>posts</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>842</Text>
              <Text style={styles.statLabel}>online</Text>
            </View>
          </View>

          {/* Menu Button */}
          <Pressable 
            style={styles.menuButton}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleMenuPress}
          >
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
          </Pressable>
        </View>

        {/* Gradient accent line */}
        <View style={styles.accentLine} />
      </Animated.View>

      {/* Quick Menu Dropdown */}
      {menuOpen && (
        <Pressable 
          style={styles.dropdownBackdrop}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.dropdown}>
            <Pressable 
              style={styles.menuItem}
              onPress={() => {
                console.log("Trending clicked");
                setMenuOpen(false);
              }}
            >
              <Text style={styles.menuIcon}>🔥</Text>
              <Text style={styles.menuText}>Trending</Text>
            </Pressable>
            <Pressable 
              style={styles.menuItem}
              onPress={() => {
                console.log("Nearby clicked");
                setMenuOpen(false);
              }}
            >
              <Text style={styles.menuIcon}>📍</Text>
              <Text style={styles.menuText}>Nearby</Text>
            </Pressable>
            <Pressable 
              style={styles.menuItem}
              onPress={() => {
                console.log("Featured clicked");
                setMenuOpen(false);
              }}
            >
              <Text style={styles.menuIcon}>⭐</Text>
              <Text style={styles.menuText}>Featured</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable 
              style={styles.menuItem}
              onPress={() => {
                console.log("Profile clicked");
                setMenuOpen(false);
              }}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>Profile</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 16,
    right: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    maxHeight: "10%",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    position: "relative",
    marginRight: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  liveBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  brandInfo: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1a1a1a",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  tagline: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: "900",
    color: "#4CAF50",
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 3,
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4CAF50",
  },
  accentLine: {
    height: 3,
    backgroundColor: "#4CAF50",
  },
  dropdownBackdrop: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 8,
  },
  dropdown: {
    position: "absolute",
    top: Platform.OS === "ios" ? 110 : 90,
    right: 16,
    width: 180,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 9,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    marginVertical: 4,
    marginHorizontal: 12,
  },
});