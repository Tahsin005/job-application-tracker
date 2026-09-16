"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { JobApplication, Resume, UserUsage, getOrCreateUserUsage } from "../models";
import { IJobApplication } from "../models/job-application";
import { IResume } from "../models/resume";
import { updateUserUsageSchema, UpdateUserUsageInput } from "../validations/admin";

interface AdminAuthResult {
    authorized: boolean;
    error: string | null;
}

async function verifyAdmin(): Promise<AdminAuthResult> {
    const session = await getSession();

    if (!session?.user) {
        return { authorized: false, error: "Unauthorized: Please sign in." };
    }

    if (!session.user.isAdmin && session.user.role !== "admin") {
        return { authorized: false, error: "Forbidden: Admin privileges required." };
    }

    return { authorized: true, error: null };
}

export async function getAdminUsersAction({
    page = 1,
    limit = 10,
    search = "",
}: {
    page?: number;
    limit?: number;
    search?: string;
} = {}) {
    const authCheck = await verifyAdmin();
    if (!authCheck.authorized) {
        return { error: authCheck.error, data: null };
    }

    await connectDB();
    const mongooseInstance = await connectDB();
    const db = mongooseInstance.connection.db;

    if (!db) {
        return { error: "Database connection failed", data: null };
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (safePage - 1) * safeLimit;

    const queryFilter = search.trim()
        ? {
              $or: [
                  { name: { $regex: search.trim(), $options: "i" } },
                  { email: { $regex: search.trim(), $options: "i" } },
              ],
          }
        : {};

    const userCol = db.collection("user");
    const totalCount = await userCol.countDocuments(queryFilter);
    const rawUsers = await userCol
        .find(queryFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .toArray();

    // Enrich users with usage and activity metrics
    const users = await Promise.all(
        rawUsers.map(async (u) => {
            const userId = u._id.toString();
            const [jobCount, resumeCount, usageDoc] = await Promise.all([
                JobApplication.countDocuments({ userId }),
                Resume.countDocuments({ userId }),
                UserUsage.findOne({ userId }),
            ]);

            return {
                id: userId,
                name: u.name || "Anonymous",
                email: u.email,
                image: u.image || null,
                role: u.role || (u.isAdmin ? "admin" : "user"),
                isAdmin: Boolean(u.isAdmin || u.role === "admin"),
                createdAt: u.createdAt || null,
                jobCount,
                resumeCount,
                usage: {
                    atsScanUsed: usageDoc?.atsScanCount ?? 0,
                    atsScanLimit: usageDoc?.atsScanLimit ?? 3,
                    coverLetterUsed: usageDoc?.coverLetterCount ?? 0,
                    coverLetterLimit: usageDoc?.coverLetterLimit ?? 3,
                    outreachUsed: usageDoc?.outreachCount ?? 0,
                    outreachLimit: usageDoc?.outreachLimit ?? 3,
                },
            };
        })
    );

    return {
        error: null,
        data: {
            users,
            pagination: {
                page: safePage,
                limit: safeLimit,
                totalCount,
                totalPages: Math.ceil(totalCount / safeLimit) || 1,
            },
        },
    };
}

export async function getAdminUserDetailsAction(userId: string) {
    const authCheck = await verifyAdmin();
    if (!authCheck.authorized) {
        return { error: authCheck.error, data: null };
    }

    if (!userId || typeof userId !== "string") {
        return { error: "Invalid user ID provided", data: null };
    }

    const mongooseInstance = await connectDB();
    const db = mongooseInstance.connection.db;

    if (!db) {
        return { error: "Database connection failed", data: null };
    }

    // Resolve user document
    let query: Record<string, unknown> = { _id: userId };
    if (mongoose.Types.ObjectId.isValid(userId)) {
        query = {
            $or: [{ _id: new mongoose.Types.ObjectId(userId) }, { _id: userId }],
        };
    }

    const rawUser = await db.collection("user").findOne(query);

    if (!rawUser) {
        return { error: "User not found in system", data: null };
    }

    const resolvedUserId = rawUser._id.toString();

    // Fetch user usage and activity data
    const [usageDoc, jobApplications, resumes] = await Promise.all([
        getOrCreateUserUsage(resolvedUserId),
        JobApplication.find({ userId: resolvedUserId }).sort({ updatedAt: -1 }),
        Resume.find({ userId: resolvedUserId }).sort({ createdAt: -1 }),
    ]);

    // Breakdown application statuses
    const statusCounts: Record<string, number> = {};
    for (const job of jobApplications) {
        const s = job.status || "Unknown";
        statusCounts[s] = (statusCounts[s] || 0) + 1;
    }

    const userProfile = {
        id: resolvedUserId,
        name: rawUser.name || "Anonymous",
        email: rawUser.email,
        image: rawUser.image || null,
        role: rawUser.role || (rawUser.isAdmin ? "admin" : "user"),
        isAdmin: Boolean(rawUser.isAdmin || rawUser.role === "admin"),
        createdAt: rawUser.createdAt || null,
        updatedAt: rawUser.updatedAt || null,
    };

    const usageData = {
        atsScanCount: usageDoc.atsScanCount,
        atsScanLimit: usageDoc.atsScanLimit,
        coverLetterCount: usageDoc.coverLetterCount,
        coverLetterLimit: usageDoc.coverLetterLimit,
        outreachCount: usageDoc.outreachCount,
        outreachLimit: usageDoc.outreachLimit,
        updatedAt: usageDoc.updatedAt,
    };

    const stats = {
        totalApplications: jobApplications.length,
        statusCounts,
        totalResumes: resumes.length,
        recentApplications: jobApplications.slice(0, 5).map((j: IJobApplication) => ({
            id: j._id.toString(),
            company: j.company,
            position: j.position,
            status: j.status,
            salary: j.salary || null,
            updatedAt: j.updatedAt,
        })),
        resumes: resumes.map((r: IResume) => ({
            id: r._id.toString(),
            name: r.name,
            isDefault: r.isDefault,
            createdAt: r.createdAt,
        })),
    };

    return {
        error: null,
        data: {
            user: userProfile,
            usage: usageData,
            stats,
        },
    };
}

export async function updateAdminUserUsageAction(rawInput: UpdateUserUsageInput) {
    const authCheck = await verifyAdmin();
    if (!authCheck.authorized) {
        return { error: authCheck.error, data: null };
    }

    const parsed = updateUserUsageSchema.safeParse(rawInput);
    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message || "Invalid input data",
            data: null,
        };
    }

    await connectDB();
    const {
        userId,
        atsScanCount,
        atsScanLimit,
        coverLetterCount,
        coverLetterLimit,
        outreachCount,
        outreachLimit,
    } = parsed.data;

    const updated = await UserUsage.findOneAndUpdate(
        { userId },
        {
            $set: {
                atsScanCount,
                atsScanLimit,
                coverLetterCount,
                coverLetterLimit,
                outreachCount,
                outreachLimit,
            },
        },
        { upsert: true, returnDocument: "after" }
    );

    if (!updated) {
        return { error: "Failed to update user quota usage", data: null };
    }

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return {
        error: null,
        data: {
            userId: updated.userId,
            atsScanCount: updated.atsScanCount,
            atsScanLimit: updated.atsScanLimit,
            coverLetterCount: updated.coverLetterCount,
            coverLetterLimit: updated.coverLetterLimit,
            outreachCount: updated.outreachCount,
            outreachLimit: updated.outreachLimit,
            updatedAt: updated.updatedAt,
        },
    };
}
