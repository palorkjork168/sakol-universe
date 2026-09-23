const errorHandler = (err, req, res, next) => {
  // Always log error on server
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || (err.name === "SequelizeValidationError" ? 400 : 500);

  // In production, mask internal server errors (500)
  const isProduction = process.env.NODE_ENV === "production";
  const userSafeMessage =
    isProduction && statusCode === 500
      ? "Internal server error"
      : err.message || "An unexpected error occurred";

  res.status(statusCode).json({
    success: false,
    message: userSafeMessage,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;