const {
  Application,
  Job,
  Company,
  User,
  UserProfile,
  UserSkill,
  Education,
  Experience,
  EmployeeProfile,
  EmploymentRecord,
  Role,
} = require("../models");
const sequelize = require("../config/database");

const applyForJob = async (
  jobId,
  user,
  applicationData
) => {
  const job = await Job.findByPk(jobId);

  if (!job) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }

  if (job.status !== "PUBLISHED") {
    const error = new Error(
      "This job is not available for applications"
    );
    error.statusCode = 400;
    throw error;
  }

  const alreadyApplied = await Application.findOne({
    where: {
      job_id: jobId,
      user_id: user.id,
    },
  });

  if (alreadyApplied) {
    const error = new Error(
      "You have already applied for this job"
    );
    error.statusCode = 409;
    throw error;
  }

  const application = await Application.create({
    job_id: jobId,
    user_id: user.id,
    cover_letter: applicationData.cover_letter || null,
    cv_url: applicationData.cv_url || null,
  });

  return application;
};

const getMyApplications = async (userId) => {
  const applications = await Application.findAll({
    where: {
      user_id: userId,
    },

    include: [
      {
        model: Job,
        include: [
          {
            model: Company,
            attributes: [
              "id",
              "name",
              "logo_url",
              "city",
              "country",
            ],
          },
        ],
      },
    ],

    order: [["created_at", "DESC"]],
  });

  return applications;
};

const getJobApplications = async (
  jobId,
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
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }

  const userRoles = user.Roles.map(
    (role) => role.name
  );

  const isAdmin = userRoles.includes("ADMIN");

  const isOwner =
    job.Company.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    const error = new Error(
      "You do not have permission to view these applications"
    );

    error.statusCode = 403;
    throw error;
  }

const applications = await Application.findAll({
  where: {
    job_id: jobId,
  },

  include: [
    {
      model: User,
      as: "applicant",

      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
      ],

      include: [
        {
          model: UserProfile,
        },

        {
          model: UserSkill,
        },

        {
          model: Education,
        },

        {
          model: Experience,
        },

        {
          model: EmployeeProfile,
          as: "employeeProfile",
          required: false,
        },
      ],
    },
  ],

  order: [
    ["created_at", "DESC"],
  ],
});

  return applications;
};

const updateApplicationStatus = async (
  applicationId,
  user,
  status
) => {
  const application = await Application.findByPk(
    applicationId,
    {
      include: [
        {
          model: Job,
          include: [
            {
              model: Company,
              attributes: ["id", "owner_id"],
            },
          ],
        },
      ],
    }
  );

  if (!application) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  const userRoles = user.Roles.map(
    (role) => role.name
  );

  const isAdmin = userRoles.includes("ADMIN");

  const isOwner =
    application.Job.Company.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    const error = new Error(
      "You do not have permission to update this application"
    );

    error.statusCode = 403;
    throw error;
  }

  await application.update({
    status,
  });

  return application;
};

const getApplicantDetails = async (applicationId, user) => {
  const application = await Application.findOne({
    where: {
      id: applicationId,
    },
    include: [
      {
        model: Job,
        include: [
          {
            model: Company,
            attributes: ["id", "owner_id"],
          },
        ],
      },
      {
        model: User,
        as: "applicant",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "email",
        ],
        include: [
          {
            model: UserProfile,
          },
          {
            model: UserSkill,
          },
          {
            model: Education,
          },
          {
            model: Experience,
          },
          {
            model: EmployeeProfile,
            as: "employeeProfile",
            required: false,
          },
        ],
      },
    ],
  });

  if (!application) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  const userRoles = (user?.Roles || []).map((role) => role.name);
  const isAdmin = userRoles.includes("ADMIN");
  const isOwner = application.Job?.Company?.owner_id === user?.id;

  if (!isAdmin && !isOwner) {
    const error = new Error(
      "You do not have permission to view this applicant's details"
    );
    error.statusCode = 403;
    throw error;
  }

  return application;
};

