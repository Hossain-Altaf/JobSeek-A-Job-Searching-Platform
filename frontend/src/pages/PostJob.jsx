import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    jobType: "full-time",
    salaryMin: "",
    salaryMax: "",
    skillsRequired: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        skillsRequired: formData.skillsRequired
          ? formData.skillsRequired.split(",").map((s) => s.trim())
          : [],
      };

      await API.post("/jobs", payload);
      navigate("/my-jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <h2>Post a Job</h2>

        {error && <p className="error-text">{error}</p>}

        <label>Job Title</label>
        <input name="title" value={formData.title} onChange={handleChange} required />

        <label>Company</label>
        <input name="company" value={formData.company} onChange={handleChange} required />

        <label>Location</label>
        <input name="location" value={formData.location} onChange={handleChange} required />

        <label>Job Type</label>
        <select name="jobType" value={formData.jobType} onChange={handleChange}>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
          <option value="remote">Remote</option>
        </select>

        <label>Salary Min</label>
        <input
          type="number"
          name="salaryMin"
          value={formData.salaryMin}
          onChange={handleChange}
        />

        <label>Salary Max</label>
        <input
          type="number"
          name="salaryMax"
          value={formData.salaryMax}
          onChange={handleChange}
        />

        <label>Skills Required (comma-separated)</label>
        <input
          name="skillsRequired"
          placeholder="React, Node.js, MongoDB"
          value={formData.skillsRequired}
          onChange={handleChange}
        />

        <label>Description</label>
        <textarea
          name="description"
          rows={5}
          value={formData.description}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
};

export default PostJob;