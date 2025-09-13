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

// Separate component, useAuth is called inside provider
function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Default route depending on auth */}
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

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard/pages"
          element={user ? <PagesDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard/navigations"
          element={
            user ? <NavigationDashboard /> : <Navigate to="/login" replace />
          }
        />
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
