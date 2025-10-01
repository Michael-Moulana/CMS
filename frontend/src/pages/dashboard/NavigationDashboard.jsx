import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../axiosConfig";
import FlashMessage from "../../components/FlashMessage";

/* cell helper */
const cell =
  "px-3 sm:px-4 md:px-6 py-4 bg-gray-100 border-b border-gray-200 md:border md:border-gray-200";

export default function NavigationDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [flash, setFlash] = useState(null);
  const [loading, setLoading] = useState(true);

  // table sorting
  const [sort, setSort] = useState({ key: "title", dir: "asc" });

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // pick flash from redirects
  useEffect(() => {
    if (location.state?.flash) {
      setFlash(location.state.flash);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // load data
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const res = await axiosInstance.get("/dashboard/navigations", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const list = res?.data?.navigation ?? res?.data?.data ?? res?.data ?? [];
        if (!ignore) setRows(Array.isArray(list) ? list : []);
      } catch {
        if (!ignore) setFlash({ type: "error", message: "Failed to load navigations" });
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [user]);

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
          return (r.title || "").toLowerCase();
        case "slug":
          return (r.slug || "").toLowerCase();
        case "order":
          return Number(r.order) || 0;
        case "parent":
          return (r.parent?.title || "—").toLowerCase();
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

  // page calc
  const total = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const data = filteredAndSorted.slice(startIdx, endIdx);

  useEffect(() => {
    setPage(1);
  }, [q, pageSize]);

  // actions
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this navigation item?")) return;
    try {
      await axiosInstance.delete(`/dashboard/navigations/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setRows((prev) => prev.filter((r) => r._id !== id));
      setFlash({ type: "success", message: "Navigation deleted" });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Delete failed";
      setFlash({ type: "error", message: msg });
    }
  };

  // sortable header cell
  const Th = ({ k, children }) => (
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
          className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-2xl border border-blue-600 text-blue-600 bg-white hover:bg-blue-50"
        >
          <span className="text-lg leading-none">+</span>
          <span className="font-medium">Add Navigation</span>
        </button>

        <div className="ml-auto flex-1 min-w-[180px] max-w-[520px]">
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

      {/* Table card */}
      <div className="w-full rounded-2xl bg-white shadow-sm border overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead className="hidden md:table-header-group">
            <tr className="text-gray-600">
              <th className="text-left font-medium px-4 md:px-6 py-3 border border-gray-200 bg-gray-100 rounded-tl-2xl">
                #
              </th>
              <Th k="title">Title</Th>
              <Th k="slug">Slug</Th>
              <Th k="order">Order</Th>
              <Th k="parent">Parent</Th>
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
              data.map((r, i) => {
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
                  <tr key={r._id || i} className="hover:bg-gray-200/60">
                    <td className={leftCell}>{startIdx + i + 1}</td>
                    <td className={cell}>
                      <div className="truncate font-medium">{r.title || "—"}</div>
                    </td>
                    <td className={`${cell} truncate`}>{r.slug || "—"}</td>
                    <td className={`${cell} whitespace-nowrap`}>{Number(r.order) || 0}</td>
                    <td className={`${cell} truncate`}>{r.parent?.title || "—"}</td>
                    <td className={rightCell}>
                      <div className="flex justify-end gap-2">
                        
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* footer / pagination */}
        <div className="flex flex-wrap items-center gap-2 p-3 border-t">
          {/* pager */}
          <div className="flex items-center gap-2">
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
          </div>

          {/* spacer */}
          <div className="flex-1" />

          {/* page size */}
          <div className="flex items-center gap-2 text-sm">
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

      {/* Showing count */}
      <div className="text-xs text-gray-500 mt-2 text-center">
        Showing {total === 0 ? 0 : startIdx + 1}–{endIdx} of {total}
      </div>
    </div>
  );
}
