import { z } from "zod";

export const createJobApplicationSchema = z.object({
    company: z.string().trim().min(1, "Company name is required"),
    position: z.string().trim().min(1, "Position title is required"),
    location: z.string().optional().default(""),
    salary: z.string().optional().default(""),
    jobUrl: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.length === 0 || z.string().url().safeParse(val).success,
            { message: "Please enter a valid URL" }
        )
        .default(""),
    tags: z.string().optional().default(""),
    description: z.string().optional().default(""),
    notes: z.string().optional().default(""),
    columnId: z.string().min(1, "Column ID is required"),
    boardId: z.string().min(1, "Board ID is required"),
});

export type CreateJobApplicationInput = z.infer<typeof createJobApplicationSchema>;

export const updateJobApplicationSchema = z.object({
    company: z.string().trim().min(1, "Company name is required"),
    position: z.string().trim().min(1, "Position title is required"),
    location: z.string().optional().default(""),
    salary: z.string().optional().default(""),
    jobUrl: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.length === 0 || z.string().url().safeParse(val).success,
            { message: "Please enter a valid URL" }
        )
        .default(""),
    tags: z.string().optional().default(""),
    description: z.string().optional().default(""),
    notes: z.string().optional().default(""),
    columnId: z.string().optional(),
    order: z.number().optional(),
});

export type UpdateJobApplicationInput = z.infer<typeof updateJobApplicationSchema>;
