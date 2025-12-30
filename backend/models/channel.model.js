const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: [3, "Name of the Channel needs to be atleast 3 characters"],
      maxlength: [
        50,
        "Name of the Channel cannot exceed more than 50 characters",
      ],
      required: function () {
        return !["dm", "group_dm"].includes(this.type);
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Description of the Channel cannot exceed more than 500 characters",
      ],
      default: "No Description provided to this Channel",
    },
    type: {
      type: String,
      enum: ["dm", "group_dm", "guild_announcement", "guild_text"],
      default: "guild_text",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function () {
          return ["dm", "group_dm"].includes(this.type);
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

ChannelSchema.statics.createNewDM = async function (participants) {
  return await this.create({
    type: "dm",
    createdBy: participants[0],
    participants,
  });
};

ChannelSchema.statics.createNewChannel = async function (data, userId) {
  return await this.create({
    name: data.name,
    description: data?.description,
    type: data?.type,
    createdBy: userId,
  });
};

module.exports = mongoose.model("Channel", ChannelSchema);
