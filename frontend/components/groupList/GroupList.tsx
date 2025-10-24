import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    Modal,
    TouchableWithoutFeedback,
} from "react-native";
import io from "socket.io-client";

const SOCKET_URL = "http://192.168.1.12:3000"; // ⚡ change to your backend IP

interface Room {
    roomId: string;
    memberCount: number;
}

interface GroupListModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectRoom?: (roomId: string) => void;
}

export default function GroupListModal({ visible, onClose, onSelectRoom }: GroupListModalProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on("connect", () => {
            console.log("✅ Connected to server");
        });

        socket.on("update_rooms", (roomList: Room[]) => {
            const filtered = roomList
                .filter((r) => r.memberCount > 0)
                .sort((a, b) => b.memberCount - a.memberCount);
            setRooms(filtered);
            setLoading(false);
        });

        // 🧪 Fake data fallback (for testing when server has no rooms)
        const timeout = setTimeout(() => {
            if (rooms.length === 0) {
                const fakeRooms: Room[] = [
                    { roomId: "chill-zone", memberCount: 12 },
                    { roomId: "music-fans", memberCount: 8 },
                    { roomId: "devs", memberCount: 5 },
                    { roomId: "lonely-room", memberCount: 1 },
                ];
                setRooms(fakeRooms);
                setLoading(false);
                console.log("⚙️ Using fake room data for testing");
            }
        }, 1000);

        // ✅ Clean up both timeout and socket connection
        return () => {
            clearTimeout(timeout);
            socket.disconnect();
        };
    }, []);


    return (
        <Modal visible={visible} animationType="slide" transparent>
            {/* Close when clicking outside the modal */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            {/* Bottom Sheet Modal */}
            <View style={styles.modalContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.header}>🔥 Active Group Chats</Text>
                    <Pressable onPress={onClose}>
                        <Text style={styles.closeButton}>✕</Text>
                    </Pressable>
                </View>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#fff" />
                ) : rooms.length === 0 ? (
                    <Text style={styles.empty}>No active group chats yet...</Text>
                ) : (
                    <FlatList
                        data={rooms}
                        keyExtractor={(item) => item.roomId}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.roomCard}
                                onPress={() => {
                                    onSelectRoom?.(item.roomId);
                                    onClose();
                                }}
                            >
                                <Text style={styles.roomName}>Room: {item.roomId}</Text>
                                <Text style={styles.memberCount}>{item.memberCount} members</Text>
                            </Pressable>
                        )}
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "80%",
        backgroundColor: "#121212",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 15,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    header: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
    },
    closeButton: {
        color: "#ff5555",
        fontSize: 18,
        fontWeight: "bold",
    },
    roomCard: {
        backgroundColor: "#1e1e1e",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    roomName: {
        color: "#fff",
        fontSize: 16,
    },
    memberCount: {
        color: "#aaa",
        fontSize: 14,
        marginTop: 4,
    },
    empty: {
        color: "#888",
        textAlign: "center",
        marginTop: 30,
    },
});
