const db = require("../models");
const asyncHandler = require("../middleware/asyncHandler");
const { sanitizeUser } = require("../utils/auth.utils");
const { ValidationError, NotFoundError } = require("../utils/error.utils");
const User = db.user;
const Channel = db.channel;

exports.searchUser = asyncHandler(async (req, res) => {
  const { keyword } = req.body;

  const pipeline = [];

  if (!keyword) {
    throw new ValidationError("Search Query required");
  }

  pipeline.push(
    {
      $match: {
        name: { $regex: keyword },
      },
    },
    {
      $sort: { name: -1 },
    },
  );

  const users = await User.aggregate(pipeline).limit(10);
  const results = users.map((user) => sanitizeUser(user));

  res.status(200).send({
    message: "User Search Successful",
    type: "success",
    results,
  });
});

exports.sendRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  const io = req.app.get("io");

  const receiver = await User.findById(receiverId);
  const sender = await User.findById(req.user._id);

  if (!receiver) {
    throw new NotFoundError("User does not exist");
  }

  const alreadyFriends = sender.checkIfAlreadyFriends(receiver._id);

  if (alreadyFriends) {
    throw new ValidationError("Cannot send request, You are already friends");
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

  const incomingRequest = await receiver.requestProcess(sender._id, "incoming");
  const outgoingRequest = await sender.requestProcess(receiver._id, "outgoing");

  io.to(receiver._id.toString()).emit("friend-request-received", {
    ...incomingRequest,
    user: sanitizeUser(sender),
  });

  res.status(200).send({
    message: "Request Successfully sent",
    type: "success",
    outgoingRequest: { ...outgoingRequest, user: sanitizeUser(receiver) },
  });
});

exports.getFriendsAndRequests = asyncHandler(async (req, res) => {
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
    })
    .populate({
      path: "friends.channel",
    });

  res.status(200).send({
    message: "Successfully retrieved friends and requests",
    type: "success",
    friends: user.friends,
    requests: user.requests,
  });
});

exports.acceptRequest = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const io = req.app.get("io");

  const friendUser = await User.findById(userId);
  const currentUser = await User.findById(req.user._id);

  if (!friendUser) {
    throw new NotFoundError("User does not exist");
  }

  const dmChannel = await Channel.createNewDM([req.user._id, userId]);

  const currentUserFriendship = await currentUser.addFriend(
    friendUser._id,
    dmChannel._id,
  );
  const friendUserFriendship = await friendUser.addFriend(
    currentUser._id,
    dmChannel._id,
  );

  io.to(friendUser._id.toString()).emit("request-accepted", {
    ...friendUserFriendship,
    user: sanitizeUser(currentUser),
  });

  res.status(200).send({
    message: "New Friendship created",
    type: "success",
    newFriend: { ...currentUserFriendship, user: sanitizeUser(friendUser) },
  });
});

exports.rejectRequest = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const io = req.app.get("io");

  const rejectedUser = await User.findById(userId);
  const currentUser = await User.findById(req.user._id);

  if (!rejectedUser) {
    throw new NotFoundError("User does not exist");
  }

  await currentUser.rejectRequest(rejectedUser._id);
  await rejectedUser.rejectRequest(currentUser._id);

  io.to(rejectedUser._id.toString()).emit("request-rejected", currentUser._id);

  res.status(200).send({
    message: "Request rejected successfully",
    type: "success",
  });
});

exports.cancelRequest = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const io = req.app.get("io");

  const cancelledUser = await User.findById(userId);
  const currentUser = await User.findById(req.user._id);

  if (!cancelledUser) {
    throw new NotFoundError("User does not exist");
  }

  await currentUser.rejectRequest(cancelledUser._id);
  await cancelledUser.rejectRequest(currentUser._id);

  io.to(cancelledUser._id.toString()).emit(
    "request-cancelled",
    currentUser._id,
  );

  res.status(200).send({
    message: "Cancelled Request Successfully",
    type: "success",
  });
});
