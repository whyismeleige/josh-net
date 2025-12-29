const db = require("../models");
const { sanitizeUser } = require("../utils/auth.utils");

const User = db.user;
const Channel = db.channel;

exports.searchUser = async (req, res) => {
  try {
    const { keyword } = req.body;

    const pipeline = [];

    if (!keyword) {
      return res.status(400).send({
        message: "Search Query required",
        type: "error",
      });
    }

    pipeline.push(
      {
        $match: {
          name: { $regex: keyword },
        },
      },
      {
        $sort: { name: -1 },
      }
    );

    const users = await User.aggregate(pipeline).limit(10);
    const results = users.map((user) => sanitizeUser(user));

    res.status(200).send({
      message: "User Search Successful",
      type: "success",
      results,
    });
  } catch (error) {
    console.log("Error in Searching Users", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const io = req.app.get("io");

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(req.user._id);

    if (!receiver) {
      return res.status(400).send({
        message: "User does not exist",
        type: "error",
      });
    }

    const requestExists = sender.requestExists(receiver._id);

    if (requestExists) {
      return res.status(400).send({
        message:
          requestExists.status === "outgoing"
            ? "Friend Request Already sent."
            : "You already have a pending request from this person",
        type: "error",
      });
    }

    if (receiver.isUserBlocked(sender._id)) {
      return res.status(403).send({
        message: "Unable to send message, Try again later",
        type: "error",
      });
    }

    await receiver.requestProcess(sender._id, "incoming");
    await sender.requestProcess(receiver._id, "outgoing");

    io.to(receiver._id.toString()).emit(
      "friend-request-received",
      {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatarURL,
      },
      (createdAt = new Date().toISOString())
    );

    res.status(200).send({
      message: "Request Successfully sent",
      type: "success",
    });
  } catch (error) {
    console.error("Error in Sending Request", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.getFriendsAndRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "friends.user",
        transform: (doc) => {
          if (!doc) return doc;
          return sanitizeUser(doc);
        },
      })
      .populate({
        path: "requests.user",
        transform: (doc) => {
          if (!doc) return doc;
          return sanitizeUser(doc);
        },
      });

    res.status(200).send({
      message: "Successfully retrieved friends and requests",
      type: "success",
      friends: user.friends,
      requests: user.requests,
    });
  } catch (error) {
    console.error("Error in Retrieving Friends and Requests", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.acceptRequest = (req, res) => {};

exports.rejectRequest = (req, res) => {};
