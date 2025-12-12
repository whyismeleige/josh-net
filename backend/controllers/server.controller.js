const db = require("../models");

const { sanitizeUser } = require("../utils/auth.utils");

const Server = db.server;
const User = db.user;
const Channel = db.channel;

exports.createServer = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).send({
        message: "Server Data required for creation",
        type: "error",
      });
    }

    const newServer = await Server.createNewServer(data, req.user._id);

    if (!newServer) {
      return res.status(400).send({
        message: "Error in Creating new Server",
        type: "error",
      });
    }

    const user = await User.findById(req.user._id);

    await user.addNewServer(newServer._id);

    res.status(200).send({
      message: "Server created successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Error in Creating Server", error);
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
      populate: {
        path: "userId",
        transform: (doc) => {
          if (!doc) return doc;
          return sanitizeUser(doc);
        },
      },
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
