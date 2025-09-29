// src/components/PageList.jsx
import React from "react";

export default function PageList({
  pages = [],
  loading = false,
  fmt = (v) => v,
  onEdit = () => {},
  onDelete = () => {},
}) {
  // Loading & empty states (shared)
  if (loading) {
    return (
      <div className="px-6 py-16 text-center text-gray-400">Loading…</div>
    );
  }
  if (!pages || pages.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-gray-400">No pages found.</div>
    );
  }

  return (
    <>
      {/* ===================== DESKTOP TABLE (md and up) ===================== */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="text-left font-medium px-6 py-4 w-12">#</th>
              <th className="text-left font-medium px-6 py-4">Title</th>
              <th className="text-left font-medium px-6 py-4">Slug</th>
              <th className="text-left font-medium px-6 py-4">Last Modified</th>
              <th className="text-right font-medium px-6 py-4">Edit</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p, i) => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{i + 1}</td>
                <td className="px-6 py-4 font-medium">{p.title}</td>
                <td className="px-6 py-4">{p.slug}</td>
                <td className="px-6 py-4 text-gray-500">{fmt(p.updatedAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {/* EDIT — white button */}
                    <button
                      onClick={() => onEdit(p)}
                      className="h-9 w-9 rounded-xl border bg-white hover:bg-gray-100 grid place-items-center"
                      title="Edit"
                      aria-label="Edit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                    {/* DELETE — red filled */}
                    <button
                      onClick={() => onDelete(p._id)}
                      className="h-9 w-9 rounded-xl bg-red-500 hover:bg-red-600 grid place-items-center text-white"
                      title="Delete"
                      aria-label="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* (Optional) static footer like Figma */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex gap-2">
            <button className="h-9 w-9 rounded-lg border bg-white">{'<'}</button>
            <button className="h-9 w-9 rounded-lg border bg-blue-50 text-blue-700">1</button>
            <button className="h-9 w-9 rounded-lg border bg-white">2</button>
            <button className="h-9 w-9 rounded-lg border bg-white">3</button>
            <button className="h-9 w-9 rounded-lg border bg-white">{'>'}</button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <select className="h-9 rounded-lg border px-3 bg-white">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span>/Page</span>
          </div>
        </div>
      </div>

      {/* ===================== MOBILE CARDS (< md) ===================== */}
      <div className="md:hidden p-4 space-y-3">
        {pages.map((p, i) => (
          <div
            key={p._id}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-stretch">
              {/* index column */}
              <div className="w-14 grid place-items-center text-gray-700 text-lg font-medium">
                {i + 1}
              </div>

              {/* content */}
              <div className="flex-1 py-4">
                <div className="text-gray-900 font-semibold">{p.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Slug: {p.slug || "-"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Last Modified: {fmt(p.updatedAt)}
                </div>
              </div>

              {/* actions */}
              <div className="pr-4 flex items-center gap-2">
                <button
                  onClick={() => onEdit(p)}
                  className="h-10 w-10 rounded-xl border bg-white hover:bg-gray-100 grid place-items-center"
                  title="Edit"
                  aria-label="Edit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