const hireApplicant = async (applicationId, user, hiringData = {}) => {
  const application = await Application.findByPk(applicationId, {
    include: [
      {
        model: Job,
        include: [
          {
            model: Company,
            attributes: ["id", "name", "owner_id"],
          },
        ],
      },
      {
        model: User,
        as: "applicant",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "email",
          "phone",
          "status",
        ],
        include: [
          {
            model: Role,
            through: { attributes: [] },
            attributes: ["id", "name"],
          },
          {
            model: EmployeeProfile,
            as: "employeeProfile",
            required: false,
          },
        ],
      },
    ],
  });

  if (!application) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify ownership / authorization
  const userRoles = (user?.Roles || []).map((role) => role.name);
  const isAdmin = userRoles.includes("ADMIN");
  const isOwner = application.Job?.Company?.owner_id === user?.id;

  if (!isAdmin && !isOwner) {
    const error = new Error(
      "You do not have permission to hire this applicant"
    );
    error.statusCode = 403;
    throw error;
  }

  // Precondition: Only ACCEPTED applications can be converted to employees
  if (application.status !== "ACCEPTED") {
    const error = new Error("Only accepted applicants can be hired.");
    error.statusCode = 400;
    throw error;
  }

  const applicantUser = application.applicant;
  if (!applicantUser) {
    const error = new Error("Applicant user not found");
    error.statusCode = 404;
    throw error;
  }

  // Execute conversion inside a managed transaction
  const conversionResult = await sequelize.transaction(async (t) => {
    // 1. Ensure EMPLOYEE role exists
    let employeeRole = await Role.findOne({
      where: { name: "EMPLOYEE" },
      transaction: t,
    });

    if (!employeeRole) {
      employeeRole = await Role.create(
        {
          name: "EMPLOYEE",
          description: "Internal Employee",
        },
        { transaction: t }
      );
    }

    // 2. Add EMPLOYEE role safely to existing user (preserves JOB_SEEKER and all existing roles)
    await applicantUser.addRole(employeeRole, { transaction: t });

    // 3. Find or create EmployeeProfile
    let profile = await EmployeeProfile.findOne({
      where: { user_id: applicantUser.id },
      transaction: t,
    });

    let isAlreadyHired = false;
    if (!profile) {
      profile = await EmployeeProfile.create(
        {
          user_id: applicantUser.id,
          department: hiringData?.department || null,
          joined_date: new Date(),
        },
        { transaction: t }
      );
    } else {
      isAlreadyHired = true;
      if (hiringData?.department && !profile.department) {
        await profile.update(
          { department: hiringData.department },
          { transaction: t }
        );
      }
    }

    // 4. Create or verify EmploymentRecord
    const existingEmployment = await EmploymentRecord.findOne({
      where: {
        user_id: applicantUser.id,
        company_id: application.Job.Company.id,
        status: "ACTIVE",
      },
      transaction: t,
    });

    if (!existingEmployment) {
      await EmploymentRecord.create(
        {
          user_id: applicantUser.id,
          company_id: application.Job.Company.id,
          start_date: new Date(),
          status: "ACTIVE",
        },
        { transaction: t }
      );
    }

    return { profile, isAlreadyHired };
  });

  // Fetch complete employee representation with refreshed roles & profile
  const refreshedUser = await User.findByPk(applicantUser.id, {
    include: [
      {
        model: Role,
        through: { attributes: [] },
        attributes: ["id", "name"],
      },
      {
        model: EmployeeProfile,
        as: "employeeProfile",
      },
    ],
    attributes: { exclude: ["password_hash"] },
  });

  return {
    is_already_hired: conversionResult.isAlreadyHired,
    employee: refreshedUser,
    application: {
      id: application.id,
      job_id: application.job_id,
      user_id: application.user_id,
      status: application.status,
      is_hired: true,
    },
  };
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicantDetails,
  hireApplicant,
};