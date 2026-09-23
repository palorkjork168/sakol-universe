const { z } = require("zod");

const positionSchema = z
  .object({
    companyId: z.string().optional(),
    company_id: z.string().optional(),
    department_id: z.string().uuid().optional().or(z.literal("")),
    title: z.string().max(255).min(1, "Title is required"),
    description: z.string().optional().or(z.literal("")),
    is_active: z.boolean().optional(),
  })
  .passthrough();

module.exports = {
  positionSchema,
};
