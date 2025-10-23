import React from "react";
import { View, Text, Modal, Button, StyleSheet } from "react-native";

interface UserLocationProps {
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UserLocation({ showForm, setShowForm }: UserLocationProps) {
  return (
    <Modal visible={showForm} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.form}>
          <Text style={styles.title}>Create Soul Post</Text>
          {/* Add your text/image upload fields here */}
          <Button title="Close" onPress={() => setShowForm(false)} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
});
