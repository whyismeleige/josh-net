/**
 * auth.controller.js
 *
 * Handles all the Auth Logic including user registration, login/logout,
 * Third-Party Login, ex: Google, password verification, OTP verification, etc.
 *
 * Security Features:
 *  - Account lookout after failed login attempts
 *  - Two-factor authentication via Email
 *  - JWT-based access/refresh token system
 *  - Secure password handling ( handled in User model )
 *
 * @module controllers/auth
 * @todo Google Auth is Left to Do
 */

const crypto = require("crypto");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const db = require("../models");
const redisClient = require("../database/redis");
const sendEmail = require("../services/email.service");
const {
  getMetaData,
  createAccessToken,
  createRefreshToken,
  decodeRefreshToken,
  sanitizeUser,
} = require("../utils/auth.utils");

const User = db.user;
const OTP = db.otp;

/**
 * Register A New User (Local Auth Provider)
 *
 * Creates a new user account with local authentication provider.
 * Automatically generates access and refresh tokens upon successful registration.
 * Tracks initial login metadata (IP, device, etc.) for security purposes.
 *
 * @route POST /api/v1/auth/register
 * @access Public
 *
 * @param {Object} req.body
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address (must be unique)
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {string} [req.body.role="student"] - User role (defaults to "student")
 *
 * @returns {Object} 200 - User registered successfully
 * @returns {Object} 400 - Validation error or user already exists
 * @returns {Object} 500 - Server error
 */

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = "student" } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).send({
        message: "Enter Valid Input",
        type: "error",
      });
    }

    // Check if user already exists to prevent duplicate registrations
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).send({
        message: "User already exists",
        type: "error",
      });
    }

    // Extract request metadata (IP, user agent, etc) for security tracking
    const metadata = getMetaData(req);

    // Create new user with local provider
    // Password will be hashed by pre-save hook in User model
    const newUser = await User.create({
      email,
      name,
      password,
      role,
      academic: {
        course: "BBA - IT",
        currentSemester: "Semester - V",
        year: "R23",
      },
      providers: ["local"],
      activity: {
        totalLogins: [
          {
            metadata,
          },
        ],
      },
    });

    // Generate JWT Tokens for immediate authentication
    const accessToken = createAccessToken({ id: newUser._id, role });
    const refreshToken = createRefreshToken({ id: newUser._id, role });

    // Store refresh token for session management
    await newUser.saveToken(refreshToken, metadata);

    res.status(200).send({
      message: "User registered successfully",
      type: "success",
      user: sanitizeUser(newUser), // Remove sensitive fields before sending
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error while Registering User", error.message);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

/**
 * Login Existing User (Local Auth Provider)
 *
 * Authenticates User with email and password.
 * Implements security features:
 *  - Account lockout after multiple failed attempts
 *  - Two-factor authentication (if enabled)
 *  - Login attempt tracking
 *
 * @route POST /api/v1/auth/login
 * @access Public
 *
 * @param {Object} req.body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 *
 * @returns {Object} 200 - Login successful (or OTP sent if 2FA enabled)
 * @returns {Object} 400 - Invalid credentials or account locked
 * @returns {Object} 500 - Server error
 */

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        message: "Enter Valid Input",
        type: "error",
      });
    }

    const metadata = getMetaData(req);

    // Explicitly select password field (excluded by default in schema)
    const userExists = await User.findOne({ email }).select("+password");

    if (!userExists) {
      return res.status(400).send({
        message: "User does not exist. Please Register",
        type: "error",
      });
    }

    // Check if account is locked due to failed login attempts
    if (userExists.isLocked()) {
      const minutesLeft = Math.ceil(
        (userExists.security.lockUntil - Date.now()) / (1000 * 60)
      );
      return res.status(400).send({
        message: `Account is Locked, \nDue to Repeated Incorrect Login Attempts,\nTry after ${minutesLeft}  minutes`,
        type: "error",
      });
    }

    if (!userExists.password) {
      return res.status(400).send({
        message: "Please Authenticate with Gmail",
        type: "error",
      });
    }

    const passwordsMatch = await userExists.passwordsMatch(password);

    if (!passwordsMatch) {
      // Track failed login attempt (may trigger account lock)
      await userExists.inSuccessfulLogin();
      return res.status(400).send({
        message: "Passwords do not match",
        type: "error",
      });
    }

    // Handle two-factor authentication if enabled
    if (userExists.security.twoFactorEnabled) {
      const { verificationId, otp } = await OTP.createVerification(
        userExists._id,
        "two_factor_auth"
      );
      sendEmail(
        email,
        "Two Factor Authentication",
        `
          <p>Hey ${userExists.name},</p>
          <p>Kindly verify the following OTP below in the app, OTP will expire in 5 minutes: </p>
          <p>${otp}</p>
          <p>Thank you</p>
        `
      );
      // Return verification ID for OTP validation in next step
      return res.status(200).send({
        message: "OTP sent successfully to your email",
        type: "success",
        verificationId,
      });
    }

    // Generate Tokens for authenticated session
    const accessToken = createAccessToken({
      id: userExists._id,
      role: userExists.role,
    });
    const refreshToken = createRefreshToken({
      id: userExists._id,
      role: userExists.role,
    });

    // Update login tracking and store refresh token
    await userExists.successfulLogin(metadata);
    await userExists.saveToken(refreshToken, metadata);

    res.status(200).send({
      message: "User Logged In Successfully",
      type: "success",
      user: sanitizeUser(userExists),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error while User Logging in", error.message);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

/**
 * Send OTP for various verification purposes
 *
 * Generates and sends OTP via email for:
 * - Email verification
 * - SMS/phone verification
 * - Password reset
 * - Two-factor authentication
 *
 * @route POST /api/v1/auth/send-otp
 * @access Public
 *
 * @param {Object} req.body
 * @param {string} req.body.purpose - One of: email_verification, sms_verification, password_reset, two_factor_auth
 * @param {string} [req.body.email] - Required for email-based verification
 * @param {string} [req.body.number] - Required for SMS verification
 *
 * @returns {Object} 200 - OTP sent successfully with verificationId
 * @returns {Object} 400 - Invalid input or user not found
 * @returns {Object} 500 - Server error
 */

exports.sendOTP = async (req, res) => {
  try {
    const { purpose } = req.body;

    if (!purpose) {
      return res.status(400).send({
        message: "Purpose is required",
        type: "error",
      });
    }

    const validPurposes = [
      "email_verification",
      "sms_verification",
      "password_reset",
      "two_factor_auth",
    ];

    if (!validPurposes.includes(purpose)) {
      return res.status(400).send({
        message: "Invalid purpose. Must be one of: " + validPurposes.join(", "),
        type: "error",
      });
    }

    // Validate required fields based on purpose
    if (purpose === "email_verification" && !req.body.email) {
      return res.status(400).send({
        message: "Email is required for email_verification",
        type: "error",
      });
    }

    if (purpose === "sms_verification" && !req.body.number) {
      return res.status(400).send({
        message: "Phone number is required for sms_verification",
        type: "error",
      });
    }

    if (
      (purpose === "password_reset" || purpose === "two_factor_auth") &&
      !req.body.email &&
      !req.body.number
    ) {
      return res.status(400).send({
        message: "Email or phone number is required",
        type: "error",
      });
    }

    const conditions = [];

    if (req.body?.email) {
      conditions.push({ email: req.body.email });
    }

    if (req.body?.number) {
      conditions.push({ phone: req.body.number });
    }

    if (conditions.length === 0) {
      // Handle case where neither email nor number provided
      return res
        .status(400)
        .send({ message: "Email or phone required", type: "error" });
    }

    // Find user by email or phone number
    const user = await User.findOne({
      $or: conditions,
    });

    if (!user) {
      return res.status(400).send({
        message: "User does not exist",
        type: "error",
      });
    }

    // Generate OTP and store in database with expiration
    const { verificationId, otp } = await OTP.createVerification(
      user._id,
      purpose
    );

    sendEmail(
      req.body.email,
      "Two Factor Authentication",
      `
          <p>Hey ${user.name},</p>
          <p>Kindly verify the following OTP below in the app, OTP will expire in 5 minutes: </p>
          <p>${otp}</p>
          <p>Thank you</p>
        `
    );

    return res.status(200).send({
      message: "OTP sent successfully to your Email",
      type: "success",
      verificationId, // Client needs this to verify OTP
    });
  } catch (error) {
    console.error("Error in Sending OTP", error.message);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

/**
 * Verify OTP and complete authentication/verification flow
 *
 * Validates OTP against stored verification record.
 * Handles different post-verification actions based on purpose:
 * - email_verification: Marks email as verified
 * - sms_verification: Marks phone as verified
 * - two_factor_auth: Completes login and returns tokens
 * - password_reset: Just validates (password change handled separately)
 *
 * @route POST /api/v1/auth/verify-otp
 * @access Public
 *
 * @param {Object} req.body
 * @param {string} req.body.verificationId - Verification ID from sendOTP response
 * @param {string} req.body.otp - 6-digit OTP code
 *
 * @returns {Object} 200 - OTP verified successfully (with tokens if 2FA)
 * @returns {Object} 400 - Invalid or expired OTP
 * @returns {Object} 429 - Maximum verification attempts exceeded
 * @returns {Object} 500 - Server error
 */

exports.verifyOTP = async (req, res) => {
  try {
    const { verificationId, otp } = req.body;

    // Validate Inputs
    if (!verificationId || !otp) {
      return res.status(400).send({
        message: "Input Validation",
        type: "error",
      });
    }

    // OTP Verification done in OTP Model
    const { user_id, purpose } = await OTP.verifyOTP(verificationId, otp);

    // Delete Session after Finding it
    await OTP.findByIdAndDelete(verificationId);

    const user = await User.findById(user_id);

    // Verification Flow According to Purpose of Verification
    if (purpose === "email_verification") {
      user.security.emailVerified = true;
      await user.save();
    }

    if (purpose === "sms_verification") {
      user.security.numberVerified = true;
      await user.save();
    }

    // Login Authentication Success
    if (purpose === "two_factor_auth") {
      const metadata = getMetaData(req);
      const accessToken = createAccessToken({
        id: user._id,
        role: user.role,
      });
      const refreshToken = createRefreshToken({
        id: user._id,
        role: user.role,
      });

      await user.successfulLogin(metadata);
      await user.saveToken(refreshToken, metadata);

      return res.status(200).send({
        message: "User Logged In Successfully",
        type: "success",
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      });
    }

    if (purpose === "password_reset") {
      return res.status(200).send({
        message: "OTP Successfully Verified",
        type: "success",
        userId: user._id,
      });
    }

    res.status(200).send({
      message: "OTP Successfully Verified",
      type: "success",
    });
  } catch (error) {
    console.error("Error while verifying", error.message);

    const statusCode = error.message.includes("Maximum")
      ? 429
      : error.message.includes("expired")
      ? 400
      : 500;
    res.status(statusCode).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

/**
 * Change Password Flow
 *
 * Updates user password after verification.
 *
 * Security Features
 *  - Does not let Same Passwords to be used again
 *  - Limiter, to change passwords on a limit ( Twice Daily )
 *
 * @route POST /api/v1/auth/change-password
 * @access Public ( should be protected with verification in production )
 *
 * @param {Object} req.body
 * @param {string} req.body.userId - User ID
 * @param {string} req.body.newPassword - New Password
 *
 * @returns {Object} 200 - Password changed successfully
 * @returns {Object} 400 - Invalid input or user not found
 * @returns {Object} 500 - Server error
 *
 * @todo Add Limiter and Past Password Checker
 * @todo Add middleware to verify recent OTP/authentication before allowing password change
 */

exports.changePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).send({
        message: "Input Invalid",
        type: "error",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).send({
        message: "User does not exist",
        type: "error",
      });
    }

    // changePassword
    await user.changePassword(newPassword);

    res.status(200).send({
      message: "Password Changed Successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Error while Changing Password", error.message);
    res.status(500).send({
      message: error.message || "Server Error",
      type: "error",
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).send({
        message: "Unauthorized Access",
        type: "error",
      });
    }

    const decoded = decodeRefreshToken(refreshToken);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).send({
        message: "User not found",
        type: "error",
      });
    }

    const tokenExists = user.refreshTokens.some(
      (tokenObj) => tokenObj.token === refreshToken
    );

    if (!tokenExists) {
      return res.status(401).send({
        message: "Invalid Refresh Token",
        type: "error",
      });
    }

    const accessToken = createAccessToken({ id: user._id, role: user.role });

    res.status(200).json({
      message: "Token Changed",
      type: "success",
      accessToken,
    });
  } catch (error) {
    console.error("Refresh Token error", error);
    res.status(403).send({ message: "Invalid Refresh Token", type: "error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.status(200).send({
      user: sanitizeUser(req.user),
      message: "User Profile Sent",
      type: "success",
    });
  } catch (error) {
    console.error("This is the error", error);
    res.status(500).send({
      message: "Error fetching User Data",
      type: "error",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).send({
        messsage: "Unauthorized Access",
        type: "error",
      });
    }
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { refreshTokens: { token: refreshToken } },
    });

    res.status(200).send({
      message: "Logged Out Successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Logout Error: ", error);
    res.status(500).send({
      message: "Server Error",
      type: "error",
    });
  }
};

/**
 * Logout of all devices
 *
 * Removes all refresh tokens for the user
 * Invalidates all active sessions across all devices
 * Useful for security concerns or when user suspects compromised account.
 *
 * @route POST /api/v1/auth/logout-all
 * @access Protected (requires valid access token)
 *
 * @param {Object} req.user - User object from auth middleware
 *
 * @returns {Object} 200 - Logged out from all devices
 * @returns {Object} 500 - Server Error
 */

exports.logoutAll = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { refreshTokens: [] },
    });

    res.status(200).send({
      message: "Logged out from all devices",
      type: "success",
    });
  } catch (error) {
    console.error("Logout all devices error:", error);
    res.status(500).send({
      message: "Server Error",
      type: "error",
    });
  }
};

