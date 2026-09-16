import mongoose, { Schema, Document } from "mongoose";

export interface IUserUsage extends Document {
    userId: string;
    atsScanCount: number;
    atsScanLimit: number;
    coverLetterCount: number;
    coverLetterLimit: number;
    outreachCount: number;
    outreachLimit: number;
    createdAt: Date;
    updatedAt: Date;
}

export type FeatureType = "atsScan" | "coverLetter" | "outreach";

export interface FeatureQuota {
    used: number;
    limit: number;
    remaining: number;
}

export interface UserUsageSummary {
    atsScan: FeatureQuota;
    coverLetter: FeatureQuota;
    outreach: FeatureQuota;
}

const DEFAULT_LIMITS = {
    atsScan: 3,
    coverLetter: 3,
    outreach: 3,
};

const UserUsageSchema = new Schema<IUserUsage>(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        atsScanCount: {
            type: Number,
            default: 0,
        },
        atsScanLimit: {
            type: Number,
            default: DEFAULT_LIMITS.atsScan,
        },
        coverLetterCount: {
            type: Number,
            default: 0,
        },
        coverLetterLimit: {
            type: Number,
            default: DEFAULT_LIMITS.coverLetter,
        },
        outreachCount: {
            type: Number,
            default: 0,
        },
        outreachLimit: {
            type: Number,
            default: DEFAULT_LIMITS.outreach,
        },
    },
    {
        timestamps: true,
    }
);

export const UserUsage =
    mongoose.models.UserUsage || mongoose.model<IUserUsage>("UserUsage", UserUsageSchema);

export async function getOrCreateUserUsage(userId: string): Promise<IUserUsage> {
    let usage = await UserUsage.findOne({ userId });
    if (!usage) {
        usage = await UserUsage.create({
            userId,
            atsScanCount: 0,
            atsScanLimit: DEFAULT_LIMITS.atsScan,
            coverLetterCount: 0,
            coverLetterLimit: DEFAULT_LIMITS.coverLetter,
            outreachCount: 0,
            outreachLimit: DEFAULT_LIMITS.outreach,
        });
    }
    return usage;
}

export async function getUserQuotaSummary(userId: string): Promise<UserUsageSummary> {
    const usage = await getOrCreateUserUsage(userId);
    return {
        atsScan: {
            used: usage.atsScanCount,
            limit: usage.atsScanLimit,
            remaining: Math.max(0, usage.atsScanLimit - usage.atsScanCount),
        },
        coverLetter: {
            used: usage.coverLetterCount,
            limit: usage.coverLetterLimit,
            remaining: Math.max(0, usage.coverLetterLimit - usage.coverLetterCount),
        },
        outreach: {
            used: usage.outreachCount,
            limit: usage.outreachLimit,
            remaining: Math.max(0, usage.outreachLimit - usage.outreachCount),
        },
    };
}

export async function checkFeatureQuota(
    userId: string,
    feature: FeatureType
): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    error?: string;
}> {
    const usage = await getOrCreateUserUsage(userId);

    const countField = `${feature}Count` as keyof IUserUsage;
    const limitField = `${feature}Limit` as keyof IUserUsage;

    const currentUsed = (usage[countField] as number) || 0;
    const currentLimit = (usage[limitField] as number) || DEFAULT_LIMITS[feature];

    if (currentUsed >= currentLimit) {
        const featureNames: Record<FeatureType, string> = {
            atsScan: "ATS Resume Matcher",
            coverLetter: "AI Cover Letter Generator",
            outreach: "Cold Outreach Generator",
        };
        return {
            allowed: false,
            limit: currentLimit,
            remaining: 0,
            error: `You have reached your limit of ${currentLimit} tries for ${featureNames[feature]}.`,
        };
    }

    return {
        allowed: true,
        limit: currentLimit,
        remaining: currentLimit - currentUsed,
    };
}

export async function consumeFeatureQuota(
    userId: string,
    feature: FeatureType
): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
    error?: string;
}> {
    const usage = await getOrCreateUserUsage(userId);

    const countField = `${feature}Count` as keyof IUserUsage;
    const limitField = `${feature}Limit` as keyof IUserUsage;

    const currentUsed = (usage[countField] as number) || 0;
    const currentLimit = (usage[limitField] as number) || DEFAULT_LIMITS[feature];

    if (currentUsed >= currentLimit) {
        const featureNames: Record<FeatureType, string> = {
            atsScan: "ATS Resume Matcher",
            coverLetter: "AI Cover Letter Generator",
            outreach: "Cold Outreach Generator",
        };
        return {
            allowed: false,
            used: currentUsed,
            limit: currentLimit,
            remaining: 0,
            error: `You have reached your limit of ${currentLimit} tries for ${featureNames[feature]}.`,
        };
    }

    const updated = await UserUsage.findOneAndUpdate(
        { userId, [countField]: { $lt: currentLimit } },
        { $inc: { [countField]: 1 } },
        { returnDocument: "after" }
    );

    if (!updated) {
        return {
            allowed: false,
            used: currentLimit,
            limit: currentLimit,
            remaining: 0,
            error: `You have reached your limit of ${currentLimit} tries.`,
        };
    }

    const newUsed = (updated[countField] as number) || currentUsed + 1;
    const remaining = Math.max(0, currentLimit - newUsed);

    return {
        allowed: true,
        used: newUsed,
        limit: currentLimit,
        remaining,
    };
}

export default UserUsage;
