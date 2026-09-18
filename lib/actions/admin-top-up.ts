"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { TopUpPackage, TopUpRequest, AdminSettings, UserUsage, getOrCreateUserUsage, MfsProvider } from "../models";
import {
    reviewTopUpRequestSchema,
    ReviewTopUpRequestInput,
    upsertTopUpPackageSchema,
    UpsertTopUpPackageInput,
    updateAdminMfsSettingsSchema,
    UpdateAdminMfsSettingsInput,
    upsertMfsProviderSchema,
    UpsertMfsProviderInput,
} from "../validations/top-up";
import { TopUpAnalyticsSummary, MfsProvider as IMfsProviderType } from "../models/models.types";

interface AdminAuthResult {
    authorized: boolean;
    error: string | null;
    userName?: string;
}

async function verifyAdmin(): Promise<AdminAuthResult> {
    const session = await getSession();

    if (!session?.user) {
        return { authorized: false, error: "Unauthorized: Please sign in." };
    }

    if (!session.user.isAdmin && session.user.role !== "admin") {
        return { authorized: false, error: "Forbidden: Admin privileges required." };
    }

    return { authorized: true, error: null, userName: session.user.name || "Admin" };
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getAdminTopUpRequestsAction({
    status,
    search = "",
    page = 1,
    limit = 10,
}: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
} = {}) {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        await connectDB();

        const safePage = Math.max(1, Number(page) || 1);
        const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
        const skip = (safePage - 1) * safeLimit;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = {};

        if (status && ["pending", "approved", "rejected"].includes(status)) {
            query.status = status;
        }

        const sanitizedSearch = search.trim();
        if (sanitizedSearch) {
            const regex = new RegExp(escapeRegex(sanitizedSearch), "i");
            query.$or = [
                { userName: regex },
                { userEmail: regex },
                { transactionId: regex },
                { senderNumber: regex },
                { packageName: regex },
            ];
        }

        const totalCount = await TopUpRequest.countDocuments(query);
        const rawRequests = await TopUpRequest.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit)
            .lean();

        const requests = rawRequests.map((r) => ({
            ...r,
            _id: String(r._id),
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
            reviewedAt: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : undefined,
        }));

        return {
            error: null,
            data: {
                requests,
                pagination: {
                    page: safePage,
                    limit: safeLimit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / safeLimit) || 1,
                },
            },
        };
    } catch (err: unknown) {
        console.error("Failed to load admin top-up requests:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to load requests",
            data: null,
        };
    }
}

export async function reviewTopUpRequestAction(rawInput: ReviewTopUpRequestInput) {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        const parsed = reviewTopUpRequestSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                error: parsed.error.issues[0]?.message || "Invalid review data",
                data: null,
            };
        }

        await connectDB();

        const { requestId, action, rejectionReason } = parsed.data;

        // Atomically claim the pending request to prevent concurrent double-approvals
        const request = await TopUpRequest.findOneAndUpdate(
            { _id: requestId, status: "pending" },
            {
                $set: {
                    status: action === "approve" ? "approved" : "rejected",
                    rejectionReason:
                        action === "approve"
                            ? ""
                            : rejectionReason?.trim() || "Verification rejected by administrator",
                    reviewedBy: authCheck.userName,
                    reviewedAt: new Date(),
                },
            },
            { returnDocument: "after" }
        );

        if (!request) {
            return {
                error: "Top-up request not found or has already been reviewed.",
                data: null,
            };
        }

        if (action === "approve") {
            try {
                // 1. Ensure user usage record exists
                await getOrCreateUserUsage(request.userId);

                // 2. Increment limits atomically
                const credits = request.creditsSnapshot || {
                    atsScan: 0,
                    coverLetter: 0,
                    outreach: 0,
                    applicationEmail: 0,
                };

                const updatedUsage = await UserUsage.findOneAndUpdate(
                    { userId: request.userId },
                    {
                        $inc: {
                            atsScanLimit: credits.atsScan || 0,
                            coverLetterLimit: credits.coverLetter || 0,
                            outreachLimit: credits.outreach || 0,
                            applicationEmailLimit: credits.applicationEmail || 0,
                        },
                    },
                    { returnDocument: "after" }
                );

                if (!updatedUsage) {
                    throw new Error("Failed to allocate credits to user usage");
                }
            } catch (creditError) {
                // Roll back request status to pending if credit allocation fails
                await TopUpRequest.updateOne(
                    { _id: request._id },
                    {
                        $set: {
                            status: "pending",
                            reviewedBy: "",
                            reviewedAt: null,
                            rejectionReason: "",
                        },
                    }
                );
                console.error("Credit allocation failed, rolled back top-up status:", creditError);
                return {
                    error: creditError instanceof Error ? creditError.message : "Failed to allocate credits to user usage",
                    data: null,
                };
            }
        }

        revalidatePath("/admin/top-ups");
        revalidatePath("/admin");
        revalidatePath(`/admin/users/${request.userId}`);
        revalidatePath("/dashboard");

        return {
            error: null,
            data: {
                id: String(request._id),
                status: request.status,
                packageName: request.packageName,
                amount: request.amount,
                userId: request.userId,
            },
        };
    } catch (err: unknown) {
        console.error("Failed to review top-up request:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to review top-up request",
            data: null,
        };
    }
}

