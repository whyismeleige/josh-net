const express = require("express");
const controller = require("../controllers/student.controller");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const { upload, uploadWithFolder } = require("../middleware/upload.middleware");

const router = express.Router();

router.use(authenticateToken, authorizeRoles("student"));

router.post(
  "/upload-single",
  upload.single("file"),
  controller.uploadSingleFile
);

router.post("/upload-folder/:folder", uploadWithFolder.single("file"), controller.uploadToFolder);

router.get("/download/:key", controller.downloadFile);

module.exports = router;
