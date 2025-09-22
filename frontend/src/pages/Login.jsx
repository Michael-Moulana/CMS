// frontend/src/pages/Login.jsx
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    try {
      setLoading(true);
      const response = await axiosInstance.post("/api/auth/login", formData);
      login(response.data);             // <- same context method you already use
      navigate("/dashboard");           // <- same navigation as before
    } catch (err) {
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile: light background. md+: blue rounded background like the design. */}
      {/* Update: per your request, use BLUE on ALL screen sizes */}
      <div className="min-h-screen w-full bg-blue-600 p-4 sm:p-6 md:p-10 flex items-center justify-center">
        {/* Desktop white card with large rounded corners */}
        <div
          className="
            w-full
            max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl
            bg-white rounded-3xl shadow-lg
            p-6 sm:p-8 md:p-10
          "
        >
          {/* Logo + brand */}
          <div className="flex items-center gap-3 mb-8 justify-center sm:justify-start">
            {/* If you keep your logo in /public/img/logo.png this works. */}
            {/* Otherwise, change the src as needed. */}
            <img src="/img/logo.png" alt="Blox CMS" className="h-10 w-10" />
            <span className="font-semibold tracking-wide">BLOX CMS</span>
          </div>

          <h1
            className="
              text-2xl sm:text-3xl font-bold
              text-center sm:text-left
              mb-6 sm:mb-8
            "
          >
            Sign in
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  w-full
                  h-11 sm:h-12
                  rounded-lg
                  border border-gray-300
                  px-4
                  outline-none
                  focus:ring-2 focus:ring-blue-500
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
                  w-full
                  h-11 sm:h-12
                  rounded-lg
                  border border-gray-300
                  px-4
                  outline-none
                  focus:ring-2 focus:ring-blue-500
                "
                autoComplete="current-password"
                required
              />
            </div>

            {/* Create account link */}
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
              className="
                w-full
                h-11 sm:h-12
                rounded-xl
                bg-blue-600 text-white
                font-medium
                hover:bg-blue-700
                transition
                disabled:opacity-60
                mt-1
              "
              aria-busy={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;