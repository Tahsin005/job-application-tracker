import mongoose, { Schema, Document } from "mongoose";

export interface IAdminSettings extends Document {
    key: string;
    bkashNumber: string;
    nagadNumber: string;
    rocketNumber: string;
    upayNumber?: string;
    instructions: string;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSettingsSchema = new Schema<IAdminSettings>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: "mfs_config",
        },
        bkashNumber: {
            type: String,
            default: "01700000000 (Personal - Send Money)",
            trim: true,
        },
        nagadNumber: {
            type: String,
            default: "01800000000 (Personal - Send Money)",
            trim: true,
        },
        rocketNumber: {
            type: String,
            default: "01900000000 (Personal - Send Money)",
            trim: true,
        },
        upayNumber: {
            type: String,
            default: "",
            trim: true,
        },
        instructions: {
            type: String,
            default:
                "Send the exact amount via Personal Send Money. After payment, enter your sender phone number and the Transaction ID (TrxID) below.",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const AdminSettings =
    mongoose.models.AdminSettings ||
    mongoose.model<IAdminSettings>("AdminSettings", AdminSettingsSchema);

export default AdminSettings;
