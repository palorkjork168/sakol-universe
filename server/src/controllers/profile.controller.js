const profileService = require(
  "../services/profile.service"
);

// ==========================================
// PROFILE
// ==========================================

const getMyProfile = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await profileService.getMyProfile(
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await profileService.updateMyProfile(
        req.user.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Profile updated successfully!",
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SKILLS
// ==========================================

const createSkill = async (
  req,
  res,
  next
) => {
  try {
    const skill =
      await profileService.createSkill(
        req.user.id,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Skill added successfully!",
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

const updateSkill = async (
  req,
  res,
  next
) => {
  try {
    const skill =
      await profileService.updateSkill(
        req.params.id,
        req.user.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Skill updated successfully!",
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

const deleteSkill = async (
  req,
  res,
  next
) => {
  try {
    await profileService.deleteSkill(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message:
        "Skill deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EDUCATION
// ==========================================

const createEducation = async (
  req,
  res,
  next
) => {
  try {
    const education =
      await profileService.createEducation(
        req.user.id,
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Education added successfully!",
      data: { education },
    });
  } catch (error) {
    next(error);
  }
};

const updateEducation = async (
  req,
  res,
  next
) => {
  try {
    const education =
      await profileService.updateEducation(
        req.params.id,
        req.user.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Education updated successfully!",
      data: { education },
    });
  } catch (error) {
    next(error);
  }
};

const deleteEducation = async (
  req,
  res,
  next
) => {
  try {
    await profileService.deleteEducation(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message:
        "Education deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EXPERIENCE
// ==========================================

const createExperience = async (
  req,
  res,
  next
) => {
  try {
    const experience =
      await profileService.createExperience(
        req.user.id,
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Experience added successfully!",
      data: { experience },
    });
  } catch (error) {
    next(error);
  }
};

const updateExperience = async (
  req,
  res,
  next
) => {
  try {
    const experience =
      await profileService.updateExperience(
        req.params.id,
        req.user.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Experience updated successfully!",
      data: { experience },
    });
  } catch (error) {
    next(error);
  }
};

const deleteExperience = async (
  req,
  res,
  next
) => {
  try {
    await profileService.deleteExperience(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message:
        "Experience deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await profileService.uploadAvatar(
        req.user.id,
        req.file
      );

    res.status(200).json({
      success: true,
      message:
        "Avatar uploaded successfully!",
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

const uploadResume = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await profileService.uploadResume(
        req.user.id,
        req.file
      );

    res.status(200).json({
      success: true,
      message:
        "Resume uploaded successfully!",
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,

  createSkill,
  updateSkill,
  deleteSkill,

  createEducation,
  updateEducation,
  deleteEducation,

  createExperience,
  updateExperience,
  deleteExperience,

  uploadAvatar,
  uploadResume,
};