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

module.exports = router;
