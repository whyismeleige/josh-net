/**
 * Student APIs
 */

// Material/Resource APIs

const {
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
} = require("@aws-sdk/client-s3");
const s3Client = require("../config/s3.config");
const db = require("../models");
const { Readable } = require("stream");
const Material = db.material;

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

exports.uploadSingle = async (req, res) => {
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

exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
        message: "Error while Uploading Files",
        type: "error",
      });
    }

    const filesInfo = req.files.map((file) => ({
      originalname: file.originalname,
      key: file.key,
      location: file.location,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.status(200).send({
      message: `Successfully Uploaded ${req.files.length} Files`,
      type: "success",
      filesInfo,
    });
  } catch (error) {
    console.error("Upload Error", error);
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

exports.listFiles = async (req, res) => {
  try {
    const folderPrefix = req.query.path ? req.query.path + "/" : "";

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: folderPrefix,
      MaxKeys: parseInt(req.query.limit) || 1000,
    });

    const data = await s3Client.send(command);

    const files = (data.Contents || []).map((file) => ({
      key: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
    }));

    res.status(200).send({
      folder: req.params.folder,
      count: files.length,
      files: files,
    });
  } catch (error) {
    console.error("Error in Listing Files", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.deleteFiles = async (req, res) => {
  try {
    const { keys } = req.body;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).send({
        message: "Please provide valid Keys Array",
        type: "error",
      });
    }

    const command = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });

    const data = await s3Client.send(command);

    res.status(200).send({
      message: "Files Deleted Successfully",
      type: "success",
      deleted: data.Deleted?.length || 0,
      errors: data.Errors || [],
    });
  } catch (error) {
    console.error("Error in Deleting Files", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

async function deleteS3Folder(folderPrefix) {
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: folderPrefix,
  });

  const listedObjects = await s3Client.send(listCommand);

  if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: folderPrefix,
      })
    );
    return;
  }

  const deleteCommand = new DeleteObjectsCommand({
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
    },
  });

  await s3Client.send(deleteCommand);

  if (listedObjects.IsTruncated) await deleteS3Folder(folderPrefix);
}

exports.deleteFolders = async (req, res) => {
  try {
    const { folders } = req.body;

    if (!folders || !Array.isArray(folders) || folders.length === 0) {
      return res.status(400).send({
        message: "Folders Array Required",
        type: "error",
      });
    }

    folders.forEach(async (folderPrefix) => {
      const folder = folderPrefix.endsWith("/")
        ? folderPrefix
        : `${folderPrefix}/`;
      await deleteS3Folder(folder);
    });

    return res.status(200).send({
      message: "Folders Successfully Deleted",
      type: "success",
    });
  } catch (error) {
    console.error("Error in Deleting Folders", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.copyFile = async (req, res) => {
  try {
    const { sourceKey, destinationKey } = req.body;

    if (!sourceKey || !destinationKey) {
      return res.status(400).send({
        message: "Source Key and Destination Key are required",
        type: "error",
      });
    }

    const command = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    });

    await s3Client.send(command);

    res.status(200).send({
      message: "File Copied Successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Error while Copying File", error);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};
