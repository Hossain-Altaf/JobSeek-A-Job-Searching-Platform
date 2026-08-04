import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobDetails from "./pages/JobDetails";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";
import Applicants from "./pages/Applicants";
import AdminPanel from "./pages/AdminPanel";
import "./App.css";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import UserProfile from "./pages/UserProfile";
import SearchResults from "./pages/SearchResults";
import Saved from "./pages/Saved";
import Messages from "./pages/Message";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/jobs/:id" element={<JobDetails />} />

  <Route
  path="/saved"
  element={
    <ProtectedRoute>
      <Saved />
    </ProtectedRoute>
  }
/>

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />
  <Route
  path="/messages"
  element={
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  }
/>
  <Route
  path="/search"
  element={
    <ProtectedRoute>
      <SearchResults />
    </ProtectedRoute>
  }
/>
  <Route
    path="/post-job"
    element={
      <ProtectedRoute allowedRoles={["employer", "admin"]}>
        <PostJob />
      </ProtectedRoute>
    }
  />
  <Route
    path="/my-jobs"
    element={
      <ProtectedRoute allowedRoles={["employer", "admin"]}>
        <MyJobs />
      </ProtectedRoute>
    }
  />
  <Route
    path="/jobs/:id/applicants"
    element={
      <ProtectedRoute allowedRoles={["employer", "admin"]}>
        <Applicants />
      </ProtectedRoute>
    }
  />
  <Route
    path="/admin"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminPanel />
      </ProtectedRoute>
    }
  />
  <Route
  path="/feed"
  element={
    <ProtectedRoute>
      <Feed />
    </ProtectedRoute>
  }
/>
<Route
  path="/users/:id"
  element={
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  }
/>
</Routes>
    </>
  );
}

export default App;