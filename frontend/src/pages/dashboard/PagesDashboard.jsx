import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import FlashMessage from "../../components/FlashMessage";
import PageForm from "../../components/PageForm";
import PageList from "../../components/PageList";

export default function PagesDashboard() {
  const { user } = useAuth();

  const [pages, setPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [flash, setFlash] = useState({ message: "", type: "" });

  const showFlash = (message, type) => {
    setFlash({ message, type });
    setTimeout(() => setFlash({ message: "", type: "" }), 2500);
  };

  useEffect(() => {
    if (!user?.token) return;
    (async () => {
      try {
        const res = await axiosInstance.get("/dashboard/pages", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPages(res.data.pages || []);
      } catch {
        showFlash("Failed to load pages", "error");
      }
    })();
  }, [user]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => (p.title || "").toLowerCase().includes(q));
  }, [pages, searchTerm]);

  useEffect(() => {
    if (editingPage) setShowForm(true);
  }, [editingPage]);

  return (
    <div className="space-y-6">
      {/* Title + subtitle */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Pages Management</h1>
        <p className="text-xs text-gray-400">Dashboard / Manage Pages</p>
      </div>

      {/* Row: Add button (left) + Search (right) */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="
            inline-flex items-center gap-2 rounded-xl px-4 h-10 text-sm
            bg-blue-600 text-white
            md:bg-white md:text-gray-700 md:border md:hover:bg-gray-50
          "
          aria-label="Add Page"
        >
          <span className="md:text-blue-600">+&nbsp;</span>
          <span className="font-medium">Add Page</span>
        </button>

        <div className="w-40 sm:w-56 md:w-64">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search By Title"
              className="w-full h-10 rounded-xl border border-gray-300 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {flash.message && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          onClose={() => setFlash({ message: "", type: "" })}
        />
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <PageForm
            pages={pages}
            setPages={setPages}
            editingPage={editingPage}
            setEditingPage={setEditingPage}
            showFlash={showFlash}
            onDone={() => setShowForm(false)}
          />
        </div>
      )}

      <PageList
        pages={filtered}
        setPages={setPages}
        setEditingPage={setEditingPage}
        showFlash={showFlash}
      />
    </div>
  );
}