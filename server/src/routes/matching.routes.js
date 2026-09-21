const express = require("express");

const matchingController =
  require(
    "../controllers/matching.controller"
  );

const authenticate =
  require(
    "../middleware/auth.middleware"
  );

const router = express.Router();

router.get(
  "/recommended",
  authenticate,
  matchingController.getRecommendedJobs
);

module.exports = router;