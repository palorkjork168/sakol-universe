const express = require("express");

const applicationController = require(
  "../controllers/application.controller"
);

const authenticate = require(
  "../middleware/auth.middleware"
);

const authorize = require(
  "../middleware/authorize.middleware"
);

const validate = require(
  "../middleware/validate.middleware"
);

const {
  createApplicationSchema,
  updateApplicationStatusSchema,
  hireApplicantSchema,
} = require(
  "../validators/application.validator"
);

const router = express.Router();

// Job seeker applies for a job
router.post(
  "/jobs/:jobId/apply",
  authenticate,
  authorize("JOB_SEEKER"),
  validate(createApplicationSchema),
  applicationController.applyForJob
);

// Get my applications
router.get(
  "/my",
  authenticate,
  applicationController.getMyApplications
);

// Employer views applicants for a job
router.get(
  "/job/:jobId",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  applicationController.getJobApplications
);

// Employer updates application status
router.patch(
  "/:id/status",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  validate(updateApplicationStatusSchema),
  applicationController.updateApplicationStatus
);

router.get(
  "/:id/applicant",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  applicationController.getApplicantDetails
);

// Employer hires accepted applicant
router.post(
  "/:id/hire",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  validate(hireApplicantSchema),
  applicationController.hireApplicant
);

module.exports = router;