const router = require("express").Router();
const controller = require("../controllers/server.controller");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth.middleware");

router.use(authenticateToken, authorizeRoles("student", "faculty", "admin"));

// Server Routes
router.post("/create", controller.createServer);
router.get("/list", controller.listServers);

// Channel Routes
router.post("/channel/create", controller.createChannel);
router.get("/channel/list", controller.listChannels);

// Message Routes
router.get("/message/list", controller.listMessages);
router.get("/messages/forward/destinations", controller.getMessageDestinations);
router.post("/messages/forward", controller.forwardMessages);
router.patch("/message/edit", controller.editMessage);
router.delete("/message", controller.deleteMessage);

// Media Routes
router.get("/media/stream", controller.streamMedia);
router.get("/media/download", controller.downloadMedia);

module.exports = router;
