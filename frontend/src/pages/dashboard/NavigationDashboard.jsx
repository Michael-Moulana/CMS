import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../axiosConfig.jsx";
import FlashMessage from "../../components/FlashMessage.jsx";

/* helpers */
const dequote = (v) => {
  if (v === null || v === undefined) return "";
  const s = String(v).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
};
const fmt = (v) => (v === 0 || v ? String(v) : "—");

/* component */
export default function NavigationDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [flash, setFlash] = useState(null);
  const [loading, setLoading] = useState(true);

  // sorting
  const [sort, setSort] = useState({ key: "title", dir: "asc" });

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // pick flash from redirect (optional)
  useEffect(() => {
    if (location.state?.flash) {
      setFlash(location.state.flash);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // load data
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/dashboard/navigations"); // baseURL already has /api
        const list = res?.data?.navigation ?? res?.data ?? [];
        setRows(Array.isArray(list) ? list : []);
      } catch {
        setFlash({ type: "error", message: "Failed to load navigations" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // search + sort
  const filteredAndSorted = useMemo(() => {
    const s = q.trim().toLowerCase();

    const filtered = s
      ? rows.filter(
          (r) =>
            (r.title || "").toLowerCase().includes(s) ||
            (r.slug || "").toLowerCase().includes(s) ||
            (r.parent?.title || "").toLowerCase().includes(s)
        )
      : rows.slice();

    const { key, dir } = sort;
    const get = (r) => {
      switch (key) {
        case "title":
          return (r.title || "").toString().toLowerCase();
        case "slug":
          return (r.slug || "").toString().toLowerCase();
        case "order":
          return Number(r.order) || 0;
        case "parent":
          return (r.parent?.title || "").toString().toLowerCase();
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
    if (!window.confirm("Delete this navigation item?")) return;
    try {
      await axios.delete(`/dashboard/navigations/${id}`);
      setRows((prev) => prev.filter((n) => n._id !== id && n.id !== id));
      setFlash({ type: "success", message: "Navigation deleted" });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Delete failed";
      setFlash({ type: "error", message: msg });
    }
  };

  // sortable header helper
  const ThSort = ({ k, children, extra = "" }) => (
    <th
      className={`text-left font-medium px-4 md:px-6 py-3 ${extra} border border-gray-200 bg-gray-100`}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 text-gray-600"
        onClick={() =>
          setSort((s) =>
            s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" }
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
      {/* Heading */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-semibold">Navigation Management</h1>
        <p className="text-sm text-gray-500">Dashboard / Navigation Management</p>
      </div>

      {/* Actions row */}
      <div className="mb-4 md:mb-6 flex items-center gap-3 flex-nowrap">
        <button
          onClick={() => navigate("/dashboard/navigations/new")}
          className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-2xl md:border md:border-blue-600 md:text-blue-600 md:bg-white bg-blue-600 text-white hover:bg-blue-700 md:hover:bg-blue-50"
        >
          <span className="font-medium">Add Navigation</span>
          <span className="text-lg leading-none">+</span>
        </button>

        <div className="ml-auto flex-1 min-w-[140px] max-w-[520px]">
          <div className="h-10 rounded-2xl border border-gray-200 bg-white px-3 flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <FlashMessage
          key={`${flash.type}-${flash.message}`}
          message={flash.message}
          type={flash.type}
          ms={2500}
          onClose={() => setFlash(null)}
        />
      )}

      {/* table / card list */}
      <div className="w-full rounded-2xl bg-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
          {/* hide header on mobile */}
          <thead className="hidden md:table-header-group">
            <tr className="text-gray-600">
              <th className="text-left font-medium px-4 md:px-6 py-3 border border-gray-200 bg-gray-100 rounded-tl-2xl">
                #
              </th>
              <ThSort k="title">Title</ThSort>
              <ThSort k="slug">Slug</ThSort>
              <ThSort k="order">Order</ThSort>
              <ThSort k="parent">Parent</ThSort>
              <th className="text-right font-medium px-4 md:px-6 py-3 border border-gray-200 bg-gray-100 text-blue-600 rounded-tr-2xl">
                Edit
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-16 text-center text-gray-400 bg-gray-100 md:border md:border-gray-200"
                >
                  Loading…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-16 text-center text-gray-400 bg-gray-100 md:border md:border-gray-200"
                >
                  No navigation items yet.
                </td>
              </tr>
            ) : (
              data.map((n, i) => {
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
                  <tr key={n._id || n.id || i} className="hover:bg-gray-200/60">
                    <td className={leftCell}>{startIdx + i + 1}</td>
                    {/* Title (mobile shows title + slug) */}
                    <td className={cell}>
                      <div className="truncate font-medium">{dequote(n.title) || "—"}</div>
                      <div className="truncate text-gray-500 text-xs md:hidden">{dequote(n.slug) || "—"}</div>
                    </td>
                    {/* slug (desktop only) */}
                    <td className={`${cell} hidden md:table-cell text-gray-600 truncate`}>
                      {dequote(n.slug) || "—"}
                    </td>
                    <td className={`${cell} hidden md:table-cell whitespace-nowrap`}>{fmt(n.order)}</td>
                    <td className={`${cell} hidden md:table-cell truncate`}>
                      <div className="max-w-[240px] truncate">{dequote(n.parent?.title) || "—"}</div>
                    </td>
                    <td className={rightCell}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/navigations/${n._id || n.id}/edit`)}
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
                          onClick={() => handleDelete(n._id || n.id)}
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

      {/* footer / pagination */}
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

          {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
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
  );
}
