const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");


const {
  registerUser,
  loginUser,
  logoutUser,
  getMyProfile,
  followUser,
  getUserProfile,
} = require("../controllers/userController");

const upload = require("../middleware/uploadMiddleware");

router.post(
  "/register",
  upload.single("profilePic"),
  registerUser
);

router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMyProfile);
router.get("/profile/:username", protect, getUserProfile);
router.put("/follow/:id", protect, followUser);

module.exports = router;