import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../axiosConfig";
import NavigationForm from "../../components/NavigationForm";
import NavigationList from "../../components/NavigationList";
import FlashMessage from "../../components/FlashMessage";

const NavigationDashboard = () => {
  const { user } = useAuth();
  const [navigation, setNavigation] = useState([]);
  const [editingNav, setEditingNav] = useState(null);
  const [flash, setFlash] = useState({ message: "", type: "" });

  const showFlash = (message, type) => {
    setFlash({ message, type });
    setTimeout(() => setFlash({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const res = await axiosInstance.get("/api/dashboard/navigation", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setNavigation(res.data.navigation);
      } catch (err) {
        showFlash("Failed to fetch navigation", "error");
      }
    };
    if (user?.token) fetchNavigation();
  }, [user]);

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
        navigation={navigation}
        setNavigation={setNavigation}
        editingNav={editingNav}
        setEditingNav={setEditingNav}
        showFlash={showFlash}
      />
      <NavigationList
        navigation={navigation}
        setNavigation={setNavigation}
        setEditingNav={setEditingNav}
        showFlash={showFlash}
      />
    </div>
  );
};

export default NavigationDashboard;
