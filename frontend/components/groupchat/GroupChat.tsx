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
    socketId: string;
}

const SOCKET_URL = "http://192.168.1.12:5000";
const API_URL = "http://192.168.1.12:5000/api/posts";

export default function GroupChat({ roomId, userId, onClose, visible }: GroupChatProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [post, setPost] = useState<Post | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [showMembers, setShowMembers] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Fetch post details
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
        
        if (visible && roomId) {
            setLoading(true);
            fetchPost();
        }
    }, [roomId, visible]);

    // Setup socket connection
    useEffect(() => {
        if (!visible) return;

        const s: Socket = io(SOCKET_URL);
        setSocket(s);

        s.on("connect", () => {
            console.log("✅ Connected to chat server");
        });

        s.on("receive_message", (msg: Message) => {
            console.log("📩 Received message:", msg.text);
            setMessages((prev) => [...prev, msg]);
        });

        s.on("room_members", (memberList: Member[]) => {
            console.log("👥 Room members updated:", memberList.length);
            setMembers(memberList);
        });

        s.on("user_joined", (member: { userId: string }) => {
            console.log("👋 User joined:", member.userId);
        });

        s.on("user_left", (leftUserId: string) => {
            console.log("🚪 User left:", leftUserId);
            setMembers((prev) => prev.filter((m) => m.userId !== leftUserId));
        });

        return () => {
            console.log("🔌 Disconnecting socket");
            s.disconnect();
        };
    }, [visible]);

    // Join room when socket is ready
    useEffect(() => {
        if (socket && roomId && visible) {
            console.log(`🚪 Joining room: ${roomId}`);
            socket.emit("join_room", { roomId, userId });
        }
        
        return () => {
            if (socket && roomId) {
                console.log(`👋 Leaving room: ${roomId}`);
                socket.emit("leave_room", { roomId, userId });
            }
        };
    }, [socket, roomId, userId, visible]);

    // Smooth entrance animation
    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 9,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            slideAnim.setValue(0);
            fadeAnim.setValue(0);
        }
    }, [visible]);

    // Auto-scroll to bottom when new message arrives
    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!message.trim() || !socket || !roomId || sending) return;
        
        setSending(true);

        const msg: Message = {
            id: Date.now().toString(),
            userId,
            text: message.trim(),
            timestamp: Date.now(),
        };

        // Optimistically add message
        setMessages((prev) => [...prev, msg]);
        
        // Send to server
        socket.emit("send_message", { ...msg, roomId });
        
        // Clear input
        setMessage("");
        
        setTimeout(() => setSending(false), 300);
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", { 
            hour: "2-digit", 
            minute: "2-digit",
            hour12: true 
        });
    };

    const getRoomName = () => {
        if (!post?.tags || post.tags.length === 0) return "Chat Room";
        return post.tags.map(tag => `#${tag}`).join(" • ");
    };

    const handleClose = () => {
        // Smooth exit
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            setMessages([]);
            setMembers([]);
            setShowMembers(false);
            onClose();
        });
    };

    if (!visible) return null;

    return (
        <Modal 
            visible={visible} 
            animationType="none" 
            transparent 
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <Animated.View 
                    style={[
                        styles.backdrop,
                        { opacity: fadeAnim }
                    ]}
                >
                    <TouchableWithoutFeedback onPress={handleClose}>
                        <View style={StyleSheet.absoluteFill} />
                    </TouchableWithoutFeedback>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.container,
                        {
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [700, 0],
                                    }),
                                },
                            ],
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4CAF50" />
                            <Text style={styles.loadingText}>Loading chat...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.headerLeft}>
                                    {post?.imageUrl && (
                                        <Image 
                                            source={{ uri: post.imageUrl }} 
                                            style={styles.roomImage} 
                                        />
                                    )}
                                    <View style={styles.headerText}>
                                        <Text style={styles.roomTitle} numberOfLines={1}>
                                            {getRoomName()}
                                        </Text>
                                        <Pressable onPress={() => setShowMembers(!showMembers)}>
                                            <Text style={styles.memberCount}>
                                                {members.length} {members.length === 1 ? "person" : "people"} here
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                    <Text style={styles.closeIcon}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Members List */}
                            {showMembers && (
                                <View style={styles.membersList}>
                                    <Text style={styles.membersTitle}>👥 People in this chat:</Text>
                                    {members.map((member, index) => (
                                        <View key={`${member.userId}-${index}`} style={styles.memberItem}>
                                            <View style={styles.memberDot} />
                                            <Text style={styles.memberName}>
                                                User {member.userId.slice(0, 8)}
                                                {member.userId === userId && " (You)"}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Messages */}
                            {messages.length === 0 ? (
                                <View style={styles.emptyMessages}>
                                    <Text style={styles.emptyMessagesEmoji}>💬</Text>
                                    <Text style={styles.emptyMessagesText}>
                                        No messages yet
                                    </Text>
                                    <Text style={styles.emptyMessagesSubtext}>
                                        Be the first to say hello!
                                    </Text>
                                </View>
                            ) : (
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
                                                            User {item.userId.slice(0, 8)}
                                                        </Text>
                                                    )}
                                                    <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                                                        {item.text}
                                                    </Text>
                                                    <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>
                                                        {formatTime(item.timestamp)}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    }}
                                    contentContainerStyle={styles.messageList}
                                    showsVerticalScrollIndicator={false}
                                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                                />
                            )}

                            {/* Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder="Type a message..."
                                    placeholderTextColor="#999"
                                    style={styles.input}
                                    multiline
                                    maxLength={500}
                                    onSubmitEditing={sendMessage}
                                />
                                <TouchableOpacity
                                    onPress={sendMessage}
                                    style={[
                                        styles.sendButton, 
                                        (!message.trim() || sending) && styles.sendButtonDisabled
                                    ]}
                                    disabled={!message.trim() || sending}
                                >
                                    <Text style={styles.sendIcon}>
                                        {sending ? "⏳" : "➤"}
                                    </Text>
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
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.6)",
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
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
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
        color: "#4CAF50",
        fontWeight: "600",
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
        backgroundColor: "#f5f5f5",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
        maxHeight: 180,
    },
    membersTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
    },
    memberItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
    },
    memberDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#4CAF50",
        marginRight: 8,
    },
    memberName: {
        fontSize: 14,
        color: "#333",
    },
    emptyMessages: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    emptyMessagesEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyMessagesText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    emptyMessagesSubtext: {
        fontSize: 14,
        color: "#999",
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
        backgroundColor: "#4CAF50",
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
    timestamp: {
        fontSize: 10,
        color: "#999",
        fontWeight: "500",
        marginTop: 4,
    },
    myTimestamp: {
        color: "rgba(255,255,255,0.8)",
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
        backgroundColor: "#4CAF50",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
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