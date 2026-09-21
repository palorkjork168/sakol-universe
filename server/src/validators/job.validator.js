const { z } = require("zod");

const createJobSchema = z.object({
  company_id: z.string().uuid("Invalid company ID"),

  title: z
    .string()
    .min(3, "Job title must be at least 3 characters")
    .max(150, "Job title must not exceed 150 characters"),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters"),

  requirements: z
    .string()
    .optional()
    .or(z.literal("")),

  responsibilities: z
    .string()
    .optional()
    .or(z.literal("")),

  employment_type: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "INTERNSHIP",
    "CONTRACT",
    "FREELANCE",
  ]),

  experience_level: z
    .enum([
      "ENTRY",
      "JUNIOR",
      "MID",
      "SENIOR",
      "LEAD",
    ])
    .optional(),

  salary_min: z.number().nonnegative().optional(),

  salary_max: z.number().nonnegative().optional(),

  salary_currency: z
    .string()
    .max(10)
    .optional(),

  location: z
    .string()
    .min(2, "Location is required"),

  is_remote: z.boolean().optional(),

  application_deadline: z.string().optional(),

  status: z
    .enum([
      "DRAFT",
      "PUBLISHED",
      "CLOSED",
    ])
    .optional(),
});

const updateJobSchema = z.object({
  title: z
    .string()
    .min(3, "Job title must be at least 3 characters")
    .max(150, "Job title must not exceed 150 characters")
    .optional(),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .optional(),

  requirements: z
    .string()
    .optional()
    .or(z.literal("")),

  responsibilities: z
    .string()
    .optional()
    .or(z.literal("")),

  employment_type: z
    .enum([
      "FULL_TIME",
      "PART_TIME",
      "INTERNSHIP",
      "CONTRACT",
      "FREELANCE",
    ])
    .optional(),

  experience_level: z
    .enum([
      "ENTRY",
      "JUNIOR",
      "MID",
      "SENIOR",
      "LEAD",
    ])
    .optional(),

  salary_min: z
    .number()
    .nonnegative()
    .optional(),

  salary_max: z
    .number()
    .nonnegative()
    .optional(),

  salary_currency: z
    .string()
    .max(10)
    .optional(),

  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .optional(),

  is_remote: z.boolean().optional(),

  application_deadline: z.string().optional(),

  status: z
    .enum([
      "DRAFT",
      "PUBLISHED",
      "CLOSED",
    ])
    .optional(),
});

const getJobsQuerySchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  employment_type: z
    .enum([
      "FULL_TIME",
      "PART_TIME",
      "INTERNSHIP",
      "CONTRACT",
      "FREELANCE",
    ])
    .optional(),
  experience_level: z
    .enum([
      "ENTRY",
      "JUNIOR",
      "MID",
      "SENIOR",
      "LEAD",
    ])
    .optional(),
  is_remote: z.enum(["true", "false"]).optional(),
  industry: z.string().optional(),
  salary_min: z.string().regex(/^\d+$/).optional(),
  salary_max: z.string().regex(/^\d+$/).optional(),
  date_posted: z.enum(["today", "week", "month"]).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  sort_by: z.enum(["created_at", "salary_min", "salary_max"]).optional(),
  sort_order: z.enum(["asc", "desc", "ASC", "DESC"]).optional(),
});

module.exports = {
  createJobSchema,
  updateJobSchema,
  getJobsQuerySchema,
};