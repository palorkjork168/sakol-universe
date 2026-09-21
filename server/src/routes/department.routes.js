const express = require("express");
const departmentController = require("../controllers/department.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");
const { departmentSchema } = require("../validators/department.validator");

const router = express.Router();

router.use(authenticate);

// Publicly readable within the company (e.g. for employees or job seekers browsing roles? Usually employees)
router.get("/company/:companyId", departmentController.getCompanyDepartments);

// Only EMPLOYER and ADMIN can mutate
router.post(
  "/",
  authorize("EMPLOYER", "ADMIN"),
  validate(departmentSchema),
  departmentController.createDepartment
);

router.put(
  "/:id",
  authorize("EMPLOYER", "ADMIN"),
  validate(departmentSchema),
  departmentController.updateDepartment
);

// Delete usually passes companyId in body or query to verify ownership
router.delete(
  "/:id",
  authorize("EMPLOYER", "ADMIN"),
  departmentController.deleteDepartment
);

module.exports = router;
