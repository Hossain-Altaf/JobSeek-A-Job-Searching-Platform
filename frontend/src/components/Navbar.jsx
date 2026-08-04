import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        JobPortal
      </Link>
      {userInfo && <SearchBar />}

      <div className="navbar-links">
        <Link to="/">Jobs</Link>
        {userInfo && <Link to="/feed">Feed</Link>}
        
        <button onClick={toggleTheme} className="theme-toggle-btn">
           {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        
        {!userInfo && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {userInfo && userInfo.role === "jobseeker" && (
          <Link to="/my-applications">My Applications</Link>
        )}

        {userInfo && userInfo.role === "employer" && (
          <>
            <Link to="/post-job">Post a Job</Link>
            <Link to="/my-jobs">My Jobs</Link>
          </>
        )}

        {userInfo && userInfo.role === "admin" && (
          <Link to="/admin">Admin Panel</Link>
        )}

        

    {userInfo && (
  <>
    <NotificationBell />
    <Link to="/saved">Saved</Link>
    <Link to="/messages">Messages</Link>
    <Link to="/profile">Profile</Link>
    <span className="navbar-user">
      Hi, {userInfo.name}{" "}
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </span>
  </>
)}
      </div>
    </nav>
  );
};

export default Navbar;