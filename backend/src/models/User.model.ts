import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import { IMetadata, IUser } from "@custom-types/models/user.model.types";

export interface IUserDocument extends IUser, Document {};
type UserModelType = Model<IUserDocument>;

const MetadataSchema = new Schema<IMetadata>({
  ipAddress: String,
  userAgent: String,
  browser: {
    name: String,
    version: String,
    major: String,
  },
  os: {
    name: String,
    version: String,
  },
  device: {
    vendor: String,
    model: String,
    type: String,
  },
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
    timezone: String,
  },
});

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      match: [/^[0-9]+@josephscollege.ac.in/, "Must use College Email"],
      index: true,
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 digits"],
      select: false,
    },
    number: {
      type: String,
      length: [10, "Phone Number needs to be of 10 digits only"],
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: {
        values: ["student", "admin", "faculty", "alumni"],
        message: "Role must be student,admin,faculty or alumni",
      },
      index: true,
      default: "student",
    },
    avatarURL: {
      type: String,
      default: "https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png",
    },
    googleID: {
      type: String,
      unique: true,
      sparse: true,
    },
    providers: {
      type: [String],
      required: true,
      enum: {
        values: ["google", "local"],
        message: "Enter Valid Auth Providers only",
      },
    },
    profile: {
      userName: {
        type: String,
      },
    },
    academic: {
      course: String,
      currentSemester: String,
      year: String,
    },
    isClassRepresentative: {
      type: Boolean,
      default: false,
    },
    activity: {
      lastLogin: {
        type: Date,
        default: Date.now,
      },
      totalLogins: [
        {
          loginTime: {
            type: Date,
            default: Date.now,
          },
          attemptsReached: {
            type: Number,
            max: [5, "Attempts cannot be more than 5"],
            default: 0,
          },
          maxAttemptsReached: {
            type: Boolean,
            default: false,
          },
          metadata: MetadataSchema
        },
      ],
    },
    security: {
      twoFactorEnabled: {
        type: Boolean,
        default: true,
      },
      loginAttempts: {
        type: Number,
        default: 0,
        max: 5,
      },
      emailVerified: {
        type: Boolean,
        default: false,
      },
      numberVerified: {
        type: Boolean,
        default: false,
      },
      lockUntil: Date,
      mustChangePassword: { type: Boolean, default: true },
      passwordChangedAt: Date,
      passwordHistory: [
        {
          password: String,
          changedAt: { type: Date, default: Date.now },
        },
      ],
    },
    isActive: { type: Boolean, default: true },
    servers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Server",
      },
    ],
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    friends: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        channel: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Channel",
          required: true,
        },
        since: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    requests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["outgoing", "incoming"],
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    blockedUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        blockedAt: {
          type: Date,
          ref: Date.now,
        },
        reason: {
          type: String,
          maxlength: [200, "Block reason cannot exceed 200 characters"],
          default: "No reason provided",
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const { password, __v, security, ...rest } = ret;
        const { passwordHistory, ...restSecurity } = security; 
        return {...rest, security: restSecurity }
      },
    },
    toObject: {
      transform: function (doc, ret) {
        const { password, __v, security, ...rest } = ret;
        const { passwordHistory, ...restSecurity } = security; 
        return {...rest, security: restSecurity }
      },
    },
  },
);

UserSchema.methods.changePassword = async function (newPassword: string) {
  this.security.passwordHistory = [
    ...this.security.passwordHistory,
    { password: this.password, changedAt: Date.now() },
  ];
  this.passwordChangedAt = Date.now();
  this.mustChangePassword = false;
  this.password = newPassword;
  await this.save();
};

UserSchema.methods.isLocked = function () {
  return Date.now() < this.security.lockUntil;
};

UserSchema.methods.passwordsMatch = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.inSuccessfulLogin = async function () {
  this.security.loginAttempts++;
  await this.save();
};

UserSchema.methods.successfulLogin = async function (metadata: IMetadata) {
  this.activity.lastLogin = Date.now();
  this.activity.totalLogins = [
    ...this.activity.totalLogins,
    {
      loginTime: Date.now(),
      attemptsReached: this.security.loginAttempts,
      maxAttemptsReached: this.security.loginAttempts === 5,
      metadata,
    },
  ];
  this.security.loginAttempts = 0;
  this.security.lockUntil = null;
  await this.save();
};

UserSchema.pre("save", async function () {
  if (this.security.lockUntil && this.security.lockUntil.getTime() < Date.now()) {
    this.security.lockUntil = undefined;
  }
  if (this.isModified("password") && this.password)
    this.password = await bcrypt.hash(this.password, 12);
  if (this.security.loginAttempts === 5) {
    this.security.loginAttempts = 0;
    this.security.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
  }
});

const User = mongoose.model<IUserDocument, UserModelType>("User", UserSchema);

export default User;
