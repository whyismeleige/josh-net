const express = require("express");
const controller = require("../controllers/auth.controller");
const middleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/verify-otp", controller.verifyOTP);
router.post("/send-otp", controller.sendOTP);
router.post("/change-password", controller.changePassword);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", middleware.authenticateToken, controller.logout);
router.post("/logout-all", middleware.authenticateToken, controller.logoutAll);

router.get("/profile", middleware.authenticateToken, controller.getProfile);

router.get("/google", controller.googleAuth);
router.get("/google/callback", controller.googleCallback);

router.post(
  "/link-google",
  middleware.authenticateToken,
  controller.linkGoogleAccount
);
router.post(
  "/unlink-google",
  middleware.authenticateToken,
  controller.unlinkGoogleAccount
);

router.post("/exchange-code", controller.exchangeCode);

module.exports = router;
