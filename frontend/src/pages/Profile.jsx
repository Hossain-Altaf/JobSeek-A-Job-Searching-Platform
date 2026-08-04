import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { userInfo, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/users/profile");
      setProfile(data);
      setName(data.name || "");
      setSkillsInput((data.skills || []).join(", "));
      setCompanyName(data.companyName || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        name,
        skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (userInfo.role === "employer") payload.companyName = companyName;

      const { data } = await API.put("/users/profile", payload);
      setProfile((prev) => ({ ...prev, ...data }));

      // keep navbar/name in sync
      login({ ...userInfo, name: data.name });

      setMessage("Profile updated!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const fieldConfig = {
      profilePic: { url: "/users/profile/picture", key: "image" },
      resume: { url: "/users/profile/resume", key: "resume" },
      companyLogo: { url: "/users/profile/logo", key: "logo" },
    };

    const config = fieldConfig[field];
    const formData = new FormData();
    formData.append(config.key, file);

    try {
      const { data } = await API.put(config.url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, ...data }));
      setMessage("Uploaded successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
    }
  };

  if (loading) return <p className="home-container">Loading...</p>;
  if (!profile) return <p className="home-container">Could not load profile.</p>;

  return (
    <div className="home-container">
      <h1>My Profile</h1>

      {message && <p className="error-text">{message}</p>}

      <div className="job-detail-card">
        {profile.profilePic && (
          <img src={profile.profilePic} alt="Profile" className="profile-pic-preview" />
        )}
        <label>Profile Picture</label>
        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "profilePic")} />
      </div>

      <form className="auth-form" onSubmit={handleInfoSubmit} style={{ maxWidth: "500px" }}>
        <h3>Basic Info</h3>

        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email</label>
        <input value={profile.email} disabled />

        {userInfo.role === "employer" && (
          <>
            <label>Company Name</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </>
        )}

        {userInfo.role === "jobseeker" && (
          <>
            <label>Skills (comma-separated)</label>
            <input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
          </>
        )}

        <button type="submit">Save Changes</button>
      </form>

      {userInfo.role === "jobseeker" && (
        <div className="job-detail-card">
          <h3>Resume</h3>
          {profile.resume && (
            <p>
              <a href={profile.resume} target="_blank" rel="noreferrer">
                View current resume
              </a>
            </p>
          )}
          <label>Upload new resume (PDF/DOC)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileUpload(e, "resume")}
          />
        </div>
      )}

      {userInfo.role === "employer" && (
        <div className="job-detail-card">
          <h3>Company Logo</h3>
          {profile.companyLogo && (
            <img src={profile.companyLogo} alt="Company logo" className="profile-pic-preview" />
          )}
          <label>Upload logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "companyLogo")}
          />
        </div>
      )}
    </div>
  );
};

export default Profile;