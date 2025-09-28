// frontend/src/pages/products/ProductTable.jsx
import React, { useMemo, useState } from "react";

/**
 * UI-only product table (CMS-155)
 * - Gray pencil (Edit) + red trash (Delete) per row
 * - Optional callbacks: onEdit(id), onDelete(id)
 * - Keeps existing dummy pagination/look
 */
export default function ProductTable({ rows: rowsProp, onEdit, onDelete }) {
  // Dummy rows for UI only when no rows passed
  const rows = useMemo(
    () =>
      rowsProp ??
      Array.from({ length: 16 }).map((_, i) => ({
        id: i + 1,
        name: "Sample",
        description: "Sample",
        price: "Sample",
        stock: "Sample",
        category: "Sample",
      })),
    [rowsProp]
  );

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const start = (page - 1) * perPage;
  const visible = rows.slice(start, start + perPage);

  const go = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  const editBtn = (id, label = "Edit") => (
    <button
      type="button"
      onClick={() => typeof onEdit === "function" && onEdit(id)}
      className="h-9 w-9 rounded-xl border bg-white hover:bg-gray-100 grid place-items-center"
      title={label}
      aria-label={label}
    >
      {/* pencil icon */}
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
  );

  const deleteBtn = (id, name = "Delete") => (
    <button
      type="button"
      onClick={() => typeof onDelete === "function" && onDelete(id)}
      className="h-9 w-9 rounded-xl bg-red-500 hover:bg-red-600 grid place-items-center text-white"
      title={name}
      aria-label={name}
    >
      {/* trash icon */}
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
  );

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* desktop header */}
      <div className="hidden md:grid grid-cols-[72px_1.2fr_2fr_1fr_1fr_1.2fr_112px] px-6 py-3 text-xs text-gray-500">
        <div>#</div>
        <div className="uppercase tracking-wide">Name</div>
        <div className="uppercase tracking-wide">Description</div>
        <div className="uppercase tracking-wide">Price</div>
        <div className="uppercase tracking-wide">Stock</div>
        <div className="uppercase tracking-wide">Category</div>
        <div className="text-right uppercase tracking-wide">Edit</div>
      </div>

      {/* rows */}
      <ul className="divide-y">
        {visible.map((r, idx) => (
          <li
            key={r.id}
            className="grid grid-cols-1 md:grid-cols-[72px_1.2fr_2fr_1fr_1fr_1.2fr_112px] items-center px-4 md:px-6 py-3 gap-2"
          >
            {/* # */}
            <div className="text-gray-500 text-sm md:text-base">{start + idx + 1}</div>

            {/* Name */}
            <div className="font-medium text-gray-800">{r.name}</div>

            {/* Description */}
            <div className="text-gray-500 truncate">{r.description}</div>

            {/* Price */}
            <div className="text-gray-700">{r.price ?? "—"}</div>

            {/* Stock */}
            <div className="text-gray-700">{r.stock ?? "—"}</div>

            {/* Category */}
            <div className="text-gray-700">{r.category ?? "—"}</div>

            {/* Actions */}
            <div className="flex md:justify-end gap-2">
              {editBtn(r.id)}
              {deleteBtn(r.id)}
            </div>
          </li>
        ))}
      </ul>

      {/* footer: “Showing …” + pagination like Figma */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-6 py-3 bg-gray-50">
        <div className="text-xs text-gray-500">
          Showing {start + 1}-{start + visible.length} of {rows.length}
        </div>

        <div className="flex items-center gap-2">
          {/* prev */}
          <button
            onClick={() => go(page - 1)}
            disabled={page === 1}
            className="h-9 w-9 rounded-xl border bg-white disabled:opacity-40"
            aria-label="Previous page"
          >
            ‹
          </button>

          {/* page numbers (1–3 buttons) */}
          {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
            const base = page <= totalPages - 2 ? page : totalPages - 2;
            const p = Math.max(1, base) + i;
            return (
              <button
                key={p}
                onClick={() => go(p)}
                className={[
                  "h-9 min-w-[36px] rounded-xl border px-3",
                  p === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-50",
                ].join(" ")}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            );
          })}

          {/* per-page selector styled “/Page” */}
          <div className="flex items-center gap-2">
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 rounded-xl border bg-white px-2"
            >
              {[10, 20, 30].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">/Page</span>
          </div>

          {/* next */}
          <button
            onClick={() => go(page + 1)}
            disabled={page === totalPages}
            className="h-9 w-9 rounded-xl border bg-white disabled:opacity-40"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
