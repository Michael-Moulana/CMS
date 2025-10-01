// src/components/PageList.jsx
import React from "react";

export default function PageList({
  pages = [],
  loading = false,
  fmt = (v) => v,
  onEdit = () => {},
  onDelete = () => {},
}) {
  return (
    <div className="md:hidden">
      <div className="rounded-2xl bg-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400">Loading…</div>
        ) : !pages || pages.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">No pages found.</div>
        ) : (
          pages.map((p, i) => (
            <div
              key={p._id}
              className={`flex items-center px-4 py-4 ${i !== pages.length - 1 ? "border-b border-gray-200" : ""}`}
            >
              <div className="w-10 text-center text-gray-700 font-medium">{i + 1}</div>

              <div className="flex-1 min-w-0">
                <div className="text-gray-900 font-semibold truncate">{p.title}</div>
                <div className="text-xs text-gray-500 mt-1 truncate">Slug: {p.slug || "-"}</div>
                <div className="text-xs text-gray-500 mt-1 truncate">Last Modified: {fmt(p.updatedAt)}</div>
              </div>

              <div className="pl-3 flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onEdit(p)}
                  className="h-10 w-10 rounded-xl border bg-white hover:bg-gray-100 grid place-items-center"
                  title="Edit"
                  aria-label="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(p._id)}
                  className="h-10 w-10 rounded-xl bg-red-500 hover:bg-red-600 grid place-items-center text-white"
                  title="Delete"
                  aria-label="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
