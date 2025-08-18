const express = require("express");
const router = express.Router();
const path = require("path");
const { spawn } = require("child_process");
const Log = require("../models/Log");
const sendEmail = require("../utils/sendEmail");

router.post("/", (req, res) => {
  const pyScript = path.join(__dirname, "../../ml-etl/retrain.py");
  const pyExec = path.join(__dirname, "../../ml-etl/venv/Scripts/python.exe");

  const python = spawn(pyExec, [pyScript]);
  let output = "", errorOutput = "";

  python.stdout.on("data", (data) => (output += data.toString()));
  python.stderr.on("data", (data) => (errorOutput += data.toString()));

  python.on("close", async (code) => {
    if (code !== 0) {
      console.error("Retrain error:", errorOutput);
      return res
        .status(500)
        .json({ success: false, message: "Retrain failed", error: errorOutput });
    }

    // ✅ Save the exact Python stdout message into logs
    const logDetail = output.trim() || "Model retrained (no details provided)";

    await Log.create({
      action: "Retrain Model",
      detail: logDetail, // e.g. "Model retrained with Ridge. R²=0.749, RMSE=21124.50"
    });

    // ✅ Send same info in email
    await sendEmail("✅ Salary-Sense Model Retrained", logDetail);

    res.json({ success: true, message: logDetail });
  });
});

module.exports = router;
