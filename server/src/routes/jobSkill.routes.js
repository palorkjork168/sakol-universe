const express = require("express");

const jobSkillController = require(
  "../controllers/jobSkill.controller"
);

const authenticate = require(
  "../middleware/auth.middleware"
);

const validate = require(
  "../middleware/validate.middleware"
);

const {
  createJobSkillSchema,
} = require(
  "../validators/jobSkill.validator"
);

const router = express.Router();

router.post(
  "/:jobId/skills",
  authenticate,
  validate(createJobSkillSchema),
  jobSkillController.addJobSkill
);

router.get(
  "/:jobId/skills",
  jobSkillController.getJobSkills
);

router.delete(
  "/:jobId/skills/:id",
  authenticate,
  jobSkillController.deleteJobSkill
);

module.exports = router;