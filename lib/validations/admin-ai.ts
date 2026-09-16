import { z } from "zod";

export const aiProviderEnum = z.enum([
    "agentrouter",
    "openai",
    "anthropic",
    "groq",
    "gemini",
    "custom",
]);

export const testAiPlaygroundSchema = z.object({
    provider: z.string().trim().min(1, "Provider is required"),
    baseUrl: z.string().trim().optional().default(""),
    apiKey: z.string().trim().optional().default(""),
    model: z.string().trim().min(1, "Model is required"),
    customHeaders: z.record(z.string(), z.string()).optional(),
    options: z.record(z.string(), z.unknown()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

export type TestAiPlaygroundInput = z.infer<typeof testAiPlaygroundSchema>;

export const saveAiConfigSchema = z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Configuration name is required"),
    provider: z.string().trim().min(1, "Provider is required"),
    baseUrl: z.string().trim().optional().default(""),
    apiKey: z.string().trim().optional().default(""),
    model: z.string().trim().min(1, "Model name is required"),
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),
    customHeaders: z.record(z.string(), z.string()).optional(),
    description: z.string().trim().optional(),
    options: z.record(z.string(), z.unknown()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

export type SaveAiConfigInput = z.infer<typeof saveAiConfigSchema>;
