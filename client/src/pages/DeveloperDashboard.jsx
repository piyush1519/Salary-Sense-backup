import React from "react";
import { useUser } from "@clerk/clerk-react";
import SalaryPredictor from "../components/developer/SalaryPredictor";
import AnalyticsDashboard from "../components/common/AnalyticsDashboard";
import NavBar from "../components/common/Navbar";
import RoleGuard from "../components/common/RoleGuard";

const DeveloperDashboard = () => {
  const { user } = useUser();

  return (
    <RoleGuard allowedRole="developer">
      <div style={{ padding: "20px" }}>
        <NavBar />
        <h2>👨‍💻 Developer Dashboard</h2>
        <p>Welcome, {user?.fullName || "Developer"}!</p>
        <hr />
        <SalaryPredictor />
        <AnalyticsDashboard />
      </div>
    </RoleGuard>
  );
};

export default DeveloperDashboard;
