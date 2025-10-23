import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Image, Alert, Pressable } from "react-native";
import MapView, { UrlTile, Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";

const markers = [
  {
    id: 1,
    title: "You are here",
    description: "Current location example",
    coordinate: { latitude: 37.78825, longitude: -122.4324 },
    image: require("../assets/images/meo.jpg"),
  },
  {
    id: 2,
    title: "Coffee shop",
    description: "Nice local cafe",
    coordinate: { latitude: 16.45568, longitude: 107.59315 },
    image: require("../assets/images/book.jpg"),
  },
];

export default function Map() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [region, setRegion] = useState({
    latitude: 16.45568,
    longitude: 107.59315,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is needed to show your position.");
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
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
          timeInterval: 3000,
        },
        (loc) => {
          setLocation(loc.coords);
        }
      );
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  // ✅ Center map to user location
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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={false}
        showsMyLocationButton={false} // we make our own custom button
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} flipY={false} />

        {markers.map((marker) => (
          <Marker key={marker.id} coordinate={marker.coordinate}>
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Image source={marker.image} style={styles.calloutImage} />
                <Text style={styles.title}>{marker.title}</Text>
                <Text style={styles.description}>{marker.description}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* ✅ Custom “My Location” button */}
      <Pressable style={styles.locateButton} onPress={handleCenterUser}>
        <Text style={styles.locateText}>📍</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  calloutContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    width: 180,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  calloutImage: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
    textAlign: "center",
  },
  description: {
    color: "gray",
    fontSize: 12,
    textAlign: "center",
  },
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
  locateText: {
    fontSize: 22,
  },
});
