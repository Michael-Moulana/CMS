// frontend/src/components/DashboardLayout.jsx

import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const iconFallback = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "/img/logo.png";
};

const Item = ({ to, icon, label, end }) => (
  <NavLink to={to} end={end}>
    {({ isActive }) => (
      <div
        className={
          "flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-gray-900 " +
          (isActive ? "bg-blue-50 text-blue-700" : "")
        }
      >
        <div
          className={
            "flex items-center justify-center h-7 w-7 rounded-lg " +
            (isActive ? "bg-blue-600" : "bg-gray-100")
          }
        >
          <img
            src={icon}
            alt=""
            onError={iconFallback}
            className={
              "h-4 w-4 object-contain " + (isActive ? "filter invert brightness-0" : "")
            }
          />
        </div>
        <span className="text-sm">{label}</span>
      </div>
    )}
  </NavLink>
);

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = (user?.email || "").split("@")[0] || "Admin";

  return (
    <div className="min-h-screen bg-gray-50 font-rota">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/img/logo.png" alt="BLOX CMS" className="h-16 w-16" />
          <span className="font-semibold tracking-wide text-blue-600">
            BLOX CMS
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg h-8 w-8 flex items-center justify-center">
            <img
              src="/img/account.png"
              alt="account"
              onError={iconFallback}
              className="h-4 w-4 object-contain filter "
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-blue-600">{displayName}</span>
            <span className="text-xs text-gray-400">Admin account</span>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 shrink-0 hidden md:flex flex-col border-r bg-white min-h-[calc(100vh-4rem)] p-4 justify-between">
          <nav className="space-y-2">
            <Item to="/dashboard" end icon="/img/Dashboard.png" label="Dashboard" />
            <Item to="/dashboard/pages" icon="/img/pages.png" label="Pages" />
            <Item
              to="/dashboard/navigations"
              icon="/img/site%20navigation.png"
              label="Manage Site Navigation"
            />
            <Item to="/dashboard/products" icon="/img/products.png" label="Products" />
            <Item to="/dashboard/media" icon="/img/media.png" label="Media" />
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-gray-100 transition"
          >
            <img
              src="/img/Logout.png"
              alt=""
              onError={iconFallback}
              className="h-5 w-5 object-contain"
            />
            <span className="text-sm">Log Out</span>
          </button>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}