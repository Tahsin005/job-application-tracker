import mongoose, { Schema, Document } from "mongoose";

export type MfsPaymentMethod = string;
export type TopUpStatus = "pending" | "approved" | "rejected";

export interface ITopUpRequest extends Document {
    userId: string;
    userName: string;
    userEmail: string;
    packageId: string;
    packageName: string;
    order: number;
    amount: number;
    currency: string;
    paymentMethod: MfsPaymentMethod;
    senderNumber: string;
    transactionId: string;
    status: TopUpStatus;
    rejectionReason?: string;
    creditsSnapshot: {
        atsScan: number;
        coverLetter: number;
        outreach: number;
        applicationEmail: number;
    };
    userNote?: string;
    reviewedBy?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TopUpRequestSchema = new Schema<ITopUpRequest>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        userEmail: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        packageId: {
            type: String,
            required: true,
            index: true,
        },
        packageName: {
            type: String,
            required: true,
            trim: true,
        },
        order: {
            type: Number,
            default: 1,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "BDT",
            trim: true,
        },
        paymentMethod: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        senderNumber: {
            type: String,
            required: true,
            trim: true,
        },
        transactionId: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
        rejectionReason: {
            type: String,
            default: "",
            trim: true,
        },
        creditsSnapshot: {
            atsScan: { type: Number, default: 0 },
            coverLetter: { type: Number, default: 0 },
            outreach: { type: Number, default: 0 },
            applicationEmail: { type: Number, default: 0 },
        },
        userNote: {
            type: String,
            default: "",
            trim: true,
        },
        reviewedBy: {
            type: String,
            default: "",
            trim: true,
        },
        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export const TopUpRequest =
    mongoose.models.TopUpRequest ||
    mongoose.model<ITopUpRequest>("TopUpRequest", TopUpRequestSchema);

export default TopUpRequest;
