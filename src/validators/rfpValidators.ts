import z from "zod";

// run-time validation
export const getRfpsQueryValidationSchema = z.object({
    status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
    search: z.string().optional(),
    minBudget: z.coerce.number().optional(),
    maxBudget: z.coerce.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
})

export const createRfpValidationSchema = z.object({
    title: z.string().min(8).max(255),
    description: z.string().optional(),
    budget: z.coerce.number(),
    due_date: z.string(),
})

export const updateRfpValidationSchema = z.object({
    title: z.string().min(8).max(255),
    description: z.string().optional(),
    budget: z.coerce.number(),
    due_date: z.string(),
})