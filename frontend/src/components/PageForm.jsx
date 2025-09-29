// src/components/PageForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../axiosConfig.jsx";

const slugify = (s = "") =>
  s.toString().trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function PageForm() {
  const { id } = useParams();             // present => edit mode
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", slug: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState("");

  // load for edit
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/dashboard/pages/${id}`);
        setForm(res.data || {});
      } catch {
        // keep UI usable even if fetch fails
        setError("Failed to load page.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(""); // clear inline error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    // simple validation
    const title = form.title.trim();
    if (!title) {
      setError("Title is required.");
      return;
    }

    const payload = {
      title,
      slug: (form.slug?.trim() || slugify(title)),
      content: form.content ?? "",
    };

    setSaving(true);
    try {
      if (id) {
        await api.put(`/dashboard/pages/${id}`, payload);
        navigate("/dashboard/pages", {
          replace: true,
          state: { flash: { type: "success", message: "Page updated" } },
        });
      } else {
        await api.post(`/dashboard/pages`, payload);
        navigate("/dashboard/pages", {
          replace: true,
          state: { flash: { type: "success", message: "Page created" } },
        });
      }
    } catch (err) {
      setSaving(false);
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Save failed. Please try again."
      );
    }
  };

  const onCancel = () => navigate("/dashboard/pages");

  return (
    <div className="max-w-[900px] mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold mb-4">
          {id ? "Edit Page" : "Add Page"}
        </h3>

        {loading ? (
          <div className="text-gray-400">Loading…</div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl border text-sm bg-red-50 text-red-700 border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="Slug (auto if empty)"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Content</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Content"
                rows={8}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        )}

        {/* actions */}
        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="text-blue-600 hover:underline"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || loading}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : id ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
