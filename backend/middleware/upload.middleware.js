const path = require("path");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3Client = require("../config/s3.config");

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

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
      const fileName = `${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

const uploadWithFolder = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const folder = req.params.folder || "upload";
      const fileName = `${folder}/${file.originalname}`;
      cb(null, fileName);
    }, 
  }),
});

module.exports = { upload, uploadWithFolder };
