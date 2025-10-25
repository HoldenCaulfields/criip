import React, { useEffect, useState, useRef } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    Text,
    StyleSheet,
    Modal,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Animated,
    TouchableWithoutFeedback,
    Pressable,
} from "react-native";
import { io, Socket } from "socket.io-client";

interface GroupChatProps {
    roomId: string | null;
    userId: string;
    onClose: () => void;
    visible: boolean;
}

interface Message {
    id: string;
    userId: string;
    text: string;
    timestamp: number;
    likes?: number;
}

interface Post {
    _id: string;
    text: string;
    imageUrl: string;
    tags: string[];
    location: {
        latitude: number;
        longitude: number;
    };
    createdAt: string;
    loves: number;
}

interface Member {
    userId: string;
    joinedAt: number;
    isTyping?: boolean;
}

const SOCKET_URL = "http://192.168.1.12:5000";
const API_URL = "http://192.168.1.12:5000/api/posts";

export default function GroupChat({ roomId, userId, onClose, visible }: GroupChatProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [post, setPost] = useState<Post | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [showMembers, setShowMembers] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch post
    useEffect(() => {
        const fetchPost = async () => {
            if (!roomId) return;
            try {
                const response = await fetch(`${API_URL}/${roomId}`);
                const data = await response.json();
                setPost(data);
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [roomId]);

    // Setup socket
    useEffect(() => {
        const s: Socket = io(SOCKET_URL);
        setSocket(s);

        s.on("receive_message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });

        s.on("room_members", (memberList: Member[]) => {
            setMembers(memberList);
        });

        s.on("user_joined", (member: Member) => {
            setMembers((prev) => [...prev, member]);
        });

        s.on("user_left", (leftUserId: string) => {
            setMembers((prev) => prev.filter((m) => m.userId !== leftUserId));
        });

        s.on("user_typing", (data: { userId: string; roomId: string }) => {
            if (data.userId !== userId) {
                setTypingUsers((prev) => [...new Set([...prev, data.userId])]);
            }
        });

        s.on("user_stopped_typing", (data: { userId: string; roomId: string }) => {
            setTypingUsers((prev) => prev.filter((u) => u !== data.userId));
        });

        s.on("message_liked", (data: { messageId: string; likes: number }) => {
            setMessages((prev) =>
                prev.map((m) => (m.id === data.messageId ? { ...m, likes: data.likes } : m))
            );
        });

        return () => {
            s.disconnect();
        };
    }, [userId]);

    // Join room
    useEffect(() => {
        if (socket && roomId) {
            socket.emit("join_room", { roomId, userId });
        }
        return () => {
            if (socket && roomId) {
                socket.emit("leave_room", { roomId, userId });
            }
        };
    }, [socket, roomId, userId]);

    // Slide animation
    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        } else {
            slideAnim.setValue(0);
        }
    }, [visible]);

    const handleTyping = () => {
        if (socket && roomId) {
            socket.emit("typing", { roomId, userId });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stop_typing", { roomId, userId });
            }, 3000);
        }
    };

    const sendMessage = async () => {
        if (!message.trim() || !socket || !roomId || sending) return;
        setSending(true);

        const msg: Message = {
            id: Date.now().toString(),
            userId,
            text: message,
            timestamp: Date.now(),
            likes: 0,
        };

        socket.emit("send_message", { ...msg, roomId });
        setMessages((prev) => [...prev, msg]);
        setMessage("");
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit("stop_typing", { roomId, userId });

        setTimeout(() => setSending(false), 300);
    };

    const likeMessage = (messageId: string) => {
        if (socket && roomId) {
            socket.emit("like_message", { roomId, messageId });
        }
    };

    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    };

    const getRoomName = () => {
        if (!post?.tags || post.tags.length === 0) return "Unnamed Room";
        return post.tags.map(tag => `#${tag}`).join(" • ");
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [600, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#000" />
                        </View>
                    ) : (
                        <>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.headerLeft}>
                                    {post?.imageUrl && (
                                        <Image source={{ uri: post.imageUrl }} style={styles.roomImage} />
                                    )}
                                    <View style={styles.headerText}>
                                        <Text style={styles.roomTitle} numberOfLines={1}>
                                            {getRoomName()}
                                        </Text>
                                        <Pressable onPress={() => setShowMembers(!showMembers)}>
                                            <Text style={styles.memberCount}>
                                                {members.length} {members.length === 1 ? "member" : "members"} online
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Text style={styles.closeIcon}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Members List */}
                            {showMembers && (
                                <FlatList
                                    data={members}
                                    keyExtractor={(item) => item.userId}
                                    renderItem={({ item }) => (
                                        <View style={styles.memberItem}>
                                            <Text style={styles.memberName}>User {item.userId.slice(0, 6)}</Text>
                                            {item.isTyping && <Text style={styles.typing}>Typing...</Text>}
                                        </View>
                                    )}
                                    style={styles.membersList}
                                />
                            )}

                            {/* Typing Indicator */}
                            {typingUsers.length > 0 && (
                                <Text style={styles.typingIndicator}>
                                    {typingUsers.map((u) => `User ${u.slice(0, 6)}`).join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
                                </Text>
                            )}

                            {/* Messages */}
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => {
                                    const isMe = item.userId === userId;
                                    return (
                                        <View style={[styles.messageWrapper, isMe && styles.myMessageWrapper]}>
                                            <View style={[styles.messageBubble, isMe ? styles.myMsg : styles.theirMsg]}>
                                                {!isMe && (
                                                    <Text style={styles.senderName}>
                                                        User {item.userId.slice(0, 6)}
                                                    </Text>
                                                )}
                                                <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                                                    {item.text}
                                                </Text>
                                                <View style={styles.messageFooter}>
                                                    <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>
                                                        {formatTime(item.timestamp)}
                                                    </Text>
                                                    <Pressable onPress={() => likeMessage(item.id)} style={styles.likeButton}>
                                                        <Text style={styles.likeEmoji}>👍</Text>
                                                        <Text style={styles.likeCount}>{item.likes ?? 0}</Text>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                }}
                                contentContainerStyle={styles.messageList}
                                showsVerticalScrollIndicator={false}
                            />

                            {/* Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={message}
                                    onChangeText={(text) => {
                                        setMessage(text);
                                        if (text.trim()) handleTyping();
                                    }}
                                    placeholder="Type a message..."
                                    placeholderTextColor="#999"
                                    style={styles.input}
                                    multiline
                                    maxLength={500}
                                />
                                <TouchableOpacity
                                    onPress={sendMessage}
                                    style={[styles.sendButton, (!message.trim() || sending) && styles.sendButtonDisabled]}
                                    disabled={!message.trim() || sending}
                                >
                                    <Text style={styles.sendIcon}>{sending ? "⏳" : "➤"}</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "#fff",
        height: "90%",
        maxHeight: "90%",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 20,
    },
    loadingContainer: {
        padding: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
        backgroundColor: "#fafafa",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    roomImage: {
        width: 44,
        height: 44,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: "#e5e5e5",
    },
    headerText: {
        flex: 1,
    },
    roomTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
        marginBottom: 2,
    },
    memberCount: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
    closeIcon: {
        fontSize: 18,
        color: "#666",
        fontWeight: "600",
    },
    membersList: {
        maxHeight: 150,
        backgroundColor: "#f5f5f5",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
    },
    memberItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    memberName: {
        fontSize: 14,
        color: "#333",
    },
    typing: {
        fontSize: 12,
        color: "#888",
        fontStyle: "italic",
    },
    typingIndicator: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        fontSize: 12,
        color: "#666",
        backgroundColor: "#f0f0f0",
    },
    messageList: {
        padding: 16,
        paddingBottom: 8,
    },
    messageWrapper: {
        marginBottom: 12,
        maxWidth: "75%",
    },
    myMessageWrapper: {
        alignSelf: "flex-end",
    },
    messageBubble: {
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    myMsg: {
        backgroundColor: "#000",
        borderBottomRightRadius: 4,
    },
    theirMsg: {
        backgroundColor: "#f0f0f0",
        borderBottomLeftRadius: 4,
    },
    senderName: {
        fontSize: 11,
        color: "#666",
        fontWeight: "600",
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    messageText: {
        fontSize: 15,
        color: "#000",
        lineHeight: 20,
    },
    myMessageText: {
        color: "#fff",
    },
    messageFooter: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        justifyContent: "space-between",
    },
    timestamp: {
        fontSize: 10,
        color: "#999",
        fontWeight: "500",
    },
    myTimestamp: {
        color: "rgba(255,255,255,0.7)",
    },
    likeButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 4,
    },
    likeEmoji: {
        fontSize: 12,
    },
    likeCount: {
        fontSize: 10,
        marginLeft: 2,
        color: "#666",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 12,
        paddingBottom: Platform.OS === "ios" ? 24 : 12,
        borderTopWidth: 1,
        borderTopColor: "#e5e5e5",
        backgroundColor: "#fafafa",
    },
    input: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        fontSize: 15,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: "#e5e5e5",
        color: "#000",
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    sendButtonDisabled: {
        backgroundColor: "#e5e5e5",
        shadowOpacity: 0,
        elevation: 0,
    },
    sendIcon: {
        fontSize: 20,
        color: "#fff",
    },
});