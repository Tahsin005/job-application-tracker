import mongoose, { Schema, Document } from "mongoose";

export interface IUserUsage extends Document {
    userId: string;
    atsScanCount: number;
    atsScanLimit: number;
    coverLetterCount: number;
    coverLetterLimit: number;
    outreachCount: number;
    outreachLimit: number;
    applicationEmailCount: number;
    applicationEmailLimit: number;
    createdAt: Date;
    updatedAt: Date;
}

export type FeatureType = "atsScan" | "coverLetter" | "outreach" | "applicationEmail";

export interface FeatureQuota {
    used: number;
    limit: number;
    remaining: number;
}

export interface UserUsageSummary {
    atsScan: FeatureQuota;
    coverLetter: FeatureQuota;
    outreach: FeatureQuota;
    applicationEmail: FeatureQuota;
}

const DEFAULT_LIMITS = {
    atsScan: 3,
    coverLetter: 3,
    outreach: 3,
    applicationEmail: 3,
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
        applicationEmailCount: {
            type: Number,
            default: 0,
        },
        applicationEmailLimit: {
            type: Number,
            default: DEFAULT_LIMITS.applicationEmail,
        },
    },
    {
        timestamps: true,
    }
);

export const UserUsage =
    mongoose.models.UserUsage || mongoose.model<IUserUsage>("UserUsage", UserUsageSchema);

export async function getOrCreateUserUsage(userId: string): Promise<IUserUsage> {
    const usage = await UserUsage.findOneAndUpdate(
        { userId },
        {
            $setOnInsert: {
                userId,
                atsScanCount: 0,
                atsScanLimit: DEFAULT_LIMITS.atsScan,
                coverLetterCount: 0,
                coverLetterLimit: DEFAULT_LIMITS.coverLetter,
                outreachCount: 0,
                outreachLimit: DEFAULT_LIMITS.outreach,
                applicationEmailCount: 0,
                applicationEmailLimit: DEFAULT_LIMITS.applicationEmail,
            },
        },
        { upsert: true, returnDocument: "after" }
    );

    const updates: Record<string, unknown> = {};
    if (usage.atsScanCount == null) updates.atsScanCount = 0;
    if (usage.atsScanLimit == null) updates.atsScanLimit = DEFAULT_LIMITS.atsScan;
    if (usage.coverLetterCount == null) updates.coverLetterCount = 0;
    if (usage.coverLetterLimit == null) updates.coverLetterLimit = DEFAULT_LIMITS.coverLetter;
    if (usage.outreachCount == null) updates.outreachCount = 0;
    if (usage.outreachLimit == null) updates.outreachLimit = DEFAULT_LIMITS.outreach;
    if (usage.applicationEmailCount == null) updates.applicationEmailCount = 0;
    if (usage.applicationEmailLimit == null) updates.applicationEmailLimit = DEFAULT_LIMITS.applicationEmail;

    if (Object.keys(updates).length > 0) {
        const conditions = Object.keys(updates).map((field) => ({
            $or: [{ [field]: { $exists: false } }, { [field]: null }],
        }));

        const updated = await UserUsage.findOneAndUpdate(
            {
                userId,
                $or: conditions,
            },
            { $set: updates },
            { returnDocument: "after" }
        );
        if (updated) {
            return updated as IUserUsage;
        }
        const fresh = await UserUsage.findOne({ userId });
        if (fresh) return fresh as IUserUsage;
    }

    return usage as IUserUsage;
}

export async function releaseFeatureQuota(
    userId: string,
    feature: FeatureType
): Promise<void> {
    const countField = `${feature}Count` as keyof IUserUsage;
    await UserUsage.findOneAndUpdate(
        { userId, [countField]: { $gt: 0 } },
        { $inc: { [countField]: -1 } }
    );
}

export async function getUserQuotaSummary(userId: string): Promise<UserUsageSummary> {
    const usage = await getOrCreateUserUsage(userId);
    return {
        atsScan: {
            used: usage.atsScanCount ?? 0,
            limit: usage.atsScanLimit ?? DEFAULT_LIMITS.atsScan,
            remaining: Math.max(0, (usage.atsScanLimit ?? DEFAULT_LIMITS.atsScan) - (usage.atsScanCount ?? 0)),
        },
        coverLetter: {
            used: usage.coverLetterCount ?? 0,
            limit: usage.coverLetterLimit ?? DEFAULT_LIMITS.coverLetter,
            remaining: Math.max(0, (usage.coverLetterLimit ?? DEFAULT_LIMITS.coverLetter) - (usage.coverLetterCount ?? 0)),
        },
        outreach: {
            used: usage.outreachCount ?? 0,
            limit: usage.outreachLimit ?? DEFAULT_LIMITS.outreach,
            remaining: Math.max(0, (usage.outreachLimit ?? DEFAULT_LIMITS.outreach) - (usage.outreachCount ?? 0)),
        },
        applicationEmail: {
            used: usage.applicationEmailCount ?? 0,
            limit: usage.applicationEmailLimit ?? DEFAULT_LIMITS.applicationEmail,
            remaining: Math.max(
                0,
                (usage.applicationEmailLimit ?? DEFAULT_LIMITS.applicationEmail) -
                    (usage.applicationEmailCount ?? 0)
            ),
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

    const currentUsed = (usage[countField] as number) ?? 0;
    const storedLimit = usage[limitField] as number | null | undefined;
    const currentLimit = storedLimit ?? DEFAULT_LIMITS[feature];

    if (currentUsed >= currentLimit) {
        const featureNames: Record<FeatureType, string> = {
            atsScan: "ATS Resume Matcher",
            coverLetter: "AI Cover Letter Generator",
            outreach: "Cold Outreach Generator",
            applicationEmail: "Job Application Email Generator",
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

    const currentUsed = (usage[countField] as number) ?? 0;
    const storedLimit = usage[limitField] as number | null | undefined;
    const currentLimit = storedLimit ?? DEFAULT_LIMITS[feature];

    if (currentUsed >= currentLimit) {
        const featureNames: Record<FeatureType, string> = {
            atsScan: "ATS Resume Matcher",
            coverLetter: "AI Cover Letter Generator",
            outreach: "Cold Outreach Generator",
            applicationEmail: "Job Application Email Generator",
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
        {
            userId,
            $or: [
                { [countField]: { $exists: false } },
                { [countField]: null },
                { [countField]: { $lt: currentLimit } },
            ],
        },
        {
            $inc: { [countField]: 1 },
            ...(storedLimit == null ? { $set: { [limitField]: currentLimit } } : {}),
        },
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

    const newUsed = (updated[countField] as number) ?? currentUsed + 1;
    const remaining = Math.max(0, currentLimit - newUsed);

    return {
        allowed: true,
        used: newUsed,
        limit: currentLimit,
        remaining,
    };
}

export default UserUsage;
