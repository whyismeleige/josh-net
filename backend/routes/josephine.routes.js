const router = require("express").Router();
const controller = require("../controllers/josephine.controller");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth.middleware");

router.use(authenticateToken, authorizeRoles("student"));

router.get("/chats",controller.listChats);
router.post("/prompt", controller.sendPrompt);

router.get("/chat/:id", controller.getChat);

module.exports = router;
