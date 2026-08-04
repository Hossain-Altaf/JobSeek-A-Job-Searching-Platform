const User = require("../models/User");

// @desc    Get logged-in user's full profile (already have /auth/me, this is an alias-friendly version)
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  res.json(req.user);
};

// @desc    Update logged-in user's profile (text fields)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, skills, companyName } = req.body;

    if (name !== undefined) user.name = name;
    if (skills !== undefined) user.skills = skills; // expects an array
    if (companyName !== undefined && user.role === "employer") {
      user.companyName = companyName;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      skills: updatedUser.skills,
      companyName: updatedUser.companyName,
      companyLogo: updatedUser.companyLogo,
      profilePic: updatedUser.profilePic,
      resume: updatedUser.resume,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload/replace profile picture
// @route   PUT /api/users/profile/picture
// @access  Private
const updateProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findById(req.user._id);
    user.profilePic = req.file.path; // Cloudinary URL
    await user.save();

    res.json({ profilePic: user.profilePic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload/replace resume (jobseeker) or company logo (employer)
// @route   PUT /api/users/profile/resume
// @access  Private (jobseeker)
const updateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    user.resume = req.file.path; // Cloudinary URL
    await user.save();

    res.json({ resume: user.resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload/replace company logo (employer only)
// @route   PUT /api/users/profile/logo
// @access  Private (employer)
const updateCompanyLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findById(req.user._id);
    user.companyLogo = req.file.path;
    await user.save();

    res.json({ companyLogo: user.companyLogo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get any user's public info by ID (for profile pages)
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name role profilePic companyName companyLogo skills createdAt"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users by name (for the global search bar)
// @route   GET /api/users/search?keyword=
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.json([]);
    }

    const users = await User.find({
      name: { $regex: keyword, $options: "i" },
      role: { $ne: "admin" },
    })
      .select("name role profilePic companyName")
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfilePic,
  updateResume,
  updateCompanyLogo,
  getUserById,
  searchUsers,
};