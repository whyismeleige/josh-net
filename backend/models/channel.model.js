const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a Channel Schema"],
      trim: true,
      minlength: [3, "Name of the Channel needs to be atleast 3 characters"],
      maxlength: [
        50,
        "Name of the Channel cannot exceed more than 50 characters",
      ],
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
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: true,
    toObject: true,
  }
);

module.exports = mongoose.model("Channel", ChannelSchema);
