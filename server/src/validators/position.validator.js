const { z } = require("zod");

const positionSchema = z.object({
  department_id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().max(255).min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

module.exports = {
  positionSchema,
};

