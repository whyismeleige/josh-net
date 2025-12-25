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

MessageSchema.methods.saveAttachments = async function (attachments) {
  this.attachments = attachments;
  return await this.save();
};
module.exports = mongoose.model("Message", MessageSchema);
