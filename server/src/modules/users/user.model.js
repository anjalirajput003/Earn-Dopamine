import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import env from "../../config/env.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must contain at least 3 characters."],
      maxlength: [30, "Username cannot exceed 30 characters."],
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must contain at least 8 characters."],
      select: false,
    },

    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      maxlength: [50, "Full name cannot exceed 50 characters."],
    },

    avatar: {
      url: String,
      publicId: String,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [250, "Bio cannot exceed 250 characters."],
      default: "",
    },

    coverImage: {
      url: String,
      publicId: String,
    },

    interests: [
      {
        type: String,
      },
    ],

    productivityGoals: [
      {
        type: String,
      },
    ],

    website: {
      type: String,
      trim: true,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      select: false,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      userId: this._id.toString(),
    },
    env.accessTokenSecret,
    {
      expiresIn: env.accessTokenExpiry,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      userId: this._id.toString(),
    },
    env.refreshTokenSecret,
    {
      expiresIn: env.refreshTokenExpiry,
    },
  );
};

const User = mongoose.model("User", userSchema);

export default User;
