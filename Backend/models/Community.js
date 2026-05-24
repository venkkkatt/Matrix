const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    coverImage: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    type: {
      type: String,
      enum: ["open", "private"],
      default: "open",
    },
  },
  { timestamps: true }
);

const Community = mongoose.model("Community", communitySchema);
module.exports = Community;