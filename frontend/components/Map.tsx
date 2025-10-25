import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Alert, Pressable } from "react-native";
import MapView, { UrlTile } from "react-native-maps";
import * as Location from "expo-location";
import MarkerContainer from "./markers/MarkerContainer";
import SocialPanel from "./SocialPanel";
import GroupChat from "./groupchat/GroupChat";

interface PostMarker {
  _id: string;
  text: string;
  imageUrl: string;
  tags: string[];
  loves: number;
  location: { latitude: number; longitude: number };
}

export default function Map() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [region, setRegion] = useState({
    latitude: 16.45568,
    longitude: 107.59315,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [markers, setMarkers] = useState<PostMarker[]>([]);
  const mapRef = useRef<MapView | null>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  const fetchMarkers = async () => {  
    try {
      const res = await fetch("http://192.168.1.12:5000/api/posts");
      if (!res.ok) throw new Error("Failed to load posts");
      const data = await res.json();
      setMarkers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to fetch markers:", err);
    }
  };

  useEffect(() => {
    fetchMarkers();
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is needed.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
      setRegion({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 1,
        longitudeDelta: 1,
      });

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 3000 },
        (loc) => setLocation(loc.coords)
      );
    })();

    return () => subscription?.remove();
  }, []);

  const handleCenterUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    } else {
      Alert.alert("Location not available", "Please wait for your location to be detected.");
    }
  };

  // Handle opening chat from marker or group list
  const handleOpenChat = (postId: string) => {
    setRoomId(postId);
    setChatVisible(true);
  };

  // Handle closing chat
  const handleCloseChat = () => {
    setChatVisible(false);
    // Don't reset roomId immediately to allow smooth transition
    setTimeout(() => setRoomId(null), 300);
  };

  // Generate userId from location
  const getUserId = () => {
    if (!location) return "guest";
    return ((location.latitude ?? 0) * 100000 + (location.longitude ?? 0) * 100000).toString();
  };

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef} 
        style={styles.map} 
        initialRegion={region} 
        showsUserLocation 
        showsMyLocationButton={false}
      >
        <UrlTile 
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" 
          maximumZ={21} tileSize={512}
          flipY={false} 
        />

        <MarkerContainer 
          markers={markers} 
          onLovePress={fetchMarkers}
          onChatPress={handleOpenChat}
        />
      </MapView>

      <Pressable style={styles.locateButton} onPress={handleCenterUser}>
        <Text style={styles.locateText}>📍</Text>
      </Pressable>

      <SocialPanel
        chatVisible={chatVisible}
        roomId={roomId}
        userId={getUserId()}
        onOpenChat={handleOpenChat}
        onCloseChat={handleCloseChat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  locateButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "white",
    borderRadius: 30,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  locateText: { fontSize: 22 },
});