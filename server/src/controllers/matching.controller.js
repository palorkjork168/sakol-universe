const matchingService = require(
  "../services/matching.service"
);

const getRecommendedJobs = async (
  req,
  res,
  next
) => {
  try {
    const recommendations =
      await matchingService.getRecommendedJobs(
        req.user.id
      );

    res.status(200).json({
      success: true,

      data: {
        recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendedJobs,
};