import { useState, useEffect } from "react";
import API from "../api/axios";

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("stats"); // stats | users | jobs

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/users"),
        API.get("/admin/jobs"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleToggleBlock = async (userId) => {
    try {
      const { data } = await API.put(`/admin/users/${userId}/block`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: data.user.isBlocked } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await API.delete(`/admin/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete job");
    }
  };

  if (loading) return <p className="home-container">Loading...</p>;

  return (
    <div className="home-container">
      <h1>Admin Panel</h1>

      <div className="admin-tabs">
        <button onClick={() => setTab("stats")} className={tab === "stats" ? "active-tab" : ""}>
          Stats
        </button>
        <button onClick={() => setTab("users")} className={tab === "users" ? "active-tab" : ""}>
          Users
        </button>
        <button onClick={() => setTab("jobs")} className={tab === "jobs" ? "active-tab" : ""}>
          Jobs
        </button>
      </div>

      {tab === "stats" && stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h2>{stats.totalJobseekers}</h2>
            <p>Job Seekers</p>
          </div>
          <div className="stat-card">
            <h2>{stats.totalEmployers}</h2>
            <p>Employers</p>
          </div>
          <div className="stat-card">
            <h2>{stats.totalJobs}</h2>
            <p>Total Jobs</p>
          </div>
          <div className="stat-card">
            <h2>{stats.activeJobs}</h2>
            <p>Active Jobs</p>
          </div>
          <div className="stat-card">
            <h2>{stats.totalApplications}</h2>
            <p>Applications</p>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="job-list">
          {users.map((u) => (
            <div className="job-card" key={u._id}>
              <h3>{u.name} ({u.role})</h3>
              <p className="job-meta">{u.email}</p>
              <p>Status: {u.isBlocked ? "Blocked" : "Active"}</p>
              <button className="logout-btn" onClick={() => handleToggleBlock(u._id)}>
                {u.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "jobs" && (
        <div className="job-list">
          {jobs.map((job) => (
            <div className="job-card" key={job._id}>
              <h3>{job.title}</h3>
              <p className="job-meta">
                {job.company} · {job.location} · posted by {job.postedBy?.name}
              </p>
              <button className="logout-btn" onClick={() => handleDeleteJob(job._id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;