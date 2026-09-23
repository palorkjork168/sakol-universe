const { z } = require("zod");

const departmentSchema = z
  .object({
    companyId: z.string().optional(),
    company_id: z.string().optional(),
    name: z.string().max(255).min(1, "Name is required"),
    description: z.string().optional().or(z.literal("")),
    is_active: z.boolean().optional(),
  })
  .passthrough();

module.exports = {
  departmentSchema,
};
