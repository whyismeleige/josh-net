const typingTimeouts = new Map();

function getRandomTimout() {
  return 500 + Math.random() * 1000;
}

function getTypingKey(channelId, userId) {
  return `${channelId}/${userId}`;
}

module.exports = (io, socket) => {
  socket.on("join-channel", async (channelId, userId) => {
    socket.join(channelId);
    console.log(`User ${userId} join Channel ${channelId}`);
  });

  socket.on("leave-channel", async (channelId, userId) => {
    socket.leave(channelId);
    console.log(`User ${userId} left channel ${channelId}`);
  });

  socket.on("typing", async (channelId, userId, userName) => {
    const key = getTypingKey(channelId, userId);
    
    if (typingTimeouts.has(key)) {
      const existing = typingTimeouts.get(key);
      clearTimeout(existing.timeout);
    }
  
    const timeout = setTimeout(() => {
      socket.to(channelId).emit("typing-indicator", `${userName} is typing...`);
      typingTimeouts.delete(key);
    }, getRandomTimout());

    typingTimeouts.set(key, {
      timeout,
      userId,
      channelId,
      startedAt: Date.now(),
    });
  });
};
