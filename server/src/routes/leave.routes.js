const express = require("express");
const leaveController = require("../controllers/leave.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");
const { leaveTypeSchema, leaveRequestSchema } = require("../validators/leave.validator");

const router = express.Router();

router.use(authenticate);

// --- LEAVE TYPES (Employer / Admin / HR) ---
router.get("/types/company/:companyId", leaveController.getCompanyLeaveTypes);

router.post(
  "/types",
  authorize("EMPLOYER", "ADMIN", "HR"),
  validate(leaveTypeSchema),
  leaveController.createLeaveType
);

router.put(
  "/types/:id",
  authorize("EMPLOYER", "ADMIN", "HR"),
  validate(leaveTypeSchema),
  leaveController.updateLeaveType
);

router.delete(
  "/types/:id",
  authorize("EMPLOYER", "ADMIN", "HR"),
  leaveController.deleteLeaveType
);


// --- LEAVE REQUESTS (Employee) ---
router.get("/my", authorize("EMPLOYEE", "ADMIN"), leaveController.getMyLeaveRequests);
router.get("/balance", authorize("EMPLOYEE", "ADMIN"), leaveController.getMyLeaveBalance);

router.post(
  "/requests",
  authorize("EMPLOYEE", "ADMIN"),
  validate(leaveRequestSchema),
  leaveController.createLeaveRequest
);

router.patch(
  "/requests/:id/cancel",
  authorize("EMPLOYEE", "ADMIN"),
  leaveController.cancelLeaveRequest
);


// --- LEAVE REVIEW (Employer / HR / Manager) ---
router.get("/company/:companyId/requests", authorize("EMPLOYER", "ADMIN", "HR", "MANAGER"), leaveController.getCompanyLeaveRequests);

router.patch(
  "/requests/:id/:action",
  authorize("EMPLOYER", "ADMIN", "HR", "MANAGER"),
  leaveController.reviewLeaveRequest
);



module.exports = router;
