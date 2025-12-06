const express = require("express");
const controller = require("../controllers/student.controller");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");

const router = express.Router();

router.use(authenticateToken, authorizeRoles("student"));

router.post("/upload-single", upload.single("file"), controller.uploadSingle);
router.post(
  "/upload-multiple",
  upload.array("files", 10),
  controller.uploadMultiple
);

router.get("/download/:key", controller.downloadFile);
router.get("/files", controller.listFiles);

router.delete("/files", controller.deleteFiles);
router.delete("/folders", controller.deleteFolders);

router.post("/file/copy", controller.copyFile);

module.exports = router;
