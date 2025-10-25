import React, { useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import CreatePostModal from "./create-post/CreatePostModal";
import GroupList from "./groupList/GroupList";
import GroupChat from "./groupchat/GroupChat";

interface PanelProps {
  openChat: boolean;
  userId: string;
  roomId: string | null;
  onOpenChat: (roomId: string) => void;
  onCloseChat: () => void;
}

export default function SocialPanel({
  openChat,
  userId,
  roomId,
  onOpenChat,
  onCloseChat,
}: PanelProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [groupVisible, setGroupVisible] = useState(false);

  const handleSelectRoom = (roomId: string) => {
    onOpenChat(roomId);
    setGroupVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* ➕ Button */}
      <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.icon}>➕</Text>
      </Pressable>

      <CreatePostModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* 💬 Button */}
      <Pressable style={styles.button} onPress={() => setGroupVisible(true)}>
        <Text style={styles.icon}>💬</Text>
      </Pressable>

      <GroupList
        onSelectRoom={handleSelectRoom}
        visible={groupVisible}
        onClose={() => setGroupVisible(false)}
      />

      {/* Group Chat (controlled by Map) */}
      {openChat && (
        <GroupChat
          visible={openChat}
          roomId={roomId}
          userId={userId}
          onClose={onCloseChat}
        />
      )}
    </View>
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
    backgroundColor: "white",
    borderRadius: 25,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: { fontSize: 20 },
});
