// ChatMessages.tsx
import React from 'react';
import { View, FlatList, Text, TextInput, Pressable, StyleSheet, ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ChatBoxStyles'; // Assuming you move styles to a separate file

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

interface ChatMessagesProps {
    selectedUser: User | null;
    filteredMessages: ChatMessage[];
    renderMessage: ListRenderItem<ChatMessage>;
    input: string;
    setInput: (text: string) => void;
    sendMessage: () => void;
    primaryBlue: string;
    themBubbleColor: string;
    secondaryBg: string;
}

export default function ChatMessages({ 
    selectedUser, 
    filteredMessages, 
    renderMessage, 
    input, 
    setInput, 
    sendMessage, 
    primaryBlue, 
    themBubbleColor,
    secondaryBg
}: ChatMessagesProps) {
    return (
        <View style={styles.chatArea}>
            {selectedUser ? (
                <>
                    <FlatList
                        style={styles.messages}
                        data={filteredMessages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        inverted
                        contentContainerStyle={styles.messageListContent}
                    />
                    <View style={styles.inputContainer}>
                        <Pressable style={styles.iconButton}>
                            <Ionicons name="image-outline" size={28} color={primaryBlue} />
                        </Pressable>

                        <TextInput
                            style={[styles.input, { backgroundColor: themBubbleColor }]}
                            placeholder="Aa"
                            placeholderTextColor="#777"
                            value={input}
                            onChangeText={setInput}
                            multiline
                        />

                        {input.trim() ? (
                            <Pressable style={[styles.sendButton, { backgroundColor: primaryBlue }]} onPress={sendMessage}>
                                <Ionicons name="send" size={24} color="white" />
                            </Pressable>
                        ) : (
                            <Pressable style={styles.iconButton}>
                                <Ionicons name="thumbs-up" size={28} color={primaryBlue} />
                            </Pressable>
                        )}
                    </View>
                </>
            ) : (
                <View style={[styles.selectUserText, { backgroundColor: secondaryBg }]}>
                    <Text style={{ fontSize: 18, color: '#666' }}>Select a user to start chatting</Text>
                </View>
            )}
        </View>
    );
}

// NOTE: For brevity, the styles for chatArea, messages, messageListContent, inputContainer, input, iconButton, sendButton, selectUserText
// are assumed to be imported or defined here.