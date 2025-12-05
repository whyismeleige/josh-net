const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "No Description Provided",
    },
    type: {
      type: String,
      enum: ["lecture_notes", "exam_papers", "resources"],
    },
    url: {
      type: String,
      required: true,
    },
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["published", "archived", "in_review"],
    },
    visibility: {
      type: String,
      enum: ["public", "private", "course_enrolled"],
    },
    downloadAllowed: {
      type: Boolean,
      default: true,
    },
    sharingAllowed: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Float32Array,
      default: 1.0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Material", MaterialSchema);
