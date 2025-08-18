// server/routes/role.js
const express = require("express");
const { requireAuth } = require("@clerk/express");
const { clerkClient } = require("@clerk/express");

const router = express.Router();

router.post("/", requireAuth(), async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.auth.userId;

    if (!role) return res.status(400).json({ error: "Role is required" });

    // ✅ Update Clerk publicMetadata
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });

    res.json({ success: true, role });
  } catch (err) {
    console.error("❌ Role update failed:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
});

module.exports = router;
