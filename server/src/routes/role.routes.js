const express = require("express");
const roleController = require("../controllers/role.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/roles", roleController.getAllRoles);
router.get("/permissions", roleController.getAllPermissions);
router.get("/roles/:id/permissions", roleController.getRolePermissions);
router.put("/roles/:id/permissions", roleController.updateRolePermissions);

module.exports = router;
