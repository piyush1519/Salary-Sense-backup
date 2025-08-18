import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const Home = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <p>Loading...</p>;
  if (!isSignedIn) return <Navigate to="/sign-in" />;

  const role = user?.publicMetadata?.role?.toLowerCase();

  if (!role) return <Navigate to="/select-role" />; // redirect to role selection

  if (role === "developer") return <Navigate to="/developer" />;
  if (role === "recruiter") return <Navigate to="/recruiter" />;
  if (role === "admin") return <Navigate to="/admin" />; // hardcoded

  return <p>Invalid role. Contact admin.</p>;
};

export default Home;
