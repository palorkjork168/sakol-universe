const { z } = require("zod");

const createApplicationSchema = z.object({
  cover_letter: z
    .string()
    .max(5000)
    .optional()
    .or(z.literal("")),

  cv_url: z
    .string()
    .url("Please provide a valid CV URL")
    .optional()
    .or(z.literal("")),
});

const updateApplicationStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "REVIEWING",
    "INTERVIEW",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
  ]),
});

const hireApplicantSchema = z.object({
  department: z.string().max(100).optional().nullable(),
});

module.exports = {
  createApplicationSchema,
  updateApplicationStatusSchema,
  hireApplicantSchema,
};