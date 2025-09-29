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

        const res = await api.get("/products");
        const payload = res.data?.data || res.data || [];
        if (!cancelled) {
          const mapped = Array.isArray(payload)
            ? payload.map((p) => ({
                ...p,
                name: p.name || p.title || "",
                category:
                  p.category ||
                  (Array.isArray(p.categories) ? p.categories.join(", ") : ""),
              }))
            : [];
          setProducts(mapped);
        }
      } catch {
        if (!cancelled) setProducts([]);

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
//added delete funciton

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

  /* minimal delete hook for mobile buttons (no service change) */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((x) => x._id !== id));
    } catch (e) {
      alert("Delete failed");
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


      {/* Desktop/tablet table (unchanged) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

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


        <Pagination
          total={total}
          startIdx={startIdx}
          endIdx={endIdx}
          totalPages={totalPages}
          currentPage={currentPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>

      {/* Phone list — updated to match your Figma (cards + edit/delete buttons) */}
      <div className="sm:hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">Loading…</div>
        ) : total === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            Product list will appear here (US-2).
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {pageRows.map((p, i) => (
              <div
                key={p._id ?? `${p.name}-${startIdx + i}`}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="pr-3">
                    <div className="text-xs text-gray-400">{startIdx + i + 1}</div>
                    <div className="mt-1 font-semibold text-gray-800">{p.name}</div>
                    {p.description ? (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</div>
                    ) : null}
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-medium text-gray-600">Price:</span> {p.price ?? "-"}
                      <span className="ml-3 font-medium text-gray-600">Stock:</span> {p.stock ?? "-"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-medium text-gray-600">Category:</span> {p.category || "-"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* edit (white) */}
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

                    {/* delete (red) */}
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
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <Pagination
            total={total}
            startIdx={startIdx}
            endIdx={endIdx}
            totalPages={totalPages}
            currentPage={currentPage}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            compact
          />
        </div>
      </div>
    </div>
  );
}

function Pagination({
  total,
  startIdx,
  endIdx,
  totalPages,
  currentPage,
  setPage,
  pageSize,
  setPageSize,
  compact = false,
}) {
  return (
    <div
      className={`px-4 sm:px-6 py-3 border-t border-gray-200 flex ${
        compact ? "gap-3 flex-col items-end" : "flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      }`}
    >
      {!compact && (
        <span className="text-xs text-gray-500">
          Showing {total === 0 ? 0 : startIdx + 1}–{endIdx} of {total}
        </span>
      )}

      <div className="flex items-center gap-2">
        <button
          className="h-8 w-8 rounded-xl border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1 || total === 0}
          aria-label="Previous page"
        >
          ‹
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={`h-8 min-w-[2rem] px-2 rounded-xl border ${
              currentPage === i + 1
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-gray-200 text-gray-600 bg-white"
            }`}
            onClick={() => setPage(i + 1)}
            disabled={total === 0}
          >
            {i + 1}
          </button>
        ))}

        <div className="h-8 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm px-3 flex items-center gap-2">
          <select
            className="outline-none bg-transparent"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-gray-400">/ Page</span>

        </div>
      </div>
    </div>
  );
}
