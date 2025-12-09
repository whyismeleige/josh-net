const { Server } = require("socket.io");

function intializeSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("chat-message", (msg) => {
        console.log("The Message is:", msg);
    })
  })

  return io;
}

module.exports = intializeSocket;
