import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

const STATUS_OPTIONS = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];

const Applicants = () => {
  const { id } = useParams(); // jobId
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplicants = async () => {
    try {
      const { data } = await API.get(`/applications/job/${id}`);
      setApplications(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await API.put(`/applications/${applicationId}/status`, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <p className="home-container">Loading...</p>;
  if (error) return <p className="home-container error-text">{error}</p>;

  return (
    <div className="home-container">
      <h1>Applicants</h1>

      {applications.length === 0 ? (
        <p>No one has applied to this job yet.</p>
      ) : (
        <div className="job-list">
          {applications.map((app) => (
            <div className="job-card" key={app._id}>
              <h3>{app.applicant?.name}</h3>
              <p className="job-meta">{app.applicant?.email}</p>

              {app.applicant?.skills?.length > 0 && (
                <div className="skills-list">
                  {app.applicant.skills.map((skill, i) => (
                    <span key={i} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {app.coverLetter && <p>{app.coverLetter}</p>}

              <p>
                <a href={app.resume} target="_blank" rel="noreferrer">
                  View Resume
                </a>
              </p>

              <label>Status: </label>
              <select
                value={app.status}
                onChange={(e) => handleStatusChange(app._id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applicants;