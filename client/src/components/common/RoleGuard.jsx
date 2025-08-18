// src/components/common/RoleGuard.jsx
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

const RoleGuard = ({ allowedRole, children }) => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);

  const role = user?.publicMetadata?.role;

  useEffect(() => {
    if (isLoaded) {
      // wait a moment for Clerk metadata to sync
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>⏳ Checking role...</p>;
  }

  if (role !== allowedRole) {
    return <p style={{ color: "red", textAlign: "center" }}>❌ Access Denied</p>;
  }

  return <>{children}</>;
};

export default RoleGuard;
