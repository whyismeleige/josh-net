/**
 * Student APIs
 */

// Material/Resource APIs

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/s3.config");
const db = require("../models");
const { Readable } = require("stream");
const Material = db.material;

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

exports.uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .send({ message: "Error while Uploading File", type: "error" });
    }

    const data = req.body;

    if (!data.userId) {
      return res.status(400).send({
        message: "User ID required",
        type: "error",
      });
    }

    await Material.createMaterial(data, req.file);

    res.status(200).send({
      message: "File Successfully Uploaded",
      type: "success",
    });
  } catch (error) {
    console.error("Upload Error", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.uploadToFolder = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .send({ message: "Error while Uploading File", type: "error" });
    }

    const material = await Material.createMaterial(data, req.file);

    res.status(200).send({
      message: "File Uploaded Successfully",
      type: "success",
      material,
    });
  } catch (error) {
    console.error("Error in Uploading to Folder", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);

    const material = await Material.findOne({ s3Key: key });

    if (!material) {
      return res.status(400).send({
        message: "File Not Found",
        type: "error",
      });
    }

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

    await material.saveDownloadAnalytics(req.user.id);

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
