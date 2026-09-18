import { z } from "zod";

export const createResumeSchema = z.object({
    name: z.string().trim().min(1, "Resume name is required"),
    textContent: z.string().trim().min(20, "Resume text content must be at least 20 characters"),
    fileData: z.string().optional(),
    fileSize: z.number().optional().default(0),
    isDefault: z.boolean().optional().default(false),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;

export const updateResumeNameSchema = z.object({
    resumeId: z.string().trim().min(1, "Resume ID is required"),
    name: z.string().trim().min(1, "Resume name is required").max(100, "Resume name cannot exceed 100 characters"),
});

export type UpdateResumeNameInput = z.infer<typeof updateResumeNameSchema>;
