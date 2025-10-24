import React, { useState, useEffect, useCallback } from "react";
import {
    View, TextInput, Text, FlatList, Pressable, StyleSheet, Modal, Image, ScrollView, Platform,
    Animated, KeyboardAvoidingView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

const SOCKET_URL = "https://192.168.1.12/api/";

// --- Type Definitions ---
type ChatMode = "chat" | "chatlist";

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
    // New prop to set the initial view (defaults to 'chatlist' if not provided)
    initialMode?: ChatMode; 
    // Optional prop for starting a chat directly with a user/group
    initialUser?: User | null; 
}

// --- Enhanced Design Variables ---
const PRIMARY_BLUE = '#007aff';
const SECONDARY_BG = '#f0f2f5';
const THEM_BUBBLE_COLOR = '#e4e6eb';
const BORDER_RADIUS_XL = 30;

// =================================================================
// 🚀 CHAT LIST SCREEN (New Component/View)
// =================================================================

interface ChatListScreenProps {
    users: User[];
    onSelectUser: (user: User) => void;
}

const ChatListScreen = ({ users, onSelectUser }: ChatListScreenProps) => {
    // Dummy recent chats for demonstration
    const recentChats = users.slice(0, 3).map((user, index) => ({
        ...user,
        lastMessage: `Hey, how are you? (${index + 1})`,
        timestamp: `${10 - index}:00 AM`,
    }));

    // Example of a recommended user
    const recommendedUser = users[3];

    const renderChatListItem = ({ item }: { item: typeof recentChats[0] }) => (
        <Pressable 
            style={styles.chatListItem} 
            onPress={() => onSelectUser(item)}
            android_ripple={{ color: '#ccc' }}
        >
            <Image source={{ uri: item.avatar }} style={styles.chatListAvatar} />
            <View style={styles.chatListDetails}>
                <Text style={styles.chatListName}>{item.name}</Text>
                <Text style={styles.chatListMessage} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.chatListTimestamp}>{item.timestamp}</Text>
        </Pressable>
    );

    return (
        <View style={styles.chatListContainer}>
            <Text style={styles.listHeader}>Recent Chats</Text>
            <FlatList
                data={recentChats}
                keyExtractor={item => item.id}
                renderItem={renderChatListItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            
            {/* Recommendation/Suggestion Section */}
            <View style={styles.recommendationBox}>
                <Text style={styles.listHeader}>Recommended Friend</Text>
                <Pressable style={styles.chatListItem} onPress={() => onSelectUser(recommendedUser)}>
                    <Image source={{ uri: recommendedUser.avatar }} style={styles.chatListAvatar} />
                    <View style={styles.chatListDetails}>
                        <Text style={styles.chatListName}>{recommendedUser.name}</Text>
                        <Text style={styles.chatListMessage} numberOfLines={1}>Tap to start a new conversation!</Text>
                    </View>
                    <Ionicons name="chatbox-ellipses-outline" size={24} color={PRIMARY_BLUE} />
                </Pressable>
            </View>
        </View>
    );
};

// =================================================================
// 💬 MAIN COMPONENT
// =================================================================

