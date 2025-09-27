import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import FlashMessage from "../../components/FlashMessage";
import PageForm from "../../components/PageForm";
import PageList from "../../components/PageList";

const CACHE_KEY = "blox-pages-cache";

export default function PagesDashboard() {
  const { user } = useAuth();

  const [pages, setPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [flash, setFlash] = useState({ message: "", type: "" });

  // flash helper
  const showFlash = (message, type) => {
    setFlash({ message, type });
    const t = setTimeout(() => setFlash({ message: "", type: "" }), 2000);
    return () => clearTimeout(t);
  };

  // load from cache immediately for snappy UI
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
      if (Array.isArray(cached) && cached.length) setPages(cached);
    } catch {}
  }, []);

  // fetch from backend (authoritative)
  const fetchPages = async () => {
    if (!user?.token) return;
    const res = await axiosInstance.get("/dashboard/pages", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    const list = res.data?.pages || [];
    setPages(list);
    // refresh cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(list));
    } catch {}
  };

  useEffect(() => {
    fetchPages().catch(() => showFlash("Failed to load pages", "error"));
  }, [user]); // refetch when auth context changes

  // keep the form open if we are editing
  useEffect(() => {
    if (editingPage) setShowForm(true);
  }, [editingPage]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => (p.title || "").toLowerCase().includes(q));
  }, [pages, searchTerm]);

  // ensure cache always mirrors state
  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(pages));
    } catch {}
  }, [pages]);

  return (
    <div className="space-y-6">
      {/* Title + breadcrumb */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Pages Management</h1>
        <p className="text-xs text-gray-400">
          Dashboard / Manage Pages{editingPage ? " / Edit Page" : ""}
        </p>
      </div>

      {/* Row: Add button (left) + Search (right) */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setEditingPage(null);
            setShowForm((s) => !s);
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 h-10 text-sm
                     bg-blue-600 text-white md:bg-white md:text-gray-700 md:border md:hover:bg-gray-50"
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
        <div className="rounded-2xl border bg-gray-50 p-5">
          <PageForm
            pages={pages}
            setPages={setPages}
            editingPage={editingPage}
            setEditingPage={setEditingPage}
            showFlash={showFlash}
            onDone={() => {
              setShowForm(false);
              fetchPages().catch(() => {}); // refresh from backend after save
            }}
          />
        </div>
      )}

      <PageList
        pages={filtered}
        setPages={(updater) => {
          setPages(typeof updater === "function" ? updater(pages) : updater);
          // also sync cache when list changes via list component (delete)
          try {
            const next =
              typeof updater === "function" ? updater(pages) : updater;
            localStorage.setItem(CACHE_KEY, JSON.stringify(next));
          } catch {}
        }}
        setEditingPage={setEditingPage}
        showFlash={showFlash}
        afterDelete={() => fetchPages().catch(() => {})}
      />
    </div>
  );
}
