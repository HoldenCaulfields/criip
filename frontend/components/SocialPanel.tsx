import React, { useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import CreatePostModal from "./create-post/CreatePostModal";
import GroupList from "./groupList/GroupList";

interface SocialProp {
    setChatVisible: (value: boolean) => void;
}

export default function SocialPanel({setChatVisible}: SocialProp) {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);

    const handleSelectRoom = (roomId: string) => {
    console.log("Joined room:", roomId);
    // You can now emit join_room or navigate to ChatBox
  };

    return (
        <View style={styles.container}>
            {/* + Button opens post modal */}
            <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
                <Text style={styles.icon}>➕</Text>
            </Pressable>

            {/* Chat button */}
            <Pressable style={styles.button} onPress={() => setChatVisible(true)}>
                <Text style={styles.icon}>💬</Text>
            </Pressable>

            {/* Modals */}
            <CreatePostModal visible={modalVisible} onClose={() => setModalVisible(false)} />

            <Pressable style={styles.button} onPress={() => setModalVisible2(true)}>
                <Text style={styles.icon}>--</Text>
            </Pressable>

            <GroupList onSelectRoom={handleSelectRoom} visible={modalVisible2} onClose={() => setModalVisible2(false)}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { position: "absolute", bottom: 40, left: 20, flexDirection: "column", gap: 12 },
    button: {
        backgroundColor: "white",
        borderRadius: 25,
        padding: 12,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    icon: { fontSize: 20 },
});
