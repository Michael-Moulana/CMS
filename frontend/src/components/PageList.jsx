import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const PageList = ({ pages, setPages, setEditingPage, showFlash }) => {
  const { user } = useAuth();

  const handleEdit = (page) => {
    setEditingPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth", // smooth scroll animation
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;

    try {
      await axiosInstance.delete(`/api/dashboard/pages/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPages(pages.filter((p) => p._id !== id));
      showFlash("Page deleted successfully", "error");
    } catch (err) {
      showFlash("Failed to delete page", "error");
    }
  };

  if (!pages || pages.length === 0) return <p>No pages created yet.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pages</h2>
      <ul>
        {pages.map((page) => (
          <li
            key={page._id}
            className="bg-gray-100 p-4 mb-2 rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">Title: {page.title}</h3>
              <p>Slug: {page.slug}</p>
              <small>Page id: {page._id}</small>
              <br />
              <small>
                Last modified:{" "}
                {new Date(page.updatedAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </small>
            </div>
            <div>
              <button
                onClick={() => handleEdit(page)}
                className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(page._id)}
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

export default PageList;
