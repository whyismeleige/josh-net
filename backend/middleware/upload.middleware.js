const path = require("path");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3Client = require("../config/s3.config");

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        uploadedBy: req.user?.id || "anonymous",
      });
    },
    key: (req, file, cb) => {
      const fileName = req.query.path
        ? `${req.query.path}/${file.originalname}`
        : file.originalname;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB Limit
  },
});

const uploadToDynamicBucket = (bucketName) => {
  return multer({
    storage: multerS3({
      s3: s3Client,
      bucket: bucketName,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        cb(null, file.originalname);
      },
    }),
  });
};

const uploadForDownload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: "attachment",
    key: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

const uploadEncrypted = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    serverSideEncryption: "AES256",
    key: (req, file, cb) => {
      cb(null, `secure/${file.originalname}`);
    },
  }),
});

const uploadChatAttachment = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 10 MB Limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDFs allowed"), false);
    }
  },
});

module.exports = {
  upload,
  uploadForDownload,
  uploadToDynamicBucket,
  uploadEncrypted,
  uploadChatAttachment,
};
