import mongoose, { Schema } from "mongoose";

export type AiProviderType =
    | "agentrouter"
    | "openai"
    | "anthropic"
    | "groq"
    | "gemini"
    | "custom";

export interface IAiConfig {
    name: string;
    provider: AiProviderType | string;
    baseUrl?: string;
    apiKey?: string;
    model: string;
    isDefault: boolean;
    isActive: boolean;
    customHeaders?: Record<string, string>;
    description?: string;
    options?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    lastTestedAt?: Date;
    lastLatencyMs?: number;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: unknown;
}

const AiConfigSchema = new Schema<IAiConfig>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        provider: {
            type: String,
            required: true,
            default: "agentrouter",
            trim: true,
        },
        baseUrl: {
            type: String,
            trim: true,
            default: "",
        },
        apiKey: {
            type: String,
            trim: true,
            default: "",
        },
        model: {
            type: String,
            required: true,
            trim: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        customHeaders: {
            type: Schema.Types.Mixed,
            default: {},
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        options: {
            type: Schema.Types.Mixed,
            default: {},
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        lastTestedAt: {
            type: Date,
        },
        lastLatencyMs: {
            type: Number,
        },
    },
    {
        timestamps: true,
        strict: false, // Fully leverages MongoDB's schemaless flexibility for arbitrary provider fields & metadata
    }
);

AiConfigSchema.index({ isDefault: 1, isActive: 1 });

export default mongoose.models.AiConfig || mongoose.model<IAiConfig>("AiConfig", AiConfigSchema);
