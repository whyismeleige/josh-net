module.exports = (io, socket) => {
  socket.on("join-channel", async (channelId, userId) => {
    socket.join(channelId);
    console.log(`User ${userId} join Channel ${channelId}`);
  });

  socket.on("leave-channel", async (channelId, userId) => {
    socket.leave(channelId);
    console.log(`User ${userId} left channel ${channelId}`);
  });
};
