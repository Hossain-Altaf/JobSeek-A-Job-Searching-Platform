const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  toggleBlockUser,
  getAllJobsAdmin,
  deleteJobAdmin,
  getStats,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// every route here requires admin role
router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.put("/users/:id/block", toggleBlockUser);
router.get("/jobs", getAllJobsAdmin);
router.delete("/jobs/:id", deleteJobAdmin);

module.exports = router;