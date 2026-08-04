const User = require("../models/User");
const { createNotification } = require("./notificationController");

// @desc    Follow a user
// @route   PUT /api/follow/:id
// @access  Private
const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = targetUser.followers.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this user" });
    }

    targetUser.followers.push(req.user._id);
    await targetUser.save();

    const currentUser = await User.findById(req.user._id);
    currentUser.following.push(targetId);
    await currentUser.save();

    await createNotification({
      recipient: targetId,
      sender: req.user._id,
      type: "follow",
      text: `${req.user.name} started following you`,
    });

    res.json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unfollow a user
// @route   PUT /api/follow/:id/unfollow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await targetUser.save();

    const currentUser = await User.findById(req.user._id);
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetId
    );
    await currentUser.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a user's followers list
// @route   GET /api/follow/:id/followers
// @access  Private
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name role profilePic companyName"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get who a user is following
// @route   GET /api/follow/:id/following
// @access  Private
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "name role profilePic companyName"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { followUser, unfollowUser, getFollowers, getFollowing };