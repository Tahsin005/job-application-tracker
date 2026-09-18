"use server";

import { getSession } from "../auth/auth";
import connectDB from "../db";
import { TopUpPackage, TopUpRequest, AdminSettings, MfsProvider } from "../models";
import {
    createTopUpRequestSchema,
    CreateTopUpRequestInput,
} from "../validations/top-up";
import { TopUpPackage as ITopUpPackageType, AdminMfsSettings as IAdminMfsSettingsType, MfsProvider as IMfsProviderType } from "../models/models.types";

const DEFAULT_PACKAGES = [
    {
        name: "Level 1 - Starter Boost",
        tierKey: "level1",
        order: 1,
        price: 150,
        currency: "BDT",
        description: "Great for active job hunters applying to a focused set of roles.",
        badgeText: "Starter",
        credits: {
            atsScan: 10,
            coverLetter: 10,
            outreach: 10,
            applicationEmail: 10,
        },
        isActive: true,
    },
    {
        name: "Level 2 - Job Hunter Pack",
        tierKey: "level2",
        order: 2,
        price: 300,
        currency: "BDT",
        description: "Our most popular pack for aggressive job search campaigns.",
        badgeText: "Most Popular",
        credits: {
            atsScan: 25,
            coverLetter: 25,
            outreach: 25,
            applicationEmail: 25,
        },
        isActive: true,
    },
    {
        name: "Level 3 - Pro Accelerator",
        tierKey: "pro",
        order: 3,
        price: 600,
        currency: "BDT",
        description: "Maximum firepower with ample credits for all AI resume tools.",
        badgeText: "Best Value",
        credits: {
            atsScan: 60,
            coverLetter: 60,
            outreach: 60,
            applicationEmail: 60,
        },
        isActive: true,
    },
];

const DEFAULT_MFS_PROVIDERS = [
    {
        name: "bKash",
        slug: "bkash",
        accountType: "Personal",
        accountNumber: "01700000000",
        instructions: "Send Money using bKash Personal account.",
        order: 1,
        color: "#E2136E",
        isActive: true,
    },
    {
        name: "Nagad",
        slug: "nagad",
        accountType: "Personal",
        accountNumber: "01800000000",
        instructions: "Send Money using Nagad Personal account.",
        order: 2,
        color: "#F7941D",
        isActive: true,
    },
    {
        name: "Rocket",
        slug: "rocket",
        accountType: "Personal",
        accountNumber: "01900000000",
        instructions: "Send Money using Rocket Personal account.",
        order: 3,
        color: "#8C3494",
        isActive: true,
    },
];

const DEFAULT_MFS_SETTINGS = {
    key: "mfs_config",
    bkashNumber: "01700000000 (Personal - Send Money)",
    nagadNumber: "01800000000 (Personal - Send Money)",
    rocketNumber: "01900000000 (Personal - Send Money)",
    upayNumber: "",
    instructions:
        "Send the exact amount via Personal Send Money. After payment, enter your sender mobile number and the Transaction ID (TrxID) below.",
};

export async function getActivePackagesAction() {
    try {
        await connectDB();

        let packages = await TopUpPackage.find({ isActive: true }).sort({ order: 1 }).lean();

        if (!packages || packages.length === 0) {
            await TopUpPackage.insertMany(DEFAULT_PACKAGES);
            packages = await TopUpPackage.find({ isActive: true }).sort({ order: 1 }).lean();
        }

        let providers = await MfsProvider.find({ isActive: true }).sort({ order: 1 }).lean();
        if (!providers || providers.length === 0) {
            await MfsProvider.insertMany(DEFAULT_MFS_PROVIDERS);
            providers = await MfsProvider.find({ isActive: true }).sort({ order: 1 }).lean();
        }

        let mfsDoc = await AdminSettings.findOne({ key: "mfs_config" }).lean();
        if (!mfsDoc) {
            mfsDoc = await AdminSettings.create(DEFAULT_MFS_SETTINGS);
        }

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
            key: mfsDoc.key,
            bkashNumber: mfsDoc.bkashNumber,
            nagadNumber: mfsDoc.nagadNumber,
            rocketNumber: mfsDoc.rocketNumber,
            upayNumber: mfsDoc.upayNumber || "",
            instructions: mfsDoc.instructions,
            updatedAt: mfsDoc.updatedAt ? new Date(mfsDoc.updatedAt).toISOString() : undefined,
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

        const pkg = await TopUpPackage.findById(packageId);
        if (!pkg || !pkg.isActive) {
            return { error: "Selected package is not available", data: null };
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
        console.error("Failed to submit top-up request:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to submit top-up request",
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
