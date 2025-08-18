import React from "react";
import { useUser } from "@clerk/clerk-react";
import SalaryCharts from "../components/recruiter/SalaryCharts";
import SalaryPredictor from "../components/developer/SalaryPredictor";
import AnalyticsDashboard from "../components/common/AnalyticsDashboard";
import NavBar from "../components/common/Navbar";
import RoleGuard from "../components/common/RoleGuard";

const RecruiterDashboard = () => {
  const { user } = useUser();

  return (
    <RoleGuard allowedRole="recruiter">
      <div style={{ padding: "20px" }}>
        <NavBar />
        <h2>📊 Recruiter Dashboard</h2>
        <p>Welcome, {user?.fullName || "Recruiter"}!</p>
        <SalaryCharts />
        <AnalyticsDashboard />
        <SalaryPredictor />
      </div>
    </RoleGuard>
  );
};

export default RecruiterDashboard;
