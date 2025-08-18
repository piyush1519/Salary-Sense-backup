import React, { useState, useRef } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import AnalyticsDashboard from "../components/common/AnalyticsDashboard";
import AdminLogs from "../components/admin/AdminLogs";
import Navbar from "../components/common/Navbar";

const cardStyle = {
  background: "#fff",
  padding: "20px",
  margin: "20px 0",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const buttonStyle = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "6px",
  background: "#007bff",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};

const disabledButtonStyle = {
  ...buttonStyle,
  background: "#aaa",
  cursor: "not-allowed",
};

const AdminDashboard = () => {
  const { user } = useUser();
  const role = user?.publicMetadata?.role;

  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [retrainMessage, setRetrainMessage] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [retrainLoading, setRetrainLoading] = useState(false);

  const logsRef = useRef(null); // Ref to trigger log refresh

  if (role !== "admin") {
    return <p style={{ color: "red", textAlign: "center" }}>❌ Access Denied</p>;
  }

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");

    const formData = new FormData();
    formData.append("file", file);

    setUploadLoading(true);
    setUploadMessage("");

    try {
      const res = await axios.post(
        "http://localhost:5000/admin/upload",
        formData,
        { withCredentials: true } // ✅ required for protected route
      );

      if (res.data.success) {
        setUploadMessage(res.data.message);
        setFile(null); // reset file input
        if (logsRef.current) logsRef.current(); // refresh logs
      } else {
        setUploadMessage("Upload failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadMessage("Upload failed. See console for details.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRetrain = async () => {
    setRetrainLoading(true);
    setRetrainMessage("");

    try {
      const res = await axios.post(
        "http://localhost:5000/admin/retrain",
        {},
        { withCredentials: true } // ✅ required
      );

      if (res.data.success) {
        setRetrainMessage(res.data.message);
        if (logsRef.current) logsRef.current(); // refresh logs
      } else {
        setRetrainMessage("Retrain failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Retrain error:", err);
      setRetrainMessage("Retrain failed. See console for details.");
    } finally {
      setRetrainLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
        <h2 style={{ textAlign: "center" }}>🛠️ Admin Dashboard</h2>
        <p style={{ textAlign: "center", color: "#555" }}>
          Manage datasets, retrain models, and view analytics.
        </p>

        {/* Upload Dataset Card */}
        <div style={cardStyle}>
          <h3>📁 Upload Dataset (.csv)</h3>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <br /><br />
          <button
            onClick={handleUpload}
            disabled={uploadLoading || !file}
            style={uploadLoading || !file ? disabledButtonStyle : buttonStyle}
          >
            {uploadLoading ? "Uploading..." : "Upload"}
          </button>
          {uploadMessage && (
            <p style={{ color: uploadMessage.includes("failed") ? "red" : "green" }}>
              {uploadMessage}
            </p>
          )}
        </div>

        {/* Retrain Model Card */}
        <div style={cardStyle}>
          <h3>🔁 Retrain Model</h3>
          <button
            onClick={handleRetrain}
            disabled={retrainLoading}
            style={retrainLoading ? disabledButtonStyle : buttonStyle}
          >
            {retrainLoading ? "Retraining..." : "Retrain Model"}
          </button>
          {retrainMessage && (
            <p style={{ color: retrainMessage.includes("failed") ? "red" : "green" }}>
              {retrainMessage}
            </p>
          )}
        </div>

        {/* Analytics & Logs */}
        <div style={cardStyle}>
          <h3>📊 Analytics</h3>
          <AnalyticsDashboard />
        </div>

        <div style={cardStyle}>
          <h3>📝 Logs</h3>
          <AdminLogs ref={logsRef} />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
