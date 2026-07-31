import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        JobPortal
      </Link>

      <div className="navbar-links">
        <Link to="/">Jobs</Link>

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
          <span className="navbar-user">
            Hi, {userInfo.name}{" "}
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;