const router = require("express").Router();
const controller = require("../controllers/server.controller");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth.middleware");

router.use(authenticateToken, authorizeRoles("student", "faculty", "admin"));

router.post("/create", controller.createServer);

module.exports = router;
