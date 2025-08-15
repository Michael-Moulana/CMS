import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import PageForm from "../components/PageForm";
import PageList from "../components/PageList";

const Dashboard = () => {
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await axiosInstance.get("/api/dashboard/pages", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPages(res.data);
      } catch (err) {
        alert("Failed to fetch pages.");
      }
    };
    if (user) fetchPages();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">CMS Dashboard</h1>
      <PageForm
        pages={pages}
        setPages={setPages}
        editingPage={editingPage}
        setEditingPage={setEditingPage}
      />
      <PageList
        pages={pages}
        setPages={setPages}
        setEditingPage={setEditingPage}
      />
    </div>
  );
};

export default Dashboard;
