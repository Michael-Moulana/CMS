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
<<<<<<< HEAD
import ProductsDashboard from "./pages/dashboard/products/ProductsDashboard.jsx";
import ProductForm from "./pages/dashboard/products/ProductForm.jsx";
import PageForm from "./components/PageForm.jsx";
import NavigationForm from "./components/NavigationForm"; // ← added
=======
import ProductsDashboard from "./pages/products/ProductsDashboard";
import ProductForm from "./pages/products/ProductForm";
import PageForm from "./components/PageForm.jsx";
>>>>>>> e372832 (CMS-221 Subtask 1: Implement redesigned Profile page in React frontend.)

import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/DashboardLayout";

<Route path="profile" element={<Profile />} />
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

<<<<<<< HEAD
        {/* Profile (requires auth, but outside dashboard layout) */}
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" replace />

          }
        />
=======
        <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
>>>>>>> e372832 (CMS-221 Subtask 1: Implement redesigned Profile page in React frontend.)

        {/* Protected dashboard area */}
        <Route
          path="/dashboard"
          element={
            user ? <DashboardLayout /> : <Navigate to="/login" replace />
          }
        >
          <Route index element={<Dashboard />} />
          
          <Route path="profile" element={<Profile />} />
          <Route path="pages" element={<PagesDashboard />} />
<<<<<<< HEAD
=======
          <Route path="pages/new" element={<PageForm />} />
          <Route path="pages/:id/edit" element={<PageForm />} />

          {/* Navigation */}
>>>>>>> e372832 (CMS-221 Subtask 1: Implement redesigned Profile page in React frontend.)
          <Route path="navigations" element={<NavigationDashboard />} />
          <Route path="navigations/new" element={<NavigationForm />} />            {/* Add Navigation */}
          <Route path="navigations/:id/edit" element={<NavigationForm />} />       {/* Edit Navigation */}

          {/* NEW: Products routes */}
          <Route path="products" element={<ProductsDashboard />} />
          <Route path="products/new" element={<ProductForm />} />
<<<<<<< HEAD
          <Route path= "products/:id/edit" element={<ProductForm />} />
=======
          <Route path="products/:id/edit" element={<ProductForm />} />
          
          



          {/*  Profile is now inside the dashboard layout */}
          <Route path="profile" element={<Profile />} />
>>>>>>> e372832 (CMS-221 Subtask 1: Implement redesigned Profile page in React frontend.)
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
