// frontend/src/pages/products/ProductsDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axiosConfig.jsx";

export default function ProductsDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/products");
        const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
        if (!cancelled && data.length) setProducts(data);
        if (!cancelled && !data.length) setProducts(stub());
      } catch {
        if (!cancelled) setProducts(stub());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function stub() {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i + 1,
      name: "Sample",
      description: "sample desc",
      price: (i + 1) * 10,
      stock: (i + 1) * 2,
      category: "Sample",
    }));
  }

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
        const r = aNum && bNum
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

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Product</h1>
        <p className="text-xs text-gray-400">Dashboard / Product</p>
      </div>

      {/* Add + Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/products/new")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-2xl
                     border border-blue-600 text-blue-600 bg-white 
                     hover:bg-gray-50 shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          <span className="font-medium">Add Product</span>
        </button>

        <div className="ml-auto w-80">
          <div className="h-10 rounded-2xl border border-gray-200 bg-white px-3
                          flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            <input
              className="w-full outline-none placeholder-gray-400"
              placeholder="Search By Title"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table + grid lines */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full table-fixed border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500">
              <th className="px-6 py-3 text-left font-medium border border-gray-200 w-12">#</th>
              <th className="px-6 py-3 text-left font-medium border border-gray-200">
                <SortBtn label="Name" col="name" />
              </th>
              <th className="px-6 py-3 text-left font-medium border border-gray-200">
                Description
              </th>
              <th className="px-6 py-3 text-left font-medium border border-gray-200">
                <SortBtn label="Price" col="price" />
              </th>
              <th className="px-6 py-3 text-left font-medium border border-gray-200">
                <SortBtn label="Stock" col="stock" />
              </th>
              <th className="px-6 py-3 text-left font-medium border border-gray-200">
                <SortBtn label="Category" col="category" />
              </th>
              <th className="px-6 py-3 text-left font-medium border border-gray-200">Edit</th>
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
                  Product list will appear here (US-2).
                </td>
              </tr>
            ) : (
              pageRows.map((p, i) => (
                <tr key={p.id ?? `${p.name}-${startIdx + i}`} className="text-sm text-gray-700">
                  <td className="px-6 py-3 border border-gray-200">{startIdx + i + 1}</td>
                  <td className="px-6 py-3 border border-gray-200">{p.name}</td>
                  <td className="px-6 py-3 border border-gray-200 truncate">{p.description}</td>
                  <td className="px-6 py-3 border border-gray-200">{p.price}</td>
                  <td className="px-6 py-3 border border-gray-200">{p.stock}</td>
                  <td className="px-6 py-3 border border-gray-200">{p.category}</td>
                  <td className="px-6 py-3 border border-gray-200 text-gray-400">—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {total === 0 ? 0 : startIdx + 1}–{endIdx} of {total}
          </span>

          <div className="flex items-center gap-2">
            <button
              className="h-8 w-8 rounded-xl border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`h-8 w-8 rounded-xl border ${
                  currentPage === i + 1
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-gray-200 text-gray-600 bg-white"
                }`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <div className="h-8 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm px-3 flex items-center gap-2">
              <select
                className="outline-none"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-gray-400">/ Page</span>
            </div>

            <button
              className="h-8 w-8 rounded-xl border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
