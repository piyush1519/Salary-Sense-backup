// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const { requireAuth } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow cookies/sessions from frontend
app.use(
  cors({
    origin: "http://localhost:3000", // React app URL
    credentials: true,
  })
);

app.use(express.json());
connectDB();

// ✅ Public routes (no auth needed)
app.use("/api/predict", require("./routes/predict"));
app.use("/api/trends", require("./routes/trends"));
app.use("/api/report", require("./routes/report"));
app.use("/api/role", require("./routes/role"));

// ✅ Protected admin routes (Clerk required)
app.use("/admin/upload", requireAuth(), require("./routes/upload"));
app.use("/admin/retrain", requireAuth(), require("./routes/retrain"));
app.use("/admin/logs", requireAuth(), require("./routes/logs"));

app.get("/", (req, res) => {
  res.send("🚀 Salary-Sense API running.");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
