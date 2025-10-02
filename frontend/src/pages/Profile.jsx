// frontend/src/pages/Profile.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";

function readStoredUser() {
  try {
    const raw =
      sessionStorage.getItem("user") ||
      localStorage.getItem("user") ||
      "";
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeStoredUser(next) {
  const raw = JSON.stringify(next);
  if (sessionStorage.getItem("user")) sessionStorage.setItem("user", raw);
  if (localStorage.getItem("user")) localStorage.setItem("user", raw);
}

const AVATAR_KEY = "profileAvatarDataUrl";

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

  // avatar (persisted locally so it “holds”)
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem(AVATAR_KEY) || ""
  );
  const fileRef = useRef(null);

  // flash (top-right)
  const [flash, setFlash] = useState(null);
  const pushFlash = (msg, variant = "success") => {
    setFlash({ msg, variant });
    setTimeout(() => setFlash(null), 2200);
  };

  const onChange = (key) => (e) =>
    setForm((s) => ({ ...s, [key]: e.target.value }));

  async function fetchProfile() {
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
  }

  useEffect(() => {
    (async () => {
      try {
        await fetchProfile();
      } catch (e) {
        pushFlash("Failed to fetch profile.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [user.token]);

  const choosePicture = () => fileRef.current?.click();
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatarUrl(dataUrl);
      localStorage.setItem(AVATAR_KEY, dataUrl);
      pushFlash("Picture selected.", "success");
    };
    reader.readAsDataURL(file);
  };

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

      // PUT -> update
      await axiosInstance.put("/auth/profile", payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // GET -> refresh UI with server truth
      await fetchProfile();

      // update stored user (so header pills / other readers reflect new name/email)
      const stored = readStoredUser();
      if (stored) {
        const next = {
          ...stored,
          name: payload.name || stored.name,
          email: payload.email || stored.email,
        };
        writeStoredUser(next);
      }

      pushFlash("Profile updated successfully.", "success");
    } catch (err) {
      pushFlash("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;

  const initial =
    (form.firstName?.[0] || form.email?.[0] || "U").toUpperCase();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* breadcrumb/header */}
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Profile</h1>
        <p className="text-[11px] sm:text-xs text-gray-400">Dashboard / Profile</p>
      </div>

      {/* Responsive grey panel:
          - full width on small screens
          - left-biased capped width on md+  */}
      <div className="rounded-3xl border border-gray-200 bg-gray-100
                      p-4 sm:p-6 lg:p-8 w-full
                      max-w-full md:max-w-[1240px]
                      min-h-[560px] sm:min-h-[640px] lg:min-h-[720px]">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800">
          Profile Information
        </h3>

        {/* avatar + button (stack on mobile, inline on md+) */}
        <div className="mt-3 sm:mt-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden bg-blue-600 text-white grid place-items-center font-semibold">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={choosePicture}
              className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Change Picture
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />
          </div>
        </div>

        {/* form: 1 col on mobile, 2 cols on md+ */}
        <form
          onSubmit={onSubmit}
          className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Left column */}
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                First Name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={onChange("firstName")}
                className="h-11 sm:h-12 w-full rounded-xl border border-gray-200 bg-white px-3 sm:px-4 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={onChange("lastName")}
                className="h-11 sm:h-12 w-full rounded-xl border border-gray-200 bg-white px-3 sm:px-4 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={onChange("email")}
                className="h-11 sm:h-12 w-full rounded-xl border border-gray-200 bg-white px-3 sm:px-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                University
              </label>
              <input
                type="text"
                value={form.university}
                onChange={onChange("university")}
                className="h-11 sm:h-12 w-full rounded-xl border border-gray-200 bg-white px-3 sm:px-4 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                Address
              </label>
              <textarea
                value={form.address}
                onChange={onChange("address")}
                rows={6}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 sm:p-4 outline-none focus:border-blue-500
                           min-h-[140px] sm:min-h-[200px] lg:min-h-[240px]"
                data-gramm="false"
                data-enable-grammarly="false"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Actions (stack on mobile, inline on md+) */}
          <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
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

      {/* top-right flash (kept responsive spacing) */}
      {flash && (
        <div
          className={
            "fixed right-4 sm:right-6 top-16 sm:top-24 z-[60] px-4 py-2 rounded-lg shadow border-l-4 " +
            (flash.variant === "success"
              ? "bg-green-50 text-green-700 border-green-500"
              : "bg-red-50 text-red-700 border-red-500")
          }
        >
          {flash.msg}
        </div>
      )}
    </div>
  );
}

