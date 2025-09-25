// frontend/src/pages/products/ProductTable.jsx
import React, { useMemo, useState } from "react";

export default function ProductTable() {
  // Dummy rows for UI only (US-2 / Subtask-1). Real data comes in Subtask-2.
  const rows = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i + 1,
        name: "Sample",
        description: "sample desc",
      })),
    []
  );

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const start = (page - 1) * perPage;
  const visible = rows.slice(start, start + perPage);

  const go = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* header row */}
      <div className="hidden md:grid grid-cols-[72px_1fr_2fr] px-6 py-3 text-xs text-gray-500">
        <div>#</div>
        <div className="uppercase tracking-wide">Name</div>
        <div className="uppercase tracking-wide">Description</div>
      </div>

      {/* rows */}
      <ul className="divide-y">
        {visible.map((r, idx) => (
          <li
            key={r.id}
            className="grid grid-cols-1 md:grid-cols-[72px_1fr_2fr] items-center px-4 md:px-6 py-3"
          >
            <div className="text-gray-500 text-sm md:text-base">{start + idx + 1}</div>
            <div className="font-medium text-gray-800">Sample</div>
            <div className="text-gray-500 truncate">sample desc</div>
          </li>
        ))}
      </ul>

      {/* footer: “Showing …” + pagination like Figma */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-6 py-3 bg-gray-50">
        <div className="text-xs text-gray-500">
          Showing {start + 1}-{start + visible.length} of {rows.length}
        </div>

        <div className="flex items-center gap-2">
          {/* left chevron */}
          <button
            onClick={() => go(page - 1)}
            disabled={page === 1}
            className="h-9 w-9 rounded-xl border bg-white disabled:opacity-40"
            aria-label="Previous page"
          >
            ‹
          </button>

          {/* page numbers (1–3 buttons max for this UI pass) */}
          {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
            // show current page, and next two pages if available
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

          {/* right chevron */}
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