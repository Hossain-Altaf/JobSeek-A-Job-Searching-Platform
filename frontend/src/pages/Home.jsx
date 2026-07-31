import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (location) params.location = location;
      if (jobType) params.jobType = jobType;

      const { data } = await API.get("/jobs", { params });
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="home-container">
      <h1>Find Your Next Job</h1>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Job title..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
          <option value="remote">Remote</option>
        </select>
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <Link to={`/jobs/${job._id}`} key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p className="job-company">{job.company}</p>
              <p className="job-meta">
                {job.location} · {job.jobType}
              </p>
              {job.salaryMin && job.salaryMax && (
                <p className="job-salary">
                  ${job.salaryMin} - ${job.salaryMax}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;