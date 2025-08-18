// routes/report.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const Log = require("../models/Log"); // optional, for logging
const runPython = require("../utils/runPython"); // utility to run Python script

const router = express.Router();
const datasetPath = path.join(__dirname, "../../ml-etl/uploads/dataset.csv");
const reportScript = path.join(__dirname, "../../ml-etl/generate_report.py");
const pdfPath = path.join(__dirname, "../../ml-etl/uploads/salary-report.pdf");

// GET /api/report/generate
router.get("/generate", async (req, res) => {
  try {
    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({ success: false, message: "Dataset not found" });
    }

    // Remove old PDF if exists
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

    // Run Python script
    await runPython("python", reportScript, [datasetPath]);

    // Make sure PDF was generated
    if (!fs.existsSync(pdfPath)) {
      return res.status(500).json({ success: false, message: "PDF not generated" });
    }

    // Optional: log the report generation
    await Log.create({
      action: "Report Generated",
      detail: `Report generated using dataset.csv at ${new Date().toLocaleString()}`,
      timestamp: new Date(),
    });

    // Stream PDF to frontend
    res.download(pdfPath, "salary-report.pdf", (err) => {
      if (err) {
        console.error("Error sending PDF:", err);
        res.status(500).json({ success: false, message: "Failed to send PDF" });
      }
    });
  } catch (err) {
    console.error("Report generation error:", err);
    res.status(500).json({ success: false, message: "Report generation failed", error: err.message });
  }
});

module.exports = router;
