const { z } = require("zod");

const leaveTypeSchema = z.object({
  name: z.string().max(255).min(1, "Name is required"),
  description: z.string().optional().or(z.literal("")),
  default_days: z.number().int().min(0).optional(),
  is_paid: z.boolean().optional(),
  requires_document: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

const leaveRequestSchema = z.object({
  leave_type_id: z.string().uuid(),
  start_date: z.string().min(1, "Start date is required"), // Can refine to check valid date strings if needed
  end_date: z.string().min(1, "End date is required"),
  reason: z.string().max(1000).min(1, "Reason is required"),
});

module.exports = {
  leaveTypeSchema,
  leaveRequestSchema,
};
