const router = require("express").Router();

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth.middleware");

router.use(authenticateToken, authorizeRoles("student"));

module.exports = router;