export default function ChatBox({ visible, onClose, initialMode = "chatlist", initialUser = null }: ChatBoxProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(initialUser);
    const [mode, setMode] = useState<ChatMode>(initialMode); // New mode state

    const users: User[] = [
        { id: "1", name: "Alice", avatar: "https://i.pravatar.cc/150?img=1" },
        { id: "2", name: "Bob", avatar: "https://i.pravatar.cc/150?img=2" },
        { id: "3", name: "Charlie", avatar: "https://i.pravatar.cc/150?img=3" },
        { id: "4", name: "David", avatar: "https://i.pravatar.cc/150?img=4" },
    ];

    // Initialize selectedUser and mode when the modal becomes visible
    useEffect(() => {
        if (visible) {
            if (initialUser) {
                setSelectedUser(initialUser);
                setMode("chat");
            } else if (users.length > 0 && mode === "chat") {
                // Default to the first user if in 'chat' mode but no user is selected
                setSelectedUser(users[0]);
            } else {
                setMode(initialMode);
            }
        }
    }, [visible, initialMode, initialUser]);

    if (!visible) return null;

    const goToChat = (user: User) => {
        setSelectedUser(user);
        setMode("chat");
    };

    const goToChatList = () => {
        setMode("chatlist");
        setSelectedUser(null); // Optional: Clear selected user when going to list
    };

    const sendMessage = () => {
        // ... (sendMessage logic remains the same)
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
        // ... (renderMessage logic remains the same)
        const isMe = item.sender === "me";
        const bubbleStyle = isMe ? styles.myMessage : styles.theirMessage;

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

    // =================================================================
    // 🖥️ CHAT VIEW RENDER
    // =================================================================

    const renderChatView = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingContainer}
            keyboardVerticalOffset={0}
        >
            <View style={styles.container}>
                {/* Header for Chat View */}
                <View style={styles.header}>
                    <Pressable onPress={goToChatList} style={styles.headerButton}>
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

                {/* User Selector List (Ribbon) - Only show in chat view, or always, your choice. 
                   I'll keep it here for continuity. */}
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

                {/* Chat area */}
                <View style={styles.chatArea}>
                    {selectedUser ? (
                        <>
                            {/* FlatList */}
                            <FlatList
                                style={styles.messages}
                                data={filteredMessages}
                                keyExtractor={item => item.id}
                                renderItem={renderMessage}
                                inverted
                                contentContainerStyle={styles.messageListContent}
                            />

                            {/* Input Bar */}
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
    );

    // =================================================================
    // 📜 CHAT LIST VIEW RENDER
    // =================================================================

    const renderChatListView = () => (
        <View style={styles.container}>
            {/* Header for Chat List View */}
            <View style={styles.header}>
                <Pressable onPress={onClose} style={styles.headerButton}>
                    <Ionicons name="close-outline" size={30} color="#1c1e21" /> 
                </Pressable>
                <Text style={styles.chatListMainTitle}>Chats</Text>
                <Pressable style={styles.headerButton}>
                    <Ionicons name="create-outline" size={28} color={PRIMARY_BLUE} /> 
                </Pressable>
            </View>
            <View style={styles.divider} />

            {/* Render the actual list screen */}
            <ChatListScreen users={users} onSelectUser={goToChat} />
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent >
            <View style={styles.modalOverlay}>
                {/* Conditionally render the correct view */}
                {mode === "chatlist" ? renderChatListView() : renderChatView()}
            </View>
        </Modal>
    );
}

// =================================================================
// 🎨 STYLES (Added styles for ChatListScreen)
// =================================================================

const styles = StyleSheet.create({
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
        marginTop: 0,
    },
    container: {
        flex: 1,
        marginTop: 60,
        backgroundColor: SECONDARY_BG,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.2, shadowRadius: 10 },
            android: { elevation: 15 },
        })
    },

    // --- Header Styles ---
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
    // New style for chat list title
    chatListMainTitle: { fontWeight: 'bold', fontSize: 24, flex: 1, textAlign: 'center', color: '#1c1e21' },

    // --- User Selector List (Ribbon Effect) ---
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

    // --- Chat Area Styles ---
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

    // --- Input Styles ---
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
    
    // --- New ChatListScreen Styles ---
    chatListContainer: {
        flex: 1,
        paddingTop: 10,
        backgroundColor: 'white',
    },
    listHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1c1e21',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    chatListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: 'white',
    },
    chatListAvatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        marginRight: 15,
    },
    chatListDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    chatListName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1c1e21',
        marginBottom: 2,
    },
    chatListMessage: {
        fontSize: 14,
        color: '#606770',
    },
    chatListTimestamp: {
        fontSize: 12,
        color: '#a0a0a0',
        marginLeft: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#ebedf0',
        marginLeft: 85, // Align with the message text start
    },
    recommendationBox: {
        backgroundColor: SECONDARY_BG,
        paddingBottom: 10,
        marginTop: 10,
    },
});