import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const UserProfile = () => {
  const { id } = useParams();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [userRes, followersRes, postsRes] = await Promise.all([
        API.get(`/users/${id}`),
        API.get(`/follow/${id}/followers`),
        API.get(`/posts/user/${id}`),
      ]);
      setProfile(userRes.data);
      setFollowers(followersRes.data);
      setIsFollowing(followersRes.data.some((f) => f._id === userInfo._id));
      setPosts(postsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await API.put(`/follow/${id}/unfollow`);
        setIsFollowing(false);
        setFollowers((prev) => prev.filter((f) => f._id !== userInfo._id));
      } else {
        await API.put(`/follow/${id}`);
        setIsFollowing(true);
        setFollowers((prev) => [...prev, { _id: userInfo._id, name: userInfo.name }]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleMessage = async () => {
    try {
      const { data } = await API.post(`/messages/start/${id}`);
      navigate(`/messages?conversation=${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Could not start conversation");
    }
  };

  if (loading) return <p className="home-container">Loading...</p>;

  return (
    <div className="home-container">
      <div className="job-detail-card">
        {profile?.profilePic && (
          <img src={profile.profilePic} alt="" className="profile-pic-preview" />
        )}
        <h1>{profile?.name || "User"}</h1>
        <p className="job-meta">{profile?.companyName || profile?.role}</p>
        <p>{followers.length} followers</p>

        {userInfo._id !== id && (
          <div className="post-actions">
            <button onClick={handleFollowToggle}>
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
            <button onClick={handleMessage}>Message</button>
          </div>
        )}
      </div>

      <h3>Posts</h3>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div className="job-list">
          {posts.map((post) => (
            <div className="job-card post-card" key={post._id}>
              <p>{post.content}</p>
              {post.image && <img src={post.image} alt="" className="post-image" />}
              <p className="job-meta">{post.likes.length} likes · {post.comments.length} comments</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;