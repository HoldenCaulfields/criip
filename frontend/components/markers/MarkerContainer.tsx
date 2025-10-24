import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Marker, Callout, CalloutSubview } from "react-native-maps";

interface MarkerContainerProps {
  markers: {
    _id: string;
    text: string;
    imageUrl: string;
    tags: string[];
    loves: number;
    location: { latitude: number; longitude: number };
  }[];
  onLovePress?: (markerId: string) => void;
  setChatVisible: (value: boolean) => void;
}

export default function MarkerContainer({
  markers,
  onLovePress,
  setChatVisible,
}: MarkerContainerProps) {
  const OFFSET = 0.00002;

  /** Handles love (like) button press */
  const handleLovePress = async (markerId: string) => {
    try {
      const res = await fetch(`http://192.168.1.12:5000/api/posts/${markerId}/love`, {
        method: "PUT",
      });
      const updated = await res.json();
      /* console.log("❤️ Loved:", updated.loves); */
      onLovePress?.(markerId);
    } catch (err) {
      console.error("Failed to love marker:", err);
    }
  };

  const offsetMarkers = (markers: MarkerContainerProps["markers"]) => {
    const sorted = [...markers].sort((a, b) => (a._id < b._id ? 1 : -1));
    const seen: Record<string, boolean> = {};
    const filtered: typeof markers = [];

    sorted.forEach((marker, index) => {
      const key = `${marker.location.latitude.toFixed(5)}_${marker.location.longitude.toFixed(5)}`;
      if (!seen[key]) {
        seen[key] = true;
        filtered.push({
          ...marker,
          location: {
            latitude: marker.location.latitude + OFFSET * index,
            longitude: marker.location.longitude + OFFSET * index,
          },
        });
      }
    });
    return filtered;
  };

  return (
    <>
      {offsetMarkers(markers).map((marker) => (
        <Marker
          key={marker._id}
          coordinate={{
            latitude: marker.location.latitude,
            longitude: marker.location.longitude,
          }}
        >
          <Callout tooltip>
            <View style={styles.calloutContainer}>
              <Image source={{ uri: marker.imageUrl }} style={styles.calloutImage} />
              <Text style={styles.title} numberOfLines={2}>
                {marker.text}
              </Text>

              {/* tags */}
              <View style={styles.tagsContainer}>
                {marker.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tagPill}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
                {marker.tags.length > 3 && (
                  <View style={styles.tagPill}>
                    <Text style={styles.tagText}>+{marker.tags.length - 3}</Text>
                  </View>
                )}
              </View>

              {/* POWERFUL DYNAMIC BUTTONS */}
              <View style={styles.buttonsContainer}>
                <CalloutSubview
                  style={styles.loveButton}
                  onPress={() => handleLovePress(marker._id)}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.loveEmoji}>❤️</Text>
                    <Text style={styles.loveCount}>{marker.loves ?? 0}</Text>
                  </View>
                </CalloutSubview>

                <CalloutSubview
                  style={styles.chatButton}
                  onPress={() => setChatVisible(true)}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.chatEmoji}>💬</Text>
                  </View>
                </CalloutSubview>
              </View>
            </View>
          </Callout>
        </Marker>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  calloutContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 14,
    width: 240,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  calloutImage: {
    width: 210,
    height: 150,
    borderRadius: 16,
    marginBottom: 12,
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    color: "#111",
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 12,
    gap: 6,
  },
  tagPill: {
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d4e1ff",
  },
  tagText: {
    fontSize: 11,
    color: "#4a6fa5",
    fontWeight: "600",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    width: "100%",
    gap: 20,
  },
  loveButton: {
    width: 60,
    height: 60,
    backgroundColor: "#ff1744",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff1744",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  chatButton: {
    width: 60,
    height: 60,
    backgroundColor: "#2979ff",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2979ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  loveGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 35,
  },
  chatGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 35,
  },
  loveEmoji: {
    fontSize: 20,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  chatEmoji: {
    fontSize: 20,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loveCount: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.8,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    textTransform: "uppercase",
  },
});