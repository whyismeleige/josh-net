const db = require("../models");
const { sanitizeUser } = require("../utils/auth.utils");

const Message = db.message;
const Channel = db.channel;

module.exports = (io, socket) => {
  socket.on("send-message", async (channelId, userId, message) => {
    const newMessage = await Message.create({
      userId,
      content: message,
    });

    await newMessage.populate({
      path: "userId",
      transform: (doc) => {
        if (!doc) return doc;
        return sanitizeUser(doc);
      },
    });

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: newMessage },
    });

    io.to(channelId).emit("receive-message", newMessage);
  });
};
