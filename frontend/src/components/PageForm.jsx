import { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const PageForm = ({ pages, setPages, editingPage, setEditingPage }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    slug: "",
  });

  useEffect(() => {
    if (editingPage) {
      setFormData(editingPage);
    } else {
      setFormData({ title: "", content: "", slug: "" });
    }
  }, [editingPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.slug) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editingPage) {
        // Update page
        const res = await axiosInstance.put(
          `/api/dashboard/pages/${editingPage._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setPages(
          pages.map((p) => (p._id === res.data.page._id ? res.data.page : p))
        );
        setEditingPage(null);
      } else {
        // Create new page
        const res = await axiosInstance.post("/api/dashboard/pages", formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPages([...pages, res.data.page]);
      }

      setFormData({ title: "", content: "", slug: "" });
    } catch (err) {
      alert("Failed to save page");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mb-6">
      <input
        type="text"
        placeholder="Page Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Slug"
        value={formData.slug}
        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <textarea
        placeholder="Content"
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        rows={5}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {editingPage ? "Update Page" : "Add Page"}
      </button>
    </form>
  );
};

export default PageForm;
