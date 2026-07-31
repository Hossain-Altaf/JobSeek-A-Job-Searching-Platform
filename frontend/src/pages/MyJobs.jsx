import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyJobs = async () => {
    try {
      const { data } = await API.get("/jobs/my/jobs");
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter((j) => j._id !== jobId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return <p className="home-container">Loading...</p>;

  return (
    <div className="home-container">
      <h1>My Posted Jobs</h1>

      {jobs.length === 0 ? (
        <p>You haven't posted any jobs yet.</p>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <div className="job-card" key={job._id}>
              <h3>{job.title}</h3>
              <p className="job-meta">
                {job.location} · {job.jobType} ·{" "}
                {job.isActive ? "Active" : "Closed"}
              </p>
              <div className="job-card-actions">
                <Link to={`/jobs/${job._id}/applicants`}>View Applicants</Link>
                <button onClick={() => handleDelete(job._id)} className="logout-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;