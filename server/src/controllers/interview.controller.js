const interviewService = require("../services/interview.service");

const createInterview = async (req, res, next) => {
  try {
    const interview = await interviewService.createInterview(
      req.user,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully!",
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getInterviewById = async (req, res, next) => {
  try {
    const interview = await interviewService.getInterviewById(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationInterviews = async (req, res, next) => {
  try {
    const interviews =
      await interviewService.getApplicationInterviews(
        req.params.applicationId,
        req.user
      );

    res.status(200).json({
      success: true,
      data: {
        interviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEmployerInterviews = async (req, res, next) => {
  try {
    const interviews =
      await interviewService.getEmployerInterviews(
        req.user,
        req.query
      );

    res.status(200).json({
      success: true,
      data: {
        interviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyInterviews = async (req, res, next) => {
  try {
    const interviews = await interviewService.getMyInterviews(
      req.user
    );

    res.status(200).json({
      success: true,
      data: {
        interviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateInterview = async (req, res, next) => {
  try {
    const interview = await interviewService.updateInterview(
      req.params.id,
      req.user,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Interview updated successfully!",
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

const cancelInterview = async (req, res, next) => {
  try {
    const interview = await interviewService.cancelInterview(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Interview cancelled successfully!",
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

const completeInterview = async (req, res, next) => {
  try {
    const interview =
      await interviewService.completeInterview(
        req.params.id,
        req.user,
        req.body.notes
      );

    res.status(200).json({
      success: true,
      message: "Interview marked as completed!",
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterview,
  getInterviewById,
  getApplicationInterviews,
  getEmployerInterviews,
  getMyInterviews,
  updateInterview,
  cancelInterview,
  completeInterview,
};
