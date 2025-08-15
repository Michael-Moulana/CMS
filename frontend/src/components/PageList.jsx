import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const PageList = ({ pages, setPages, setEditingPage }) => {
  const { user } = useAuth();

  const handleEdit = (page) => {
    setEditingPage(page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;

    try {
      await axiosInstance.delete(`/api/dashboard/pages/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPages(pages.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete page");
    }
  };

  if (pages.length === 0) return <p>No pages created yet.</p>;

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
              <h3 className="font-bold">{page.title}</h3>
              <p>{page.content}</p>
              <small>Created by: {page.createdBy}</small>
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
