import mongoose, { Schema, Document } from "mongoose";

export interface IAtsAnalysis {
    score: number;
    missingKeywords: string[];
    matchedKeywords: string[];
    actionVerbRecommendations: string[];
    summary: string;
    analyzedAt: Date;
    resumeName?: string;
}

export interface IJobApplication extends Document {
    company: string;
    position: string;
    location?: string;
    status: string;
    columnId: mongoose.Types.ObjectId;
    boardId: mongoose.Types.ObjectId;
    userId: string;
    order: number;
    notes?: string;
    salary?: string;
    jobUrl?: string;
    appliedDate?: Date;
    tags?: string[];
    description?: string;
    resumeId?: mongoose.Types.ObjectId;
    attachedResumeName?: string;
    atsAnalysis?: IAtsAnalysis;
    aiCoverLetter?: string;
    aiOutreachMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
    {
        company: {
            type: String,
            required: true,
        },
        position: {
            type: String,
            required: true,
        },
        location: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            default: "applied",
        },
        columnId: {
            type: Schema.Types.ObjectId,
            ref: "Column",
            required: true,
            index: true,
        },
        boardId: {
            type: Schema.Types.ObjectId,
            ref: "Board",
            required: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        order: {
            type: Number,
            required: true,
            default: 0,
        },
        notes: {
            type: String,
        },
        salary: {
            type: String,
        },
        jobUrl: {
            type: String,
        },
        appliedDate: {
            type: Date,
        },
        tags: [
            {
                type: String,
            },
        ],
        description: {
            type: String,
        },
        resumeId: {
            type: Schema.Types.ObjectId,
            ref: "Resume",
        },
        attachedResumeName: {
            type: String,
        },
        atsAnalysis: {
            score: { type: Number },
            missingKeywords: [{ type: String }],
            matchedKeywords: [{ type: String }],
            actionVerbRecommendations: [{ type: String }],
            summary: { type: String },
            analyzedAt: { type: Date },
            resumeName: { type: String },
        },
        aiCoverLetter: {
            type: String,
        },
        aiOutreachMessage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.JobApplication || mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);
