import React, { useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import CreatePostModal from "./create-post/CreatePostModal";

export default function SocialPanel({ onOpenChat }: { onOpenChat: () => void }) {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            {/* + Button opens modal */}
            <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
                <Text style={styles.icon}>➕</Text>
            </Pressable>

            {/* Chat button */}
            <Pressable style={styles.button} onPress={onOpenChat}>
                <Text style={styles.icon}>💬</Text>
            </Pressable>

            {/* Modal */}
            <CreatePostModal visible={modalVisible} onClose={() => setModalVisible(false)} />
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
