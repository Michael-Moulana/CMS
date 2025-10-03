// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;

    try {
      setLoading(true);
      await axiosInstance.post("/auth/register", formData);
      alert("Registration successful. Please sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-blue-600 p-4 sm:p-6 md:p-10 flex items-center justify-center">
      {/* White card – same shell as Login */}
      <div
        className="
          w-full
          max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl
          bg-white rounded-3xl shadow-lg
          p-6 sm:p-8 md:p-10
        "
      >
        {/* Brand row */}
        <div className="flex items-center gap-3 mb-8 justify-center sm:justify-start">
          <img src="/img/logo.png" alt="Blox CMS" className="h-10 w-10" />
          <span className="font-semibold tracking-wide">BLOX CMS</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left mb-6 sm:mb-8">
          Sign up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Name</label>
            <input
              name="name"
              type="text"
              placeholder="Andrew"
              value={formData.name}
              onChange={handleChange}
              className="
                w-full h-11 sm:h-12 rounded-lg border border-gray-300 px-4
                outline-none focus:ring-2 focus:ring-blue-500
              "
              autoComplete="name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">E-mail</label>
            <input
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="
                w-full h-11 sm:h-12 rounded-lg border border-gray-300 px-4
                outline-none focus:ring-2 focus:ring-blue-500
              "
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
              className="
                w-full h-11 sm:h-12 rounded-lg border border-gray-300 px-4
                outline-none focus:ring-2 focus:ring-blue-500
              "
              autoComplete="new-password"
              required
            />
          </div>

          {/* Already have an account? */}
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 underline">
              Sign in
            </Link>
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full h-11 sm:h-12 rounded-xl bg-blue-600 text-white font-medium
              hover:bg-blue-700 transition disabled:opacity-60 mt-1
            "
            aria-busy={loading}
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}