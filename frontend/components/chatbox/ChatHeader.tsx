// ChatHeader.tsx
import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ChatBoxStyles'; // Assuming you move styles to a separate file

interface User {
    id: string;
    name: string;
    avatar: string;
}

interface ChatHeaderProps {
    selectedUser: User | null;
    onClose: () => void;
    primaryBlue: string;
}

export default function ChatHeader({ selectedUser, onClose, primaryBlue }: ChatHeaderProps) {
    return (
        <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={28} color={primaryBlue} />
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
        </View>
    );
}

// NOTE: For brevity, the styles for 'header', 'headerButton', 'userInfo', 'headerAvatar', 'headerName', 'activeStatus' 
// are assumed to be imported or defined here.