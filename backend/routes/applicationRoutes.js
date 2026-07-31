const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const upload = require("../middleware/upload");

// jobseeker applies with a resume file (field name must be "resume")
router.post(
  "/:jobId",
  protect,
  authorize("jobseeker"),
  upload.single("resume"),
  applyToJob
);

router.get("/my", protect, authorize("jobseeker"), getMyApplications);

router.get(
  "/job/:jobId",
  protect,
  authorize("employer", "admin"),
  getApplicantsForJob
);

router.put(
  "/:id/status",
  protect,
  authorize("employer", "admin"),
  updateApplicationStatus
);

module.exports = router;