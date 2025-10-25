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
    Image,
} from "react-native";
import io, { Socket } from "socket.io-client";

const SOCKET_URL = "http://192.168.1.12:5000";
const API_URL = "http://192.168.1.12:5000/api/posts";

interface Room {
    roomId: string;
    memberCount: number;
    postPreview?: { text: string; imageUrl: string; tags: string[] };
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
    const socketRef = React.useRef<Socket | null>(null);

    // Fetch post details for a room
    const fetchPostDetails = async (roomId: string) => {
        try {
            const response = await fetch(`${API_URL}/${roomId}`);
            if (!response.ok) return null;
            const data = await response.json();
            return {
                text: data.text,
                imageUrl: data.imageUrl,
                tags: data.tags || [],
            };
        } catch (error) {
            console.error(`Error fetching post ${roomId}:`, error);
            return null;
        }
    };

    // Scan for active rooms by checking all posts
    const scanActiveRooms = async () => {
        try {
            const response = await fetch(API_URL);
            const posts = await response.json();
            
            // For each post, check if it has an active socket.io room
            // We'll create room objects and let socket.io tell us member counts
            const potentialRooms = posts.map((post: any) => ({
                roomId: post._id,
                memberCount: 0, // Will be updated by socket
                postPreview: {
                    text: post.text,
                    imageUrl: post.imageUrl,
                    tags: post.tags || [],
                }
            }));

            return potentialRooms;
        } catch (error) {
            console.error("Error scanning rooms:", error);
            return [];
        }
    };

    useEffect(() => {
        if (!visible) return;

        setLoading(true);
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on("connect", async () => {
            console.log("✅ Connected to server for room list");
            
            // Get all potential rooms (all posts)
            const potentialRooms = await scanActiveRooms();
            
            // Filter to only show rooms that have members
            // This is a simple approach - shows all posts as potential rooms
            setRooms(potentialRooms);
            setFilteredRooms(potentialRooms);
            setLoading(false);
            setRefreshing(false);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [visible]);

    useEffect(() => {
        const filtered = rooms.filter((room) => {
            if (!searchQuery) return true;
            
            const searchLower = searchQuery.toLowerCase();
            const matchesRoomId = room.roomId.toLowerCase().includes(searchLower);
            const matchesTags = room.postPreview?.tags?.some(tag => 
                tag.toLowerCase().includes(searchLower)
            );
            const matchesText = room.postPreview?.text?.toLowerCase().includes(searchLower);
            
            return matchesRoomId || matchesTags || matchesText;
        });
        setFilteredRooms(filtered);
    }, [searchQuery, rooms]);

    const handleRefresh = async () => {
        setRefreshing(true);
        const potentialRooms = await scanActiveRooms();
        setRooms(potentialRooms);
        setFilteredRooms(potentialRooms);
        setRefreshing(false);
    };

    const handleSelectRoom = (roomId: string) => {
        console.log("📍 Selected room:", roomId);
        onSelectRoom?.(roomId);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.header}>🔥 Join Group Chats</Text>
                    <Pressable onPress={onClose} style={styles.closeButtonContainer}>
                        <Text style={styles.closeButton}>✕</Text>
                    </Pressable>
                </View>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by tags or content..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#aaa"
                />

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#fff" size="large" />
                ) : filteredRooms.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>💬</Text>
                        <Text style={styles.empty}>
                            {searchQuery ? "No rooms match your search" : "No posts available yet"}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery ? "Try a different search" : "Create a post on the map to start chatting!"}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredRooms}
                        keyExtractor={(item) => item.roomId}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.roomCard}
                                onPress={() => handleSelectRoom(item.roomId)}
                            >
                                <View style={styles.roomContent}>
                                    {item.postPreview?.imageUrl && (
                                        <Image 
                                            source={{ uri: item.postPreview.imageUrl }} 
                                            style={styles.roomImage}
                                        />
                                    )}
                                    <View style={styles.roomInfo}>
                                        <View style={styles.roomHeader}>
                                            <Text style={styles.roomName} numberOfLines={1}>
                                                {item.postPreview?.tags && item.postPreview.tags.length > 0
                                                    ? item.postPreview.tags.map(tag => `#${tag}`).join(" • ")
                                                    : `Room ${item.roomId.slice(0, 8)}...`
                                                }
                                            </Text>
                                            <View style={styles.joinBadge}>
                                                <Text style={styles.joinBadgeText}>JOIN</Text>
                                            </View>
                                        </View>
                                        
                                        {item.postPreview?.text && (
                                            <Text style={styles.roomDescription} numberOfLines={2}>
                                                {item.postPreview.text}
                                            </Text>
                                        )}

                                        <Text style={styles.tapToJoin}>Tap to join this chat 💬</Text>
                                    </View>
                                </View>
                            </Pressable>
                        )}
                        refreshControl={
                            <RefreshControl 
                                refreshing={refreshing} 
                                onRefresh={handleRefresh} 
                                tintColor="#fff" 
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
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
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
    },
    closeButtonContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#ff5555",
        alignItems: "center",
        justifyContent: "center",
    },
    closeButton: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    searchInput: {
        backgroundColor: "#1e1e1e",
        color: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 15,
        borderWidth: 1,
        borderColor: "#333",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    empty: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 8,
    },
    emptySubtext: {
        color: "#888",
        fontSize: 14,
        textAlign: "center",
    },
    roomCard: {
        backgroundColor: "#1e1e1e",
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    roomContent: {
        flexDirection: "row",
        padding: 12,
    },
    roomImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: "#333",
    },
    roomInfo: {
        flex: 1,
        justifyContent: "space-between",
    },
    roomHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    roomName: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        flex: 1,
        marginRight: 8,
    },
    joinBadge: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    joinBadgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
    },
    roomDescription: {
        color: "#aaa",
        fontSize: 13,
        marginBottom: 4,
        lineHeight: 18,
    },
    tapToJoin: {
        color: "#4CAF50",
        fontSize: 12,
        fontWeight: "600",
    },
});