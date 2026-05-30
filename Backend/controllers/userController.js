const User = require("../models/User");
const streamifier = require("streamifier");
const validator = require("validator");
const asyncHandler = require("express-async-handler")
const ErrorHandler = require("../utils/ErrorHandler")
const Post = require("../models/Post")
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "matrix-profile-pics",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerUser = asyncHandler(async (req, res, next) => {

    const {
      userName,
      fullName,
      email,
      password,
      gender,
      dept,
      phone,
      bio,

    } = req.body;

    if (!userName || !fullName || !email || !password) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (!validator.isEmail(email)) {
      return next(new ErrorHandler("Invalid email", 400));
    }

    if (password.length < 6) {
      return next(new ErrorHandler("Password should have more than 6 characters", 400));
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      return next(new ErrorHandler("User already exists", 409));
    }

    let profilePicData = {
      public_id: "",
      url: "",
    };

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);

    profilePicData = {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      };
    }

    const user = await User.create({
      userName,
      fullName,
      email,
      password,
      gender,
      dept,
      phone,
      bio,
      profilePic : profilePicData 
    });

    const token = user.generateJWT();

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      success: true,
      message: `Hello, ${user.userName}`,
      user,
    });
});

const loginUser = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({ userName }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = user.generateJWT();

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: `Hello, ${user.userName}`,
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const logoutUser = asyncHandler(async(req, res, next) => {

  res.clearCookie("token", cookieOptions);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
})

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("followers", "userName profilePic")
      .populate("following", "userName profilePic")
      .populate("savedPosts")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if(!userToFollow) {
            return res.status(404).json({success: false, message: "No such User!"});
        }

        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You can't follow yourself" });
        }

        const isFollowing = currentUser.following.includes(req.params.id);

        if (isFollowing) {
            currentUser.following = currentUser.following.filter(
                (id) => id.toString() !== req.params.id
            );
            userToFollow.followers = userToFollow.followers.filter(
                (id) => id.toString() !== req.user._id.toString()
            );
            } else {
            currentUser.following.push(req.params.id);
            userToFollow.followers.push(req.user._id);
        }

        await currentUser.save();
        await userToFollow.save();

    res.status(200).json({
      success: true,
      following: currentUser.following,
      isFollowing: isFollowing,
      message: isFollowing ? `Unfollowed ${userToFollow.userName}` : `Following ${userToFollow.userName}`,
    });
    } catch (error) {
        console.error("FOLLOW ERROR:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.params.username })
      .populate("followers", "userName profilePic")
      .populate("following", "userName profilePic");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const postsCount = await Post.countDocuments({
      author: user._id, community: null
    });

    res.status(200).json({ success: true, user, postsCount });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const savePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const postId = req.params.postId;

    const alreadySaved = user.savedPosts.includes(postId);

    if (alreadySaved) {
      user.savedPosts = user.savedPosts.filter(
        (id) => id.toString() !== postId
      );
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      saved: !alreadySaved,
      message: alreadySaved ? "Post unsaved" : "Post saved",
    });
  } catch (error) {
    console.error("SAVE POST ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "savedPosts",
        populate: { path: "author", select: "userName fullName profilePic dept" },
      });
      

    res.status(200).json({
      success: true,
      posts: user.savedPosts,
    });
  } catch (error) {
    console.error("GET SAVED ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getUserPosts = asyncHandler( async (req, res, next) => {

  const user = await User.findOne({ userName: req.params.username });
    if (!user) {
      return next(new ErrorHandler("User not found", 404))
    }
    const posts = await Post.find({ author: user._id, community: null })
      .populate("author", "userName fullName profilePic dept")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("userName fullName profilePic dept followers createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  
});

const updateProfile = async (req, res) => {
  try {
    const { fullName, userName, bio, dept, gender, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (userName && userName !== user.userName) {
      const existing = await User.findOne({ userName });
      if (existing) {
        return res.status(409).json({ success: false, message: "Username already taken" });
      }
    }

    if (fullName) user.fullName = fullName;
    if (userName) user.userName = userName;
    if (bio !== undefined) user.bio = bio;
    if (dept !== undefined) user.dept = dept;
    if (gender) user.gender = gender;
    if (phone !== undefined) user.phone = phone;

    if (req.file) {
      if (user.profilePic?.public_id) {
        await cloudinary.uploader.destroy(user.profilePic.public_id);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer);
      user.profilePic = {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated",
      user,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getSuggestions = asyncHandler(async (req, res, next) => {
  
    const users = await User.find({ _id: { $nin: [req.user._id, ...req.user.following] } })
      .select("userName fullName profilePic dept followers")
      .limit(5);

    res.status(200).json({ success: true, users });

})

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMyProfile,
  followUser,
  getUserProfile,
  savePost,
  getSavedPosts,
  getUserPosts, 
  getAllUsers, 
  updateProfile,
  getSuggestions
};