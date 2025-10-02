import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust path if needed
import axiosInstance from "../axiosConfig";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get("/auth/profile", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const [first = "", ...rest] = (data.name || "").split(" ");
        const last = rest.join(" ");
        setForm({
          firstName: first,
          lastName: last,
          email: data.email || "",
          university: data.university || "",
          address: data.address || "",
        });
      } catch {
        alert("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user.token]);

  const onChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: `${form.firstName || ""} ${form.lastName || ""}`.trim(),
        email: form.email,
        university: form.university,
        address: form.address,
      };
      await axiosInstance.put("/auth/profile", payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert("Profile updated successfully!");
    } catch {
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Profile</h1>
        <p className="text-xs text-gray-400">Dashboard / Profile</p>
      </div>

      {/* Big grey card, slightly left-biased (no mx-auto) */}
      <div className="rounded-3xl border border-gray-200 bg-gray-100 p-6 md:p-8 max-w-6xl">
        {/* Title on left */}
        <h3 className="text-base font-semibold text-gray-800">Profile Information</h3>

        {/* Avatar + Change Picture on LEFT, under the title */}
        <div className="mt-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-600 text-white grid place-items-center font-semibold">
            {form.firstName?.[0]?.toUpperCase() || "U"}
          </div>
          <button
            type="button"
            className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Change Picture
          </button>
        </div>

        {/* Form grid */}
        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-2">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={onChange("firstName")}
                placeholder="sample"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={onChange("lastName")}
                placeholder="sample"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={onChange("email")}
                placeholder="sample"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-2">University</label>
              <input
                type="text"
                value={form.university}
                onChange={onChange("university")}
                placeholder="sample"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Address</label>
              <textarea
                value={form.address}
                onChange={onChange("address")}
                placeholder="sample"
                rows={6}
                className="w-full rounded-xl border border-gray-200 bg-white p-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-10 px-4 rounded-xl border bg-white hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Updating…" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}