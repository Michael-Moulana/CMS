// frontend/src/pages/products/ProductsDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductsDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Product</h1>
        <p className="text-xs text-gray-400">Dashboard / Product</p>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard/products/new")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border 
                     bg-blue-600 text-white md:bg-white md:text-blue-600 
                     hover:bg-blue-700 md:hover:bg-gray-50"
        >
          <span className="text-lg leading-none">+</span>
          Add Product
        </button>

        <div className="w-64">
          <div className="h-10 rounded-xl border px-3 flex items-center gap-2 text-sm text-gray-500 bg-white">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <input
              className="w-full outline-none"
              placeholder="Search By Title"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Table shell (placeholder for US-2) */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-3 text-xs text-gray-500">#</div>
        <div className="h-64 grid place-items-center text-gray-400 text-sm">
          Product list will appear here (US-2).
        </div>
      </div>
    </div>
  );
}