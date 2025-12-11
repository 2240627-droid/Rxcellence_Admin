const express = require("express");
const router = express.Router();
const {
  dashboard,
  getUsers,
  updateUserStatus,
  exportUsersCSV,
  bulkUpdateUsersStatus,
  bulkDeleteUsers,
} = require("../controller/usermanagementController");

// Redirect /admin to /admin/dashboard
router.get("/", (req, res) => {
  res.redirect("/admin/dashboard");
});

// Dashboard route
router.get("/dashboard", dashboard);

// Fetch all users with optional filters
router.get("/users", getUsers);

// Update user status (approve, reject, suspend, activate)
router.post("/users/:id/status", updateUserStatus);

// Export users to CSV
router.get("/export", exportUsersCSV);

// Bulk status update
router.post("/users/bulk-status", bulkUpdateUsersStatus);

// CSV export (already exists)
router.get("/export", exportUsersCSV);

router.post("/users/bulk-delete", bulkDeleteUsers);

module.exports = router;
