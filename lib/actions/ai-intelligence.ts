"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { stripHtmlTags } from "../utils";
import {
    JobApplication,
    Resume,
    consumeFeatureQuota,
    releaseFeatureQuota,
    getUserQuotaSummary,
} from "../models";
import {
    analyzeAtsMatch,
    generateCoverLetter,
    generateColdOutreachMessage,
} from "../ai/agentrouter";

function formatAiErrorMessage(err: unknown, defaultMsg: string): string {
    console.error("AI Action error:", err);
    if (err instanceof Error) {
        const lower = err.message.toLowerCase();
        if (
            lower.includes("fetch failed") ||
            lower.includes("timeout") ||
            lower.includes("aborterror") ||
            lower.includes("econnreset")
        ) {
            return "The AI service is currently taking longer to respond. Please try again in a few moments.";
        }
        return err.message;
    }
    return defaultMsg;
}

async function resolveResumeForJob(userId: string, requestedResumeId?: string, jobId?: string) {
    if (requestedResumeId && mongoose.Types.ObjectId.isValid(requestedResumeId)) {
        const found = await Resume.findOne({ _id: requestedResumeId, userId });
        if (found) return found;
    }

    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
        const job = await JobApplication.findOne({ _id: jobId, userId });
        if (job?.resumeId && mongoose.Types.ObjectId.isValid(job.resumeId)) {
            const linked = await Resume.findOne({ _id: job.resumeId, userId });
            if (linked) return linked;
        }
    }

    const defaultResume = await Resume.findOne({ userId, isDefault: true });
    if (defaultResume) return defaultResume;

    const anyResume = await Resume.findOne({ userId }).sort({ updatedAt: -1 });
    return anyResume;
}

export async function runAtsMatchAction({
    jobId,
    resumeId,
}: {
    jobId: string;
    resumeId?: string;
}) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
            data: null,
        };
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return {
            error: "Job application not found",
            data: null,
        };
    }

    if (resumeId && !mongoose.Types.ObjectId.isValid(resumeId)) {
        return {
            error: "Resume not found",
            data: null,
        };
    }

    await connectDB();

    const job = await JobApplication.findOne({
        _id: jobId,
        userId: session.user.id,
    });

    if (!job) {
        return {
            error: "Job application not found",
            data: null,
        };
    }

    const resume = await resolveResumeForJob(session.user.id, resumeId, jobId);

    if (!resume || !resume.textContent) {
        return {
            error: "No resume found. Please upload a resume first or select one from the library.",
            data: null,
        };
    }

    // Reserve quota atomically before calling AI
    const reserved = await consumeFeatureQuota(session.user.id, "atsScan");
    if (!reserved.allowed) {
        return {
            error: reserved.error || "Usage limit reached for ATS Matcher.",
            data: null,
        };
    }

    try {
        const analysis = await analyzeAtsMatch({
            resumeText: resume.textContent,
            jobTitle: job.position,
            company: job.company,
            jobDescription: stripHtmlTags(job.description),
        });

        job.atsAnalysis = {
            score: analysis.matchScore,
            missingKeywords: analysis.missingKeywords,
            matchedKeywords: analysis.matchedKeywords,
            actionVerbRecommendations: analysis.actionVerbRecommendations,
            summary: analysis.summary,
            analyzedAt: new Date(),
            resumeName: resume.name,
        };

        if (!job.resumeId) {
            job.resumeId = resume._id;
            job.attachedResumeName = resume.name;
        }

        await job.save();

        revalidatePath("/dashboard");

        return {
            error: null,
            data: {
                analysis: JSON.parse(JSON.stringify(job.atsAnalysis)),
                job: JSON.parse(JSON.stringify(job)),
                remaining: reserved.remaining,
                limit: reserved.limit,
            },
        };
    } catch (err: unknown) {
        await releaseFeatureQuota(session.user.id, "atsScan");
        return {
            error: formatAiErrorMessage(err, "Failed to run ATS analysis."),
            data: null,
        };
    }
}

export async function generateCoverLetterAction({
    jobId,
    resumeId,
}: {
    jobId: string;
    resumeId?: string;
}) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
            data: null,
        };
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return {
            error: "Job application not found",
            data: null,
        };
    }

    if (resumeId && !mongoose.Types.ObjectId.isValid(resumeId)) {
        return {
            error: "Resume not found",
            data: null,
        };
    }

    await connectDB();

    const job = await JobApplication.findOne({
        _id: jobId,
        userId: session.user.id,
    });

    if (!job) {
        return {
            error: "Job application not found",
            data: null,
        };
    }

    const resume = await resolveResumeForJob(session.user.id, resumeId, jobId);

    if (!resume || !resume.textContent) {
        return {
            error: "No resume found. Please upload a resume first.",
            data: null,
        };
    }

    // Reserve quota atomically before calling AI
    const reserved = await consumeFeatureQuota(session.user.id, "coverLetter");
    if (!reserved.allowed) {
        return {
            error: reserved.error || "Usage limit reached for Cover Letter Generator.",
            data: null,
        };
    }

    try {
        const coverLetter = await generateCoverLetter({
            resumeText: resume.textContent,
            jobTitle: job.position,
            company: job.company,
            jobDescription: stripHtmlTags(job.description),
        });

        job.aiCoverLetter = coverLetter;
        await job.save();

        revalidatePath("/dashboard");

        return {
            error: null,
            data: {
                coverLetter,
                remaining: reserved.remaining,
                limit: reserved.limit,
            },
        };
    } catch (err: unknown) {
        await releaseFeatureQuota(session.user.id, "coverLetter");
        return {
            error: formatAiErrorMessage(err, "Failed to generate cover letter."),
            data: null,
        };
    }
}

export async function generateOutreachAction({
    jobId,
    resumeId,
}: {
    jobId: string;
    resumeId?: string;
}) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
            data: null,
        };
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return {
            error: "Job application not found",
            data: null,
        };
    }

    if (resumeId && !mongoose.Types.ObjectId.isValid(resumeId)) {
        return {
            error: "Resume not found",
            data: null,
        };
    }

    await connectDB();

    const job = await JobApplication.findOne({
        _id: jobId,
        userId: session.user.id,
    });

    if (!job) {
        return {
            error: "Job application not found",
            data: null,
        };
    }

    const resume = await resolveResumeForJob(session.user.id, resumeId, jobId);

    if (!resume || !resume.textContent) {
        return {
            error: "No resume found. Please upload a resume first.",
            data: null,
        };
    }

    // Reserve quota atomically before calling AI
    const reserved = await consumeFeatureQuota(session.user.id, "outreach");
    if (!reserved.allowed) {
        return {
            error: reserved.error || "Usage limit reached for Cold Outreach Generator.",
            data: null,
        };
    }

    try {
        const outreachMessage = await generateColdOutreachMessage({
            resumeText: resume.textContent,
            jobTitle: job.position,
            company: job.company,
            jobDescription: stripHtmlTags(job.description),
        });

        job.aiOutreachMessage = outreachMessage;
        await job.save();

        revalidatePath("/dashboard");

        return {
            error: null,
            data: {
                outreachMessage,
                remaining: reserved.remaining,
                limit: reserved.limit,
            },
        };
    } catch (err: unknown) {
        await releaseFeatureQuota(session.user.id, "outreach");
        return {
            error: formatAiErrorMessage(err, "Failed to generate outreach message."),
            data: null,
        };
    }
}

export async function getUserUsageAction() {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
            data: null,
        };
    }

    await connectDB();

    const summary = await getUserQuotaSummary(session.user.id);

    return {
        error: null,
        data: summary,
    };
}
