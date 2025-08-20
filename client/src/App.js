import RoleSelector from "./components/common/RoleSelector";
import Home from "./pages/Home";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { SignIn } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        {/* Home is now landing page */}
        <Route path="/" element={<Home />} />

        <Route path="/sign-in" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/select-role" element={<RoleSelector />} />

        {/* Dashboards */}
        <Route path="/developer" element={<DeveloperDashboard />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
