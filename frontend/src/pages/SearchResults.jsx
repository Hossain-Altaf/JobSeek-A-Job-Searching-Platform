import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [tab, setTab] = useState("jobs"); // jobs | people
  const [jobs, setJobs] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [jobsRes, peopleRes] = await Promise.all([
          API.get("/jobs", { params: { keyword: query } }),
          API.get("/users/search", { params: { keyword: query } }),
        ]);
        setJobs(jobsRes.data);
        setPeople(peopleRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query]);

  return (
    <div className="home-container">
      <h1>Search results for "{query}"</h1>

      <div className="admin-tabs">
        <button className={tab === "jobs" ? "active-tab" : ""} onClick={() => setTab("jobs")}>
          Jobs ({jobs.length})
        </button>
        <button className={tab === "people" ? "active-tab" : ""} onClick={() => setTab("people")}>
          People ({people.length})
        </button>
      </div>

      {loading ? (
        <p>Searching...</p>
      ) : tab === "jobs" ? (
        jobs.length === 0 ? (
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
              </Link>
            ))}
          </div>
        )
      ) : people.length === 0 ? (
        <p>No people found.</p>
      ) : (
        <div className="job-list">
          {people.map((person) => (
            <Link to={`/users/${person._id}`} key={person._id} className="job-card">
              <div className="post-header">
                {person.profilePic && (
                  <img src={person.profilePic} alt="" className="post-avatar" />
                )}
                <div>
                  <h3 style={{ margin: 0 }}>{person.name}</h3>
                  <p className="job-meta" style={{ margin: 0 }}>
                    {person.companyName || person.role}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;