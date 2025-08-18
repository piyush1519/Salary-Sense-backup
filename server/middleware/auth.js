const { requireAuth } = require("@clerk/express");

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("❌ Missing CLERK_SECRET_KEY in .env");
}

module.exports = { requireAuth };
