const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateProfilePic,
  updateResume,
  updateCompanyLogo,
  getUserById,
  searchUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/profile/picture", protect, upload.single("image"), updateProfilePic);
router.put("/profile/resume", protect, upload.single("resume"), updateResume);
router.put("/profile/logo", protect, upload.single("logo"), updateCompanyLogo);
router.get("/search", protect, searchUsers);
router.get("/:id", protect, getUserById);

module.exports = router;