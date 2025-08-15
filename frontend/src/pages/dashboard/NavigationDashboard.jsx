import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../axiosConfig";
import NavigationForm from "../../components/NavigationForm";
import NavigationList from "../../components/NavigationList";
import FlashMessage from "../../components/FlashMessage";

const NavigationDashboard = () => {
  const { user } = useAuth();
  const [navigations, setNavigations] = useState([]);
  const [editingNav, setEditingNav] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [flash, setFlash] = useState({ message: "", type: "" });

  const showFlash = (message, type) => {
    setFlash({ message, type });
    setTimeout(() => setFlash({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    if (!user?.token) return;

    const fetchNavigations = async () => {
      try {
        const res = await axiosInstance.get("/api/dashboard/navigation", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setNavigations(res.data.navigation);
      } catch (err) {
        showFlash("Failed to fetch navigation", "error");
      }
    };

    fetchNavigations();
  }, [user]);

  // Filter pages based on search term
  const filteredNavs = navigations.filter((navigation) =>
    navigation.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Navigation Management
      </h1>

      {flash.message && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          onClose={() => setFlash({ message: "", type: "" })}
        />
      )}

      <NavigationForm
        navigations={navigations}
        setNavigations={setNavigations}
        editingNav={editingNav}
        setEditingNav={setEditingNav}
        showFlash={showFlash}
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

      <NavigationList
        navigations={filteredNavs}
        setNavigations={setNavigations}
        setEditingNav={setEditingNav}
        showFlash={showFlash}
      />
    </div>
  );
};

export default NavigationDashboard;
