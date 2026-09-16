import mongoose, { Schema } from "mongoose";

export interface IAiPrompt {
    action: string;
    name: string;
    description?: string;
    systemPrompt: string;
    userPromptTemplate: string;
    options?: Record<string, unknown>;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: unknown;
}

const AiPromptSchema = new Schema<IAiPrompt>(
    {
        action: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        systemPrompt: {
            type: String,
            required: true,
        },
        userPromptTemplate: {
            type: String,
            required: true,
        },
        options: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        strict: false, // Fully leverages MongoDB's flexible schemaless capabilities
    }
);

export default mongoose.models.AiPrompt || mongoose.model<IAiPrompt>("AiPrompt", AiPromptSchema);
