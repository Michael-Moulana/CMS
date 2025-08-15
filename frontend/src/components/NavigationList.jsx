import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";

const NavigationList = ({
  navigations = [], // default to empty array
  setNavigations,
  setEditingNav,
  showFlash,
}) => {
  const { user } = useAuth();

  const handleEdit = (nav) => {
    setEditingNav(nav);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axiosInstance.delete(`/api/dashboard/navigation/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setNavigations(navigations.filter((n) => n._id !== id));
      showFlash("Navigation deleted successfully", "success");
    } catch (err) {
      showFlash("Failed to delete navigation", "error");
    }
  };

  if (navigations.length === 0) {
    return <p className="text-gray-500">No navigation items yet.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Navigation Items</h2>
      <ul>
        {navigations.map((nav) => (
          <li
            key={nav._id}
            className="bg-gray-100 p-4 mb-2 rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{nav.title}</h3>
              <p>ID: {nav._id}</p>
              <p>Slug: {nav.slug}</p>
              <p>Order: {nav.order}</p>
              <p>Parent: {nav.parent?.title || "None"}</p>
              <p>
                Last modified:{" "}
                {new Date(nav.updatedAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </div>
            <div>
              <button
                onClick={() => handleEdit(nav)}
                className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(nav._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationList;