// Google Authentication Provider
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        if (!email.endsWith(`@josephscollege.ac.in`))
          return done(null, false, {
            message: "Only St Joseph's College Email allowed",
            type: "error",
          });

        let user = await User.findOne({
          $or: [{ googleID: profile.id }, { email }],
        });

        if (user) {
          if (!user.googleID) {
            user.googleID = profile.id;
            user.providers.push("google");
            await user.save();
          }

          return done(null, user);
        }

        const newUser = await User.create({
          email,
          googleID: profile.id,
          avatarURL: profile._json.picture,
          name: profile._json.given_name,
          providers: ["google"],
        });

        return done(null, newUser);
      } catch (error) {
        console.error("Google OAuth Error", error);
        return done(error, null);
      }
    }
  )
);

exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user) => {
    try {
      if (err) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/error?message=Authentication-Failed`
        );
      }

      if (!user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/error?message=User-not-found`
        );
      }

      const metadata = getMetaData(req);

      const accessToken = createAccessToken({ id: user._id, role: user.role });
      const refreshToken = createRefreshToken({
        id: user._id,
        role: user.role,
      });

      await user.successfulLogin(metadata);
      await user.saveToken(refreshToken, metadata);

      const tempCode = crypto.randomBytes(32).toString("hex");

      const authData = {
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
      };

      await redisClient.setEx(
        `auth:${tempCode}`,
        300,
        JSON.stringify(authData)
      );

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?code=${tempCode}`
      );
    } catch (error) {
      console.error("Error: Google Auth", error);
      res.status(500).send({
        message: "Server Error",
        type: "error",
      });
    }
  })(req, res, next);
};

exports.exchangeCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).send({
        message: "Code is required",
        type: "error",
      });
    }

    const dataString = await redisClient.get(`auth:${code}`);

    if (!dataString) {
      return res.status(401).send({
        message: "Invalid or Expired Code",
        type: "error",
      });
    }

    const authData = JSON.parse(dataString);

    await redisClient.del(`auth:${code}`);

    res.status(200).send({
      message: "Successful Login",
      type: "success",
      user: authData.user,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
    });
  } catch (error) {
    console.error("Error in Exchanging Code", error);
    res.status(500).send({
      message: "Server Error",
      type: "error",
    });
  }
};

exports.linkGoogleAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { googleAccessToken } = req.body;

    if (!googleAccessToken) {
      return res.status(400).send({
        message: "Validation Error, Try Again ",
        type: "error",
      });
    }

    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${googleAccessToken}`
    );
    const googleData = await response.json();

    if (!googleData.id) {
      return res.status(400).send({
        message: "Invalid Google Token",
        type: "error",
      });
    }

    const email = googleData.email?.toLowerCase();

    if (!email || !email.endsWith(`@josephscollege.ac.in`)) {
      return res.status(400).send({
        message: "Only St Joseph's College Email allowed",
        type: "error",
      });
    }

    const existingGoogleUser = await User.findOne({ googleID: googleData.id });

    if (
      existingGoogleUser &&
      existingGoogleUser._id.toString() !== userId.toString()
    ) {
      return res.status(400).send({
        message: "This Google Account is already linked to another user",
        type: "error",
      });
    }

    const user = await User.findById(userId);

    if (user.email !== googleData.email.toLowerCase()) {
      return res.status(400).send({
        message: "Google Account email must match your current account email",
        type: "error",
      });
    }

    user.googleID = googleData.id;
    user.providers = [...user.providers, "google"];

    await user.save();

    res.status(200).send({
      message: "Google Account Linked Successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Error Linking Google Account:", error);
    res.status(500).send({
      message: "Server Error",
      type: "error",
    });
  }
};

exports.unlinkGoogleAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user.googleID) {
      return res.status(400).send({
        message: "No Google Account Linked",
        type: "error",
      });
    }

    if (!user.password && user.authProvider !== "google") {
      return res.status(400).send({
        message: "Please set a password before unlinking Google Account",
        type: "error",
      });
    }

    user.googleID = undefined;
    user.providers = ["local"];

    await user.save();

    res.status(200).send({
      message: "Google Account unlinked successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Error in Unlinking Google Account", error);
    res.status(500).send({
      message: "Server Error",
      type: "error",
    });
  }
};
