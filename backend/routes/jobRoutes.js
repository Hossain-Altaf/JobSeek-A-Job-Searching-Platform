const express = require("express");
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// IMPORTANT: /my/jobs must come before /:id, otherwise Express
// treats "my" as an :id value and this route never gets hit.
router.get("/my/jobs", protect, authorize("employer", "admin"), getMyJobs);

router.get("/", getJobs);
router.get("/:id", getJobById);

router.post("/", protect, authorize("employer", "admin"), createJob);
router.put("/:id", protect, authorize("employer", "admin"), updateJob);
router.delete("/:id", protect, authorize("employer", "admin"), deleteJob);

module.exports = router;