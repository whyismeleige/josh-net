const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.otp = require("./otp.model");
db.material = require("./material.model");
db.server = require("./server.model");
db.channel = require("./channel.model");
db.message = require("./message.model");

module.exports = db;
