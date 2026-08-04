import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Feed = () => {
  const { userInfo } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [type, setType] = useState("update");
  const [imageFile, setImageFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("all"); // "all" | "following"
  const [commentDrafts, setCommentDrafts] = useState({}); // { postId: "text" }

  const fetchFeed = async (pageNum = 1, mode = viewMode) => {
    setLoading(true);
    try {
      const endpoint = mode === "following" ? "/posts/following" : "/posts";
      const { data } = await API.get(endpoint, { params: { page: pageNum, limit: 10 } });
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(1, viewMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("type", type);
      if (imageFile) formData.append("image", imageFile);

      const { data } = await API.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPosts((prev) => [data, ...prev]);
      setContent("");
      setImageFile(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await API.put(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: data.likes } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentDrafts[postId];
    if (!text?.trim()) return;

    try {
      const { data } = await API.post(`/posts/${postId}/comment`, { text });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: [...p.comments, data] } : p
        )
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePost = async (postId) => {
    try {
      await API.put(`/saved/post/${postId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const isLikedByMe = (post) =>
    post.likes.some((id) => id === userInfo._id || id?._id === userInfo._id);

  return (
    <div className="home-container">
      <h1>Feed</h1>

      <div className="admin-tabs">
        <button
          className={viewMode === "all" ? "active-tab" : ""}
          onClick={() => setViewMode("all")}
        >
          Everyone
        </button>
        <button
          className={viewMode === "following" ? "active-tab" : ""}
          onClick={() => setViewMode("following")}
        >
          Following
        </button>
      </div>

      <form className="apply-form" onSubmit={handlePost} style={{ maxWidth: "100%" }}>
        <label>Share an update</label>
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's new? A skill you learned, company news, anything..."
        />
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="update">General Update</option>
          <option value="skill">New Skill</option>
          <option value="company_news">Company News</option>
        </select>
        <label>Image (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        <button type="submit" disabled={posting}>
          {posting ? "Posting..." : "Post"}
        </button>
      </form>

      {loading ? (
        <p>Loading feed...</p>
      ) : posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div className="job-list">
          {posts.map((post) => (
            <div className="job-card post-card" key={post._id}>
              <div className="post-header">
                {post.author?.profilePic && (
                  <img src={post.author.profilePic} alt="" className="post-avatar" />
                )}
                <div>
                  <Link to={`/users/${post.author?._id}`} className="post-author-name">
                    {post.author?.name}
                  </Link>
                  <p className="job-meta" style={{ margin: 0 }}>
                    {post.author?.companyName || post.author?.role} ·{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p>{post.content}</p>
              {post.image && <img src={post.image} alt="" className="post-image" />}

              <div className="post-actions">
                <button onClick={() => handleLike(post._id)}>
                  {isLikedByMe(post) ? "♥ Liked" : "♡ Like"} ({post.likes.length})
                </button>
                <button onClick={() => handleSavePost(post._id)}>Save</button>
              </div>

              <div className="comments-section">
                {post.comments.map((c) => (
                  <div key={c._id} className="comment-item">
                    <strong>{c.user?.name}:</strong> {c.text}
                  </div>
                ))}

                <div className="comment-input-row">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentDrafts[post._id] || ""}
                    onChange={(e) =>
                      setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCommentSubmit(post._id);
                    }}
                  />
                  <button onClick={() => handleCommentSubmit(post._id)}>Send</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => fetchFeed(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => fetchFeed(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;