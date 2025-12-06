const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
      default: "No Description Provided",
    },
    type: {
      type: String,
      enum: ["lecture_notes", "exam_papers"],
      default: "lecture_notes",
    },
    s3Key: {
      type: String,
      required: true,
      unique: true,
    },
    s3URL: {
      type: String,
      required: true,
      unique: true,
    },
    s3Bucket: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["published", "archived", "in_review"],
      default: "in_review",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "course_enrolled"],
      default: "public",
    },
    downloadAllowed: {
      type: Boolean,
      default: true,
    },
    sharingAllowed: {
      type: Boolean,
      default: true,
    },
    analytics: {
      downloadedBy: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          timeOfDownload: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      sharedBy: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          timeOfShare: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    mimetype: String,
    size: mongoose.Schema.Types.Int32,
    fieldName: String,
    encoding: String,
    acl: String,
    contentType: String,
    etag: String,
  },
  {
    timestamps: true,
  }
);

MaterialSchema.methods.saveDownloadAnalytics = async (userId) => {
  this.analytics.downloadedBy = [...this.analytics.downloadedBy, { userId }];
  await this.save();
}

MaterialSchema.statics.createMaterial = async (data, file) => {
  return await this.create({
    title: file.originalname,
    uploadedBy: data.userId,
    description: data.description,
    type: data.fileType,
    s3Key: file.key,
    s3URL: file.location,
    s3Bucket: file.bucket,
    status: data.status,
    visibility: data.visibility,
    downloadAllowed: data.downloadAllowed,
    sharingAllowed: data.sharingAllowed,
    mimetype: file.mimetype,
    size: file.size,
    fieldName: file.fieldname,
    encoding: file.encoding,
    acl: file.acl,
    contentType: file.contentType,
    etag: file.etag,
  });
};

module.exports = mongoose.model("Material", MaterialSchema);
