const {
  Job,
  JobSkill,
  Company,
} = require("../models");
const authorizationService = require("./authorization.service");

const addJobSkill = async (
  jobId,
  user,
  skillData
) => {
  const job = await Job.findByPk(jobId, {
    include: [
      {
        model: Company,
        attributes: ["id", "owner_id"],
      },
    ],
  });

  if (!job) {
    const error = new Error(
      "Job not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const hasPerm = await authorizationService.hasCompanyPermission(
    user,
    job.Company.id,
    "jobs.update"
  );

  if (!hasPerm) {
    const error = new Error(
      "You do not have permission to manage skills for this job"
    );

    error.statusCode = 403;

    throw error;
  }

  const skill =
    await JobSkill.create({
      job_id: jobId,
      skill_name: skillData.skill_name,
      is_required:
        skillData.is_required ?? true,
    });

  return skill;
};

const getJobSkills = async (jobId) => {
  return JobSkill.findAll({
    where: {
      job_id: jobId,
    },

    order: [
      ["created_at", "ASC"],
    ],
  });
};

const deleteJobSkill = async (
  jobId,
  skillId,
  user
) => {
  const job = await Job.findByPk(jobId, {
    include: [
      {
        model: Company,
        attributes: ["id", "owner_id"],
      },
    ],
  });

  if (!job) {
    const error = new Error(
      "Job not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const hasPerm = await authorizationService.hasCompanyPermission(
    user,
    job.Company.id,
    "jobs.update"
  );

  if (!hasPerm) {
    const error = new Error(
      "You do not have permission to manage skills for this job"
    );

    error.statusCode = 403;

    throw error;
  }

  const skill =
    await JobSkill.findOne({
      where: {
        id: skillId,
        job_id: jobId,
      },
    });

  if (!skill) {
    const error = new Error(
      "Job skill not found"
    );

    error.statusCode = 404;

    throw error;
  }

  await skill.destroy();

  return true;
};

module.exports = {
  addJobSkill,
  getJobSkills,
  deleteJobSkill,
};