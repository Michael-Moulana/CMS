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
        const res = await axiosInstance.get("/api/dashboard/pages", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPages(res.data.pages || []);
      } catch (e2) {
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Pages Management</h1>
          <p className="text-xs text-gray-400">Dashboard / Manage Pages</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm bg-white hover:bg-gray-50"
          >
            <span className="text-blue-600">+</span> {editingPage ? "Edit Page" : "Add Page"}
          </button>
          <div className="w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search By Title"
              className="w-full h-10 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
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
