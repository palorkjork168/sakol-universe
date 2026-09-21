const { Company } = require("../models");

const createCompany = async (userId, companyData) => {
  const company = await Company.create({
    ...companyData,
    owner_id: userId,
    status: "PENDING",
  });

  return company;
};

const getMyCompanies = async (userId) => {
  const companies = await Company.findAll({
    where: {
      owner_id: userId,
    },
    order: [["created_at", "DESC"]],
  });

  return companies;
};

const updateCompany = async (companyId, user, companyData) => {
  const company = await Company.findByPk(companyId);

  if (!company) {
    const error = new Error("Company not found");
    error.statusCode = 404;
    throw error;
  }

  const userRoles = (user?.Roles || []).map((r) => r.name);
  const isAdmin = userRoles.includes("ADMIN");
  const isOwner = company.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    const error = new Error("You do not have permission to update this company");
    error.statusCode = 403;
    throw error;
  }

  await company.update(companyData);

  return company;
};

module.exports = {
  createCompany,
  getMyCompanies,
  updateCompany,
};