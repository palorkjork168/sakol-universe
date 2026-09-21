const { Op } = require("sequelize");
const { Job, Company, Application } = require("../models");

const createJob = async (user, jobData) => {
  const company = await Company.findByPk(
    jobData.company_id
  );

  if (!company) {
    const error = new Error("Company not found");
    error.statusCode = 404;
    throw error;
  }

  const userRoles = user.Roles.map(
    (role) => role.name
  );

  const isAdmin = userRoles.includes("ADMIN");

  const isOwner =
    company.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    const error = new Error(
      "You do not have permission to create jobs for this company"
    );

    error.statusCode = 403;
    throw error;
  }

  const job = await Job.create(jobData);

  return job;
};

const getJobs = async (query) => {
  const {
    search,
    location,
    employment_type,
    experience_level,
    is_remote,
    industry,
    salary_min,
    salary_max,
    date_posted,
    sort_by = "created_at",
    sort_order = "desc",
    page = 1,
    limit = 10,
  } = query;

  const where = {
    status: "PUBLISHED",
  };

  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (location) {
    where.location = {
      [Op.iLike]: `%${location}%`,
    };
  }

  if (employment_type) {
    where.employment_type = employment_type;
  }

  if (experience_level) {
    where.experience_level = experience_level;
  }

  if (is_remote !== undefined) {
    where.is_remote = is_remote === "true";
  }

  if (salary_min) {
    where.salary_min = {
      [Op.or]: [
        { [Op.gte]: parseInt(salary_min, 10) },
        { [Op.is]: null }
      ]
    };
  }

  if (salary_max) {
    where.salary_max = {
      [Op.or]: [
        { [Op.lte]: parseInt(salary_max, 10) },
        { [Op.is]: null }
      ]
    };
  }

  if (date_posted) {
    const date = new Date();
    if (date_posted === "today") {
      date.setHours(0, 0, 0, 0);
    } else if (date_posted === "week") {
      date.setDate(date.getDate() - 7);
    } else if (date_posted === "month") {
      date.setMonth(date.getMonth() - 1);
    }
    where.created_at = {
      [Op.gte]: date,
    };
  }

  const companyWhere = {};
  if (industry) {
    companyWhere.industry = {
      [Op.iLike]: `%${industry}%`,
    };
  }

  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const pageLimit = Math.min(
    Math.max(parseInt(limit, 10) || 10, 1),
    100
  );

  const offset = (currentPage - 1) * pageLimit;
  
  let orderColumn = "created_at";
  if (["created_at", "salary_min", "salary_max"].includes(sort_by)) {
    orderColumn = sort_by;
  }
  
  let orderDirection = "DESC";
  if (sort_order && sort_order.toUpperCase() === "ASC") {
    orderDirection = "ASC";
  }

  const { count, rows } = await Job.findAndCountAll({
    where,
    include: [
      {
        model: Company,
        attributes: [
          "id",
          "name",
          "logo_url",
          "city",
          "country",
          "industry",
        ],
        where: Object.keys(companyWhere).length > 0 ? companyWhere : undefined,
      },
    ],
    order: [[orderColumn, orderDirection]],
    limit: pageLimit,
    offset,
    distinct: true,
  });

  return {
    jobs: rows,
    pagination: {
      total: count,
      page: currentPage,
      limit: pageLimit,
      totalPages: Math.ceil(count / pageLimit),
    },
  };
};

const getJobById = async (jobId) => {
  const job = await Job.findByPk(jobId, {
    include: [
      {
        model: Company,
      },
    ],
  });

  if (!job) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }

  return job;
};

const updateJob = async (jobId, user, jobData) => {
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

  const userRoles = user.Roles.map((role) => role.name);

  const isAdmin = userRoles.includes("ADMIN");

  const isOwner =
    job.Company.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    const error = new Error(
      "You do not have permission to manage this job"
    );

    error.statusCode = 403;

    throw error;
  }

  await job.update(jobData);

  return job;
};

const deleteJob = async (jobId, user) => {
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

  const userRoles = user.Roles.map((role) => role.name);

  const isAdmin = userRoles.includes("ADMIN");

  const isOwner =
    job.Company.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    const error = new Error(
      "You do not have permission to manage this job"
    );

    error.statusCode = 403;

    throw error;
  }

  await job.destroy();

  return true;
};

const getMyJobs = async (user) => {
  const userRoles = (user?.Roles || []).map((role) => role.name);
  const isAdmin = userRoles.includes("ADMIN");

  const companyWhere = isAdmin ? {} : { owner_id: user.id };

  const jobs = await Job.findAll({
    include: [
      {
        model: Company,
        where: Object.keys(companyWhere).length > 0 ? companyWhere : undefined,
        attributes: [
          "id",
          "name",
          "logo_url",
          "city",
          "country",
          "industry",
          "owner_id",
        ],
      },
      {
        model: Application,
        attributes: ["id", "status"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return jobs;
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
};