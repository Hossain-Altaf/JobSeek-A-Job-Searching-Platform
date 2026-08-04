const User = require("../models/User");

// @desc    Toggle save/unsave a job
// @route   PUT /api/saved/job/:jobId
// @access  Private
const toggleSaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.jobId;

    const alreadySaved = user.savedJobs.some((id) => id.toString() === jobId);

    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();
    res.json({ savedJobs: user.savedJobs, saved: !alreadySaved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle save/unsave a post
// @route   PUT /api/saved/post/:postId
// @access  Private
const toggleSavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const postId = req.params.postId;

    const alreadySaved = user.savedPosts.some((id) => id.toString() === postId);

    if (alreadySaved) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();
    res.json({ savedPosts: user.savedPosts, saved: !alreadySaved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all saved jobs (populated)
// @route   GET /api/saved/jobs
// @access  Private
const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedJobs",
      populate: { path: "postedBy", select: "name companyName companyLogo" },
    });
    res.json(user.savedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all saved posts (populated)
// @route   GET /api/saved/posts
// @access  Private
const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedPosts",
      populate: { path: "author", select: "name role profilePic companyName" },
    });
    res.json(user.savedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleSaveJob, toggleSavePost, getSavedJobs, getSavedPosts };