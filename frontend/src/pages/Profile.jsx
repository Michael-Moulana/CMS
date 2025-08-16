import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";

const Profile = () => {
  const { user } = useAuth(); // already contains token
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({
          name: data.name || "",
          email: data.email || "",
          university: data.university || "",
          address: data.address || "",
        });
      } catch (error) {
        console.error(
          "Failed to fetch profile:",
          error.response?.data || error.message
        );
        alert("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile(); // always attempt, backend will reject if unauthorized
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axiosInstance.put("/api/auth/profile", formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(
        "Failed to update profile:",
        error.response?.data || error.message
      );
      alert("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Loading profile...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Profile</h1>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="University"
          value={formData.university}
          onChange={(e) =>
            setFormData({ ...formData, university: e.target.value })
          }
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
          disabled={updating}
        >
          {updating ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
