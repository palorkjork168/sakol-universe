const express = require("express");

const companyController = require(
  "../controllers/company.controller"
);

const authenticate = require(
  "../middleware/auth.middleware"
);

const validate = require(
  "../middleware/validate.middleware"
);

const {
  createCompanySchema,
  updateCompanySchema,
} = require("../validators/company.validator");

const router = express.Router();

router.post(
  "/",
  authenticate,
  validate(createCompanySchema),
  companyController.createCompany
);

router.get(
  "/my",
  authenticate,
  companyController.getMyCompanies
);

router.put(
  "/:id",
  authenticate,
  validate(updateCompanySchema),
  companyController.updateCompany
);

module.exports = router;