import mongoose, { Schema, Document } from "mongoose";

export interface ITopUpPackage extends Document {
    name: string;
    tierKey: string;
    order: number;
    price: number;
    currency: "BDT";
    description: string;
    badgeText?: string;
    credits: {
        atsScan: number;
        coverLetter: number;
        outreach: number;
        applicationEmail: number;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TopUpPackageSchema = new Schema<ITopUpPackage>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        tierKey: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        order: {
            type: Number,
            required: true,
            default: 1,
            index: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            enum: ["BDT"],
            default: "BDT",
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        badgeText: {
            type: String,
            default: "",
            trim: true,
        },
        credits: {
            atsScan: { type: Number, default: 0, min: 0 },
            coverLetter: { type: Number, default: 0, min: 0 },
            outreach: { type: Number, default: 0, min: 0 },
            applicationEmail: { type: Number, default: 0, min: 0 },
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

export const TopUpPackage =
    mongoose.models.TopUpPackage ||
    mongoose.model<ITopUpPackage>("TopUpPackage", TopUpPackageSchema);

export default TopUpPackage;
