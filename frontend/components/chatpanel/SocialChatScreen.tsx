import React, { useState } from "react";
import { View, Button } from "react-native";
import GroupList from "../groupList/GroupList";
import GroupChat from "../groupchat/GroupChat";

export default function SocialChatScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [chatVisible, setChatVisible] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

    const userId = "user_" + Math.random().toString(36).substring(2, 8); // fake userId

    const handleSelectRoom = (roomId: string) => {
        setSelectedRoom(roomId);
        setChatVisible(true);
    };

    const handleCloseChat = () => {
        setChatVisible(false);
        setSelectedRoom(null);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center" }}>

            <GroupList
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelectRoom={handleSelectRoom}
            />

            <GroupChat
                visible={chatVisible}
                roomId={selectedRoom}
                userId={userId}
                onClose={handleCloseChat}
            />
        </View>
    );
}
