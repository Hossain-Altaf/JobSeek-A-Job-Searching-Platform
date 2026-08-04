const express = require("express");
const router = express.Router();
const {
  toggleSaveJob,
  toggleSavePost,
  getSavedJobs,
  getSavedPosts,
} = require("../controllers/savedController");
const { protect } = require("../middleware/auth");

router.get("/jobs", protect, getSavedJobs);
router.get("/posts", protect, getSavedPosts);
router.put("/job/:jobId", protect, toggleSaveJob);
router.put("/post/:postId", protect, toggleSavePost);

module.exports = router;