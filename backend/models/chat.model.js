const mongoose = require("mongoose");

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
          required: true,
          trim: true,
        },
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
  if(this.access === "public" || this.userId.toString() === userId) return true;
  return false;
}

ChatSchema.methods.saveConversation = async function (author, message) {
  this.conversationHistory = [...this.conversationHistory, { author, message }];
  return await this.save();
}

module.exports = mongoose.model("Chat", ChatSchema);
