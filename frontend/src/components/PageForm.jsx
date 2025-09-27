import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

export default function PageForm({
  pages,
  setPages,
  editingPage,
  setEditingPage,
  showFlash,
  onDone,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: "", slug: "", content: "" });

  // prefill in edit mode
  useEffect(() => {
    if (editingPage) {
      setFormData({
        title: editingPage.title || "",
        slug: editingPage.slug || "",
        content: editingPage.content || "",
      });
    } else {
      setFormData({ title: "", slug: "", content: "" });
    }
  }, [editingPage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showFlash("Title and Content are required", "error");
      return;
    }
    if (!user?.token) {
      showFlash("Not authenticated", "error");
      return;
    }

    try {
      if (editingPage && editingPage._id) {
        // update
        const res = await axiosInstance.put(
          `/dashboard/pages/${editingPage._id}`,
          { ...formData },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setPages((prev) => prev.map((p) => (p._id === res.data.page._id ? res.data.page : p)));
        showFlash("Page updated", "success");
      } else {
        // create
        const res = await axiosInstance.post(
          "/dashboard/pages",
          { ...formData },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setPages((prev) => [...prev, res.data.page]);
        showFlash("Page created", "success");
      }

      setEditingPage(null);
      setFormData({ title: "", slug: "", content: "" });
      if (onDone) onDone();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      showFlash("Save failed", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-sm font-medium text-gray-500 mb-4">
        {editingPage ? "Edit Page" : "Add Page"}
      </h2>

      <div className="space-y-4">
        <input
          name="title"
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full h-10 rounded-xl border border-gray-300 px-3 text-sm"
        />

        <input
          name="slug"
          type="text"
          placeholder="Slug"
          value={formData.slug}
          onChange={handleChange}
          className="w-full h-10 rounded-xl border border-gray-300 px-3 text-sm"
        />

        <textarea
          name="content"
          placeholder="Content"
          value={formData.content}
          onChange={handleChange}
          rows={6}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        {editingPage && (
          <button
            type="button"
            onClick={() => {
              setEditingPage(null);
              if (onDone) onDone();
            }}
            className="px-4 h-10 rounded-xl border text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 h-10 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          {editingPage ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}