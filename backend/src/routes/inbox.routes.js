const router = require("express").Router();
const controller = require("../controllers/inbox.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth.middleware")

router.use(authenticateToken, authorizeRoles("student"));

router.get("/friends", controller.getFriendsAndRequests);

router.post("/search-user", controller.searchUser);
router.post("/friends/request", controller.sendRequest);

router.post("/friends/request/accept", controller.acceptRequest);
router.post("/friends/request/reject", controller.rejectRequest);
router.post("/friends/request/cancel", controller.cancelRequest);

module.exports = router;