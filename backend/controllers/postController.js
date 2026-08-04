const { createNotification } = require("./notificationController");
const Post = require("../models/Post");

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (any logged-in user)
const createPost = async (req, res) => {
  try {
    const { content, type, jobId } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      type: type || "update",
      job: jobId || undefined,
      image: req.file ? req.file.path : "",
    });

    const populatedPost = await post.populate(
      "author",
      "name role profilePic companyName companyLogo"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feed (all posts, most recent first)
// @route   GET /api/posts?page=1&limit=10
// @access  Private
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("author", "name role profilePic companyName companyLogo")
      .populate("job", "title company")
      .populate("comments.user", "name profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      posts,
      page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single user's posts (for their profile page)
// @route   GET /api/posts/user/:userId
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "name role profilePic companyName companyLogo")
      .populate("comments.user", "name profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or unlike a post (toggle)
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    if (!alreadyLiked) {
      await createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: "like",
        text: `${req.user.name} liked your post`,
        post: post._id,
      });
    }

    res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ user: req.user._id, text });
    await post.save();

    const populatedPost = await post.populate("comments.user", "name profilePic");

    await createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: "comment",
      text: `${req.user.name} commented on your post`,
      post: post._id,
    });

    res.status(201).json(populatedPost.comments[populatedPost.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a post (own post, or admin)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ message: "Post removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get personalized feed (posts from people you follow + your own)
// @route   GET /api/posts/following?page=1&limit=10
// @access  Private
const getFollowingFeed = async (req, res) => {
  try {
    const User = require("../models/User");
    const currentUser = await User.findById(req.user._id);

    const authorIds = [...currentUser.following, req.user._id];

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: { $in: authorIds } })
      .populate("author", "name role profilePic companyName companyLogo")
      .populate("job", "title company")
      .populate("comments.user", "name profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: { $in: authorIds } });

    res.json({
      posts,
      page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getFeed,
  getFollowingFeed,
  getUserPosts,
  toggleLike,
  addComment,
  deletePost,
};