// src/components/common/RoleGuard.jsx
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

const RoleGuard = ({ allowedRole, children }) => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(false);

  const role = user?.publicMetadata?.role;

  useEffect(() => {
    if (isLoaded) {
      // Initial wait for Clerk metadata
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // If role check fails, retry once after reload
  useEffect(() => {
    if (!loading && isLoaded && role !== allowedRole && !retry) {
      const timer = setTimeout(() => {
        window.location.reload(); // 🔄 hard refresh
        setRetry(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, isLoaded, role, allowedRole, retry]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>⏳ Checking role...</p>;
  }

  if (role !== allowedRole) {
    return <p style={{ color: "red", textAlign: "center" }}>❌ Access Denied</p>;
  }

  return <>{children}</>;
};

export default RoleGuard;
