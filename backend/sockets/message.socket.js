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
  socket.on("send-message", async (attachmentsLength, metadata, message, tempMsgId) => {
    const { serverId, channelId, userId } = metadata;
    console.log("Currently Working on Temp Message", tempMsgId);

    let newMessage = await Message.create({
      userId: userId,
      content: message,
    });

    const attachmentId = uuid.v4();

    const attachments = [];

    console.log(`The new message created for ${tempMsgId} is`, newMessage);

    try {
      for (let i = 0; i < attachmentsLength; i++) {
        socket.emit("get-file", i);

        const data = await new Promise((resolve, reject) => {
          receiveFile(socket, `./uploads/${newMessage._id}`, i, async (err, data) => {
            if (err) reject(err);
            console.log("The Meta Data is:" ,data);

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
          });
        });

        attachments.push(data);
      }
    } catch (error) {
      console.error("Error in Uploading File", error);

      socket.emit("upload-error", error);
    } finally {
      console.log("All messages were successfully", tempMsgId);

      socket.emit("all-uploads-complete");
    }

    newMessage = await newMessage.saveAttachments(attachments);

    await newMessage.populate({
      path: "userId",
      transform: (doc) => {
        if (!doc) return doc;
        return sanitizeUser(doc);
      },
    });

    console.log("New Message saved to database", newMessage);

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: newMessage._id },
    });

    io.to(channelId).emit("receive-message", newMessage, tempMsgId);
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

  console.log("Temporary Path", tmp);

  const eventName = key.toString();

  console.log("The current event working on:", eventName);

  const handler = (part) => {
    if (part.metadata) {
      console.log(`The Final part received for `, part.id);

      stream.close();
      const newPath = path.join(destination, part.metadata.name);

      console.log("The New Path is", newPath);

      fs.renameSync(tmp, newPath);
      socket.emit(`${key}:${part.id}:end`);
      socket.removeListener(eventName, handler);
      callback(null, { ...part.metadata, newPath });
    } else {
      console.log(`The Write part received for`, part.id);

      stream.write(part.chunk);
      socket.emit(`${key}:${part.id}:next`);
    }
  };

  socket.on(eventName, handler);
};
