import React from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

export default function PageList({ pages, setPages, setEditingPage, showFlash }) {
  const { user } = useAuth();

  const handleEdit = (page) => {
    setEditingPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this page?")) return;
    try {
      await axiosInstance.delete(`/api/dashboard/pages/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPages((prev) => prev.filter((p) => p._id !== id));
      showFlash("Page deleted", "success");
    } catch (e2) {
      showFlash("Delete failed", "error");
    }
  };

  if (!pages || pages.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-gray-400">
        No pages yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="text-left font-medium px-6 py-4">#</th>
              <th className="text-left font-medium px-6 py-4">Title</th>
              <th className="text-left font-medium px-6 py-4">Slug</th>
              <th className="text-left font-medium px-6 py-4">Last Modified</th>
              <th className="text-right font-medium px-6 py-4">Edit</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, idx) => (
              <tr key={page._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{idx + 1}</td>
                <td className="px-6 py-4 font-medium">{page.title}</td>
                <td className="px-6 py-4">{page.slug}</td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(page.updatedAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(page)}
                      className="h-9 w-9 rounded-xl border bg-white hover:bg-gray-100 grid place-items-center"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(page._id)}
                      className="h-9 w-9 rounded-xl bg-red-500 hover:bg-red-600 grid place-items-center text-white"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      </div>

      <div className="flex items-center justify-between p-4">
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
  );
}
