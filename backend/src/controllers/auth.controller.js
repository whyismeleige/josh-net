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

const { ValidationError, NotFoundError } = require("../utils/errors.utils");

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

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "student" } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new ValidationError("All fields are required");
  }

  // Check if user already exists to prevent duplicate registrations
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new ValidationError("User already exists");
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
});

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

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError("All fields are required");
  }

  const metadata = getMetaData(req);

  // Explicitly select password field (excluded by default in schema)
  const userExists = await User.findOne({ email }).select("+password");

  if (!userExists) {
    throw new ValidationError("User does not exist. Please Register");
  }

  // Check if account is locked due to failed login attempts
  if (userExists.isLocked()) {
    const minutesLeft = Math.ceil(
      (userExists.security.lockUntil - Date.now()) / (1000 * 60),
    );
    throw new ValidationError(
      `Account is Locked, \nDue to Repeated Incorrect Login Attempts,\nTry after ${minutesLeft}  minutes`,
    );
  }

  if (!userExists.password) {
    throw new ValidationError(
      "No Password Set for this Account. \nPlease Authenticate with Gmail",
    );
  }

  const passwordsMatch = await userExists.passwordsMatch(password);

  if (!passwordsMatch) {
    // Track failed login attempt (may trigger account lock)
    await userExists.inSuccessfulLogin();
    throw new ValidationError("Passwords do not match");
  }

  // Handle two-factor authentication if enabled
  if (userExists.security.twoFactorEnabled) {
    const { verificationId, otp } = await OTP.createVerification(
      userExists._id,
      "two_factor_auth",
    );
    sendEmail(
      email,
      "Two Factor Authentication",
      `
          <p>Hey ${userExists.name},</p>
          <p>Kindly verify the following OTP below in the app, OTP will expire in 5 minutes: </p>
          <p>${otp}</p>
          <p>Thank you</p>
        `,
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
});

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

exports.sendOTP = asyncHandler(async (req, res) => {
  const { purpose } = req.body;

  if (!purpose) {
    throw new ValidationError("Purpose is required");
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
    throw new ValidationError("Email is required for email_verification");
  }

  if (purpose === "sms_verification" && !req.body.number) {
    throw new ValidationError("Phone number is required for sms_verification");
  }

  if (
    (purpose === "password_reset" || purpose === "two_factor_auth") &&
    !req.body.email &&
    !req.body.number
  ) {
    throw new ValidationError("Email or phone number is required");
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
    throw new NotFoundError("User does not exist");
  }

  // Generate OTP and store in database with expiration
  const { verificationId, otp } = await OTP.createVerification(
    user._id,
    purpose,
  );

  sendEmail(
    req.body.email,
    "Two Factor Authentication",
    `
          <p>Hey ${user.name},</p>
          <p>Kindly verify the following OTP below in the app, OTP will expire in 5 minutes: </p>
          <p>${otp}</p>
          <p>Thank you</p>
        `,
  );

  return res.status(200).send({
    message: "OTP sent successfully to your Email",
    type: "success",
    verificationId, // Client needs this to verify OTP
  });
});

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

exports.verifyOTP = asyncHandler(async (req, res) => {
  const { verificationId, otp } = req.body;

  // Validate Inputs
  if (!verificationId || !otp) {
    throw new ValidationError("All fields are required");
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
});

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

exports.changePassword = asyncHandler(async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    throw new ValidationError("All fields are required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User does not exist");
  }

  // changePassword
  await user.changePassword(newPassword);

  res.status(200).send({
    message: "Password Changed Successfully",
    type: "success",
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AuthorizationError("Refresh Token is required");
  }

  const decoded = decodeRefreshToken(refreshToken);

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const tokenExists = user.refreshTokens.some(
    (tokenObj) => tokenObj.token === refreshToken,
  );

  if (!tokenExists) {
    throw new AuthorizationError("Invalid Refresh Token");
  }

  const accessToken = createAccessToken({ id: user._id, role: user.role });

  res.status(200).json({
    message: "Token Changed",
    type: "success",
    accessToken,
  });
});

exports.getProfile = asyncHandler(async (req, res) => {
  res.status(200).send({
    user: sanitizeUser(req.user),
    message: "User Profile Sent",
    type: "success",
  });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new ValidationError("Refresh Token is required");
  }
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { refreshTokens: { token: refreshToken } },
  });

  res.status(200).send({
    message: "Logged Out Successfully",
    type: "success",
  });
});

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

exports.logoutAll = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshTokens: [] },
  });

  res.status(200).send({
    message: "Logged out from all devices",
    type: "success",
  });
});

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
    },
  ),
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
          `${process.env.FRONTEND_URL}/auth/error?message=Authentication-Failed`,
        );
      }

      if (!user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/error?message=User-not-found`,
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
        JSON.stringify(authData),
      );

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?code=${tempCode}`,
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

exports.exchangeCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) {
    throw new ValidationError("Code is required");
  }

  const dataString = await redisClient.get(`auth:${code}`);

  if (!dataString) {
    throw new ValidationError("Invalid or Expired Code");
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
});

exports.linkGoogleAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { googleAccessToken } = req.body;

  if (!googleAccessToken) {
    throw new ValidationError("Google Access Token is required");
  }

  const response = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${googleAccessToken}`,
  );
  const googleData = await response.json();

  if (!googleData.id) {
    throw new ValidationError("Invalid Google Token");
  }

  const email = googleData.email?.toLowerCase();

  if (!email || !email.endsWith(`@josephscollege.ac.in`)) {
    throw new ValidationError("Only St Joseph's College Email allowed");
  }


  const existingGoogleUser = await User.findOne({ googleID: googleData.id });

  if (
    existingGoogleUser &&
    existingGoogleUser._id.toString() !== userId.toString()
  ) {
    throw new ValidationError(
      "This Google Account is already linked to another user",
    );
  }

  const user = await User.findById(userId);

  if (user.email !== googleData.email.toLowerCase()) {
    throw new ValidationError(
      "Google Account email must match your current account email",
    );
  }

  user.googleID = googleData.id;
  user.providers = [...user.providers, "google"];

  await user.save();

  res.status(200).send({
    message: "Google Account Linked Successfully",
    type: "success",
  });
});

exports.unlinkGoogleAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user.googleID) {
    throw new ValidationError("No Google Account Linked");
  }

  if (!user.password && user.authProvider !== "google") {
    throw new ValidationError(
      "Please set a password before unlinking Google Account",
    );
  }

  user.googleID = undefined;
  user.providers = ["local"];

  await user.save();

  res.status(200).send({
    message: "Google Account unlinked successfully",
    type: "success",
  });
});
