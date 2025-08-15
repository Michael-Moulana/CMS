import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
      <div className="flex flex-col space-y-4 max-w-sm mx-auto">
        <Link
          to="/dashboard/pages"
          className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700 transition"
        >
          Manage Pages
        </Link>
        <Link
          to="/dashboard/navigation"
          className="bg-green-600 text-white p-4 rounded text-center hover:bg-green-700 transition"
        >
          Manage Site Navigation
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
