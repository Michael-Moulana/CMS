// frontend/src/components/NavigationForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";

export default function NavigationForm({
  navigations,          // optional (from dashboard)
  setNavigations,       // optional (from dashboard)
  editingNav,           // optional (from dashboard)
  setEditingNav,        // optional (from dashboard)
  showFlash,            // optional (from dashboard)
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // support routed edit

  // local fallback options for Parent dropdown when props aren't supplied
  const [navOptions, setNavOptions] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    order: 0,
    parent: "",
  });

  const isEditing = Boolean(editingNav?._id || id);
  const editId = editingNav?._id || id;

  // prefer options from props; otherwise use local fallback
  const allOptions = Array.isArray(navigations) && navigations.length
    ? navigations
    : navOptions;

  /** 1) Pre-fill from editingNav if provided by parent */
  useEffect(() => {
    if (editingNav) {
      setFormData({
        title: editingNav.title || "",
        slug: editingNav.slug || "",
        order: editingNav.order || 0,
        parent: editingNav.parent?._id || "",
      });
    } else if (!id) {
      setFormData({ title: "", slug: "", order: 0, parent: "" });
    }
  }, [editingNav, id]);

  /** 2) If opened via route (/.../:id/edit), fetch the record to pre-fill */
  useEffect(() => {
    if (!id || editingNav || !user?.token) return;

    (async () => {
      try {
        const res = await axiosInstance.get(`/dashboard/navigations/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const nav = res.data?.navigation || res.data || {};
        setFormData({
          title: nav.title || "",
          slug: nav.slug || "",
          order: nav.order || 0,
          parent: nav.parent?._id || "",
        });
      } catch {
        // fallback: fetch list and find by id
        try {
          const list = await axiosInstance.get(`/dashboard/navigations`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          const arr = list.data?.navigation || list.data || [];
          const nav = Array.isArray(arr) ? arr.find((n) => n._id === id) : null;
          if (nav) {
            setFormData({
              title: nav.title || "",
              slug: nav.slug || "",
              order: nav.order || 0,
              parent: nav.parent?._id || "",
            });
          }
          // populate local options for Parent select if props aren't present
          if (!Array.isArray(navigations) || !navigations.length) {
            setNavOptions(arr);
          }
        } catch { /* ignore */ }
      }
    })();
  }, [id, editingNav, user, navigations]);

  /** 3) Ensure Parent dropdown has options when props aren't supplied */
  useEffect(() => {
    // If parent already passed options, do nothing
    if ((Array.isArray(navigations) && navigations.length) || !user?.token) return;

    (async () => {
      try {
        const list = await axiosInstance.get(`/dashboard/navigations`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const arr = list.data?.navigation || list.data || [];
        // If dashboard passed a setter, sync it; otherwise keep local fallback
        if (setNavigations) setNavigations(arr);
        else setNavOptions(arr);
      } catch { /* ignore */ }
    })();
  }, [navigations, setNavigations, user]);

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
      if (isEditing) {
        res = await axiosInstance.put(
          `/dashboard/navigations/${editId}`,
          {
            title: formData.title,
            slug: formData.slug,
            order: Number(formData.order),
            parent: formData.parent || null,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        setNavigations?.((prev) =>
          Array.isArray(prev)
            ? prev.map((n) =>
                n._id === res.data.navigation._id ? res.data.navigation : n
              )
            : prev
        );
        setEditingNav?.(null);
        showFlash?.("Navigation updated successfully", "warning");

        navigate("/dashboard/navigations", {
          replace: true,
          state: { flash: { type: "warning", message: "Navigation updated successfully" } },
        });
      } else {
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

        setNavigations?.([...(Array.isArray(navigations) ? navigations : []), res.data.navigation]);
        // also add to local fallback so the dropdown updates immediately
        setNavOptions((prev) => [...prev, res.data.navigation]);

        showFlash?.("Navigation created successfully", "success");
        navigate("/dashboard/navigations", {
          replace: true,
          state: { flash: { type: "success", message: "Navigation created successfully" } },
        });
      }

      setFormData({ title: "", slug: "", order: 0, parent: "" });
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      alert("Failed to save navigation");
      showFlash?.("Failed to save navigation", "error");
      navigate("/dashboard/navigations", {
        replace: true,
        state: { flash: { type: "error", message: "Failed to save navigation" } },
      });
    }
  };

  const label = isEditing ? "Edit Navigation" : "Create Navigation";

  return (
    <div className="w-full">
      <div className="rounded-3xl border border-gray-200 bg-gray-100 shadow-sm p-5 md:p-8 max-w-[1200px]">
        <h3 className="text-lg font-semibold mb-5">{label}</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
            <input
              type="text"
              placeholder="sample"
              value={formData.title}
              onChange={(e) => setFormData((s) => ({ ...s, title: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Slug</label>
            <input
              type="text"
              placeholder="sample"
              value={formData.slug}
              onChange={(e) => setFormData((s) => ({ ...s, slug: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Order</label>
            <input
              type="number"
              placeholder="0"
              value={formData.order}
              onChange={(e) => setFormData((s) => ({ ...s, order: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
            />
          </div>

          {/* Parent */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Parent</label>
            <select
              value={formData.parent}
              onChange={(e) => setFormData((s) => ({ ...s, parent: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
            >
              <option value="">select</option>
              {allOptions
                .filter((nav) => !editId || nav._id !== editId) // don't allow selecting itself
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
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}