const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");

// Get admin dashboard stats
router.get("/dashboard", authenticate, authorize("ADMIN"), adminController.getDashboardStats);

module.exports = router;
