// frontend/src/components/DashboardLayout.jsx
import { Outlet, useNavigate } from "react-router-dom"; // + useNavigate
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate(); // + navigate hook
  const short = user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen flex">
      {/* --- your sidebar stays the same --- */}

      <div className="flex-1">
        <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b bg-white">
          {/* --- left header content stays the same --- */}

          {/* clickable profile chip */}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="group flex items-center gap-3 rounded-2xl bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Open profile"
            title="Open profile"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/20">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" />
                <path d="M20 21a8 8 0 10-16 0" />
              </svg>
            </span>
            <div className="text-left">
              <div className="text-sm font-semibold leading-none truncate">{short}</div>
              <div className="text-[11px] opacity-80 leading-none">Admin account</div>
            </div>
          </button>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
