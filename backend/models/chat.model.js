const mongoose = require("mongoose");
const { uploadS3File } = require("../utils/s3.utils");

const ChatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      length: [100, "Title length cannot exceed more than 100 characters"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    conversationHistory: [
      {
        author: {
          type: String,
          enum: ["user", "ai", "assistant"],
          required: true,
        },
        message: {
          type: String,
          trim: true,
        },
        attachments: [
          {
            title: {
              type: String,
              required: true,
              trim: true,
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
          },
        ],
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    access: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    aiModel: {
      type: String,
      required: true,
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

ChatSchema.methods.checkAccess = function (userId) {
  if (this.access === "public" || this.userId.toString() === userId)
    return true;
  return false;
};

ChatSchema.methods.saveConversation = async function (
  author,
  message,
  files = []
) {
  const attachmentPromises = files.map(async (file) => {
    const title = file.originalname;
    const s3Key = `${this.userId}/${this._id}/${title}`;
    const s3URL = await uploadS3File(s3Key, file.buffer);
    return {
      title,
      s3Key,
      s3URL,
    };
  });
  const attachments = await Promise.all(attachmentPromises);
  this.conversationHistory = [
    ...this.conversationHistory,
    { author, message, attachments },
  ];
  return await this.save();
};

module.exports = mongoose.model("Chat", ChatSchema);
