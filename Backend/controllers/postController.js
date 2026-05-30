const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const asyncHandler = require("express-async-handler")
const ErrorHandler = require("../utils/ErrorHandler")
const User = require("../models/User")

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "matrix-posts" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    let images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        images.push({
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        });
      }
    }

    const post = await Post.create({
      author: req.user._id,
      caption,
      images,
    });

    await post.populate("author", "fullName userName profilePic");

    res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("CREATE POST ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getFeed = async (req, res) => {
  try {
    
    const user = await User.findById(req.user.id);
    if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    }); 
    }
    const followingIds = [...user.following, user._id]

    const posts = await Post.find( {
      community: null, 
      author: {
        $in: followingIds
      }})
      .populate("author", "fullName userName profilePic")
      .populate("comments.user", "userName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
    success: true,
    posts});
    

  } catch (error) {
    console.error("FEED ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "fullName userName profilePic dept")
      .populate("comments.user", "userName profilePic");

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("GET POST ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("LIKE ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      text,
    });

    await post.save();
    await post.populate("comments.user", "userName profilePic");

    res.status(201).json({
      success: true,
      comments: post.comments,
    });
  } catch (error) {
    console.error("COMMENT ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    for (const image of post.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    await post.deleteOne();

    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const isCommentOwner = comment.user.toString() === req.user._id.toString();
    const isPostOwner = post.author.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    post.comments = post.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );

    await post.save();
    await post.populate("comments.user", "userName profilePic");

    res.status(200).json({
      success: true,
      comments: post.comments,
    });
  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getPopularPosts = asyncHandler (async (req, res, next) => {
    const posts = await Post.find({
      community: null})
      .populate("author", "fullName userName profilePic")
      .populate("comments.user", "userName profilePic")
      .sort({
        likes: -1,
        createdAt: -1
      })

      const popularPosts = posts.map((post) => {
        
        const likeScore = post.likes.length * 10;
        const commentScore = post.comments.length * 2;

        const score = likeScore + commentScore;

        return {
          ...post.toObject(),
          score,
        };
      }).sort((a,b) => b.score - a.score)
      
      res.status(200).json({
        success: true,
        posts: popularPosts
      })
  
})

const getTrendingPosts = asyncHandler(async (req, res, next) => {

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await Post.find({
      community: null,
      createdAt: { $gte: sevenDaysAgo },
    })
      .populate("author", "userName fullName profilePic dept")
      .populate("comments.user", "userName profilePic")
      .lean(); 

    const now = Date.now();

    const scoredPosts = posts.map((post) => {
      const ageInHours = (now - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);

      const likesScore    = post.likes.length * 3;
      const commentsScore = post.comments.length * 5;
      const engagementScore = likesScore + commentsScore;

      if (engagementScore < 5) return null;

      const gravity = 1.2;
      const decayFactor = Math.pow(ageInHours + 2, gravity);

      const velocity = engagementScore / (ageInHours + 1);

      const trendingScore = (engagementScore + velocity * 2) / decayFactor;
      console.log(trendingScore)
      return {
        ...post,
        trendingScore: parseFloat(trendingScore.toFixed(4)),
        engagementScore,
        velocity: parseFloat(velocity.toFixed(4)),
      };
    }).filter(Boolean);

    scoredPosts.sort((a, b) => b.trendingScore - a.trendingScore);

    const cleanPosts = scoredPosts.slice(0, 20).map(({ trendingScore, engagementScore, velocity, ...post }) => post);

    res.status(200).json({
      success: true,
      posts: cleanPosts,
    });
})

module.exports = {
  createPost,
  getFeed,
  getPost,
  likePost,
  addComment,
  deleteComment,
  deletePost,
  getPopularPosts,
  getTrendingPosts
};