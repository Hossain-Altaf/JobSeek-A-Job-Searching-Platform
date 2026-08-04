const express = require("express");
const router = express.Router();
const {
  createPost,
  getFeed,
  getFollowingFeed,
  getUserPosts,
  toggleLike,
  addComment,
  deletePost,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/following", protect, getFollowingFeed);
router.get("/", protect, getFeed);
router.post("/", protect, upload.single("image"), createPost);

router.get("/user/:userId", protect, getUserPosts);

router.put("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);
router.delete("/:id", protect, deletePost);

module.exports = router;