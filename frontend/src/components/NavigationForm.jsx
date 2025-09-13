import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";

const NavigationForm = ({
  navigations,
  setNavigations,
  editingNav,
  setEditingNav,
  showFlash,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    order: 0,
    parent: "",
  });

  useEffect(() => {
    if (editingNav) {
      setFormData({
        title: editingNav.title || "",
        slug: editingNav.slug || "",
        order: editingNav.order || 0,
        parent: editingNav.parent?._id || "",
      });
    } else {
      setFormData({ title: "", slug: "", order: 0, parent: "" });
    }
  }, [editingNav]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.slug) {
      alert("Please fill all required fields");
      return;
    }

    if (!user?.token) {
      alert("User not authenticated");
      return;
    }

    try {
      let res;

      if (editingNav?._id) {
        // Update navigation
        res = await axiosInstance.put(
          `/api/dashboard/navigations/${editingNav._id}`,
          {
            title: formData.title,
            slug: formData.slug,
            order: Number(formData.order),
            parent: formData.parent || null,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        // Replace updated nav in state
        setNavigations(
          navigations.map((n) =>
            n._id === res.data.navigation._id ? res.data.navigation : n
          )
        );
        setEditingNav(null);
        showFlash("Navigation updated successfully", "warning");
      } else {
        // Create new navigation
        res = await axiosInstance.post(
          "/api/dashboard/navigations",
          {
            title: formData.title,
            slug: formData.slug,
            order: Number(formData.order),
            parent: formData.parent || null,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        // Append new nav to state
        setNavigations([...navigations, res.data.navigation]);
        showFlash("Navigation created successfully", "success");
      }

      // Reset form
      setFormData({ title: "", slug: "", order: 0, parent: "" });
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      alert("Failed to save navigation");
      showFlash("Failed to save navigation", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mb-6">
      <input
        type="text"
        placeholder="Navigation Title"
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
      <input
        type="number"
        placeholder="Order"
        value={formData.order}
        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <select
        value={formData.parent}
        onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">-- No Parent --</option>
        {navigations
          .filter((nav) => !editingNav || nav._id !== editingNav._id) // prevent selecting itself
          .map((nav) => (
            <option key={nav._id} value={nav._id}>
              {nav.title}
            </option>
          ))}
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {editingNav ? "Update Navigation" : "Add Navigation"}
      </button>
    </form>
  );
};

export default NavigationForm;
