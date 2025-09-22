import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from ".././axiosConfig";
import { useAuth } from ".././context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  /* handleSubmit: same behavior as before, only UI changed */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    try {
      setLoading(true);
      const response = await axiosInstance.post("/api/auth/login", formData);
      login(response.data);                 // <- same context method you already use
      navigate("/dashboard");               // <- same navigation as before
    } catch (err) {
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Mobile: light background; later we’ll add explicit responsive in a separate subtask.
       Desktop look now: full blue background + white rounded card centered (as in the design). */
    <div className="min-h-screen w-full bg-blue-600 flex items-center justify-center">
      {/* Desktop white card with large rounded corners */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg p-8">
        {/* Logo + brand */}
        <div className="flex items-center gap-3 mb-8">
          {/* If your logo is at /public/img/logo.png this works */}
          <img src="/img/logo.png" alt="Blox CMS" className="h-10 w-10" />
          <span className="font-semibold tracking-wide">BLOX CMS</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">E-mail</label>
            <input
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-11 rounded-lg border border-gray-300 px-4 outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Password</label>
            <input
              name="password"
              type="password"
              placeholder="@#*%"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-11 rounded-lg border border-gray-300 px-4 outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Create account link (same wording as design) */}
          <p className="text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 underline">
              Create now
            </Link>
          </p>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
