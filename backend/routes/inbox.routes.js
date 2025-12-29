const router = require("express").Router();
const controller = require("../controllers/inbox.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth.middleware")

router.use(authenticateToken, authorizeRoles("student"));

router.get("/friends", controller.getFriendsAndRequests);

router.post("/search-user", controller.searchUser);
router.post("/friends/request", controller.sendRequest);

module.exports = router;