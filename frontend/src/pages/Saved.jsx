import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const Saved = () => {
  const [tab, setTab] = useState("jobs"); // jobs | posts
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const [jobsRes, postsRes] = await Promise.all([
        API.get("/saved/jobs"),
        API.get("/saved/posts"),
      ]);
      setSavedJobs(jobsRes.data);
      setSavedPosts(postsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsaveJob = async (jobId) => {
    try {
      await API.put(`/saved/job/${jobId}`);
      setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnsavePost = async (postId) => {
    try {
      await API.put(`/saved/post/${postId}`);
      setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="home-container">Loading...</p>;

  return (
    <div className="home-container">
      <h1>Saved</h1>

      <div className="admin-tabs">
        <button className={tab === "jobs" ? "active-tab" : ""} onClick={() => setTab("jobs")}>
          Jobs ({savedJobs.length})
        </button>
        <button className={tab === "posts" ? "active-tab" : ""} onClick={() => setTab("posts")}>
          Posts ({savedPosts.length})
        </button>
      </div>

      {tab === "jobs" ? (
        savedJobs.length === 0 ? (
          <p>No saved jobs yet.</p>
        ) : (
          <div className="job-list">
            {savedJobs.map((job) => (
              <div className="job-card" key={job._id}>
                <Link to={`/jobs/${job._id}`}>
                  <h3>{job.title}</h3>
                  <p className="job-company">{job.company}</p>
                  <p className="job-meta">
                    {job.location} · {job.jobType}
                  </p>
                </Link>
                <button className="logout-btn" onClick={() => handleUnsaveJob(job._id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )
      ) : savedPosts.length === 0 ? (
        <p>No saved posts yet.</p>
      ) : (
        <div className="job-list">
          {savedPosts.map((post) => (
            <div className="job-card post-card" key={post._id}>
              <div className="post-header">
                {post.author?.profilePic && (
                  <img src={post.author.profilePic} alt="" className="post-avatar" />
                )}
                <Link to={`/users/${post.author?._id}`} className="post-author-name">
                  {post.author?.name}
                </Link>
              </div>
              <p>{post.content}</p>
              {post.image && <img src={post.image} alt="" className="post-image" />}
              <button className="logout-btn" onClick={() => handleUnsavePost(post._id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;