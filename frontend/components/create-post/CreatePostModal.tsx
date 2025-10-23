import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, Modal, Pressable, Image, StyleSheet,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, 
  ScrollView, Animated
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as ImageManipulator from "expo-image-manipulator";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

const tagIcons: { [key: string]: string } = {
  findjob: "💼",
  lover: "💕",
  music: "🎵",
  movies: "🎬",
  default: "🏷️"
};

export default function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(["findjob", "lover", "music", "movies"]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") alert("Permission to access gallery is required!");
    })();
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addNewTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setSelectedTags(prev => [...prev, trimmed]);
      setNewTag("");
      Keyboard.dismiss();
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      let uri = result.assets[0].uri;

      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      setImage(manipResult.uri);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location is required!");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const location = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };

      const formData = new FormData();
      formData.append("text", text);
      formData.append("tags", JSON.stringify(selectedTags));
      formData.append("location", JSON.stringify(location));

      if (image) {
        const filename = image.split("/").pop()!;
        const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
        const type = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
        formData.append("image", { uri: image, name: filename, type } as any);
      }

      const res = await fetch("http://192.168.1.12:5000/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("✅ Uploaded:", data);

      setText("");
      setImage(null);
      setSelectedTags([]);
      onClose();
    } catch (err) {
      console.error("❌ Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTagIcon = (tag: string) => {
    return tagIcons[tag] || tagIcons.default;
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <Animated.View 
              style={[
                styles.card,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerBar} />
                <Text style={styles.title}>Create Post</Text>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Text Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="What's on your mind?"
                    placeholderTextColor="#A8A8A8"
                    multiline
                    value={text}
                    onChangeText={setText}
                  />
                </View>

                {/* Image Section */}
                {image ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <Pressable onPress={() => setImage(null)} style={styles.removeImageBtn}>
                      <Text style={styles.removeImageText}>✕</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={styles.imageButton} onPress={pickImage}>
                    <View style={styles.imageBtnContent}>
                      <Text style={styles.imageIcon}>📸</Text>
                      <Text style={styles.imageBtnText}>Add Photo</Text>
                    </View>
                  </Pressable>
                )}

                {/* Tags Section */}
                <View style={styles.tagsSection}>
                  <Text style={styles.sectionLabel}>Tags</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.tagsScroll}
                    contentContainerStyle={styles.tagsContent}
                  >
                    {tags.map(tag => (
                      <Pressable
                        key={tag}
                        style={[
                          styles.tag, 
                          selectedTags.includes(tag) && styles.tagSelected
                        ]}
                        onPress={() => toggleTag(tag)}
                      >
                        <Text style={styles.tagIcon}>{getTagIcon(tag)}</Text>
                        <Text style={[
                          styles.tagText,
                          selectedTags.includes(tag) && styles.tagTextSelected
                        ]}>
                          {tag}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Add New Tag */}
                <View style={styles.newTagContainer}>
                  <TextInput
                    style={styles.newTagInput}
                    placeholder="Add custom tag..."
                    placeholderTextColor="#A8A8A8"
                    value={newTag}
                    onChangeText={setNewTag}
                    onSubmitEditing={addNewTag}
                    returnKeyType="done"
                  />
                  <Pressable 
                    style={[styles.addTagBtn, !newTag.trim() && styles.addTagBtnDisabled]} 
                    onPress={addNewTag}
                    disabled={!newTag.trim()}
                  >
                    <Text style={styles.addTagBtnText}>+</Text>
                  </Pressable>
                </View>
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable 
                  style={styles.cancelBtn} 
                  onPress={onClose}
                  android_ripple={{ color: '#E8E8F0' }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.submitBtn, loading && styles.submitBtnLoading]}
                  onPress={handleSubmit}
                  disabled={loading}
                  android_ripple={{ color: '#5B4FDB' }}
                >
                  <Text style={styles.submitBtnText}>
                    {loading ? "Posting..." : "Post"}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    width: "100%",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxHeight: "90%",
    shadowColor: "#1E293B",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -8 },
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  headerBar: {
    width: 48,
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.3,
  },
  closeBtn: {
    position: "absolute",
    right: 0,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 22,
    color: "#64748B",
    fontWeight: "400",
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 18,
    minHeight: 110,
    fontSize: 16,
    textAlignVertical: "top",
    backgroundColor: "#F8FAFC",
    color: "#1E293B",
    lineHeight: 22,
  },
  imageButton: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#C7D2FE",
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 24,
    backgroundColor: "#F0F4FF",
  },
  imageBtnContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  imageBtnText: {
    fontSize: 15,
    color: "#6366F1",
    fontWeight: "600",
  },
  imageContainer: {
    marginBottom: 16,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  removeImageBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(15,23,42,0.85)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  tagsSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tagsScroll: {
    flexDirection: "row",
  },
  tagsContent: {
    paddingRight: 24,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    marginRight: 10,
    gap: 6,
  },
  tagSelected: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  tagIcon: {
    fontSize: 16,
  },
  tagText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },
  tagTextSelected: {
    color: "white",
  },
  newTagContainer: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "center",
  },
  newTagInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
    fontSize: 15,
    color: "#1E293B",
  },
  addTagBtn: {
    backgroundColor: "#6366F1",
    width: 48,
    height: 48,
    borderRadius: 24,
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  addTagBtnDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
  },
  addTagBtnText: {
    color: "white",
    fontSize: 26,
    fontWeight: "300",
    marginTop: -2,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.3,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 8,
  },
  submitBtnLoading: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
});