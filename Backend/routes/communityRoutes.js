const express = require("express");
const router = express.Router();
const {
  createCommunity,
  getAllCommunities,
  getCommunity,
  joinCommunity,
  createCommunityPost,
  getCommunityPosts,
} = require("../controllers/communityController");
const protect = require("../middleware/authMiddleware");

router.post("/create", protect, createCommunity);
router.get("/", protect, getAllCommunities);
router.get("/:id", protect, getCommunity);
router.put("/:id/join", protect, joinCommunity);
router.post("/:id/post", protect, createCommunityPost);
router.get("/:id/posts", protect, getCommunityPosts);

module.exports = router;