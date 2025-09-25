// frontend/src/pages/products/ProductsDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductsDashboard() {
  const navigate = useNavigate();
  const cols = ["#", "Name", "Description", "Price", "Stock", "Category", "Edit"];

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Product</h1>
        <p className="text-xs text-gray-400">Dashboard / Product</p>
      </div>

      {/* Top row: Add + Search (match Figma spacing/look) */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/products/new")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-2xl
                     border border-blue-600 text-blue-600 bg-white 
                     hover:bg-gray-50 shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          <span className="font-medium">Add Product</span>
        </button>

        <div className="ml-auto w-80">
          <div className="h-10 rounded-2xl border border-gray-200 bg-white px-3
                          flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            <input className="w-full outline-none placeholder-gray-400" placeholder="Search By Title" disabled />
          </div>
        </div>
      </div>

      {/* Table card + grid lines */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full table-fixed border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500">
              {cols.map((c, i) => (
                <th
                  key={c}
                  className={`px-6 py-3 text-left font-medium border border-gray-200 ${i === 0 ? "w-12" : ""}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>

        {/* placeholder rows for US-2 */}
          <tbody>
            <tr>
              <td
                colSpan={cols.length}
                className="px-6 py-16 text-center text-sm text-gray-400 border border-gray-200"
              >
                Product list will appear here (US-2).
              </td>
            </tr>
          </tbody>
        </table>

        {/* Pagination bar (UI only for now) */}
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">Showing 0–0 of 0</span>

          <div className="flex items-center gap-2">
            <button
              className="h-8 w-8 rounded-xl border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
              disabled
              aria-label="Previous page"
            >
              ‹
            </button>

            <button className="h-8 w-8 rounded-xl border border-gray-200 bg-white text-gray-600">
              1
            </button>

            <div className="h-8 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm px-3 flex items-center gap-2">
              <span>10</span>
              <span className="text-gray-400">/ Page</span>
            </div>

            <button
              className="h-8 w-8 rounded-xl border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
              disabled
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
