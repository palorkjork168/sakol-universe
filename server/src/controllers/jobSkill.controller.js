const jobSkillService = require(
  "../services/jobSkill.service"
);

const addJobSkill = async (
  req,
  res,
  next
) => {
  try {
    const skill =
      await jobSkillService.addJobSkill(
        req.params.jobId,
        req.user,
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Job skill added successfully!",
      data: {
        skill,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getJobSkills = async (
  req,
  res,
  next
) => {
  try {
    const skills =
      await jobSkillService.getJobSkills(
        req.params.jobId
      );

    res.status(200).json({
      success: true,
      data: {
        skills,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteJobSkill = async (
  req,
  res,
  next
) => {
  try {
    await jobSkillService.deleteJobSkill(
      req.params.jobId,
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message:
        "Job skill deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addJobSkill,
  getJobSkills,
  deleteJobSkill,
};