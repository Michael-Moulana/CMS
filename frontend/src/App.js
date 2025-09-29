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

// NEW imports
import ProductsDashboard from "./pages/products/ProductsDashboard";
import ProductForm from "./pages/products/ProductForm";
import PageForm from "./components/PageForm.jsx";   

import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/DashboardLayout";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {!user && <Navbar />}

      <Routes>
        {/* Default redirect */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Profile (requires auth, but outside dashboard layout) */}
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" replace />}
        />

        {/* Protected dashboard area */}
        <Route
          path="/dashboard"
          element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />

          {/* Pages */}
          <Route path="pages" element={<PagesDashboard />} />
          <Route path="pages/new" element={<PageForm />} />        {/* Add Page */}
          <Route path="pages/:id/edit" element={<PageForm />} />   {/* Edit Page */}

          {/* Navigation */}
          <Route path="navigations" element={<NavigationDashboard />} />

          {/* Products */}
          <Route path="products" element={<ProductsDashboard />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
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