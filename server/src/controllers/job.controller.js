const jobService = require("../services/job.service");
const { getJobsQuerySchema } = require("../validators/job.validator");

const createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob(
      req.user,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Job created successfully!",
      data: {
        job,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const validationResult = getJobsQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const result = await jobService.getJobs(validationResult.data);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: {
        job,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(
      req.params.id,
      req.user,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Job updated successfully!",
      data: {
        job,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJob(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Job deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.getMyJobs(req.user);

    res.status(200).json({
      success: true,
      data: {
        jobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
};