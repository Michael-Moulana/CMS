// frontend/src/pages/products/ProductsDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< Updated upstream
=======
import { getProducts } from "./ProductService";
>>>>>>> Stashed changes

export default function ProductsDashboard() {
  const navigate = useNavigate();

<<<<<<< Updated upstream
  // dummy sample data for UI only (backend will replace later)
  const products = [
    { id: 1, name: "Sample", description: "sample desc" },
    { id: 2, name: "Sample", description: "sample desc" },
    { id: 3, name: "Sample", description: "sample desc" },
    { id: 4, name: "Sample", description: "sample desc" },
    { id: 5, name: "Sample", description: "sample desc" },
    { id: 6, name: "Sample", description: "sample desc" },
  ];
=======
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "title", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
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
      ? products.filter((p) => String(p.title || "").toLowerCase().includes(q))
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
>>>>>>> Stashed changes

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Product</h1>
        <p className="text-xs text-gray-400">Dashboard / Product</p>
      </div>

<<<<<<< Updated upstream
      {/* Actions: button + search */}
      <div className="flex flex-wrap items-center">
        <button
          onClick={() => navigate("/dashboard/products/new")}
          className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl
                     bg-blue-600 text-white hover:bg-blue-700
                     md:border md:bg-white md:text-blue-600 md:hover:bg-gray-50"
=======
      {/* Actions */}
      <div className="flex items-center gap-3 flex-nowrap">
        <button
          onClick={() => navigate("/dashboard/products/new")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-2xl
                     bg-blue-600 text-white border border-blue-600 hover:bg-blue-700
                     md:bg-white md:text-blue-600 md:hover:bg-gray-50"
>>>>>>> Stashed changes
        >
          <span className="text-lg leading-none">+</span>
          Add Product
        </button>

<<<<<<< Updated upstream
        <div className="flex-1 min-w-[180px] md:w-64 md:flex-none ml-6 sm:ml-8">
          <div className="h-10 rounded-xl border px-3 flex items-center gap-2 text-sm text-gray-500 bg-white">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
=======
        <div className="ml-auto shrink-0 w-[150px] sm:w-[220px] md:w-80 min-w-0">
          <div className="h-10 rounded-2xl border border-gray-200 bg-white px-3
                          flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
>>>>>>> Stashed changes
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              className="w-full outline-none"
              placeholder="Search By Title"
<<<<<<< Updated upstream
              disabled
=======
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
>>>>>>> Stashed changes
            />
          </div>
        </div>
      </div>

<<<<<<< Updated upstream
      {/* Product Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left w-12">#</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">{i + 1}</td>
                <td className="px-6 py-3">{p.name}</td>
                <td className="px-6 py-3">{p.description}</td>
                <td className="px-6 py-3 flex items-center justify-center gap-2">
                  <button className="p-2 rounded-lg border hover:bg-gray-100">
                    ✏
                  </button>
                  <button className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600">
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination mockup */}
        <div className="flex items-center justify-between px-6 py-3 text-sm text-gray-500 bg-gray-50">
          <span>Showing 1–6 of 6</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-lg border bg-white">1</button>
            <button className="px-3 py-1 rounded-lg border bg-white">2</button>
            <span className="px-3">…</span>
            <button className="px-3 py-1 rounded-lg border bg-white">Next</button>
=======
      {/* Desktop/Tablet table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-[11px] md:text-xs text-gray-500">
                <th className="px-3 md:px-6 py-3 text-left font-medium border border-gray-200 w-10 md:w-12">#</th>
                <th className="px-3 md:px-6 py-3 text-left font-medium border border-gray-200 w-[22%]">
                  <SortBtn label="Name" col="title" />
                </th>
                <th className="px-3 md:px-6 py-3 text-left font-medium border border-gray-200 hidden lg:table-cell w-[28%]">
                  Description
                </th>
                <th className="px-3 md:px-6 py-3 text-left font-medium border border-gray-200 hidden md:table-cell w-[10%]">
                  <SortBtn label="Price" col="price" />
                </th>
                <th className="px-3 md:px-6 py-3 text-left font-medium border border-gray-200 hidden md:table-cell w-[10%]">
                  <SortBtn label="Stock" col="stock" />
                </th>
                <th className="px-3 md:px-6 py-3 text-left font-medium border border-gray-200 hidden lg:table-cell w-[15%]">
                  Category
                </th>
                <th className="px-3 md:px-6 py-3 text-left font-medium border border-gray-200 hidden xl:table-cell w-[8%]">
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
                    Product list will appear here (US-2).
                  </td>
                </tr>
              ) : (
                pageRows.map((p, i) => (
                  <tr key={p._id ?? `${p.title}-${startIdx + i}`} className="text-xs md:text-sm text-gray-700">
                    <td className="px-3 md:px-6 py-3 border border-gray-200">{startIdx + i + 1}</td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 whitespace-nowrap">{p.title}</td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 hidden lg:table-cell truncate">
                      {p.description}
                    </td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 hidden md:table-cell">{p.price}</td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 hidden md:table-cell">{p.stock}</td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 hidden lg:table-cell">
                      {(p.categories || [])[0] || ""}
                    </td>
                    <td className="px-3 md:px-6 py-3 border border-gray-200 hidden xl:table-cell text-gray-400">—</td>
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
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            Product list will appear here (US-2).
>>>>>>> Stashed changes
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pageRows.map((p, i) => (
              <li key={p._id ?? `${p.title}-${startIdx + i}`} className="px-4 py-3 flex items-center">
                <span className="w-6 text-sm text-gray-500">{startIdx + i + 1}</span>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{p.title}</div>
                  <div className="text-xs text-gray-400 truncate">{p.description}</div>
                </div>
                <div className="ml-3 text-xs text-gray-500 whitespace-nowrap">
                  ${p.price} • {p.stock}
                </div>
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

        <button
          className="h-8 w-8 rounded-xl border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || total === 0}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}