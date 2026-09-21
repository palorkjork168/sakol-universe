const express = require("express");

const savedJobController = require("../controllers/savedJob.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/saved", authenticate, savedJobController.getSavedJobs);

router.get("/:jobId/saved", authenticate, savedJobController.checkIfSaved);

router.post("/:jobId/save", authenticate, savedJobController.saveJob);

router.delete("/:jobId/save", authenticate, savedJobController.unsaveJob);

module.exports = router;
