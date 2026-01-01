const db = require("../models");
const uuid = require("uuid");
const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");

const { sanitizeUser } = require("../utils/auth.utils");
const { uploadS3File } = require("../utils/s3.utils");

const Message = db.message;
const Channel = db.channel;

module.exports = (io, socket) => {
  socket.on(
    "send-message",
    async (attachmentsLength, metadata, message, replyMessageId, tempMsgId) => {
      const { serverId, channelId, userId } = metadata;

      console.log("Reply to message", message.replyTo);
      let newMessage = await Message.create({
        userId: userId,
        content: message,
        replyTo: replyMessageId,
      });

      const attachmentId = uuid.v4();

      const attachments = [];

      try {
        for (let i = 0; i < attachmentsLength; i++) {
          socket.emit(`get-file:${tempMsgId}`, i);

          const data = await new Promise((resolve, reject) => {
            receiveFile(
              socket,
              `./`,
              `${i}:${tempMsgId}`,
              async (err, data) => {
                if (err) reject(err);
                const buffer = fs.readFileSync(data.newPath);

                const s3Key = `${serverId}/${channelId}/${newMessage._id}/${attachmentId}-${data.name}`;

                const s3URL = await uploadS3File(s3Key, buffer);

                fs.unlinkSync(data.newPath);
                resolve({
                  attachmentId,
                  fileName: data.name,
                  s3Key,
                  s3URL,
                  fileSize: data.size,
                  mimeType: data.type,
                });
              }
            );
          });

          attachments.push(data);
        }
      } catch (error) {
        console.error("Error in Uploading File", error);

        socket.emit(`upload-error:${tempMsgId}`, error);
      } finally {
        socket.emit(`all-uploads-complete:${tempMsgId}`);
      }

      newMessage = await newMessage.saveAttachments(attachments);

      await newMessage.populate([
        {
          path: "userId",
          transform: (doc) => {
            if (!doc) return doc;
            return sanitizeUser(doc);
          },
        },
        {
          path: "replyTo",
          populate: {
            path: "userId",
            transform: (doc) => {
              if (!doc) return doc;
              return sanitizeUser(doc);
            },
          },
        },
      ]);

      await Channel.findByIdAndUpdate(channelId, {
        $push: { messages: newMessage._id },
      });

      io.to(channelId).emit("receive-message", newMessage, tempMsgId);
    }
  );

  socket.on("toggle-reaction", async (channelId, messageId, userId, emoji) => {
    const message = await Message.findById(messageId);

    const newCount = await message.toggleReaction(emoji, userId);

    console.log("The new count is", newCount);
    io.to(channelId).emit(
      "reaction-updated",
      messageId,
      userId,
      emoji,
      newCount,
      (timestamp = new Date().toISOString())
    );
  });
};

const createDirIfNotExistsRecursive = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const receiveFile = (socket, destination, key, callback) => {
  createDirIfNotExistsRecursive(destination);

  const id = nanoid(10);
  const tmp = path.join(destination, id);
  const stream = fs.createWriteStream(tmp);
  const eventName = key.toString();

  const handler = (part) => {
    if (part.metadata) {
      stream.close();
      const newPath = path.join(destination, part.metadata.name);
      fs.renameSync(tmp, newPath);
      socket.emit(`${key}:${part.id}:end`);
      socket.removeListener(eventName, handler);
      callback(null, { ...part.metadata, newPath });
    } else {
      stream.write(part.chunk);
      socket.emit(`${key}:${part.id}:next`);
    }
  };

  socket.on(eventName, handler);
};
