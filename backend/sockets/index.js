const { Server } = require("socket.io");

const ChannelSocket = require("./channel.socket");
const MessageSocket = require("./message.socket");

function intializeSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 5 * 1024 * 1024,
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    ChannelSocket(io, socket);
    MessageSocket(io, socket);
  });

  return io;
}

module.exports = intializeSocket;
