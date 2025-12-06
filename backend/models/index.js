const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.otp = require("./otp.model");
db.material = require("./material.model");

module.exports = db;