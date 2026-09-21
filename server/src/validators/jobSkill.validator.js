const { z } = require("zod");

const createJobSkillSchema = z.object({
  skill_name: z
    .string()
    .min(1, "Skill name is required")
    .max(100),

  is_required: z
    .boolean()
    .optional(),
});

module.exports = {
  createJobSkillSchema,
};