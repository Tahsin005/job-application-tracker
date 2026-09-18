"use server";

import mongoose from "mongoose";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { TopUpPackage, TopUpRequest, AdminSettings, MfsProvider } from "../models";
import {
    createTopUpRequestSchema,
    CreateTopUpRequestInput,
} from "../validations/top-up";
import { TopUpPackage as ITopUpPackageType, AdminMfsSettings as IAdminMfsSettingsType, MfsProvider as IMfsProviderType } from "../models/models.types";

export async function getActivePackagesAction() {
    try {
        await connectDB();

        const packages = await TopUpPackage.find({ isActive: true }).sort({ order: 1 }).lean();
        const providers = await MfsProvider.find({ isActive: true }).sort({ order: 1 }).lean();
        const mfsDoc = await AdminSettings.findOne({ key: "mfs_config" }).lean();

        const serializedPackages = packages.map((pkg) => ({
            ...pkg,
            _id: String(pkg._id),
            createdAt: pkg.createdAt ? new Date(pkg.createdAt).toISOString() : undefined,
            updatedAt: pkg.updatedAt ? new Date(pkg.updatedAt).toISOString() : undefined,
        })) as unknown as ITopUpPackageType[];

        const serializedProviders = providers.map((prov) => ({
            ...prov,
            _id: String(prov._id),
            createdAt: prov.createdAt ? new Date(prov.createdAt).toISOString() : undefined,
            updatedAt: prov.updatedAt ? new Date(prov.updatedAt).toISOString() : undefined,
        })) as unknown as IMfsProviderType[];

        const serializedMfs: IAdminMfsSettingsType = {
            key: mfsDoc?.key || "mfs_config",
            bkashNumber: mfsDoc?.bkashNumber || "",
            nagadNumber: mfsDoc?.nagadNumber || "",
            rocketNumber: mfsDoc?.rocketNumber || "",
            upayNumber: mfsDoc?.upayNumber || "",
            instructions: mfsDoc?.instructions || "",
            updatedAt: mfsDoc?.updatedAt ? new Date(mfsDoc.updatedAt).toISOString() : undefined,
        };

        return {
            error: null,
            data: {
                packages: serializedPackages,
                mfsProviders: serializedProviders,
                mfsSettings: serializedMfs,
            },
        };
    } catch (err: unknown) {
        console.error("Failed to load active packages:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to load packages",
            data: null,
        };
    }
}

export async function submitTopUpRequestAction(rawInput: CreateTopUpRequestInput) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return { error: "Unauthorized: Please sign in.", data: null };
        }

        const parsed = createTopUpRequestSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                error: parsed.error.issues[0]?.message || "Invalid submission data",
                data: null,
            };
        }

        await connectDB();

        const { packageId, paymentMethod, senderNumber, transactionId, userNote } = parsed.data;

        if (!mongoose.Types.ObjectId.isValid(packageId)) {
            return { error: "Selected package is not available", data: null };
        }

        const pkg = await TopUpPackage.findById(packageId);
        if (!pkg || !pkg.isActive) {
            return { error: "Selected package is not available", data: null };
        }

        const activeProvider = await MfsProvider.findOne({ slug: paymentMethod, isActive: true });
        if (!activeProvider) {
            return { error: "The selected payment method is not currently active", data: null };
        }

        const cleanTrxId = transactionId.trim().toUpperCase();

        // Check for existing pending request with exact TrxID
        const existingTrx = await TopUpRequest.findOne({
            transactionId: cleanTrxId,
            status: { $in: ["pending", "approved"] },
        });

        if (existingTrx) {
            return {
                error:
                    existingTrx.status === "approved"
                        ? "This Transaction ID has already been verified and credited."
                        : "A verification request with this Transaction ID is already pending review.",
                data: null,
            };
        }

        const newRequest = await TopUpRequest.create({
            userId: session.user.id,
            userName: session.user.name || "Candidate",
            userEmail: session.user.email || "",
            packageId: String(pkg._id),
            packageName: pkg.name,
            order: pkg.order || 1,
            amount: pkg.price,
            currency: pkg.currency || "BDT",
            paymentMethod,
            senderNumber: senderNumber.trim(),
            transactionId: cleanTrxId,
            status: "pending",
            creditsSnapshot: {
                atsScan: pkg.credits.atsScan,
                coverLetter: pkg.credits.coverLetter,
                outreach: pkg.credits.outreach,
                applicationEmail: pkg.credits.applicationEmail,
            },
            userNote: userNote?.trim() || "",
        });

        return {
            error: null,
            data: {
                id: String(newRequest._id),
                packageName: newRequest.packageName,
                amount: newRequest.amount,
                currency: newRequest.currency,
                transactionId: newRequest.transactionId,
                status: newRequest.status,
                createdAt: newRequest.createdAt.toISOString(),
            },
        };
    } catch (err: unknown) {
        // Handle MongoDB duplicate key error code 11000 for unique transactionId
        if (
            err &&
            typeof err === "object" &&
            "code" in err &&
            (err as { code: number }).code === 11000
        ) {
            return {
                error: "A verification request with this Transaction ID is already pending review or has been approved.",
                data: null,
            };
        }

        console.error("Failed to submit top-up request:", err);
        return {
            error: "Failed to submit top-up request. Please try again later.",
            data: null,
        };
    }
}

export async function getUserTopUpHistoryAction() {
    try {
        const session = await getSession();

        if (!session?.user) {
            return { error: "Unauthorized: Please sign in.", data: null };
        }

        await connectDB();

        const requests = await TopUpRequest.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .lean();

        const serialized = requests.map((r) => ({
            ...r,
            _id: String(r._id),
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
            reviewedAt: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : undefined,
        }));

        return {
            error: null,
            data: serialized,
        };
    } catch (err: unknown) {
        console.error("Failed to get user top-up history:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to fetch top-up history",
            data: null,
        };
    }
}
