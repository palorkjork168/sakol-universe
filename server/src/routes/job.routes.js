const express = require("express");

const jobController = require(
  "../controllers/job.controller"
);

const authenticate = require(
  "../middleware/auth.middleware"
);

const validate = require(
  "../middleware/validate.middleware"
);

const authorize = require(
  "../middleware/authorize.middleware"
);

const {
  createJobSchema,
  updateJobSchema,
} = require("../validators/job.validator");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get("/", jobController.getJobs);

router.get(
  "/my",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  jobController.getMyJobs
);

router.get("/:id", jobController.getJobById);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  validate(createJobSchema),
  jobController.createJob
);

router.put(
  "/:id",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  validate(updateJobSchema),
  jobController.updateJob
);

router.delete(
  "/:id",
  authenticate,
  authorize("EMPLOYER", "ADMIN"),
  jobController.deleteJob
);

module.exports = router;