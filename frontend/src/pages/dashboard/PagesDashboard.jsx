// UI shell for Pages management that mirrors Figma.
// Data wiring, CRUD, and responsiveness come in later subtasks.
import React from "react";
import { Link } from "react-router-dom";

export default function PagesDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Pages Management</h1>
          <p className="text-xs text-gray-400">Dashboard / Manage Pages</p>
        </div>

        {/* Search box (right) */}
        <div className="w-64">
          <input
            type="text"
            placeholder="Search By Title"
            className="w-full h-10 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Add Page button */}
      <div>
        <Link
          to="#"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm bg-white hover:bg-gray-50"
        >
          + Add Page
        </Link>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left font-medium px-6 py-4">#</th>
                <th className="text-left font-medium px-6 py-4">Title</th>
                <th className="text-left font-medium px-6 py-4">Slug</th>
                <th className="text-left font-medium px-6 py-4">Content</th>
                <th className="text-right font-medium px-6 py-4">Edit</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state row; replace with mapped rows in CRUD subtask */}
              <tr className="border-t">
                <td className="px-6 py-10 text-center text-gray-400" colSpan={5}>
                  No pages yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination footer (static for now) */}
        <div className="flex items-center justify-between p-4">
          <div className="flex gap-2">
            <button className="h-9 w-9 rounded-lg border bg-white">{'<'}</button>
            <button className="h-9 w-9 rounded-lg border bg-blue-50 text-blue-700">1</button>
            <button className="h-9 w-9 rounded-lg border bg-white">2</button>
            <button className="h-9 w-9 rounded-lg border bg-white">3</button>
            <button className="h-9 w-9 rounded-lg border bg-white">{'>'}</button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <select className="h-9 rounded-lg border px-3 bg-white">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span>/Page</span>
          </div>
        </div>
      </div>
    </div>
  );
}