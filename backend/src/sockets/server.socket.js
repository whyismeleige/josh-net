
module.exports = (io, socket) => {
  socket.on("join-server", async (serverId) => {
    socket.join(serverId);
  });

  socket.on("leave-server", async (serverId) => {
    socket.leave(serverId);
  });
};
