const express = require("express");
const router = express.Router();
const {
  createPost,
  getFeed,
  getPost,
  likePost,
  addComment,
  deleteComment,
  deletePost,
  getPopularPosts,
  getTrendingPosts
} = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/feed", protect, getFeed);
router.post("/create", protect, upload.array("images", 5), createPost);
router.get("/popular", protect, getPopularPosts)
router.get("/trending", protect, getTrendingPosts)
router.get("/:id", protect, getPost);
router.put("/:id/like", protect, likePost);
router.post("/:id/comment", protect, addComment);
router.delete("/:id", protect, deletePost);
router.delete("/:postId/comment/:commentId", protect, deleteComment);

module.exports = router;