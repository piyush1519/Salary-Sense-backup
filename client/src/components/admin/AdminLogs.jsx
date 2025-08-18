import React, { useEffect, useState } from "react";
import axios from "axios";

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const thStyle = {
  borderBottom: "2px solid #ddd",
  padding: "10px",
  textAlign: "left",
  background: "#f4f4f4",
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "10px",
};

const AdminLogs = ({ retrainMessage, uploadMessage }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/admin/logs", {
        withCredentials: true, // ✅ required for protected route
      });

      if (res.data.success) {
        // Reverse so latest logs appear first
        setLogs(res.data.data.reverse());
      } else {
        setError("Failed to fetch logs.");
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setError("Error fetching logs.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs on mount and whenever retrain/upload messages change
  useEffect(() => {
    fetchLogs();
  }, [retrainMessage, uploadMessage]);

  if (loading) return <p>Loading logs...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>🧾 Activity Logs</h3>
      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td style={tdStyle}>{new Date(log.timestamp).toLocaleString()}</td>
                <td
                  style={{
                    ...tdStyle,
                    color:
                      log.action === "Retrain Model"
                        ? "#007bff"
                        : "#28a745",
                  }}
                >
                  {log.action}
                </td>
                <td style={tdStyle}>{log.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminLogs;
