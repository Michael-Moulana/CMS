// frontend/src/components/NavigationForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";

export default function NavigationForm({
  navigations,
  setNavigations,
  editingNav,
  setEditingNav,
  showFlash,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

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
          `/dashboard/navigations/${editingNav._id}`,
          {
            title: formData.title,
            slug: formData.slug,
            order: Number(formData.order),
            parent: formData.parent || null,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        setNavigations(
          navigations.map((n) =>
            n._id === res.data.navigation._id ? res.data.navigation : n
          )
        );
        setEditingNav?.(null);
        showFlash?.("Navigation updated successfully", "warning");
      } else {
        // Create new navigation
        res = await axiosInstance.post(
          "/dashboard/navigations",
          {
            title: formData.title,
            slug: formData.slug,
            order: Number(formData.order),
            parent: formData.parent || null,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        setNavigations?.([...navigations, res.data.navigation]);
        showFlash?.("Navigation created successfully", "success");
      }

      setFormData({ title: "", slug: "", order: 0, parent: "" });
      // optional: go back to the list
      // navigate("/dashboard/navigations");
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      alert("Failed to save navigation");
      showFlash?.("Failed to save navigation", "error");
    }
  };

  const label = editingNav ? "Edit Navigation" : "Create Navigation";

  return (
    <div className="w-full">
      {/* big rounded grey panel, a bit left-leaning by occupying full content width */}
      <div className="rounded-3xl border border-gray-200 bg-gray-100 shadow-sm p-5 md:p-8 max-w-[1200px]">
        <h3 className="text-lg font-semibold mb-5">{label}</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Title
            </label>
            <input
              type="text"
              placeholder="sample"
              value={formData.title}
              onChange={(e) =>
                setFormData((s) => ({ ...s, title: e.target.value }))
              }
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Slug
            </label>
            <input
              type="text"
              placeholder="sample"
              value={formData.slug}
              onChange={(e) =>
                setFormData((s) => ({ ...s, slug: e.target.value }))
              }
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Order
            </label>
            <input
              type="number"
              placeholder="0"
              value={formData.order}
              onChange={(e) =>
                setFormData((s) => ({ ...s, order: e.target.value }))
              }
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
            />
          </div>

          {/* Parent */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Parent
            </label>
            <select
              value={formData.parent}
              onChange={(e) =>
                setFormData((s) => ({ ...s, parent: e.target.value }))
              }
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
            >
              <option value="">select</option>
              {Array.isArray(navigations) &&
                navigations
                  .filter((nav) => !editingNav || nav._id !== editingNav._id)
                  .map((nav) => (
                    <option key={nav._id} value={nav._id}>
                      {nav.title}
                    </option>
                  ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-1 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-10 px-4 rounded-xl border bg-white hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              {editingNav ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
