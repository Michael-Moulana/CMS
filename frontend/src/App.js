import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/dashboard/Dashboard";
import PagesDashboard from "./pages/dashboard/PagesDashboard";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/pages" element={<PagesDashboard />} />
          {/* <Route path="/dashboard/navigation" element={<Dashboard />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
