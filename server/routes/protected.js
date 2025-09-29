const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

router.get("/user-data", authMiddleware, (req, res) => {
  res.json({ message: "This is protected user data", user: req.user });
});

router.get("/admin-data", authMiddleware, adminOnly, (req, res) => {
  res.json({ message: "This is protected admin data" });
});

module.exports = router;
