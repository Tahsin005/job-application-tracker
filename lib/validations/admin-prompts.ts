import { z } from "zod";

export const saveAdminPromptSchema = z
    .object({
        action: z.string().trim().min(1, "Action identifier is required"),
        name: z.string().trim().min(1, "Prompt name is required"),
        systemPrompt: z.string().trim().min(1, "System prompt cannot be empty"),
        userPromptTemplate: z.string().trim().min(1, "User prompt template cannot be empty"),
        description: z.string().trim().optional(),
        options: z.record(z.string(), z.unknown()).optional(),
    })
    .passthrough();

export type SaveAdminPromptInput = z.infer<typeof saveAdminPromptSchema>;

export const resetAdminPromptSchema = z
    .object({
        action: z.string().trim().min(1, "Action identifier is required"),
    })
    .passthrough();

export type ResetAdminPromptInput = z.infer<typeof resetAdminPromptSchema>;
