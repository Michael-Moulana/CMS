import { useState, useEffect } from "react";
import PageForm from "../../components/PageForm";
import PageList from "../../components/PageList";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../axiosConfig";

const PagesDashboard = () => {
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch pages on mount
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await axiosInstance.get("/api/dashboard/pages", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPages(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPages();
  }, [user.token]);

  // Filter pages based on search term
  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Pages Management</h1>

      <PageForm
        pages={pages}
        setPages={setPages}
        editingPage={editingPage}
        setEditingPage={setEditingPage}
      />

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search pages by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <PageList
        pages={filteredPages}
        setPages={setPages}
        setEditingPage={setEditingPage}
      />
    </div>
  );
};

export default PagesDashboard;
