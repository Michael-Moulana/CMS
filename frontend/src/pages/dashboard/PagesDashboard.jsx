// src/pages/dashboard/PagesDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../axiosConfig.jsx";
import PageList from "../../components/PageList.jsx";
import FlashMessage from "../../components/FlashMessage.jsx";

/* date formatter */
const fmt = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

export default function PagesDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [flash, setFlash] = useState(null);
  const [loading, setLoading] = useState(true);

  // sorting + pagination
  const [sort, setSort] = useState({ key: "title", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // pick flash from redirect
  useEffect(() => {
    if (location.state?.flash) {
      setFlash(location.state.flash);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // load
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/dashboard/pages");
        const list = res?.data?.pages ?? res?.data ?? [];
        setRows(Array.isArray(list) ? list : []);
      } catch {
        setFlash({ type: "error", message: "Failed to load pages" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // search + sort
  const filteredAndSorted = useMemo(() => {
    const s = q.trim().toLowerCase();

    const filtered = s
      ? rows.filter((r) => (r.title || "").toLowerCase().includes(s))
      : rows.slice();

    const { key, dir } = sort;

    const get = (r) => {
      switch (key) {
        case "title":
          return (r.title || "").toString().toLowerCase();
        case "slug":
          return (r.slug || "").toString().toLowerCase();
        case "updatedAt":
          return new Date(r.updatedAt || 0).getTime();
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
    if (!window.confirm("Delete this page?")) return;
    try {
      await api.delete(`/dashboard/pages/${id}`);
      setRows((prev) => prev.filter((x) => x._id !== id));
      setFlash({ type: "success", message: "Page deleted" });
    } catch {
      setFlash({ type: "error", message: "Delete failed" });
    }
  };

  // sortable header cell
  const ThSort = ({ k, children }) => (
    <th className="text-left font-medium px-4 md:px-6 py-3 border border-gray-200 bg-gray-100">
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

  // responsive cell style (mobile: only bottom line; desktop: full grid)
  const cell =
    "px-4 md:px-6 py-4 bg-gray-100 border-b border-gray-200 md:border md:border-gray-200";

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 bg-white">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-semibold">Pages Management</h1>
        <p className="text-sm text-gray-500">Dashboard / Manage Pages</p>
      </div>

      <div className="mb-4 md:mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/pages/new")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-2xl md:border md:border-blue-600 md:text-blue-600 md:bg-white bg-blue-600 text-white hover:bg-blue-700 md:hover:bg-blue-50"
        >
          <span className="text-lg leading-none">+</span>
          <span className="font-medium">Add Page</span>
        </button>

        <div className="ml-auto shrink-0 w-[220px] md:w-80">
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

      {flash && (
        <FlashMessage
          key={`${flash.type}-${flash.message}`}
          message={flash.message}
          type={flash.type}
          ms={2500}
          onClose={() => setFlash(null)}
        />
      )}

      {/* DESKTOP TABLE */}
      <div className="hidden md:block rounded-2xl bg-gray-100 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr className="text-gray-600">
              <th className="text-left font-medium px-6 py-3 border border-gray-200 bg-gray-100 rounded-tl-2xl">
                #
              </th>
              <ThSort k="title">Title</ThSort>
              <ThSort k="slug">Slug</ThSort>
              <ThSort k="updatedAt">Last Modified</ThSort>
              <th className="text-right font-medium px-6 py-3 border border-gray-200 bg-gray-100 text-blue-600 rounded-tr-2xl">
                Edit
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400 bg-gray-100 md:border md:border-gray-200">
                  Loading…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400 bg-gray-100 md:border md:border-gray-200">
                  No pages found.
                </td>
              </tr>
            ) : (
              data.map((p, i) => {
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
                  <tr key={p._id} className="hover:bg-gray-200/60">
                    <td className={leftCell}>{startIdx + i + 1}</td>
                    <td className={cell}>
                      <div className="truncate font-medium">{p.title || "—"}</div>
                      <div className="truncate text-gray-500 text-xs md:hidden">{fmt(p.updatedAt)}</div>
                    </td>
                    <td className={`${cell} hidden md:table-cell truncate`}>{p.slug || "—"}</td>
                    <td className={`${cell} hidden md:table-cell whitespace-nowrap`}>{fmt(p.updatedAt)}</td>
                    <td className={rightCell}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/pages/${p._id}/edit`)}
                          className="h-9 w-9 rounded-xl border bg-white hover:bg-gray-100 grid place-items-center"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <PageList
        pages={data}
        start={startIdx}
        loading={loading}
        fmt={fmt}
        onEdit={(page) => navigate(`/dashboard/pages/${page._id}/edit`)}
        onDelete={handleDelete}
      />

      {/* pagination */}
      <div className="flex flex-wrap justify-center md:justify-between items-center gap-2 md:gap-3 p-3">
        <div className="order-2 md:order-1 text-xs text-gray-500 px-1 w-full md:w-auto text-center md:text-left">
          Showing {total === 0 ? 0 : startIdx + 1}–{endIdx} of {total}
        </div>

        <div className="order-1 md:order-2 flex items-center gap-2 overflow-x-auto">
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
                className={`h-9 w-9 rounded-lg border ${n === safePage ? "bg-blue-50 text-blue-700" : "bg-white"}`}
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
