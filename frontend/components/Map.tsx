import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Image, Alert, Pressable } from "react-native";
import MapView, { UrlTile, Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";

interface PostMarker {
  _id: string;
  text: string;
  imageUrl: string;
  tags: string[];
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

  // Fetch all posts from backend
  const fetchMarkers = async () => {
    try {
      const res = await fetch("http://192.168.1.12:5000/api/posts");
      const data: PostMarker[] = await res.json();
      setMarkers(data);
    } catch (err) {
      console.error("Failed to fetch markers:", err);
      Alert.alert("Error", "Could not load posts.");
    }
  };

  useEffect(() => {
    fetchMarkers(); // fetch posts on mount

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
        { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 3000 },
        (loc) => {
          setLocation(loc.coords);
        }
      );
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const handleCenterUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        1000
      );
    } else {
      Alert.alert("Location not available", "Please wait for your location to be detected.");
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchMarkers, 5000); // fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const OFFSET = 0.00002;

  // Keep only newest post per location
  const offsetMarkers = (markers: PostMarker[]) => {
    // Sort newest first (if your _id is sortable by time)
    const sorted = [...markers].sort((a, b) => (a._id < b._id ? 1 : -1));

    const seen: { [key: string]: boolean } = {};
    const filtered: PostMarker[] = [];

    sorted.forEach((marker, index) => {
      // Round lat/lng to avoid float precision issues
      const key = `${marker.location.latitude.toFixed(5)}_${marker.location.longitude.toFixed(5)}`;

      if (!seen[key]) {
        seen[key] = true;
        filtered.push({
          ...marker,
          // optional offset for very close but not identical markers
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
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} flipY={false} />

        {offsetMarkers(markers).map((marker) => (
          <Marker
            key={marker._id}
            coordinate={{ latitude: marker.location.latitude, longitude: marker.location.longitude }}
          >
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Image source={{ uri: marker.imageUrl }} style={styles.calloutImage} />
                <Text style={styles.title}>{marker.text}</Text>

                {/* Display tags */}
                <View style={styles.tagsContainer}>
                  {marker.tags.map((tag, index) => (
                    <Text key={index} style={styles.tag}>
                      #{tag}
                    </Text>
                  ))}
                </View>
              </View>
            </Callout>

          </Marker>
        ))}
      </MapView>

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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 4,
  },
  tag: {
    backgroundColor: "#eee",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    color: "#333",
    margin: 2,
  },

});