export async function getAdminTopUpAnalyticsAction(): Promise<{
    error: string | null;
    data: TopUpAnalyticsSummary | null;
}> {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        await connectDB();

        const [
            totalApprovedResult,
            pendingCount,
            approvedCount,
            rejectedCount,
            totalRequests,
            pkgAgg,
            methodAgg,
        ] = await Promise.all([
            TopUpRequest.aggregate([
                { $match: { status: "approved" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            TopUpRequest.countDocuments({ status: "pending" }),
            TopUpRequest.countDocuments({ status: "approved" }),
            TopUpRequest.countDocuments({ status: "rejected" }),
            TopUpRequest.countDocuments(),
            TopUpRequest.aggregate([
                { $match: { status: "approved" } },
                {
                    $group: {
                        _id: "$packageName",
                        count: { $sum: 1 },
                        revenue: { $sum: "$amount" },
                    },
                },
                { $sort: { revenue: -1 } },
            ]),
            TopUpRequest.aggregate([
                { $match: { status: "approved" } },
                {
                    $group: {
                        _id: "$paymentMethod",
                        count: { $sum: 1 },
                        revenue: { $sum: "$amount" },
                    },
                },
                { $sort: { revenue: -1 } },
            ]),
        ]);

        const totalRevenue = totalApprovedResult[0]?.total || 0;

        const packageDistribution = pkgAgg.map((p) => ({
            packageName: p._id || "Other",
            count: p.count,
            revenue: p.revenue,
        }));

        const methodDistribution = methodAgg.map((m) => ({
            method: m._id,
            count: m.count,
            revenue: m.revenue,
        }));

        return {
            error: null,
            data: {
                totalRevenue,
                pendingCount,
                approvedCount,
                rejectedCount,
                totalRequests,
                packageDistribution,
                methodDistribution,
            },
        };
    } catch (err: unknown) {
        console.error("Failed to calculate top-up analytics:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to load analytics",
            data: null,
        };
    }
}

export async function getUserTopUpHistoryForAdminAction(userId: string) {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        await connectDB();

        const requests = await TopUpRequest.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        const serialized = requests.map((r) => ({
            ...r,
            _id: String(r._id),
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
            reviewedAt: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : undefined,
        }));

        const totalSpend = requests
            .filter((r) => r.status === "approved")
            .reduce((sum, r) => sum + (r.amount || 0), 0);

        return {
            error: null,
            data: {
                requests: serialized,
                totalSpend,
            },
        };
    } catch (err: unknown) {
        console.error("Failed to load user top-up history for admin:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to load user history",
            data: null,
        };
    }
}

export async function getAdminPackagesAction() {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        await connectDB();

        const packages = await TopUpPackage.find().sort({ order: 1 }).lean();

        const serialized = packages.map((p) => ({
            ...p,
            _id: String(p._id),
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
        }));

        return {
            error: null,
            data: serialized,
        };
    } catch (err: unknown) {
        console.error("Failed to load admin packages:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to load packages",
            data: null,
        };
    }
}

export async function upsertAdminPackageAction(rawInput: UpsertTopUpPackageInput) {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        const parsed = upsertTopUpPackageSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                error: parsed.error.issues[0]?.message || "Invalid package data",
                data: null,
            };
        }

        await connectDB();

        const { id, ...data } = parsed.data;

        if (id) {
            const updated = await TopUpPackage.findByIdAndUpdate(
                id,
                { $set: data },
                { returnDocument: "after" }
            );

            if (!updated) {
                return { error: "Package not found to update", data: null };
            }

            revalidatePath("/admin/packages");
            revalidatePath("/dashboard");

            return {
                error: null,
                data: {
                    ...updated.toObject(),
                    _id: String(updated._id),
                },
            };
        } else {
            const created = await TopUpPackage.create(data);

            revalidatePath("/admin/packages");
            revalidatePath("/dashboard");

            return {
                error: null,
                data: {
                    ...created.toObject(),
                    _id: String(created._id),
                },
            };
        }
    } catch (err: unknown) {
        console.error("Failed to upsert package:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to save package",
            data: null,
        };
    }
}

export async function toggleAdminPackageStatusAction(packageId: string) {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        await connectDB();

        const pkg = await TopUpPackage.findById(packageId);
        if (!pkg) {
            return { error: "Package not found", data: null };
        }

        pkg.isActive = !pkg.isActive;
        await pkg.save();

        revalidatePath("/admin/packages");
        revalidatePath("/dashboard");

        return {
            error: null,
            data: {
                id: String(pkg._id),
                isActive: pkg.isActive,
            },
        };
    } catch (err: unknown) {
        console.error("Failed to toggle package status:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to update package",
            data: null,
        };
    }
}

