import mongoose, { Schema, Document } from "mongoose";

export interface IMfsProvider extends Document {
    name: string;
    slug: string;
    accountType: string; // "Personal", "Agent", "Merchant", "Bank", etc.
    accountNumber: string;
    instructions: string;
    order: number;
    color?: string; // e.g. "#E2136E", "#F7941D", "#8C3494"
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MfsProviderSchema = new Schema<IMfsProvider>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        accountType: {
            type: String,
            default: "Personal",
            trim: true,
        },
        accountNumber: {
            type: String,
            required: true,
            trim: true,
        },
        instructions: {
            type: String,
            default: "Send money using Send Money. Keep your Transaction ID (TrxID) handy.",
            trim: true,
        },
        order: {
            type: Number,
            default: 1,
            index: true,
        },
        color: {
            type: String,
            default: "",
            trim: true,
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

export const MfsProvider =
    mongoose.models.MfsProvider ||
    mongoose.model<IMfsProvider>("MfsProvider", MfsProviderSchema);

export default MfsProvider;
