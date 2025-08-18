import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const chartConfigs = [
  { label: "📊 Salary by Organization Size", endpoint: "org-size" },
  { label: "📈 Salary by Experience", endpoint: "experience" },
  { label: "🏢 Salary by Work Mode", endpoint: "workmode" },
  { label: "🎓 Salary by Education Level", endpoint: "education" },
  { label: "🌍 Salary by Region", endpoint: "region" },
];

const AnalyticsDashboard = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      for (const config of chartConfigs) {
        try {
          const res = await axios.get(`http://localhost:5000/api/trends/${config.endpoint}`);
          if (res.data.success) {
            setChartData((prev) => ({
              ...prev,
              [config.endpoint]: res.data.data,
            }));
          }
        } catch (err) {
          console.error(`❌ Failed to fetch ${config.endpoint}:`, err.message);
        }
      }
    };

    fetchData();
  }, []);

  const downloadReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/report/generate", {
        responseType: "blob", // Important for file download
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "salary-report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // ✅ free memory
    } catch (err) {
      console.error("❌ Error generating or downloading report:", err);
      setToast("Failed to generate PDF report.");
      setTimeout(() => setToast(""), 3000); // hide toast after 3s
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (endpoint, title) => {
    const data = chartData[endpoint];
    if (!data || data.length === 0) return null;

    return (
      <div key={endpoint} className="mb-10 bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: "var(--x-color)" }} />
            <YAxis tick={{ fill: "var(--x-color)" }} />
            <Tooltip />
            <Bar dataKey="avgSalary" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">📊 Developer Salary Insights</h2>
      
      {/* Download Report Button */}
      <button
        onClick={downloadReport}
        disabled={loading}
        className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {loading ? "Generating PDF..." : "📄 Download PDF Report"}
      </button>

      {/* Toast Message */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}

      {chartConfigs.map((cfg) => renderChart(cfg.endpoint, cfg.label))}
    </div>
  );
};

export default AnalyticsDashboard;
