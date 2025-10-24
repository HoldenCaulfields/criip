export default function initSocket(io) {
  // Store members per room (in memory)
  const roomMembers = {}; // { roomId: [ { userId, socketId } ] }

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    // When a user joins a room
    socket.on("join_room", ({ roomId, userId }) => {
      socket.join(roomId);

      console.log(`📍 User ${userId} (${socket.id}) joined room ${roomId}`);

      if (!roomMembers[roomId]) roomMembers[roomId] = [];
      roomMembers[roomId].push({ userId, socketId: socket.id });

      // Notify all room members
      io.to(roomId).emit("room_members", roomMembers[roomId]);
      socket.to(roomId).emit("user_joined", { userId });
    });

    // When a user leaves manually
    socket.on("leave_room", ({ roomId, userId }) => {
      socket.leave(roomId);

      console.log(`📍 User ${userId} left room ${roomId}`);

      if (roomMembers[roomId]) {
        roomMembers[roomId] = roomMembers[roomId].filter((m) => m.socketId !== socket.id);
        io.to(roomId).emit("room_members", roomMembers[roomId]);
        socket.to(roomId).emit("user_left", userId);
      }
    });

    // Handle message sending
    socket.on("send_message", (data) => {
      socket.to(data.roomId).emit("receive_message", data);
      console.log(`💬 Message sent to room ${data.roomId}:`, data.text);
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);

      // Remove the user from all rooms
      for (const roomId in roomMembers) {
        const member = roomMembers[roomId].find((m) => m.socketId === socket.id);
        if (member) {
          roomMembers[roomId] = roomMembers[roomId].filter((m) => m.socketId !== socket.id);
          io.to(roomId).emit("room_members", roomMembers[roomId]);
          io.to(roomId).emit("user_left", member.userId);
        }
      }
    });
  });
}
