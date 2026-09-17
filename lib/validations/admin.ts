import { z } from "zod";

export const updateUserUsageSchema = z.object({
    userId: z.string().trim().min(1, "User ID is required"),
    atsScanCount: z.coerce.number().int().min(0, "Count cannot be negative"),
    atsScanLimit: z.coerce.number().int().min(0, "Limit cannot be negative"),
    coverLetterCount: z.coerce.number().int().min(0, "Count cannot be negative"),
    coverLetterLimit: z.coerce.number().int().min(0, "Limit cannot be negative"),
    outreachCount: z.coerce.number().int().min(0, "Count cannot be negative"),
    outreachLimit: z.coerce.number().int().min(0, "Limit cannot be negative"),
    applicationEmailCount: z.coerce.number().int().min(0, "Count cannot be negative").default(0),
    applicationEmailLimit: z.coerce.number().int().min(0, "Limit cannot be negative").default(3),
});

export type UpdateUserUsageInput = z.infer<typeof updateUserUsageSchema>;
