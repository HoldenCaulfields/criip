import React, { useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import CreatePostModal from "./create-post/CreatePostModal";
import GroupList from "./groupList/GroupList";
import GroupChat from "./groupchat/GroupChat";

interface PanelProps {
  chatVisible: boolean;
  userId: string;
  roomId: string | null;
  onOpenChat: (roomId: string) => void;
  onCloseChat: () => void;
}

export default function SocialPanel({
  chatVisible,
  userId,
  roomId,
  onOpenChat,
  onCloseChat,
}: PanelProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [groupVisible, setGroupVisible] = useState(false);

  const handleSelectRoom = (selectedRoomId: string) => {
    console.log("🎯 Room selected from list:", selectedRoomId);
    setGroupVisible(false);
    
    // Small delay for smooth transition
    setTimeout(() => {
      onOpenChat(selectedRoomId);
    }, 150);
  };

  const handleCloseGroupList = () => {
    setGroupVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        {/* ➕ Create Post Button */}
        <Pressable 
          style={[styles.button, styles.createButton]} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.icon}>➕</Text>
        </Pressable>

        {/* 💬 Group List Button */}
        <Pressable 
          style={[styles.button, styles.chatButton]} 
          onPress={() => setGroupVisible(true)}
        >
          <Text style={styles.icon}>💬</Text>
        </Pressable>
      </View>

      {/* Modals */}
      <CreatePostModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />

      <GroupList
        onSelectRoom={handleSelectRoom}
        visible={groupVisible}
        onClose={handleCloseGroupList}
      />

      {/* Group Chat - Opens from marker or group list */}
      <GroupChat
        visible={chatVisible}
        roomId={roomId}
        userId={userId}
        onClose={onCloseChat}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 20,
    flexDirection: "column",
    gap: 12,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  createButton: {
    backgroundColor: "#4CAF50",
  },
  chatButton: {
    backgroundColor: "#2196F3",
  },
  icon: { 
    fontSize: 24,
  },
});