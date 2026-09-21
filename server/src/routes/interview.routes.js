const express = require("express");

const interviewController = require("../controllers/interview.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createInterviewSchema,
  updateInterviewSchema,
  completeInterviewSchema,
} = require("../validators/interview.validator");

const router = express.Router();

// Employer schedules an interview
router.post(
  "/",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  validate(createInterviewSchema),
  interviewController.createInterview
);

// Employer lists all interviews across owned jobs
router.get(
  "/employer/my",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  interviewController.getEmployerInterviews
);

// Job Seeker lists all their scheduled interviews
router.get(
  "/my",
  authenticate,
  authorize("JOB_SEEKER", "ADMIN"),
  interviewController.getMyInterviews
);

// Get interviews for a specific application
router.get(
  "/application/:applicationId",
  authenticate,
  interviewController.getApplicationInterviews
);

// Get interview detail by ID
router.get(
  "/:id",
  authenticate,
  interviewController.getInterviewById
);

// Employer updates scheduled interview
router.put(
  "/:id",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  validate(updateInterviewSchema),
  interviewController.updateInterview
);

// Employer cancels interview
router.patch(
  "/:id/cancel",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  interviewController.cancelInterview
);

// Employer marks interview completed
router.patch(
  "/:id/complete",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  validate(completeInterviewSchema),
  interviewController.completeInterview
);

module.exports = router;
