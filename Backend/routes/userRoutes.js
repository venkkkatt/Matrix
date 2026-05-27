const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const User = require("../models/User")


const {
  registerUser,
  loginUser,
  logoutUser,
  getMyProfile,
  followUser,
  getUserProfile,
  savePost,
  getSavedPosts,
  getUserPosts, 
  getAllUsers
} = require("../controllers/userController");

const upload = require("../middleware/uploadMiddleware");

router.post("/register", upload.single("profilePic"),registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMyProfile);
router.get("/profile/:username", protect, getUserProfile);
router.put("/follow/:id", protect, followUser);
router.put("/save/:postId", protect, savePost);
router.get("/saved", protect, getSavedPosts);
router.get("/profile/:username/posts", protect, getUserPosts);
router.get("/all", protect, getAllUsers);


router.get("/suggestions", protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("userName fullName profilePic dept followers")
      .limit(5);
    res.status(200).json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/search", protect, async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      $or: [
        { userName: { $regex: q, $options: "i" } },
        { fullName: { $regex: q, $options: "i" } },
      ],
      _id: { $ne: req.user._id },
    }).select("userName fullName profilePic dept").limit(10);
    res.status(200).json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;