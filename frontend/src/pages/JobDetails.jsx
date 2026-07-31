import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const JobDetails = () => {
  const { id } = useParams();
  const { userInfo } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await API.get(`/jobs/${id}`);
        setJob(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyMessage("");

    if (!resumeFile) {
      setApplyMessage("Please select a resume file.");
      return;
    }

    setApplying(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("coverLetter", coverLetter);

      await API.post(`/applications/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setApplyMessage("Application submitted successfully!");
    } catch (err) {
      setApplyMessage(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <p className="home-container">Loading...</p>;
  if (!job) return <p className="home-container">Job not found.</p>;

  return (
    <div className="home-container">
      <div className="job-detail-card">
        <h1>{job.title}</h1>
        <p className="job-company">{job.company}</p>
        <p className="job-meta">
          {job.location} · {job.jobType}
        </p>
        {job.salaryMin && job.salaryMax && (
          <p className="job-salary">
            ${job.salaryMin} - ${job.salaryMax}
          </p>
        )}

        <h3>Description</h3>
        <p>{job.description}</p>

        {job.skillsRequired?.length > 0 && (
          <>
            <h3>Skills Required</h3>
            <div className="skills-list">
              {job.skillsRequired.map((skill, i) => (
                <span key={i} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Only show apply form to logged-in job seekers */}
      {userInfo?.role === "jobseeker" && (
        <form className="apply-form" onSubmit={handleApply}>
          <h3>Apply to this job</h3>

          {applyMessage && <p className="error-text">{applyMessage}</p>}

          <label>Resume (PDF/DOC)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files[0])}
            required
          />

          <label>Cover Letter (optional)</label>
          <textarea
            rows={4}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />

          <button type="submit" disabled={applying}>
            {applying ? "Submitting..." : "Apply Now"}
          </button>
        </form>
      )}

      {!userInfo && (
        <p className="home-container">Please log in as a job seeker to apply.</p>
      )}

      {userInfo?.role === "employer" && (
        <p className="home-container">Employers cannot apply to jobs.</p>
      )}
    </div>
  );
};

export default JobDetails;