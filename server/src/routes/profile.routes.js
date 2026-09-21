const express = require("express");

const profileController = require(
  "../controllers/profile.controller"
);

const authenticate = require(
  "../middleware/auth.middleware"
);

const validate = require(
  "../middleware/validate.middleware"
);

const {
  updateProfileSchema,

  createSkillSchema,
  updateSkillSchema,

  createEducationSchema,
  updateEducationSchema,

  createExperienceSchema,
  updateExperienceSchema,
} = require(
  "../validators/profile.validator"
);

const {
  avatarUpload,
  resumeUpload,
} = require(
  "../middleware/upload.middleware"
);

const router = express.Router();

router.use(authenticate);

// ==========================================
// PROFILE
// ==========================================

router.get(
  "/me",
  profileController.getMyProfile
);

router.put(
  "/me",
  validate(updateProfileSchema),
  profileController.updateMyProfile
);

// ==========================================
// SKILLS
// ==========================================

router.post(
  "/skills",
  validate(createSkillSchema),
  profileController.createSkill
);

router.put(
  "/skills/:id",
  validate(updateSkillSchema),
  profileController.updateSkill
);

router.delete(
  "/skills/:id",
  profileController.deleteSkill
);

// ==========================================
// EDUCATIONS
// ==========================================

router.post(
  "/educations",
  validate(createEducationSchema),
  profileController.createEducation
);

router.put(
  "/educations/:id",
  validate(updateEducationSchema),
  profileController.updateEducation
);

router.delete(
  "/educations/:id",
  profileController.deleteEducation
);

// ==========================================
// EXPERIENCES
// ==========================================

router.post(
  "/experiences",
  validate(createExperienceSchema),
  profileController.createExperience
);

router.put(
  "/experiences/:id",
  validate(updateExperienceSchema),
  profileController.updateExperience
);

router.delete(
  "/experiences/:id",
  profileController.deleteExperience
);

router.post(
  "/avatar",
  avatarUpload.single("avatar"),
  profileController.uploadAvatar
);

router.post(
  "/resume",
  resumeUpload.single("resume"),
  profileController.uploadResume
);

module.exports = router;

