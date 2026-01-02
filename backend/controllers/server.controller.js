const db = require("../models");
const path = require("path");

const { sanitizeUser } = require("../utils/auth.utils");
const { uploadS3File } = require("../utils/s3.utils");

const Server = db.server;
const User = db.user;
const Channel = db.channel;
const Message = db.message;
const ServerInvite = db.serverInvite;

exports.createServer = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const icon = req.file;

    if (!data) {
      return res.status(400).send({
        message: "Server Data required for creation",
        type: "error",
      });
    }

    const channels = await Channel.createBaseChannels(req.user._id);

    let newServer = await Server.createNewServer(
      { ...data, channels },
      req.user._id
    );

    if (!newServer) {
      return res.status(400).send({
        message: "Error in Creating new Server",
        type: "error",
      });
    }

    if (icon) {
      const key = `${newServer._id}/icon/${icon.originalname}`;
      const { cdnURL } = await uploadS3File(key, icon.buffer);
      newServer = await Server.findByIdAndUpdate(
        newServer._id,
        { $set: { icon: cdnURL } },
        { new: true }
      );
    }

    const user = await User.findById(req.user._id);

    await user.addNewServer(newServer._id);

    await newServer.populate({
      path: "users",
      transform: (doc) => {
        if (!doc) return doc;
        return sanitizeUser(doc);
      },
    });

    res.status(200).send({
      message: "Server created successfully",
      type: "success",
      newServer,
    });
  } catch (error) {
    console.error("Error in Creating Server", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.createUserInvite = async (req, res) => {
  try {
    const { serverId } = req.body;

    const serverExists = await Server.findOne({
      _id: serverId,
      users: req.user._id,
    });

    if (!serverExists) {
      return res.status(400).send({
        message: "Invalid Server Provided, Try Again Later",
        type: "error",
      });
    }

    const existingInvite = await ServerInvite.findOne({
      serverId,
      createdBy: req.user._id,
    });

    const invite = existingInvite
      ? existingInvite
      : await ServerInvite.createInviteCode(serverId, req.user._id);

    res.status(200).send({
      message: "Successfully Generated Invite Code",
      type: "success",
      inviteCode: invite.code,
    });
  } catch (error) {
    console.error("Error in Creating Server Invite", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.joinServerViaInvite = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).send({
        message: "Invalid InviteCode, Try Again Later",
        type: "error",
      });
    }

    const inviteVerified = await ServerInvite.findOne({
      code: inviteCode,
    });

    if (!inviteVerified) {
      return res.status(400).send({
        message: "This invite is either invalid or has expired",
        type: "error",
      });
    }

    let server = await Server.findById(inviteVerified.serverId);

    if (!server) {
      return res.status(400).send({
        message: "Server Not found",
        type: "error",
      });
    }

    const userAlreadyJoined = server.users.includes(req.user._id);

    if (userAlreadyJoined) {
      return res.status(400).send({
        message: "You are already a member of this server",
        type: "error",
      });
    }

    const io = req.app.get("io");

    const user = await User.findById(req.user._id);

    await user.addNewServer(server._id);

    server = await server.addMember(user._id);
    server = await server.populate({
      path: "users",
      transform: (doc) => {
        if (!doc) return doc;
        return sanitizeUser(doc);
      },
    });

    io.to(server._id).emit("new-member-joined", server._id, user);

    res.status(200).send({
      message: "Joined Server Successfully",
      type: "success",
      server,

    });
  } catch (error) {
    console.error("Error in Joining Server", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.listServers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "servers",
      populate: {
        path: "users",
        transform: (doc) => {
          if (!doc) return doc;
          return sanitizeUser(doc);
        },
      },
    });

    return res.status(200).send({
      message: "Servers retrieved successfully",
      type: "success",
      servers: user.servers,
    });
  } catch (error) {
    console.error("Error in Listing Servers", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.createChannel = async (req, res) => {
  try {
    const { data } = req.body;

    const server = await Server.findById(data.serverId);

    if (!server) {
      return res.status(400).send({
        message: "Server does not exist",
        type: "error",
      });
    }

    if (!data) {
      return res.status(400).send({
        message: "Invalid Input, Try Again",
        type: "error",
      });
    }

    const newChannel = await Channel.createNewChannel(data, req.user._id);

    if (!newChannel) {
      return res.status(400).send({
        message: "Error in creating new Channel",
        type: "error",
      });
    }

    await server.addChannel(newChannel._id);

    return res.status(200).send({
      message: "Channel created successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Error in Creating New Channel", error);
    res.status(400).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.listChannels = async (req, res) => {
  try {
    const serverId = req.query.serverId;

    const server = await Server.findById(serverId).populate("channels");

    if (!server) {
      return res.status(400).send({
        message: "Server does not exist",
        type: "error",
      });
    }

    res.status(200).send({
      message: "Channels retrieved successfully",
      type: "success",
      channels: server.channels,
    });
  } catch (error) {
    console.error("Error in Retrieving Channels", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.listMessages = async (req, res) => {
  try {
    const channelId = req.query.channelId;

    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      match: { deleted: false },
      populate: [
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
        {
          path: "forwardedMessage",
          populate: {
            path: "userId",
            transform: (doc) => {
              if (!doc) return doc;
              return sanitizeUser(doc);
            },
          },
        },
      ],
    });

    if (!channel) {
      return res.status(400).send({
        message: "Channel does not exist",
        type: "error",
      });
    }

    res.status(200).send({
      message: "Messages retrieved successfully",
      type: "success",
      messages: channel.messages,
    });
  } catch (error) {
    console.error("Error in Retrieving Messages", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.getMessageDestinations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "servers",
        populate: {
          path: "channels",
        },
      })
      .populate({ path: "friends.user" })
      .populate({ path: "friends.channel" });

    const forwardChannels = [];

    user.servers.forEach((server) => {
      server.channels.forEach((channel) => {
        forwardChannels.push({
          serverId: server._id,
          serverName: server.name,
          serverIcon: server.icon,
          channelId: channel._id,
          channelName: channel.name,
          channelType: channel.type,
        });
      });
    });
    const forwardDMs = user.friends.map((friend) => ({
      friendName: friend.user.name,
      channelId: friend.channel._id,
      friendAvatar: friend.user.avatarURL,
    }));
    res.status(200).send({
      message: "Successfully retrieved destinations",
      type: "success",
      forwardChannels,
      forwardDMs,
    });
  } catch (error) {
    console.error("Error in Fetching Message Destinations", error);
    res.status(500).send({
      message: error.message || "Error",
      type: "error",
    });
  }
};

exports.forwardMessages = async (req, res) => {
  try {
    const { forwardedMessage, messageContent = "", channelIds } = req.body;
    const io = req.app.get("io");

    if (
      !forwardedMessage ||
      !Array.isArray(channelIds) ||
      channelIds.length === 0
    ) {
      return res.status(400).send({
        message: "Channels or Forwarding Message is Invalid, Try Again later",
        type: "error",
      });
    }

    const newMessage = await Message.create({
      userId: req.user._id,
      forwardedMessage,
      content: messageContent,
    });

    await newMessage.populate([
      {
        path: "forwardedMessage",
        populate: {
          path: "userId",
          transform: (doc) => {
            if (!doc) return doc;
            return sanitizeUser(doc);
          },
        },
      },
      {
        path: "userId",
      },
    ]);

    if (newMessage.userId) {
      newMessage.userId = sanitizeUser(newMessage.userId);
    }

    for (const channelId of channelIds) {
      await Channel.findByIdAndUpdate(channelId, {
        $push: { messages: newMessage._id },
      });
      io.to(channelId).emit("receive-message", newMessage);
    }

    res.status(200).send({
      message: "Successfully forwarded messages",
      type: "success",
    });
  } catch (error) {
    console.error("Error in Forwarding Messages", error);
    res.status(500).send({
      message: error.message || "Error",
      type: "error",
    });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const { messageId, channelId, editedMessage } = req.body;
    const io = req.app.get("io");

    if (!messageId || !channelId || !editedMessage) {
      return res.status(400).send({
        message: "Message Content is Invalid, Try again later",
        type: "error",
      });
    }

    await Message.findByIdAndUpdate(messageId, {
      $set: {
        content: editedMessage,
        isEdited: true,
        editedTimestamp: new Date().toISOString(),
      },
    });

    io.to(channelId).emit("message-edited", messageId, editedMessage);

    res.status(200).send({
      message: "Successfully Edited Message",
      type: "success",
    });
  } catch (error) {
    console.error("Error in Editing Messages", error);
    res.status(500).send({
      message: error.message || "Error",
      type: "error",
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { channelId, messageId } = req.body;
    const io = req.app.get("io");

    await Message.findByIdAndUpdate(messageId, {
      $set: {
        deleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user._id,
      },
    });

    io.to(channelId).emit("message-deleted", messageId);

    res.status(200).send({
      message: "Successfully Deleted Message",
      type: "success",
    });
  } catch (error) {
    console.error("Error in editing message", error);
    res.status(500).send({
      message: error.message || "Error",
      type: "error",
    });
  }
};
