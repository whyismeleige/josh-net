/**
 * Student APIs
 */

// Material/Resource APIs

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/s3.config");

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

exports.uploadSingleFile = (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .send({ message: "Error while Uploading File", type: "error" });
    }

    const fileInfo = {
      fieldName: req.file.fieldName,
      originalName: req.file.originalName,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bucket: req.file.bucket,
      key: req.file.key,
      acl: req.file.acl,
      contentType: req.file.contentType,
      location: req.file.location,
      etag: req.file.etag,
    };

    res.status(200).send({
      message: "File Successfully Uploaded",
      type: "success",
      fileInfo
    });
  } catch (error) {
    console.error("Upload Error", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.uploadMultiple = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
        message: "Error in Uploading Multiple Files",
        type: "error",
      });
    }

    const filesInfo = req.files.map((file) => ({
      fieldName: req.file.fieldName,
      originalName: req.file.originalName,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bucket: req.file.bucket,
      key: req.file.key,
      acl: req.file.acl,
      contentType: req.file.contentType,
      location: req.file.location,
      etag: req.file.etag,
    }));

    res.status(200).send({
      message: `${req.files.length} files uploaded successfully`,
      type: "success",
    });
  } catch (error) {
    console.error("Uploading Multiple Files Error:", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const data = await s3Client.send(command);

    res.set({
      "Content-Type": data.ContentType,
      "Content-Length": data.ContentLength,
      "Content-Disposition": `attachment; filename="${key.split("/").pop()}"`,
    });

    if (data.Body instanceof Readable) {
      data.Body.pipe(res);
    } else {
      res.send(data.Body);
    }
  } catch (error) {
    console.error("Error in Downloading File", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};
