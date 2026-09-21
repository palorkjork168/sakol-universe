const { Op } = require("sequelize");
const sequelize = require("../config/database");
const {
  Interview,
  Application,
  Job,
  Company,
  User,
  UserProfile,
} = require("../models");

const createInterview = async (user, interviewData) => {
  const application = await Application.findByPk(
    interviewData.application_id,
    {
      include: [
        {
          model: Job,
          include: [
            {
              model: Company,
              attributes: ["id", "owner_id", "name"],
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

  const userRoles = (user?.Roles || []).map((r) => r.name);
  const isAdmin = userRoles.includes("ADMIN");
  const isOwner =
    application.Job?.Company?.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    const error = new Error(
      "You do not have permission to schedule an interview for this application"
    );
    error.statusCode = 403;
    throw error;
  }

  const transaction = await sequelize.transaction();
  try {
    const interview = await Interview.create(
      {
        ...interviewData,
        created_by: user.id,
        status: "SCHEDULED",
      },
      { transaction }
    );

    // Automatically advance application status to INTERVIEW if in PENDING or REVIEWING
    if (
      application.status === "PENDING" ||
      application.status === "REVIEWING"
    ) {
      await application.update(
        { status: "INTERVIEW" },
        { transaction }
      );
    }

    await transaction.commit();

    // Reload with associations
    return await Interview.findByPk(interview.id, {
      include: [
        {
          model: Application,
          as: "application",
          include: [
            {
              model: Job,
              include: [{ model: Company }],
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
              include: [{ model: UserProfile }],
            },
          ],
        },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getInterviewById = async (interviewId, user) => {
  const interview = await Interview.findByPk(interviewId, {
    include: [
      {
        model: Application,
        as: "application",
        include: [
          {
            model: Job,
            include: [{ model: Company }],
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
            include: [{ model: UserProfile }],
          },
        ],
      },
      {
        model: User,
        as: "creator",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "email",
        ],
      },
    ],
  });

  if (!interview) {
    const error = new Error("Interview not found");
    error.statusCode = 404;
    throw error;
  }

  const userRoles = (user?.Roles || []).map((r) => r.name);
  const isAdmin = userRoles.includes("ADMIN");
  const isOwner =
    interview.application?.Job?.Company?.owner_id === user.id;
  const isCandidate =
    interview.application?.user_id === user.id;

  if (!isAdmin && !isOwner && !isCandidate) {
    const error = new Error(
      "You do not have permission to view this interview"
    );
    error.statusCode = 403;
    throw error;
  }

  return interview;
};

const getApplicationInterviews = async (applicationId, user) => {
  const application = await Application.findByPk(applicationId, {
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
  });

  if (!application) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  const userRoles = (user?.Roles || []).map((r) => r.name);
  const isAdmin = userRoles.includes("ADMIN");
  const isOwner =
    application.Job?.Company?.owner_id === user.id;
  const isCandidate = application.user_id === user.id;

  if (!isAdmin && !isOwner && !isCandidate) {
    const error = new Error(
      "You do not have permission to view interviews for this application"
    );
    error.statusCode = 403;
    throw error;
  }

  const interviews = await Interview.findAll({
    where: {
      application_id: applicationId,
    },
    include: [
      {
        model: User,
        as: "creator",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "email",
        ],
      },
    ],
    order: [["scheduled_at", "DESC"]],
  });

  return interviews;
};

const getEmployerInterviews = async (user, query = {}) => {
  const userRoles = (user?.Roles || []).map((r) => r.name);
  const isAdmin = userRoles.includes("ADMIN");

  const companyWhere = isAdmin
    ? {}
    : { owner_id: user.id };

  const interviewWhere = {};

  if (query.status) {
    interviewWhere.status = query.status;
  }

  if (query.upcoming === "true") {
    interviewWhere.status = "SCHEDULED";
    interviewWhere.scheduled_at = {
      [Op.gte]: new Date(),
    };
  }

  const interviews = await Interview.findAll({
    where: interviewWhere,
    include: [
      {
        model: Application,
        as: "application",
        required: true,
        include: [
          {
            model: Job,
            required: true,
            include: [
              {
                model: Company,
                required: true,
                where:
                  Object.keys(companyWhere).length > 0
                    ? companyWhere
                    : undefined,
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
            include: [{ model: UserProfile }],
          },
        ],
      },
      {
        model: User,
        as: "creator",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "email",
        ],
      },
    ],
    order: [["scheduled_at", "ASC"]],
  });

  return interviews;
};

const getMyInterviews = async (user) => {
  const interviews = await Interview.findAll({
    include: [
      {
        model: Application,
        as: "application",
        required: true,
        where: {
          user_id: user.id,
        },
        include: [
          {
            model: Job,
            required: true,
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
      },
      {
        model: User,
        as: "creator",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "email",
        ],
      },
    ],
    order: [["scheduled_at", "ASC"]],
  });

  return interviews;
};

const updateInterview = async (
  interviewId,
  user,
  updateData
) => {
  const interview = await Interview.findByPk(interviewId, {
    include: [
      {
        model: Application,
        as: "application",
        include: [
          {
            model: Job,
            include: [{ model: Company }],
          },
        ],
      },
    ],
  });

  if (!interview) {
    const error = new Error("Interview not found");
    error.statusCode = 404;
    throw error;
  }

  const userRoles = (user?.Roles || []).map((r) => r.name);
  const isAdmin = userRoles.includes("ADMIN");
  const isOwner =
    interview.application?.Job?.Company?.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    const error = new Error(
      "You do not have permission to update this interview"
    );
    error.statusCode = 403;
    throw error;
  }

  if (interview.status === "COMPLETED") {
    const error = new Error(
      "Cannot modify an interview that is already completed"
    );
    error.statusCode = 400;
    throw error;
  }

  if (interview.status === "CANCELLED") {
    const error = new Error(
      "Cannot modify a cancelled interview"
    );
    error.statusCode = 400;
    throw error;
  }

  await interview.update(updateData);

  return interview;
};

const cancelInterview = async (interviewId, user) => {
  const interview = await Interview.findByPk(interviewId, {
    include: [
      {
        model: Application,
        as: "application",
        include: [
          {
            model: Job,
            include: [{ model: Company }],
          },
        ],
      },
    ],
  });

  if (!interview) {
    const error = new Error("Interview not found");
    error.statusCode = 404;
    throw error;
  }

  const userRoles = (user?.Roles || []).map((r) => r.name);
  const isAdmin = userRoles.includes("ADMIN");
  const isOwner =
    interview.application?.Job?.Company?.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    const error = new Error(
      "You do not have permission to cancel this interview"
    );
    error.statusCode = 403;
    throw error;
  }

  if (interview.status === "COMPLETED") {
    const error = new Error(
      "Cannot cancel an interview that has already been completed"
    );
    error.statusCode = 400;
    throw error;
  }

  if (interview.status === "CANCELLED") {
    return interview; // Idempotent
  }

  await interview.update({ status: "CANCELLED" });

  return interview;
};

const completeInterview = async (
  interviewId,
  user,
  notes
) => {
  const interview = await Interview.findByPk(interviewId, {
    include: [
      {
        model: Application,
        as: "application",
        include: [
          {
            model: Job,
            include: [{ model: Company }],
          },
        ],
      },
    ],
  });

  if (!interview) {
    const error = new Error("Interview not found");
    error.statusCode = 404;
    throw error;
  }

  const userRoles = (user?.Roles || []).map((r) => r.name);
  const isAdmin = userRoles.includes("ADMIN");
  const isOwner =
    interview.application?.Job?.Company?.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    const error = new Error(
      "You do not have permission to complete this interview"
    );
    error.statusCode = 403;
    throw error;
  }

  if (interview.status === "CANCELLED") {
    const error = new Error(
      "Cannot complete an interview that was cancelled"
    );
    error.statusCode = 400;
    throw error;
  }

  const updatedNotes = notes
    ? interview.notes
      ? `${interview.notes}\n\n[Completion Notes]: ${notes}`
      : notes
    : interview.notes;

  await interview.update({
    status: "COMPLETED",
    notes: updatedNotes,
  });

  return interview;
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
