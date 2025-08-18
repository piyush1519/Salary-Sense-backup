import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const RoleSelector = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const selectRole = async (role) => {
    try {
      const token = await getToken(); // 🔑 Clerk JWT

      const res = await fetch("http://localhost:5000/api/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ send token
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update role");
      }

      if (role === "developer") navigate("/developer");
      else if (role === "recruiter") navigate("/recruiter");
    } catch (err) {
      console.error("❌ Role update failed:", err);
      alert("Failed to set role. Try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Select Your Role</h2>
      <button onClick={() => selectRole("developer")}>Developer</button>
      <button onClick={() => selectRole("recruiter")}>Recruiter</button>
    </div>
  );
};

export default RoleSelector;