export async function getAdminMfsSettingsAction() {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        await connectDB();

        let mfsDoc = await AdminSettings.findOne({ key: "mfs_config" }).lean();
        if (!mfsDoc) {
            mfsDoc = await AdminSettings.create({
                key: "mfs_config",
                bkashNumber: "01700000000 (Personal - Send Money)",
                nagadNumber: "01800000000 (Personal - Send Money)",
                rocketNumber: "01900000000 (Personal - Send Money)",
                instructions:
                    "Send the exact amount via Personal Send Money. After payment, enter your sender mobile number and the Transaction ID (TrxID) below.",
            });
        }

        return {
            error: null,
            data: {
                key: mfsDoc.key,
                bkashNumber: mfsDoc.bkashNumber,
                nagadNumber: mfsDoc.nagadNumber,
                rocketNumber: mfsDoc.rocketNumber,
                upayNumber: mfsDoc.upayNumber || "",
                instructions: mfsDoc.instructions,
            },
        };
    } catch (err: unknown) {
        console.error("Failed to load MFS settings:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to load settings",
            data: null,
        };
    }
}

export async function updateAdminMfsSettingsAction(rawInput: UpdateAdminMfsSettingsInput) {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        const parsed = updateAdminMfsSettingsSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                error: parsed.error.issues[0]?.message || "Invalid settings data",
                data: null,
            };
        }

        await connectDB();

        const updated = await AdminSettings.findOneAndUpdate(
            { key: "mfs_config" },
            { $set: parsed.data },
            { upsert: true, returnDocument: "after" }
        );

        revalidatePath("/admin/packages");
        revalidatePath("/dashboard");

        return {
            error: null,
            data: {
                key: updated.key,
                bkashNumber: updated.bkashNumber,
                nagadNumber: updated.nagadNumber,
                rocketNumber: updated.rocketNumber,
                upayNumber: updated.upayNumber || "",
                instructions: updated.instructions,
            },
        };
    } catch (err: unknown) {
        console.error("Failed to update MFS settings:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to save settings",
            data: null,
        };
    }
}

export async function getAdminMfsProvidersAction() {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        await connectDB();

        const providers = await MfsProvider.find().sort({ order: 1 }).lean();

        const serialized: IMfsProviderType[] = providers.map((p) => ({
            ...p,
            _id: String(p._id),
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
        }));

        return {
            error: null,
            data: serialized,
        };
    } catch (err: unknown) {
        console.error("Failed to load MFS providers:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to load providers",
            data: null,
        };
    }
}

export async function upsertAdminMfsProviderAction(rawInput: UpsertMfsProviderInput) {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        const parsed = upsertMfsProviderSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                error: parsed.error.issues[0]?.message || "Invalid provider data",
                data: null,
            };
        }

        await connectDB();

        const { id, ...data } = parsed.data;

        if (id) {
            const updated = await MfsProvider.findByIdAndUpdate(
                id,
                { $set: data },
                { returnDocument: "after" }
            );

            if (!updated) {
                return { error: "Provider not found", data: null };
            }

            revalidatePath("/admin/packages");
            revalidatePath("/dashboard");

            return {
                error: null,
                data: {
                    ...updated.toObject(),
                    _id: String(updated._id),
                },
            };
        } else {
            const created = await MfsProvider.create(data);

            revalidatePath("/admin/packages");
            revalidatePath("/dashboard");

            return {
                error: null,
                data: {
                    ...created.toObject(),
                    _id: String(created._id),
                },
            };
        }
    } catch (err: unknown) {
        console.error("Failed to save MFS provider:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to save provider",
            data: null,
        };
    }
}

export async function toggleAdminMfsProviderStatusAction(providerId: string) {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        await connectDB();

        const provider = await MfsProvider.findById(providerId);
        if (!provider) {
            return { error: "Provider not found", data: null };
        }

        provider.isActive = !provider.isActive;
        await provider.save();

        revalidatePath("/admin/packages");
        revalidatePath("/dashboard");

        return {
            error: null,
            data: {
                id: String(provider._id),
                isActive: provider.isActive,
            },
        };
    } catch (err: unknown) {
        console.error("Failed to toggle provider status:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to update provider",
            data: null,
        };
    }
}

export async function deleteAdminMfsProviderAction(providerId: string) {
    try {
        const authCheck = await verifyAdmin();
        if (!authCheck.authorized) {
            return { error: authCheck.error, data: null };
        }

        await connectDB();

        await MfsProvider.findByIdAndDelete(providerId);

        revalidatePath("/admin/packages");
        revalidatePath("/dashboard");

        return {
            error: null,
            data: {
                id: providerId,
            },
        };
    } catch (err: unknown) {
        console.error("Failed to delete MFS provider:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to delete provider",
            data: null,
        };
    }
}
