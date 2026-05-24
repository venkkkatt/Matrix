const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const validator = require("validator");

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

const registerUser = async (req, res) => {
  try {
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
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: `Hello, ${user.userName}`,
      token,
      user,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: `Hello, ${user.userName}`,
      token,
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

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("followers", "userName profilePic")
      .populate("following", "userName profilePic");

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
      following: !isFollowing,
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

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMyProfile,
  followUser,
  getUserProfile,
  
};