// frontend/src/pages/products/ProductsDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../axiosConfig.jsx";
import FlashMessage from "../../components/FlashMessage.jsx";

/* helper: pretty print categories no matter how backend returns them */
function prettyCats(value) {
  if (!value) return "—";
  try {
    if (Array.isArray(value)) return value.join(", ");
    const s = typeof value === "string" ? value.trim() : value;
    if (typeof s === "string" && s.startsWith("[") && s.endsWith("]")) {
      const arr = JSON.parse(s);
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

  // sorting
  const [sort, setSort] = useState({ key: "name", dir: "asc" });

  // grab flash from form pages
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
        const list = res?.data?.data ?? res?.data ?? [];
        setRows(Array.isArray(list) ? list : []);
      } catch {
        setFlash({ type: "error", message: "Failed to load products" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // search + sort (client-side)
  const data = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = s
      ? rows.filter((r) => (r.title || r.name || "").toLowerCase().includes(s))
      : rows.slice();

    const { key, dir } = sort;
    const get = (r) => {
      switch (key) {
        case "name": return (r.title || r.name || "").toString().toLowerCase();
        case "description": return (r.description || "").toString().toLowerCase();
        case "price": return Number(r.price) || 0;
        case "stock": return Number(r.stock) || 0;
        case "category": return prettyCats(r.categories ?? r.category).toLowerCase();
        default: return "";
      }
    };
    filtered.sort((a, b) => {
      const A = get(a); const B = get(b);
      if (A < B) return dir === "asc" ? -1 : 1;
      if (A > B) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [rows, q, sort]);

  // delete
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

  // tiny head cell with sort arrow
  const ThSort = ({ k, children, extra = "" }) => (
    <th className={`text-left font-medium px-6 py-4 ${extra}`}>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-gray-600"
        onClick={() =>
          setSort((s) => (s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" }))
        }
        title="Sort"
      >
        <span>{children}</span>
        <span className="text-xs text-gray-400">
          {sort.key === k ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );

  const cell = "px-6 py-4 border-r last:border-r-0";

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/products/new")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-2xl border border-blue-600 text-blue-600 bg-white hover:bg-blue-50"
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

      {/* Table (with grid lines like Figma) */}
      <div className="rounded-2xl ring-1 ring-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-600">
                <th className="text-left font-medium px-6 py-4 w-12">#</th>
                <ThSort k="name">Name</ThSort>
                <ThSort k="description">Description</ThSort>
                <ThSort k="price">Price</ThSort>
                <ThSort k="stock">Stock</ThSort>
                <ThSort k="category">Category</ThSort>
                {/* Blue Edit header text to match Figma */}
                <th className="text-right font-medium px-6 py-4 text-blue-600">Edit</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                data.map((p, i) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50/60">
                    <td className={cell}>{i + 1}</td>
                    <td className={`${cell} font-medium`}>{p.title || p.name}</td>
                    <td className={`${cell} text-gray-600 truncate`}>{p.description || "—"}</td>
                    <td className={cell}>{fmt(p.price)}</td>
                    <td className={cell}>{fmt(p.stock)}</td>
                    <td className={cell}>{prettyCats(p.categories ?? p.category)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {/* edit */}
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
                        {/* delete */}
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

        {/* footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-500 px-2">
            Showing 1–{Math.min(data.length, 10)} of {data.length}
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
