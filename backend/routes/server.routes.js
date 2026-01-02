const router = require("express").Router();
const controller = require("../controllers/server.controller");
const { uploadImages } = require("../middleware/upload.middleware");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth.middleware");

router.use(authenticateToken, authorizeRoles("student", "faculty", "admin"));

// Server Routes
router.post("/create", uploadImages.single("icon"), controller.createServer);
router.get("/list", controller.listServers);
router.post("/create/invite", controller.createUserInvite);
router.post("/join/invite", controller.joinServerViaInvite);

// Channel Routes
router.post("/channel/create", controller.createChannel);
router.get("/channel/list", controller.listChannels);

// Message Routes
router.get("/message/list", controller.listMessages);
router.get("/messages/forward/destinations", controller.getMessageDestinations);
router.post("/messages/forward", controller.forwardMessages);
router.patch("/message/edit", controller.editMessage);
router.delete("/message", controller.deleteMessage);

module.exports = router;
