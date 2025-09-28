// frontend/src/pages/products/ProductsDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../axiosConfig.jsx";
import FlashMessage from "../../components/FlashMessage.jsx";

/* helper: pretty print categories no matter how backend returns them */
function prettyCats(value) {
  if (!value) return "—";
  try {
    // array already
    if (Array.isArray(value)) return value.join(", ");
    // string that might be JSON
    const maybe = typeof value === "string" ? value.trim() : value;
    if (typeof maybe === "string" && maybe.startsWith("[") && maybe.endsWith("]")) {
      const arr = JSON.parse(maybe);
      return Array.isArray(arr) ? arr.join(", ") : String(value);
    }
    return String(value);
  } catch {
    return String(value);
  }
}

const fmt = (n) => (n === 0 || n ? String(n) : "—");

export default function ProductsDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [flash, setFlash] = useState(null);
  const [loading, setLoading] = useState(true);

  // pick flash from create/edit page
  useEffect(() => {
    if (location.state?.flash) {
      setFlash(location.state.flash);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // load products
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/products"); // your /api/products proxy in server.js
        const list = res?.data?.data ?? res?.data ?? [];
        setRows(Array.isArray(list) ? list : []);
      } catch (e) {
        setFlash({ type: "error", message: "Failed to load products" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      (r.title || r.name || "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setRows((prev) => prev.filter((p) => p._id !== id));
      setFlash({ type: "success", message: "Product deleted" });
    } catch {
      setFlash({ type: "error", message: "Delete failed" });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/products/new")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-2xl
                     border border-blue-600 text-blue-600 bg-white hover:bg-blue-50"
        >
          <span className="text-lg leading-none">+</span>
          <span className="font-medium">Add Product</span>
        </button>

        <div className="ml-auto shrink-0 w-[240px] md:w-80">
          <div className="h-10 rounded-2xl border border-gray-200 bg-white px-3 flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              className="w-full outline-none placeholder-gray-400"
              placeholder="Search By Title"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Flash */}
      {flash && (
        <FlashMessage
          key={`${flash.type}-${flash.message}`}
          message={flash.message}
          type={flash.type}
          ms={2500}
          onClose={() => setFlash(null)}
        />
      )}

      {/* Table */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left font-medium px-6 py-4 w-12">#</th>
                <th className="text-left font-medium px-6 py-4">Name</th>
                <th className="text-left font-medium px-6 py-4">Description</th>
                <th className="text-left font-medium px-6 py-4">Price</th>
                <th className="text-left font-medium px-6 py-4">Stock</th>
                <th className="text-left font-medium px-6 py-4">Category</th>
                <th className="text-right font-medium px-6 py-4">Edit</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 font-medium">{p.title || p.name}</td>
                    <td className="px-6 py-4 text-gray-600">{p.description || "—"}</td>
                    <td className="px-6 py-4">{fmt(p.price)}</td>
                    <td className="px-6 py-4">{fmt(p.stock)}</td>
                    <td className="px-6 py-4">{prettyCats(p.categories ?? p.category)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {/* Pencil (edit) */}
                        <button
                          onClick={() => navigate(`/dashboard/products/${p._id}/edit`)}
                          className="h-9 w-9 rounded-xl border bg-white hover:bg-gray-100 grid place-items-center"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>

                        {/* Trash (delete) */}
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="h-9 w-9 rounded-xl bg-red-500 hover:bg-red-600 grid place-items-center text-white"
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* footer (visual only) */}
        <div className="flex items-center justify-between p-4 border-top">
          <div className="text-xs text-gray-500 px-2">
            Showing 1–{Math.min(filtered.length, 10)} of {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-lg border bg-white">{"<"}</button>
            <button className="h-9 w-9 rounded-lg border bg-blue-50 text-blue-700">1</button>
            <button className="h-9 w-9 rounded-lg border bg-white">2</button>
            <button className="h-9 w-9 rounded-lg border bg-white">3</button>
            <div className="flex items-center gap-2 text-sm">
              <select className="h-9 rounded-lg border px-3 bg-white">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
              <span>/Page</span>
            </div>
            <button className="h-9 w-9 rounded-lg border bg-white">{">"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
