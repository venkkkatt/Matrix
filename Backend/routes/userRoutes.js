const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");


const {
  registerUser,
  loginUser,
  getMyProfile,
} = require("../controllers/userController");

const upload = require("../middleware/uploadMiddleware");

router.post(
  "/register",
  upload.single("profilePic"),
  registerUser
);

router.post("/login", loginUser);

router.get("/me", protect, getMyProfile);

module.exports = router;