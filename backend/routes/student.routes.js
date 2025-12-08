const express = require("express");
const controller = require("../controllers/student.controller");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");
const { validateStudentCourse } = require("../middleware/material.middleware");

const router = express.Router();

router.use(authenticateToken, authorizeRoles("student"));

router.post(
  "/upload-single",
  validateStudentCourse,
  upload.single("file"),
  controller.uploadSingle
);
router.post(
  "/upload-multiple",
  upload.array("files", 10),
  controller.uploadMultiple
);

router.get("/download", controller.downloadFile);
router.post("/download-folders", controller.downloadFolder);

router.get("/files", controller.listFiles);

router.delete("/files", controller.deleteFiles);
router.delete("/folders", controller.deleteFolders);

router.post("/file/copy", controller.copyFile);
router.post("/folder/copy", controller.copyFolder);

router.post("/file/move", controller.moveFile);
router.post("/folder/move", controller.moveFolders);

router.get("/coursework", controller.getStudentCoursework);2

module.exports = router;
