import { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const NavigationForm = ({
  navigation,
  setNavigation,
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
      setFormData(editingNav);
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

      if (editingNav && editingNav._id) {
        // Update navigation
        res = await axiosInstance.put(
          `/api/dashboard/navigation/${editingNav._id}`,
          {
            title: formData.title,
            slug: formData.slug,
            order: Number(formData.order),
            parent: formData.parent || null,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        setNavigation(
          navigation.map((n) =>
            n._id === res.data.navigation._id ? res.data.navigation : n
          )
        );
        setEditingNav(null);
        showFlash("Navigation updated successfully", "warning");
      } else {
        // Create navigation
        res = await axiosInstance.post(
          "/api/dashboard/navigation",
          {
            title: formData.title,
            slug: formData.slug,
            order: Number(formData.order),
            parent: formData.parent || null,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        console.log("Nav response:", res);

        setNavigation([...navigation, res.data.navigation]);
        showFlash("Navigation created successfully", "success");
      }

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
      <input
        type="text"
        placeholder="Parent Navigation ID (optional)"
        value={formData.parent}
        onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
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
