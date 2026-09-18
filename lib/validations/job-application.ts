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

export const interviewRoundSchema = z.object({
    _id: z.string().optional(),
    roundType: z.enum(["Screening", "Technical", "System Design", "Behavioral", "Final", "Other"]),
    customRoundName: z.string().trim().optional().default(""),
    scheduledAt: z.union([
        z.string().trim().min(1, "Scheduled date and time is required"),
        z.date(),
    ]),
    durationMinutes: z.coerce.number().min(5).max(480).default(60),
    interviewerNames: z.string().trim().optional().default(""),
    meetingUrl: z
        .string()
        .trim()
        .optional()
        .refine(
            (val) => !val || val.length === 0 || z.string().url().safeParse(val).success,
            { message: "Please enter a valid URL (e.g. https://meet.google.com/...)" }
        )
        .default(""),
    location: z.string().trim().optional().default(""),
    notes: z.string().trim().optional().default(""),
    status: z
        .enum(["scheduled", "completed", "passed", "rejected", "cancelled"])
        .default("scheduled"),
    feedback: z.string().trim().optional().default(""),
});

export type InterviewRoundInput = z.infer<typeof interviewRoundSchema>;

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
    interviews: z.array(interviewRoundSchema).optional(),
});

export type UpdateJobApplicationInput = z.infer<typeof updateJobApplicationSchema>;
