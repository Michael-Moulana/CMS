// frontend/src/App.js
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

import Dashboard from "./pages/dashboard/Dashboard";
import PagesDashboard from "./pages/dashboard/PagesDashboard";
import NavigationDashboard from "./pages/dashboard/NavigationDashboard";

import { AuthProvider, useAuth } from "./context/AuthContext";

// NEW: layout that provides the sidebar + header for dashboard pages
import DashboardLayout from "./components/DashboardLayout";

// Keeps routes separate so we can read auth inside them
function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {/* Keep the top Navbar only for public routes.
         When inside /dashboard we render the new DashboardLayout instead. */}
      {!user && <Navbar />}

      <Routes>
        {/* Default redirect based on auth */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Profile still requires auth, but is not part of the dashboard layout */}
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" replace />}
        />

        {/* Protected dashboard area.
           One wrapper route supplies the sidebar/header; children are the screens. */}
        <Route
          path="/dashboard"
          element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}
        >
          {/* /dashboard */}
          <Route index element={<Dashboard />} />
          {/* /dashboard/pages */}
          <Route path="pages" element={<PagesDashboard />} />
          {/* /dashboard/navigations */}
          <Route path="navigations" element={<NavigationDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}