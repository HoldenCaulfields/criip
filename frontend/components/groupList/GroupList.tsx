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
    TextInput,
    RefreshControl,
} from "react-native";
import io from "socket.io-client";

const SOCKET_URL = "http://192.168.1.12:5000";

interface Room {
    roomId: string;
    memberCount: number;
    lastMessage?: { text: string; timestamp: number };
    postPreview?: { text: string; imageUrl: string };
}

interface GroupListModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectRoom?: (roomId: string) => void;
}

export default function GroupList({ visible, onClose, onSelectRoom }: GroupListModalProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on("connect", () => {
            console.log("✅ Connected to server");
            socket.emit("request_rooms"); // Request initial rooms
        });

        socket.on("update_rooms", (roomList: Room[]) => {
            const filtered = roomList
                .filter((r) => r.memberCount > 0)
                .sort((a, b) => b.memberCount - a.memberCount);
            setRooms(filtered);
            setFilteredRooms(filtered);
            setLoading(false);
            setRefreshing(false);
        });

        // Listen for last message updates
        socket.on("room_last_message", (data: { roomId: string; lastMessage: { text: string; timestamp: number } }) => {
            setRooms((prev) =>
                prev.map((r) =>
                    r.roomId === data.roomId ? { ...r, lastMessage: data.lastMessage } : r
                )
            );
            setFilteredRooms((prev) =>
                prev.map((r) =>
                    r.roomId === data.roomId ? { ...r, lastMessage: data.lastMessage } : r
                )
            );
        });

        // 🧪 Fake data fallback (for testing)
        const timeout = setTimeout(() => {
            if (rooms.length === 0) {
                const fakeRooms: Room[] = [
                    { roomId: "chill-zone", memberCount: 12, lastMessage: { text: "Hey!", timestamp: Date.now() } },
                    { roomId: "music-fans", memberCount: 8, lastMessage: { text: "New song out!", timestamp: Date.now() } },
                ];
                setRooms(fakeRooms);
                setFilteredRooms(fakeRooms);
                setLoading(false);
            }
        }, 1000);

        return () => {
            clearTimeout(timeout);
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const filtered = rooms.filter((room) =>
            room.roomId.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredRooms(filtered);
    }, [searchQuery, rooms]);

    const handleRefresh = () => {
        setRefreshing(true);
        // Emit to server to refresh rooms
        const socket = io(SOCKET_URL);
        socket.emit("request_rooms");
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.header}>🔥 Active Group Chats</Text>
                    <Pressable onPress={onClose}>
                        <Text style={styles.closeButton}>✕</Text>
                    </Pressable>
                </View>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#aaa"
                />

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#fff" />
                ) : filteredRooms.length === 0 ? (
                    <Text style={styles.empty}>No active group chats yet...</Text>
                ) : (
                    <FlatList
                        data={filteredRooms}
                        keyExtractor={(item) => item.roomId}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.roomCard}
                                onPress={() => {
                                    onSelectRoom?.(item.roomId);
                                    onClose();
                                }}
                            >
                                <View style={styles.roomHeader}>
                                    <Text style={styles.roomName}>Room: {item.roomId}</Text>
                                    <Text style={styles.memberCount}>{item.memberCount} members</Text>
                                </View>
                                {item.lastMessage && (
                                    <Text style={styles.lastMessage} numberOfLines={1}>
                                        Last: {item.lastMessage.text}
                                    </Text>
                                )}
                            </Pressable>
                        )}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#fff" />
                        }
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
        fontSize: 20,
        fontWeight: "bold",
    },
    searchInput: {
        backgroundColor: "#1e1e1e",
        color: "#fff",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    roomCard: {
        backgroundColor: "#1e1e1e",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    roomHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    roomName: {
        color: "#fff",
        fontSize: 16,
    },
    memberCount: {
        color: "#aaa",
        fontSize: 14,
    },
    lastMessage: {
        color: "#888",
        fontSize: 12,
        marginTop: 4,
    },
    empty: {
        color: "#888",
        textAlign: "center",
        marginTop: 30,
    },
});