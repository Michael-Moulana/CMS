// Simple welcome screen to match the mock.
// Keep it minimal; tiles/widgets can be added later.
import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.email?.split("@")[0] || "Michael";

  return (
    <div className="space-y-6">
      {/* Small breadcrumb-style header area */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-xs text-gray-400">Dashboard</p>
      </div>

      {/* Welcome hero card */}
      <div className="bg-white rounded-2xl p-10 shadow-sm border flex flex-col items-center">
        <div className="text-5xl font-extrabold text-blue-600 leading-tight">
          Welcome
        </div>
        <div className="mt-3 text-xl text-gray-500">{name}</div>
      </div>
    </div>
  );
}