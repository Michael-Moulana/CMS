import { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const PageForm = ({
  pages,
  setPages,
  editingPage,
  setEditingPage,
  showFlash,
}) => {
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

    if (!formData.title || !formData.content) {
      alert("Please fill all fields");
      return;
    }

    if (!user?.token) {
      alert("User not authenticated");
      return;
    }

    try {
      let res;

      if (editingPage && editingPage._id) {
        // Update page
        res = await axiosInstance.put(
          `/api/dashboard/pages/${editingPage._id}`,
          {
            title: formData.title,
            content: formData.content,
            slug: formData.slug,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        // Update pages state
        setPages(
          pages.map((p) => (p._id === res.data.page._id ? res.data.page : p))
        );
        setEditingPage(null);
        showFlash("Page updated successfully", "warning");
      } else {
        // Create new page
        res = await axiosInstance.post(
          "/api/dashboard/pages",
          {
            title: formData.title,
            content: formData.content,
            slug: formData.slug,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setPages([...pages, res.data.page]);
        showFlash("Page created successfully", "success");
      }

      // Clear form
      setFormData({ title: "", content: "", slug: "" });
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      alert("Failed to save page");
      showFlash("Failed to save page", "error"); // red for errors
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
