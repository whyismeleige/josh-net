require("dotenv").config();
const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/s3.config");

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;
const CDN_URL = process.env.CDN_URL;

async function s3URLToPDFBase64(key) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const data = await s3Client.send(command);
    const base64 = data.Body.transformToString("base64");
    return base64;
  } catch (error) {
    console.error("Error converting s3 PDF to base64", error);
    throw error;
  }
}

async function downloadSingleFile(key) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    throw error;
  }
}

async function uploadS3File(key, fileBuffer) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
    });
    await s3Client.send(command);
    const s3URL = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    const cdnURL = `${CDN_URL}/${key}`;
    return { s3URL, cdnURL };
  } catch (error) {
    console.error("Error in uploading file", error);
    throw error;
  }
}

module.exports = { downloadSingleFile, s3URLToPDFBase64, uploadS3File };
