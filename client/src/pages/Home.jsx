// pages/Home.jsx
import { useUser, SignInButton } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const Home = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <p>Loading...</p>;

  // If not signed in → show landing content
  if (!isSignedIn) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1>Welcome to Salary-Sense 🚀</h1>
        <p>Smart salary prediction platform for developers and recruiters.</p>
        <SignInButton mode="redirect">
          <button style={{ padding: "0.8rem 1.5rem", marginTop: "1rem" }}>
            Sign In
          </button>
        </SignInButton>
      </div>
    );
  }

  // If signed in → role-based redirect
  const role = user?.publicMetadata?.role?.toLowerCase();

  if (!role) return <Navigate to="/select-role" />;
  if (role === "developer") return <Navigate to="/developer" />;
  if (role === "recruiter") return <Navigate to="/recruiter" />;
  if (role === "admin") return <Navigate to="/admin" />;

  return <p>Invalid role. Contact admin.</p>;
};

export default Home;
