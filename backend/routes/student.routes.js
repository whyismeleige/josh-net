const express = require("express");
const controller = require("../controllers/student.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { upload, uploadWithFolder } = require("../middleware/upload.middleware");

const router = express.Router();

router.use(authMiddleware.authenticateToken);

router.post(
  "/upload-single",
  upload.single("file"),
  controller.uploadSingleFile
);
router.post(
  "/upload-multiple",
  upload.array("files", 10),
  controller.uploadMultiple
);
router.get("/download/:key", controller.downloadFile);

module.exports = router;
