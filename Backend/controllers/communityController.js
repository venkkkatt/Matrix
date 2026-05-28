const Community = require("../models/Community");
const Post = require("../models/Post");

const createCommunity = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Community name is required" });
    }

    const existing = await Community.findOne({ name });
    if (existing) {
      return res.status(409).json({ success: false, message: "Community name already taken" });
    }

    const community = await Community.create({
      name,
      description,
      type,
      admin: req.user._id,
      members: [req.user._id], 
    });

    await community.populate("admin", "userName profilePic");

    res.status(201).json({ success: true, community });
  } catch (error) {
    console.error("CREATE COMMUNITY ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("admin", "userName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, communities });
  } catch (error) {
    console.error("GET COMMUNITIES ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("admin", "userName profilePic")
      .populate("members", "userName profilePic");

    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    res.status(200).json({ success: true, community });
  } catch (error) {
    console.error("GET COMMUNITY ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const userId = req.user._id.toString();

    const isMember = community.members.some(
      (m) => m.toString() === userId
    );

    if (isMember) {
      community.members = community.members.filter(
        (m) => m.toString() !== userId
      );

      await community.save();

      return res.status(200).json({
        success: true,
        joined: false,
        message: "Left community",
      });
    }

    if (community.type === "open") {
      community.members.push(req.user._id);

      await community.save();

      return res.status(200).json({
        success: true,
        joined: true,
        message: "Joined community",
      });
    }

    const alreadyRequested = community.joinRequests.some(
      (r) => r.toString() === userId
    );

    if (alreadyRequested) {
      return res.status(400).json({
        success: false,
        message: "Request already sent",
      });
    }

    community.joinRequests.push(req.user._id);

    await community.save();

    res.status(200).json({
      success: true,
      requested: true,
      message: "Join request sent",
    });

  } catch {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


const createCommunityPost = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    const isMember = community.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ success: false, message: "Join the community to post" });
    }

    const { caption, communityId } = req.body;

    if (!caption && !communityId) {
      return res.status(400).json({ success: false, message: "Caption and ID is required" });
    }
    

    const post = await Post.create({
      author: req.user._id,
      caption,
      community: community._id,
    });

    await post.populate("author", "userName fullName profilePic dept");

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("COMMUNITY POST ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getCommunityPosts = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    const isMember = community.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (community.type === "private" && !isMember) {
      return res.status(403).json({
        success: false,
        message: "Private community",
      });
    }

    const posts = await Post.find({ community: req.params.id })
      .populate("author", "userName fullName profilePic dept")
      .populate("comments.user", "userName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("GET COMMUNITY POSTS ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  createCommunity,
  getAllCommunities,
  getCommunity,
  joinCommunity,
  createCommunityPost,
  getCommunityPosts,
};