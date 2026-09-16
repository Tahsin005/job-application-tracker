import mongoose, { Schema, Document } from "mongoose";

export interface IResume extends Document {
    userId: string;
    name: string;
    textContent: string;
    fileData?: string;
    fileSize?: number;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        textContent: {
            type: String,
            required: true,
        },
        fileData: {
            type: String,
        },
        fileSize: {
            type: Number,
            default: 0,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

ResumeSchema.index({ userId: 1, isDefault: 1 });

export default mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);
