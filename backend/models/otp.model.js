const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const OTPSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: [5, "Maximum verification attempts exceeded"],
    },
    purpose: {
      type: String,
      enum: [
        "email_verification",
        "sms_verification",
        "password_reset",
        "two_factor_auth",
      ],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3000,
    },
    lastAttemptedAt: Date,
  },
  {
    timestamps: true,
  }
);

OTPSchema.statics.verifyOTP = async function (id, candidateOTP) {
  try {
    const verification = await this.findById(id);

    if (!verification) {
      throw new Error("No Pending Verifications");
    }
    if (verification.attempts >= 5) {
      throw new Error("Maximum Verification Attempts reached. Resend OTP");
    }
    const otpMatch = await bcrypt.compare(candidateOTP, verification.otp);

    if (!otpMatch) {
      verification.attempts += 1;
      await verification.save();
      throw new Error("OTP does not match");
    }

    return verification;
  } catch (error) {
    throw error;
  }
};

OTPSchema.statics.generateOTP = function (length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

OTPSchema.statics.createVerification = async function (user_id, purpose) {
  try {
    await this.deleteMany({ user_id, purpose });
    const otp = this.generateOTP();
    const verification = new this({
      user_id,
      otp,
      purpose,
    });
    await verification.save();
    return {
      verificationId: verification._id,
      otp: otp,
    };
  } catch (error) {
    throw error;
  }
};

OTPSchema.pre("save", async function (next) {
  if (!this.isModified("otp")) return next();
  try {
    this.otp = await bcrypt.hash(this.otp, 12);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("OTP", OTPSchema);
