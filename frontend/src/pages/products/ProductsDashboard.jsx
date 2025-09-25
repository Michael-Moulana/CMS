// frontend/src/pages/products/ProductsDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductsDashboard() {
  const navigate = useNavigate();

  // dummy sample data for UI only (backend will replace later)
  const products = [
    { id: 1, name: "Sample", description: "sample desc" },
    { id: 2, name: "Sample", description: "sample desc" },
    { id: 3, name: "Sample", description: "sample desc" },
    { id: 4, name: "Sample", description: "sample desc" },
    { id: 5, name: "Sample", description: "sample desc" },
    { id: 6, name: "Sample", description: "sample desc" },
  ];

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Product</h1>
        <p className="text-xs text-gray-400">Dashboard / Product</p>
      </div>

      {/* Actions: button + search */}
      <div className="flex flex-wrap items-center">
        <button
          onClick={() => navigate("/dashboard/products/new")}
          className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl
                     bg-blue-600 text-white hover:bg-blue-700
                     md:border md:bg-white md:text-blue-600 md:hover:bg-gray-50"
        >
          <span className="text-lg leading-none">+</span>
          Add Product
        </button>

        <div className="flex-1 min-w-[180px] md:w-64 md:flex-none ml-6 sm:ml-8">
          <div className="h-10 rounded-xl border px-3 flex items-center gap-2 text-sm text-gray-500 bg-white">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              className="w-full outline-none"
              placeholder="Search By Title"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left w-12">#</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">{i + 1}</td>
                <td className="px-6 py-3">{p.name}</td>
                <td className="px-6 py-3">{p.description}</td>
                <td className="px-6 py-3 flex items-center justify-center gap-2">
                  <button className="p-2 rounded-lg border hover:bg-gray-100">
                    ✏
                  </button>
                  <button className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600">
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination mockup */}
        <div className="flex items-center justify-between px-6 py-3 text-sm text-gray-500 bg-gray-50">
          <span>Showing 1–6 of 6</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-lg border bg-white">1</button>
            <button className="px-3 py-1 rounded-lg border bg-white">2</button>
            <span className="px-3">…</span>
            <button className="px-3 py-1 rounded-lg border bg-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}