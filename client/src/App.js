import RoleSelector from "./components/common/RoleSelector";
import Home from "./pages/Home";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { SignIn, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/select-role" element={<RoleSelector />} />

        <Route path="/sign-in" element={<SignIn routing="path" path="/sign-in" />} />

        <Route path="/" element={
          <>
            <SignedIn><Home /></SignedIn>
            <SignedOut><RedirectToSignIn /></SignedOut>
          </>
        }/>

        <Route path="/developer" element={<DeveloperDashboard />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
