import React from "react";

export default function ProductTable({
  items = [],
  loading = false,
  sort = { key: "name", dir: "asc" },
  onSort,
  onEdit,
  onDelete,
}) {
  const Th = ({ k, children, extra = "" }) => (
    <th className={`text-left font-medium px-6 py-4 ${extra}`}>
      <button
        type="button"
        onClick={() => onSort?.(k)}
        className="inline-flex items-center gap-1 text-gray-600"
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
    <div className="rounded-2xl ring-1 ring-gray-200 overflow-hidden bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left font-medium px-6 py-4 w-12">#</th>
            <Th k="name">Name</Th>
            <Th k="description">Description</Th>
            <Th k="price">Price</Th>
            <Th k="stock">Stock</Th>
            <Th k="category">Category</Th>
            <th className="text-right font-medium px-6 py-4 text-blue-600">Edit</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-gray-400">Loading…</td>
            </tr>
          )}
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-gray-400">No products found.</td>
            </tr>
          )}
          {!loading &&
            items.map((p, i) => (
              <tr key={p._id ?? i} className="border-t hover:bg-gray-50/60">
                <td className={cell}>{i + 1}</td>
                <td className={`${cell} font-medium`}>{p.title || p.name}</td>
                <td className={`${cell} text-gray-600 truncate`}>{p.description || "—"}</td>
                <td className={cell}>{p.price ?? "—"}</td>
                <td className={cell}>{p.stock ?? "—"}</td>
                <td className={cell}>
                  {Array.isArray(p.categories) ? p.categories.join(", ") : String(p.category ?? "—")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit?.(p._id)}
                      className="h-9 w-9 rounded-xl border bg-white hover:bg-gray-100 grid place-items-center"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete?.(p._id)}
                      className="h-9 w-9 rounded-xl bg-red-500 hover:bg-red-600 grid place-items-center text-white"
                      title="Delete"
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
            ))}
        </tbody>
      </table>
    </div>
  );
}
