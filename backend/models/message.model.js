const mongoose = require("mongoose");
const uuid = require("uuid");

const MessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "embed"],
      default: "text",
    },
    attachments: [
      {
        id: {
          type: mongoose.Schema.Types.String,
          default: () => uuid.v4().replace(/\-/g, ""),
        },
        fileName: {
          type: String,
          trim: true,
          required: true,
        },
        s3Key: {
          type: String,
          required: true,
          trim: true,
        },
        s3URL: {
          type: String,
          required: true,
          trim: true,
        },
        fileSize: mongoose.Schema.Types.Int32,
        mimeType: String,
      },
    ],
    reactions: [
      {
        emoji: {
          type: String,
          required: true,
        },
        users: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            timestamp: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        count: {
          type: Number,
          default: 1,
        },
      },
    ],
    content: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    editedTimestamp: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

MessageSchema.methods.toggleReaction = async function (emoji, userId) {
  const existingReaction = this.reactions.find(
    (reaction) => reaction.emoji === emoji
  );
  let count;
  if (!existingReaction) {
    this.reactions.push({
      emoji,
      users: [{ user: userId }],
      count: 1,
    });
    count = 1;
  } else {
    const existingUser = existingReaction.users.find(
      (doc) => doc.user.toString() === userId.toString()
    );
    if (existingUser) {
      existingReaction.users.pull({ user: userId });
      existingReaction.count--;
    } else {
      existingReaction.users.push({ user: userId });
      existingReaction.count++;
    }
    if(existingReaction.count === 0) {
      this.reactions.pull(existingReaction);
    }
    count = existingReaction.count;
  }
  await this.save();
  return count;
};

MessageSchema.methods.saveAttachments = async function (attachments) {
  this.attachments = attachments;
  return await this.save();
};
module.exports = mongoose.model("Message", MessageSchema);
