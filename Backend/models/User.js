const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      select: false,
      sparse: true,
      match: [/^[0-9]{10}$/, "Phone number must contain exactly 10 digits"],
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 6,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    bio: { 
        type: String, 
        default: "",
    },

    dept: String,

    role: {
      type: String,
      enum: ["regular", "admin"],
      default: "regular",
    },
    profilePic: {
      url: String,
      public_id: String
    },
    followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ],

    following: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);

});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;
  delete user.__v;

  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;