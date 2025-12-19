const router = require("express").Router();
const controller = require("../controllers/josephine.controller");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const { voiceUpload } = require("../middleware/voice.middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.use(authenticateToken, authorizeRoles("student"));

router.get("/chats",controller.listChats);
router.post("/prompt", upload.single("file"), controller.sendPrompt);

router.get("/chat/:id", controller.getChat);

router.post("/voice-chat", voiceUpload.single("audio"), controller.voiceChat);

module.exports = router;
