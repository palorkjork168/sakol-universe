const { SavedJob, Job, Company } = require("../models");

const saveJob = async (userId, jobId) => {
  const job = await Job.findByPk(jobId);

  if (!job) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }

  const [savedJob, created] = await SavedJob.findOrCreate({
    where: {
      user_id: userId,
      job_id: jobId,
    },
  });

  if (!created) {
    const error = new Error("Job already saved");
    error.statusCode = 409;
    throw error;
  }

  return savedJob;
};

const unsaveJob = async (userId, jobId) => {
  const deletedCount = await SavedJob.destroy({
    where: {
      user_id: userId,
      job_id: jobId,
    },
  });

  if (deletedCount === 0) {
    const error = new Error("Saved job not found");
    error.statusCode = 404;
    throw error;
  }

  return true;
};

const getSavedJobs = async (userId) => {
  const savedJobs = await SavedJob.findAll({
    where: {
      user_id: userId,
    },
    include: [
      {
        model: Job,
        as: "job",
        include: [
          {
            model: Company,
            attributes: ["id", "name", "logo_url", "city", "country", "industry"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return savedJobs;
};

const checkIfSaved = async (userId, jobId) => {
  const savedJob = await SavedJob.findOne({
    where: {
      user_id: userId,
      job_id: jobId,
    },
  });

  return !!savedJob;
};

module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkIfSaved,
};
