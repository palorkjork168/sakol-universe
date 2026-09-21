const savedJobService = require("../services/savedJob.service");
const { z } = require("zod");

const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Validate UUID
    const uuidSchema = z.string().uuid();
    const validationResult = uuidSchema.safeParse(jobId);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    const savedJob = await savedJobService.saveJob(req.user.id, jobId);

    res.status(201).json({
      success: true,
      message: "Job saved successfully",
      data: {
        savedJob,
      },
    });
  } catch (error) {
    next(error);
  }
};

const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const uuidSchema = z.string().uuid();
    const validationResult = uuidSchema.safeParse(jobId);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    await savedJobService.unsaveJob(req.user.id, jobId);

    res.status(200).json({
      success: true,
      message: "Job removed from saved list",
    });
  } catch (error) {
    next(error);
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await savedJobService.getSavedJobs(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        savedJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

const checkIfSaved = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const uuidSchema = z.string().uuid();
    const validationResult = uuidSchema.safeParse(jobId);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    const saved = await savedJobService.checkIfSaved(req.user.id, jobId);

    res.status(200).json({
      success: true,
      data: {
        saved,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkIfSaved,
};
