const db = require("../models");

const User = db.user;

exports.listChats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("chats");

    return res.status(200).send({
      message: "Chats retrieved successfully",
      type: "success",
      chats: user.chats,
    });
  } catch (error) {
    console.error("Error in Getting Chats for User", error.message);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};
