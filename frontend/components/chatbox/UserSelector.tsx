// UserSelector.tsx
import React from 'react';
import { ScrollView, Pressable, Image, Text, StyleSheet } from 'react-native';
import { styles } from './ChatBoxStyles'; // Assuming you move styles to a separate file

interface User {
    id: string;
    name: string;
    avatar: string;
}

interface UserSelectorProps {
    users: User[];
    selectedUser: User | null;
    setSelectedUser: (user: User) => void;
    primaryBlue: string;
}

export default function UserSelector({ users, selectedUser, setSelectedUser, primaryBlue }: UserSelectorProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.userSelectorList}
            contentContainerStyle={styles.userListContent}
        >
            {users.map(user => (
                <Pressable
                    key={user.id}
                    style={[
                        styles.userItem,
                        selectedUser?.id === user.id && styles.selectedUser
                    ]}
                    onPress={() => setSelectedUser(user)}
                >
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    <Text style={[
                        styles.userName,
                        selectedUser?.id === user.id && { fontWeight: '700', color: primaryBlue }
                    ]}>
                        {user.name}
                    </Text>
                </Pressable>
            ))}
        </ScrollView>
    );
}

// NOTE: For brevity, the styles for 'userSelectorList', 'userListContent', 'userItem', 'selectedUser', 'avatar', 'userName'
// are assumed to be imported or defined here.