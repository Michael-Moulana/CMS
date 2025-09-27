import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../axiosConfig.jsx";
import FlashMessage from "../../components/FlashMessage";

function sanitizeText(v) {
  if (typeof v !== "string") return v;
  const s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function normalizeCategory(raw) {
  if (!raw) return "";
  if (Array.isArray(raw)) return raw.join(", ");
  let s = String(raw).trim();
  try {
    const candidate = s
      .replaceAll('\\"', '"')
      .replace(/^\s*'\[/, "[")
      .replace(/\]'\s*$/, "]")
      .replace(/'/g, '"');
    const arr = JSON.parse(candidate);
    if (Array.isArray(arr)) return arr.join(", ");
  } catch {}
  return sanitizeText(s);
}

export default function ProductsDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [flash, setFlash] = useState({ message: "", type: "" });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  
  useEffect(() => {
    let f = location.state?.flash;
    if (!f) {
      const stored = sessionStorage.getItem("products_flash");
      if (stored) {
        try { f = JSON.parse(stored); } catch {}
      }
    }
    if (f?.message) {
      setFlash({ message: f.message, type: f.type || "success" });
      sessionStorage.removeItem("products_flash");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // fetch products list
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/products");
        const payload = res.data?.data || res.data || [];
        if (!cancelled) {
          const mapped = Array.isArray(payload)
            ? payload.map((p) => ({
                ...p,
                name: sanitizeText(p.name || p.title || ""),
                description: sanitizeText(p.description || ""),
                category: normalizeCategory(Array.isArray(p.categories) ? p.categories : p.category),
              }))
            : [];
          setProducts(mapped);
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = q
      ? products.filter((p) => String(p.name || "").toLowerCase().includes(q))
      : products;

    if (sort.key) {
      rows = [...rows].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        const aNum = typeof av === "number" || !isNaN(parseFloat(av));
        const bNum = typeof bv === "number" || !isNaN(parseFloat(bv));
        const r =
          aNum && bNum
            ? Number(av) - Number(bv)
            : String(av ?? "").localeCompare(String(bv ?? ""), undefined, { sensitivity: "base" });
        return sort.dir === "asc" ? r : -r;
      });
    }
    return rows;
  }, [products, query, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(total, startIdx + pageSize);
  const pageRows = filtered.slice(startIdx, endIdx);

  const setSortKey = (key) =>
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );

  const SortBtn = ({ label, col }) => (
    <button
      type="button"
      onClick={() => setSortKey(col)}
      className="inline-flex items-center gap-1 hover:text-gray-700"
      aria-sort={sort.key !== col ? "none" : sort.dir === "asc" ? "ascending" : "descending"}
    >
      <span>{label}</span>
      {sort.key === col ? (sort.dir === "asc" ? "▲" : "▼") : ""}
    </button>
  );

  const goEdit = (id) => navigate(`/dashboard/products/${id}/edit`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Product</h1>
        <p className="text-xs text-gray-400">Dashboard / Product</p>
      </div>


      {flash.message && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          ms={2500}
          onClose={() => setFlash({ message: "", type: "" })}
        />
      )}

      <div className="flex items-center gap-3 flex-nowrap">
        <button
          onClick={() => navigate("/dashboard/products/new")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-2xl
                     bg-blue-600 text-white border border-blue-600 hover:bg-blue-700
                     md:bg-white md:text-blue-600 md:hover:bg-gray-50"
        >
          <span className="text-lg leading-none">+</span>
          <span className="font-medium">Add Product</span>
        </button>

        <div className="ml-auto shrink-0 w-[150px] sm:w-[220px] md:w-80 min-w-0">
          <div className="h-10 rounded-2xl border border-gray-200 bg-white px-3
                          flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              className="w-full outline-none placeholder-gray-400"
              placeholder="Search By Title"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-[11px] md:text-xs text-gray-500">
                <th className="px-3 md:px-6 py-3 border border-gray-200 w-10 md:w-12">#</th>
                <th className="px-3 md:px-6 py-3 border border-gray-200 w-[22%]">
                  <SortBtn label="Name" col="name" />
                </th>
                <th className="px-3 md:px-6 py-3 border border-gray-200 hidden lg:table-cell w-[28%]">
                  Description
                </th>
                <th className="px-3 md:px-6 py-3 border border-gray-200 hidden md:table-cell w-[10%]">
                  <SortBtn label="Price" col="price" />
                </th>
                <th className="px-3 md:px-6 py-3 border border-gray-200 hidden md:table-cell w-[10%]">
                  <SortBtn label="Stock" col="stock" />
                </th>
                <th className="px-3 md:px-6 py-3 border border-gray-200 hidden lg:table-cell w-[15%]">
                  <SortBtn label="Category" col="category" />
                </th>
                <th className="px-3 md:px-6 py-3 border border-gray-200 hidden xl:table-cell w-[8%]">
                  Edit
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400 border border-gray-200">
                    Loading…
                  </td>
                </tr>
              ) : total === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400 border border-gray-200">
                    Product list will appear here.
                  </td>
                </tr>
              ) : (
                pageRows.map((p, i) => (
                  <tr key={p._id ?? `${p.name}-${startIdx + i}`} className="text-xs md:text-sm text-gray-700">
                    <td className="px-3 md:px-6 py-3 border border-gray-200">{startIdx + i + 1}</td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 whitespace-nowrap">{p.name}</td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 hidden lg:table-cell truncate">{p.description}</td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 hidden md:table-cell">{p.price}</td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 hidden md:table-cell">{p.stock}</td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 hidden lg:table-cell">{p.category}</td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 hidden xl:table-cell">
                      {/* EDIT button — white, bordered, black icon (like Pages) */}
                      <button
                        onClick={() => goEdit(p._id)}
                        className="h-8 w-8 rounded-lg border bg-white hover:bg-gray-100 grid place-items-center text-gray-700"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
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

      {/* Phone list */}
      <div className="sm:hidden bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">Loading…</div>
        ) : total === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">Product list will appear here.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pageRows.map((p, i) => (
              <li key={p._id ?? `${p.name}-${startIdx + i}`} className="px-4 py-3 flex items-center">
                <span className="w-6 text-sm text-gray-500">{startIdx + i + 1}</span>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{p.name}</div>
                  <div className="text-xs text-gray-400 truncate">{p.description}</div>
                </div>
                <div className="ml-3 text-xs text-gray-500 whitespace-nowrap">
                  ${p.price} • {p.stock}
                </div>
                {/* Mobile edit button — same white/black style */}
                <button
                  onClick={() => goEdit(p._id)}
                  className="ml-3 h-8 w-8 rounded-lg border bg-white hover:bg-gray-100 grid place-items-center text-gray-700"
                  aria-label="Edit"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
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
  );
}

function Pagination({
  total, startIdx, endIdx, totalPages, currentPage,
  setPage, pageSize, setPageSize, compact = false
}) {
  const showPager = totalPages > 1;
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
        {showPager && (
          <button
            className="h-8 w-8 rounded-xl border bg-white text-gray-500 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || total === 0}
            aria-label="Previous page"
          >
            ‹
          </button>
        )}

        {showPager &&
          Array.from({ length: totalPages }).map((_, i) => (
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

        <div className="h-8 rounded-xl border bg-white text-gray-600 text-sm px-3 flex items-center gap-2">
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

        {showPager && (
          <button
            className="h-8 w-8 rounded-xl border bg-white text-gray-500 disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || total === 0}
            aria-label="Next page"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
