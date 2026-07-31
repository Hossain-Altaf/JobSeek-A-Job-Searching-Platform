const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

// @desc    Get all users (jobseekers + employers)
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block or unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (admin)
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot block an admin account" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all jobs (including inactive ones)
// @route   GET /api/admin/jobs
// @access  Private (admin)
const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("postedBy", "name email companyName")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any job (moderation)
// @route   DELETE /api/admin/jobs/:id
// @access  Private (admin)
const deleteJobAdmin = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    await job.deleteOne();
    res.json({ message: "Job removed by admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = async (req, res) => {
  try {
    const totalJobseekers = await User.countDocuments({ role: "jobseeker" });
    const totalEmployers = await User.countDocuments({ role: "employer" });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();

    res.json({
      totalJobseekers,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  toggleBlockUser,
  getAllJobsAdmin,
  deleteJobAdmin,
  getStats,
};