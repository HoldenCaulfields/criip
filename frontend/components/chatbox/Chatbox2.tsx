import React, { useState, useEffect } from "react";
import {
    View, TextInput, Text, FlatList, Pressable, StyleSheet, Modal, Image, ScrollView, Platform,
    KeyboardAvoidingView
} from "react-native";
import ChatHeader from './ChatHeader';
import UserSelector from './UserSelector';
import ChatMessages from "./ChatMessages";
/* import { styles } from "./ChatBoxStyles"; */

// --- Type Definitions (Keep these here or in a separate types file) ---
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
    mode: "local" | "marker";
    markerId?: string;
}

// --- Constants (Keep these here or in a separate constants file) ---
const PRIMARY_BLUE = '#007aff';
const SECONDARY_BG = '#f0f2f5';
const THEM_BUBBLE_COLOR = '#e4e6eb';
const BORDER_RADIUS_XL = 30;

// --- Main ChatBox Component ---
export default function ChatBox({ visible, onClose, mode, markerId }: ChatBoxProps) {
    const [input, setInput] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
    const [markerMessages, setMarkerMessages] = useState<{ [key: string]: ChatMessage[] }>({});

    const [markerUsers, setMarkerUsers] = useState<User[]>([]);

    // local mock users
    const localUsers: User[] = [
        { id: "1", name: "Alice", avatar: "https://i.pravatar.cc/150?img=1" },
        { id: "2", name: "Bob", avatar: "https://i.pravatar.cc/150?img=2" },
        { id: "3", name: "Charlie", avatar: "https://i.pravatar.cc/150?img=3" },
        { id: "4", name: "David", avatar: "https://i.pravatar.cc/150?img=4" },
    ];

    // Fetch mock users for marker mode
    useEffect(() => {
        if (mode === "marker" && markerId) {
            setMarkerUsers([
                { id: "100", name: "MarkerUser1", avatar: "https://i.pravatar.cc/150?img=9" },
                { id: "101", name: "MarkerUser2", avatar: "https://i.pravatar.cc/150?img=10" },
            ]);
        }
    }, [mode, markerId]);

    // choose the correct user list
    const users = mode === "local" ? localUsers : markerUsers;

    // auto-select first user when visible
    useEffect(() => {
        if (visible && users.length > 0 && !selectedUser) {
            setSelectedUser(users[0]);
        }
    }, [visible, users, selectedUser]);

    if (!visible) return null;

    const activeMessages =
        mode === "local"
            ? localMessages
            : markerId
                ? markerMessages[markerId] || []
                : [];

    const sendMessage = () => {
        if (!selectedUser || input.trim() === "") return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: input.trim(),
            userId: selectedUser.id,
            sender: "me",
        };

        const updateMessages = (message: ChatMessage) => {
            if (mode === "local") {
                setLocalMessages(prev => [message, ...prev]);
            } else if (mode === "marker" && markerId) {
                setMarkerMessages(prev => ({
                    ...prev,
                    [markerId]: [message, ...(prev[markerId] || [])],
                }));
            }
        };

        updateMessages(newMessage);
        setInput("");

        // Simulated auto-reply
        setTimeout(() => {
            const replyMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: `${selectedUser.name} replied!`,
                userId: selectedUser.id,
                sender: "them",
            };
            updateMessages(replyMessage);
        }, 1000);
    };

    const filteredMessages = selectedUser
        ? activeMessages.filter(msg => msg.userId === selectedUser.id)
        : [];

    // The renderMessage function is passed down to ChatMessages
    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isMe = item.sender === "me";
        // Note: selectedUser is used here to get the avatar for 'them' messages, 
        // which might be incorrect if the chat supports multiple "them" users.
        // For this simple mock, we'll keep it as-is for the selected user.
        const avatarUrl = selectedUser?.avatar; 

        return (
            <View style={[styles.messageRow, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
                {!isMe && avatarUrl && (
                    <Image source={{ uri: avatarUrl }} style={styles.msgAvatar} />
                )}
                <View style={[
                    styles.messageBubble,
                    isMe ? styles.myMessage : styles.theirMessage,
                ]}>
                    <Text style={{ color: isMe ? 'white' : '#1c1e21', fontSize: 16 }}>
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingContainer}
                    keyboardVerticalOffset={0}
                >
                    <View style={styles.container}>
                        
                        <ChatHeader 
                            selectedUser={selectedUser} 
                            onClose={onClose} 
                            primaryBlue={PRIMARY_BLUE} 
                        />
                        <View style={styles.divider} />

                        <UserSelector
                            users={users}
                            selectedUser={selectedUser}
                            setSelectedUser={setSelectedUser}
                            primaryBlue={PRIMARY_BLUE}
                        />

                        <ChatMessages
                            selectedUser={selectedUser}
                            filteredMessages={filteredMessages}
                            renderMessage={renderMessage}
                            input={input}
                            setInput={setInput}
                            sendMessage={sendMessage}
                            primaryBlue={PRIMARY_BLUE}
                            themBubbleColor={THEM_BUBBLE_COLOR}
                            secondaryBg={SECONDARY_BG}
                        />
                        
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    // --- Base & Root Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboardAvoidingContainer: {
        flex: 1,
        borderTopLeftRadius: BORDER_RADIUS_XL,
        borderTopRightRadius: BORDER_RADIUS_XL,
        overflow: 'hidden',
        marginTop: 100,
    },
    container: {
        flex: 1,
        backgroundColor: SECONDARY_BG,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.2, shadowRadius: 10 },
            android: { elevation: 15 },
        }),
    },
    divider: { 
        height: 1, 
        backgroundColor: '#ebedf0' 
    },
    selectUserText: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: SECONDARY_BG 
    },

    // --- Header Styles ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: 'white',
    },
    headerButton: { padding: 5 },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 15 },
    headerAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
    headerName: { fontWeight: '700', fontSize: 18, color: '#1c1e21' },
    activeStatus: { fontSize: 13, color: '#606770' },

    // --- User Selector Styles ---
    userSelectorList: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ebedf0', maxHeight: 100 },
    userListContent: { paddingHorizontal: 15, alignItems: 'center' },
    userItem: { alignItems: "center", justifyContent: 'center', marginRight: 25, paddingVertical: 5 },
    selectedUser: { 
        borderBottomWidth: 3, 
        borderBottomColor: PRIMARY_BLUE 
    },
    avatar: { width: 55, height: 55, borderRadius: 27.5, marginBottom: 5 },
    userName: { fontSize: 13, color: '#606770' },
    selectedUserNameActive: { 
        fontWeight: '700', 
        color: PRIMARY_BLUE 
    },

    // --- Chat/Message Styles ---
    chatArea: { flex: 1, paddingHorizontal: 10 },
    messages: { flex: 1 },
    messageListContent: { paddingBottom: 15, paddingTop: 10 },
    messageRow: { flexDirection: 'row', marginVertical: 3, alignItems: 'flex-end' },
    messageBubble: { maxWidth: "80%", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
    myMessage: { 
        backgroundColor: PRIMARY_BLUE, 
        borderBottomRightRadius: 6, 
        marginRight: 8 
    },
    theirMessage: { 
        backgroundColor: THEM_BUBBLE_COLOR, 
        borderBottomLeftRadius: 6, 
        marginLeft: 8 
    },
    msgAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 5, alignSelf: 'flex-end' },
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
    iconButton: { padding: 5, marginBottom: 4 },
    sendButton: {
        padding: 2,
        backgroundColor: PRIMARY_BLUE, 
        borderRadius: 25,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});