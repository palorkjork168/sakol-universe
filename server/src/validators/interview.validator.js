const { z } = require("zod");

const createInterviewSchema = z
  .object({
    application_id: z.string().uuid("Invalid application ID"),

    scheduled_at: z
      .string()
      .refine(
        (val) => !isNaN(Date.parse(val)),
        "Invalid scheduled date and time"
      ),

    duration_minutes: z
      .number()
      .int("Duration must be an integer")
      .min(5, "Duration must be at least 5 minutes")
      .max(480, "Duration cannot exceed 8 hours")
      .optional()
      .default(30),

    interview_type: z.enum(["IN_PERSON", "VIDEO", "PHONE"], {
      errorMap: () => ({
        message: "Interview type must be IN_PERSON, VIDEO, or PHONE",
      }),
    }),

    location: z
      .string()
      .max(255)
      .optional()
      .or(z.literal("")),

    meeting_link: z
      .string()
      .url("Please provide a valid meeting URL (e.g. Google Meet, Zoom)")
      .optional()
      .or(z.literal("")),

    notes: z
      .string()
      .max(5000)
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.interview_type === "VIDEO" && data.meeting_link) {
        return Boolean(data.meeting_link);
      }
      return true;
    },
    {
      message: "Please provide a meeting link for video interviews",
      path: ["meeting_link"],
    }
  );

const updateInterviewSchema = z.object({
  scheduled_at: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid scheduled date and time"
    )
    .optional(),

  duration_minutes: z
    .number()
    .int("Duration must be an integer")
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration cannot exceed 8 hours")
    .optional(),

  interview_type: z
    .enum(["IN_PERSON", "VIDEO", "PHONE"])
    .optional(),

  location: z
    .string()
    .max(255)
    .optional()
    .or(z.literal("")),

  meeting_link: z
    .string()
    .url("Please provide a valid meeting URL")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(5000)
    .optional()
    .or(z.literal("")),
});

const completeInterviewSchema = z.object({
  notes: z
    .string()
    .max(5000)
    .optional()
    .or(z.literal("")),
});

module.exports = {
  createInterviewSchema,
  updateInterviewSchema,
  completeInterviewSchema,
};
