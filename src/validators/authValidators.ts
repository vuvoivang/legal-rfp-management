import z from "zod";

// run-time validation
export const loginBodyValidationSchema = z.object({
  email: z.string(),
  password: z.string(),
});

