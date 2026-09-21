const { z } = require("zod");

const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(150, "Company name must not exceed 150 characters"),

  description: z
    .string()
    .max(5000)
    .optional()
    .or(z.literal("")),

  website: z
    .string()
    .url("Please provide a valid website URL")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email("Please provide a valid email")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .max(30)
    .optional()
    .or(z.literal("")),

  address: z.string().max(255).optional().or(z.literal("")),

  city: z.string().max(100).optional().or(z.literal("")),

  country: z.string().max(100).optional().or(z.literal("")),

  industry: z.string().max(100).optional().or(z.literal("")),

  company_size: z
    .enum([
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "500+",
    ])
    .optional(),
});

const updateCompanySchema = createCompanySchema.partial();

module.exports = {
  createCompanySchema,
  updateCompanySchema,
};