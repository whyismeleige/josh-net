const db = require("../models");

const Server = db.server;

exports.createServer = async (req, res) => {
  try {
    const user = req.user;

    const { data } = req.body;

    if (!data) {
      return res.status(400).send({
        message: "Server Data required for creation",
        type: "error",
      });
    }

    const newServer = await Server.createNewServer(data, user._id);

    if (!newServer) {
      return res.status(400).send({
        message: "Error in Creating new Server",
        type: "error",
      });
    }

    await user.addNewServer(newServer._id);

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

exports.joinServer = async (req, res) => {};

exports.leaveServer = async (req, res) => {};

exports.getServer = async (req, res) => {};
