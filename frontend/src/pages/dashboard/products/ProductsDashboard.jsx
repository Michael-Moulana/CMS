// frontend/src/pages/products/ProductsDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../axiosConfig.jsx";
import FlashMessage from "../../../components/FlashMessage.jsx";

/* helpers */
const dequote = (v) => {
  if (v === null || v === undefined) return "";
  const s = String(v).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
};

function prettyCats(value) {
  if (!value) return "";
  try {
    if (Array.isArray(value)) return value.join(", ");
    const s = String(value).trim();
    if (s.startsWith("[") && s.endsWith("]")) {
      const arr = JSON.parse(s);
      return Array.isArray(arr) ? arr.join(", ") : dequote(s);
    }
    return dequote(s);
  } catch {
    return dequote(value);
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

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ---- NEW: shared “inner” width to center content on phones/tablets ----
  const inner = "mx-auto w-full max-w-[680px] md:max-w-[1200px]";

  // pick flash from redirect
  // pick flash from redirect OR sessionStorage
useEffect(() => {
  let f = null;

  // 1) navigation state (preferred)
  if (location.state?.flash) {
    f = location.state.flash;
    navigate(location.pathname, { replace: true, state: {} });
  } else {
    // 2) fallback: sessionStorage (from product create)
    const raw = sessionStorage.getItem("products_flash");
    if (raw) {
      try {
        f = JSON.parse(raw);
      } catch {}
      sessionStorage.removeItem("products_flash");
    }
  }

  if (f) setFlash(f);
}, [location, navigate]);

  // load data
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

  // search + sort
  const filteredAndSorted = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = s
      ? rows.filter((r) => (r.title || r.name || "").toLowerCase().includes(s))
      : rows.slice();

    const { key, dir } = sort;
    const get = (r) => {
      switch (key) {
        case "name":
          return (r.title || r.name || "").toString().toLowerCase();
        case "description":
          return (r.description || "").toString().toLowerCase();
        case "price":
          return Number(r.price) || 0;
        case "stock":
          return Number(r.stock) || 0;
        case "category":
          return prettyCats(r.categories ?? r.category).toLowerCase();
        default:
          return "";
      }
    };
    filtered.sort((a, b) => {
      const A = get(a);
      const B = get(b);
      if (A < B) return dir === "asc" ? -1 : 1;
      if (A > B) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [rows, q, sort]);

  // page slice
  const total = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const data = filteredAndSorted.slice(startIdx, endIdx);

  useEffect(() => {
    setPage(1);
  }, [q, pageSize]);

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data?.success === false)
        throw new Error(res.data.message || "Delete failed");
      setRows((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      setFlash({ type: "success", message: "Product deleted" });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Delete failed";
      setFlash({ type: "error", message: msg });
    }
  };

  // sortable header
  const ThSort = ({ k, children, extra = "" }) => (
    <th
      className={`text-left font-medium px-4 md:px-6 py-3 ${extra} border border-gray-200 bg-gray-100`}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 text-gray-600"
        onClick={() =>
          setSort((s) =>
            s.key === k
              ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" }
              : { key: k, dir: "asc" }
          )
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

  const cell =
    "px-3 sm:px-4 md:px-6 py-4 bg-gray-100 border-b border-gray-200 md:border md:border-gray-200";

  return (
    <div className="w-full p-4 md:p-6">
      {/* header */}
      <div className={`${inner} mb-4 md:mb-6`}>
        <h1 className="text-xl font-semibold">Product</h1>
        <p className="text-sm text-gray-500">Dashboard / Product</p>
      </div>

      {/* actions (same row; responsive) */}
      <div
        className={`${inner} mb-4 md:mb-6 flex items-center gap-3 flex-nowrap`}
      >
        <button
          onClick={() => navigate("/dashboard/products/new")}
          className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-2xl md:border md:border-blue-600 md:text-blue-600 md:bg-white bg-blue-600 text-white hover:bg-blue-700 md:hover:bg-blue-50"
        >
          <span className="font-medium">Add Product</span>
          <span className="text-lg leading-none">+</span>
        </button>

        <div className="ml-auto flex-1 min-w-[140px] max-w-[520px]">
          <div className="h-10 rounded-2xl border border-gray-200 bg-white px-3 flex items-center gap-2 text-sm text-gray-500">
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
              className="w-full outline-none placeholder-gray-400"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* flash */}
      {flash && (
        <div className={inner}>
          <FlashMessage
            key={`${flash.type}-${flash.message}`}
            message={flash.message}
            type={flash.type}
            ms={2500}
            onClose={() => setFlash(null)}
          />
        </div>
      )}

      {/* table card */}
      <div className={inner}>
        <div className="w-full rounded-3xl bg-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            {/* hide header on mobile */}
            <thead className="hidden md:table-header-group">
              <tr className="text-gray-600">
                <th className="text-left font-medium px-4 md:px-6 py-3 border border-gray-200 bg-gray-100 rounded-tl-2xl">
                  #
                </th>
                <ThSort k="name">Name</ThSort>
                <ThSort k="description">Description</ThSort>
                <ThSort k="price">Price</ThSort>
                <ThSort k="stock">Stock</ThSort>
                <ThSort k="category">Category</ThSort>
                <th className="text-right font-medium px-4 md:px-6 py-3 border border-gray-200 bg-gray-100 text-blue-600 rounded-tr-2xl">
                  Edit
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-400 bg-gray-100 md:border md:border-gray-200"
                  >
                    Loading…
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-400 bg-gray-100 md:border md:border-gray-200"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                data.map((p, i) => {
                  const name = dequote(p.title || p.name || "");
                  const desc = dequote(p.description || "");
                  const isFirst = i === 0;
                  const isLast = i === data.length - 1;

                  const leftCell =
                    cell +
                    (isFirst ? " rounded-tl-2xl md:rounded-none" : "") +
                    (isLast ? " rounded-bl-2xl md:rounded-none" : "");
                  const rightCell =
                    cell +
                    (isFirst ? " rounded-tr-2xl md:rounded-none" : "") +
                    (isLast ? " rounded-br-2xl md:rounded-none" : "");

                  return (
                    <tr
                      key={p._id || p.id || i}
                      className="hover:bg-gray-200/60"
                    >
                      <td className={leftCell}>{startIdx + i + 1}</td>
                      <td className={cell}>
                        <div className="truncate font-medium">
                          {name || "—"}
                        </div>
                        <div className="truncate text-gray-500 text-xs md:hidden">
                          {desc || "—"}
                        </div>
                      </td>
                      <td
                        className={`${cell} hidden md:table-cell text-gray-600 truncate`}
                      >
                        {desc || "—"}
                      </td>
                      <td
                        className={`${cell} hidden md:table-cell whitespace-nowrap`}
                      >
                        {fmt(p.price)}
                      </td>
                      <td
                        className={`${cell} hidden md:table-cell whitespace-nowrap`}
                      >
                        {fmt(p.stock)}
                      </td>
                      <td className={`${cell} hidden md:table-cell truncate`}>
                        <div className="max-w-[240px] truncate">
                          {prettyCats(p.categories ?? p.category) || "—"}
                        </div>
                      </td>
                      <td className={rightCell}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/products/${p._id || p.id}/edit`
                              )
                            }
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
                          <button
                            onClick={() => handleDelete(p._id || p.id)}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* footer / pagination */}
      <div className={inner}>
        <div className="w-full flex flex-wrap items-center gap-2 p-3">
          <div className="text-xs text-gray-500 order-2 sm:order-1 w-full sm:w-auto text-center sm:text-left">
            Showing {total === 0 ? 0 : startIdx + 1}–{endIdx} of {total}
          </div>

          <div className="order-1 sm:order-2 flex items-center gap-2 overflow-x-auto w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="h-9 w-9 rounded-lg border bg-white disabled:opacity-50"
              title="Previous"
            >
              {"<"}
            </button>

            {Array.from({ length: totalPages })
              .slice(0, 5)
              .map((_, idx) => {
                const n = idx + 1;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-9 w-9 rounded-lg border ${
                      n === safePage ? "bg-blue-50 text-blue-700" : "bg-white"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="h-9 w-9 rounded-lg border bg-white disabled:opacity-50"
              title="Next"
            >
              {">"}
            </button>

            <div className="flex items-center gap-2 text-sm ml-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-9 rounded-lg border px-3 bg-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>/Page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
