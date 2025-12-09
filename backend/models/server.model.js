const mongoose = require("mongoose");

const ServerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Server Name should at least be 3 characters"],
      maxlength: [
        50,
        "Server Name should cannot exceed more than 50 characters",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Server Description cannot exceed more than 500 characters",
      ],
      default: "No Description provided to the Server",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Server Creator ID required"],
    },
    icon: {
      type: String,
      default: "https://img.icons8.com/ios-filled/100/university.png",
    },
    banner: {
      type: String,
      default: "",
    },
    serverType: {
      type: String,
      enum: {
        values: [
          "class",
          "department",
          "college",
          "committee",
          "club",
          "project",
          "study_group",
          "general",
        ],
        message: "Invalid Server Type",
      },
      default: "class",
      index: true,
    },
    academicInfo: {
      course: String,
      year: String,
      currentSemester: String,
    },
    joinPolicy: {
      type: String,
      enum: ["open", "invite_only", "request_approval", "restricted"],
    },
    leaders: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: [
            "admin",
            "moderator",
            "class_representative",
            "committee_head",
          ],
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    channels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: true,
    toObject: true,
  }
);

ServerSchema.statics.createNewServer = async function (data, userId) {
  return await this.create({
    name: data.name,
    description: data?.description,
    createdBy: userId,
    icon: data?.icon,
    banner: data?.banenr,
    serverType: data?.serverType,
    academicInfo: data?.academicInfo,
    joinPolicy: data?.joinPolicy,
  })
}

module.exports = mongoose.model("Server", ServerSchema);
