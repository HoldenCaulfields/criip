import React, { useState, useEffect, useCallback } from "react";
import {
    View, TextInput, Text, FlatList, Pressable, StyleSheet, Modal, Image, ScrollView, Platform,
    Animated, KeyboardAvoidingView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

const SOCKET_URL = "https://192.168.1.12/api/";

// --- Type Definitions (Kept the same) ---
interface ChatMessage {
    id: string;
    text: string;
    userId: string;
    sender: "me" | "them";
}

interface User {
    id: string;
    name: string;
    avatar: string;
}

interface ChatBoxProps {
    visible: boolean;
    onClose: () => void;
}

// --- Enhanced Design Variables ---
const PRIMARY_BLUE = '#007aff'; 
const SECONDARY_BG = '#f0f2f5'; 
const THEM_BUBBLE_COLOR = '#e4e6eb'; 
const BORDER_RADIUS_XL = 30; 

export default function ChatBox({ visible, onClose }: ChatBoxProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const users: User[] = [
        { id: "1", name: "Alice", avatar: "https://i.pravatar.cc/150?img=1" },
        { id: "2", name: "Bob", avatar: "https://i.pravatar.cc/150?img=2" },
        { id: "3", name: "Charlie", avatar: "https://i.pravatar.cc/150?img=3" },
        { id: "4", name: "David", avatar: "https://i.pravatar.cc/150?img=4" },
    ];

    useEffect(() => {
        if (visible && users.length > 0 && !selectedUser) {
            setSelectedUser(users[0]);
        }
    }, [visible, selectedUser]);

    if (!visible) return null;

    const sendMessage = () => {
        if (!selectedUser || input.trim() === "") return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: String(input.trim()),
            userId: selectedUser.id,
            sender: "me"
        };
        setMessages(prev => [newMessage, ...prev]);
        setInput("");

        setTimeout(() => {
            const replyMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: `Got it! ${selectedUser?.name ?? "User"} is typing a response...`,
                userId: selectedUser.id,
                sender: "them"
            };
            setMessages(prev => [replyMessage, ...prev]);
        }, 1200);
    };

    const filteredMessages = selectedUser
        ? messages.filter(msg => msg.userId === selectedUser.id)
        : [];

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isMe = item.sender === "me";
        const bubbleStyle = isMe ? styles.myMessage : styles.theirMessage;

        // Simple press animation removed for brevity, keeping the core logic
        const onPressIn = () => {};
        const onPressOut = () => {};

        return (
            <View style={[styles.messageRow, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
                {!isMe && selectedUser && (
                    <Image source={{ uri: selectedUser.avatar }} style={styles.msgAvatar} />
                )}
                <Pressable
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    style={({ pressed }) => [
                        styles.messageBubble,
                        bubbleStyle,
                        { opacity: pressed ? 0.8 : 1 }
                    ]}
                >
                    <Text style={{
                        color: isMe ? 'white' : '#1c1e21',
                        fontSize: 16,
                    }}>
                        {item.text}
                    </Text>
                </Pressable>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent >
            <View style={styles.modalOverlay}>
                
                {/* 1. KeyboardAvoidingView wraps all chat content below the header. */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingContainer} // This style is crucial!
                    keyboardVerticalOffset={0} // Start from the bottom of the modal
                >
                    <View style={styles.container}>
                        
                        {/* Header (Stays Fixed at the Top) */}
                        <View style={styles.header}>
                            <Pressable onPress={onClose} style={styles.headerButton}>
                                <Ionicons name="arrow-back" size={28} color={PRIMARY_BLUE} />
                            </Pressable>
                            {selectedUser && (
                                <View style={styles.userInfo}>
                                    <Image source={{ uri: selectedUser.avatar }} style={styles.headerAvatar} />
                                    <View>
                                        <Text style={styles.headerName}>{selectedUser.name}</Text>
                                        <Text style={styles.activeStatus}>Active now</Text>
                                    </View>
                                </View>
                            )}
                            <View style={styles.headerIcons}>
                                <Ionicons name="call-outline" size={26} color={PRIMARY_BLUE} style={{ marginRight: 18 }} />
                                <Ionicons name="videocam-outline" size={26} color={PRIMARY_BLUE} />
                            </View>
                        </View>
                        <View style={styles.divider} />

                        {/* User Selector List (Ribbon) - Stays Fixed */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.userSelectorList}
                            contentContainerStyle={styles.userListContent}
                        >
                            {users.map(user => (
                                <Pressable
                                    key={user.id}
                                    style={({ pressed }) => [
                                        styles.userItem,
                                        selectedUser?.id === user.id && styles.selectedUser,
                                        { opacity: pressed ? 0.6 : 1 }
                                    ]}
                                    onPress={() => setSelectedUser(user)}
                                >
                                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                                    <Text style={[styles.userName, selectedUser?.id === user.id && styles.selectedUserNameActive]}>{user.name}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>

                        {/* Chat area (Flexible content) */}
                        <View style={styles.chatArea}>
                            {selectedUser ? (
                                <>
                                    {/* FlatList (The content that needs to shrink) */}
                                    <FlatList
                                        style={styles.messages}
                                        data={filteredMessages}
                                        keyExtractor={item => item.id}
                                        renderItem={renderMessage}
                                        inverted
                                        contentContainerStyle={styles.messageListContent}
                                    />

                                    {/* Input Bar (The part that needs to move up) */}
                                    <View style={styles.inputContainer}>
                                        <Pressable style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
                                            <Ionicons name="image-outline" size={28} color={PRIMARY_BLUE} />
                                        </Pressable>

                                        <TextInput
                                            style={styles.input}
                                            placeholder="Aa"
                                            placeholderTextColor="#777"
                                            value={input}
                                            onChangeText={setInput}
                                            multiline
                                        />

                                        {input.trim() ? (
                                            <Pressable style={({ pressed }) => [styles.sendButton, { opacity: pressed ? 0.7 : 1 }]} onPress={sendMessage}>
                                                <Ionicons name="send" size={24} color="white" />
                                            </Pressable>
                                        ) : (
                                            <Pressable style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
                                                <Ionicons name="thumbs-up" size={28} color={PRIMARY_BLUE} />
                                            </Pressable>
                                        )}
                                    </View>
                                </>
                            ) : (
                                <View style={styles.selectUserText}>
                                    <Text style={{ fontSize: 18, color: '#666' }}>Select a user to start chatting</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

// --- Styles (Only modified 'container' and added 'keyboardAvoidingContainer') ---

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    // New style to make KAV take up the space the container used to
    keyboardAvoidingContainer: {
        flex: 1,
        // Match the border radius logic from the old 'container'
        borderTopLeftRadius: BORDER_RADIUS_XL,
        borderTopRightRadius: BORDER_RADIUS_XL,
        overflow: 'hidden',
        marginTop: 100, // Keep the same margin
    },
    container: {
        flex: 1, // Crucial: Allows content to fill the KAV
        backgroundColor: SECONDARY_BG,
        // Removed border radius and shadow properties from here, moved to KAV
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.2, shadowRadius: 10 },
            android: { elevation: 15 },
        })
    },

    // --- Header Styles (Unchanged) ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    headerButton: { padding: 5 },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 15 },
    headerAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
    headerName: { fontWeight: '700', fontSize: 18, color: '#1c1e21' },
    activeStatus: { fontSize: 13, color: '#606770' },
    headerIcons: { flexDirection: 'row', alignItems: 'center' },
    divider: { height: 1, backgroundColor: '#ebedf0' },

    // --- User Selector List (Ribbon Effect) (Unchanged) ---
    userSelectorList: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ebedf0',
        maxHeight: 100,
    },
    userListContent: {
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    userItem: {
        alignItems: "center",
        justifyContent: 'center',
        marginRight: 25,
        paddingVertical: 5,
        height: '100%',
    },
    selectedUser: {
        borderBottomWidth: 3,
        borderBottomColor: PRIMARY_BLUE,
        paddingTop: 5,
        marginTop: -5,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        marginBottom: 5,
        borderWidth: 2,
        borderColor: '#f0f2f5',
    },
    userName: { fontSize: 13, color: '#606770' },
    selectedUserNameActive: { fontWeight: '700', color: PRIMARY_BLUE },

    // --- Chat Area Styles (Unchanged, but now sits inside KAV) ---
    chatArea: { flex: 1, paddingHorizontal: 10 },
    messages: { flex: 1 },
    messageListContent: { paddingBottom: 15, paddingTop: 10 },

    messageRow: { flexDirection: 'row', marginVertical: 3, alignItems: 'flex-end' },
    messageBubble: {
        maxWidth: "80%",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
    },
    myMessage: {
        backgroundColor: PRIMARY_BLUE,
        borderBottomRightRadius: 6,
        marginRight: 8,
    },
    theirMessage: {
        backgroundColor: THEM_BUBBLE_COLOR,
        borderBottomLeftRadius: 6,
        marginLeft: 8,
    },
    msgAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 5, alignSelf: 'flex-end' },

    // --- Input Styles (Unchanged) ---
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#ebedf0',
    },
    input: {
        flex: 1,
        backgroundColor: THEM_BUBBLE_COLOR,
        borderRadius: 25,
        paddingHorizontal: 18,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 120,
        minHeight: 45,
        marginHorizontal: 8,
    },
    iconButton: {
        padding: 5,
        marginBottom: 4,
    },
    sendButton: {
        padding: 2,
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 25,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectUserText: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: SECONDARY_BG },
});