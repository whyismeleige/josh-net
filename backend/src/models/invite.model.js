const mongoose = require("mongoose");

const ServerInviteSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    expiresAt: {
      type: Date,
      expires: 60 * 60 * 24 * 7,
    },
  },
  {
    timestamps: true,
  }
);

const createRandomInviteCode = (length = 8) => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * characters.length));

  return result;
};

ServerInviteSchema.statics.createInviteCode = async function (serverId, userId) {
  const MAX_RETRIES = 5;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const inviteCode = createRandomInviteCode();

    try {
      return await this.create({
        code: inviteCode,
        serverId,
        createdBy: userId,
      });
    } catch (error) {
      if (error.code === 11000 && attempt < MAX_RETRIES - 1) continue;
      throw error;
    }
  }
  throw new Error(
    "Failed to Generate unique Invite Code after maximum retries"
  );
};

module.exports = mongoose.model("Invite", ServerInviteSchema);
