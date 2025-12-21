const router = require("express").Router();
const controller = require("../controllers/josephine.controller");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const { voiceUpload } = require("../middleware/voice.middleware");
const { uploadChatAttachment } = require("../middleware/upload.middleware");

router.use(authenticateToken, authorizeRoles("student"));

router.get("/chats", controller.listChats);
router.post("/prompt", uploadChatAttachment.array("files"), controller.sendPrompt);

router.get("/chat/:id", controller.getChat);

router.post("/voice-chat", voiceUpload.single("audio"), controller.voiceChat);

module.exports = router;
