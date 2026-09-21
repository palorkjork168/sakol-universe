const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");
const companyRoutes = require("./routes/company.routes");
const jobRoutes = require("./routes/job.routes");
const applicationRoutes = require(
  "./routes/application.routes"
);

const profileRoutes = require(
  "./routes/profile.routes"
);

const jobSkillRoutes = require(
  "./routes/jobSkill.routes"
);

const matchingRoutes =
  require("./routes/matching.routes");

const savedJobRoutes =
  require("./routes/savedJob.routes");

const attendanceRoutes = require("./routes/attendance.routes");
const employeeRoutes = require("./routes/employee.routes");
const interviewRoutes = require("./routes/interview.routes");
const departmentRoutes = require("./routes/department.routes");
const positionRoutes = require("./routes/position.routes");
const leaveRoutes = require("./routes/leave.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Sakol Universe API is running!",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

app.use("/api/companies", companyRoutes);

app.use("/api/attendance", attendanceRoutes);
app.use("/api/employees", employeeRoutes);

app.use(
  "/api/jobs",
  matchingRoutes
);

app.use(
  "/api/jobs",
  savedJobRoutes
);

app.use("/api/jobs", jobRoutes);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/jobs",
  jobSkillRoutes
);

app.use("/api/interviews", interviewRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

module.exports = app;