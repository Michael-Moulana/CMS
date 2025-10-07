// frontend/src/components/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// swap to /img/logo.png if an icon can't be loaded
const iconFallback = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "/img/logo.png";
};

// Single sidebar item (icon "pill" turns blue; icon becomes white when active)
const Item = ({ to, icon, label, end, onNavigate }) => (
  <NavLink to={to} end={end} onClick={onNavigate}>
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
              "h-4 w-4 " + (isActive ? "filter invert brightness-0" : "")
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

  // mobile drawer
  const [open, setOpen] = useState(false);

  // lock page scroll while drawer is open (mobile)
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // shown in the top-right
  const displayName = (user?.email || "").split("@")[0] || "Admin";

  // close drawer after navigating on mobile
  const closeDrawerOnNavigate = () => setOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 font-rota">
      {/* Header */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6">
        {/* Hamburger only on mobile */}
        <button
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-gray-100"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-700">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/img/logo.png" alt="BLOX CMS" className="h-9 w-9" />
          <span className="font-semibold tracking-wide text-blue-600">
            BLOX CMS
          </span>
        </Link>

        {/* Account (clickable -> /dashboard/profile) */}
        <Link
          to="/dashboard/profile"
          className="flex items-center gap-3 group"
          aria-label="Open profile"
        >
          <div className="bg-blue-600 rounded-lg h-8 w-8 flex items-center justify-center group-hover:bg-blue-700 transition-colors">
            <img
              src="/img/account.png"
              alt=""
              onError={iconFallback}
              className="h-4 w-4 filter"
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
              {displayName}
            </span>
            <span className="text-xs text-gray-400">Admin account</span>
          </div>
        </Link>
      </header>

      <div className="flex">
        {/* ===== Sidebar (desktop) ===== */}
        <aside className="w-64 shrink-0 hidden md:flex flex-col border-r bg-white min-h-[calc(100vh-4rem)] p-4 justify-between">
          <nav className="space-y-2">
            <Item
              to="/dashboard"
              end
              icon="/img/Dashboard.png"
              label="Dashboard"
            />
            <Item to="/dashboard/pages" icon="/img/pages.png" label="Pages" />
            <Item
              to="/dashboard/navigations"
              icon="/img/site-nav.png"
              label="Manage Site Navigation"
            />
            <Item
              to="/dashboard/products"
              icon="/img/products.png"
              label="Products"
            />
          </nav>

          {/* Log Out row (text + blue icon, not a filled button) */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-gray-100 transition"
          >
            <img
              src="/img/Logout.png"
              alt=""
              onError={iconFallback}
              className="h-5 w-5"
            />
            <span className="text-sm">Log Out</span>
          </button>
        </aside>

        {/* ===== Drawer (mobile) ===== */}
        {/* Backdrop */}
        {open && (
          <div
            className="fixed inset-0 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
        {/* Panel */}
        <aside
          className={
            "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r p-4 flex flex-col justify-between md:hidden transform transition-transform " +
            (open ? "translate-x-0" : "-translate-x-full")
          }
          aria-hidden={!open}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2"
                onClick={closeDrawerOnNavigate}
              >
                <img src="/img/logo.png" alt="BLOX CMS" className="h-8 w-8" />
                <span className="font-semibold tracking-wide text-blue-600">
                  BLOX CMS
                </span>
              </Link>
              <button
                className="h-9 w-9 rounded-lg hover:bg-gray-100"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-700">
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="space-y-2">
              <Item
                to="/dashboard"
                end
                icon="/img/Dashboard.png"
                label="Dashboard"
                onNavigate={closeDrawerOnNavigate}
              />
              <Item
                to="/dashboard/pages"
                icon="/img/pages.png"
                label="Pages"
                onNavigate={closeDrawerOnNavigate}
              />
              <Item
                to="/dashboard/navigations"
                icon="/img/site%20navigation.png"
                label="Manage Site Navigation"
                onNavigate={closeDrawerOnNavigate}
              />
              <Item
                to="/dashboard/products"
                icon="/img/products.png"
                label="Products"
                onNavigate={closeDrawerOnNavigate}
              />
            </nav>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-gray-100 transition"
          >
            <img
              src="/img/Logout.png"
              alt=""
              onError={iconFallback}
              className="h-5 w-5"
            />
            <span className="text-sm">Log Out</span>
          </button>
        </aside>

        {/* Main panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
