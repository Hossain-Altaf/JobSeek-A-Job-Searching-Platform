const Application = require("../models/Application");
const Job = require("../models/Job");

// @desc    Apply to a job (jobseeker uploads resume via Cloudinary)
// @route   POST /api/applications/:jobId
// @access  Private (jobseeker only)
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Job not found or no longer active" });
    }

    // req.file is populated by the "upload" middleware (multer + cloudinary)
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });
    if (alreadyApplied) {
      return res.status(400).json({ message: "You already applied to this job" });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      resume: req.file.path, // Cloudinary URL
      coverLetter: coverLetter || "",
    });

    res.status(201).json(application);
  } catch (error) {
    // handles the unique index (job+applicant) race condition too
    if (error.code === 11000) {
      return res.status(400).json({ message: "You already applied to this job" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in jobseeker's own applications
// @route   GET /api/applications/my
// @access  Private (jobseeker)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate("job", "title company location jobType")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applicants for a specific job (employer who owns it, or admin)
// @route   GET /api/applications/job/:jobId
// @access  Private (employer, admin)
const getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view these applicants" });
    }

    const applications = await Application.find({ job: jobId })
      .populate("applicant", "name email skills resume profilePic")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status (shortlist, reject, accept, etc.)
// @route   PUT /api/applications/:id/status
// @access  Private (employer who owns the job, admin)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (
      application.job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to update this application" });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
};