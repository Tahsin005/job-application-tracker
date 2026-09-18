"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import {
    JobApplication,
    consumeFeatureQuota,
    releaseFeatureQuota,
    getUserQuotaSummary,
} from "../models";
import { processAiTask, resolveResumeForJob } from "../ai/ai-processor";
import { publishAiTask } from "../upstash/qstash";
import { setAiJobStatus } from "../upstash/redis";
import { stripHtmlTags } from "../utils";
import { checkActionRateLimit } from "../ratelimit/action-guard";

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

    const rateCheck = await checkActionRateLimit({
        actionName: "runAtsMatch",
        userId: session.user.id,
        tier: "sensitive",
    });
    if (!rateCheck.allowed) {
        return {
            error: rateCheck.error || "Rate limit exceeded. Please try again shortly.",
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

    // Reserve quota atomically before queuing
    const reserved = await consumeFeatureQuota(session.user.id, "atsScan");
    if (!reserved.allowed) {
        return {
            error: reserved.error || "Usage limit reached for ATS Matcher.",
            data: null,
        };
    }

    await setAiJobStatus("atsScan", jobId, {
        status: "queued",
        step: "Job queued in background",
    });

    let dispatch;
    try {
        dispatch = await publishAiTask({
            type: "atsScan",
            jobId,
            resumeId: resume._id.toString(),
            userId: session.user.id,
        });
    } catch (err) {
        console.error("Failed to queue ATS task:", err);
        await releaseFeatureQuota(session.user.id, "atsScan");
        await setAiJobStatus("atsScan", jobId, {
            status: "failed",
            error: "Failed to queue ATS analysis. Please try again.",
        });
        return {
            error: "Failed to queue ATS analysis. Please try again.",
            data: null,
        };
    }

    if (dispatch.mode === "direct") {
        const res = await processAiTask({
            type: "atsScan",
            jobId,
            resumeId: resume._id.toString(),
            userId: session.user.id,
        });

        if (!res.success) {
            return {
                error: res.error || "Failed to run ATS analysis.",
                data: null,
            };
        }

        revalidatePath("/dashboard");

        const quotaSummary = await getUserQuotaSummary(session.user.id);

        return {
            error: null,
            data: {
                status: "completed" as const,
                jobId,
                remaining: quotaSummary.atsScan.remaining,
                limit: quotaSummary.atsScan.limit,
                result: res.data,
            },
        };
    }

    return {
        error: null,
        data: {
            status: "queued" as const,
            jobId,
            remaining: reserved.remaining,
            limit: reserved.limit,
        },
    };
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

    const rateCheck = await checkActionRateLimit({
        actionName: "generateCoverLetter",
        userId: session.user.id,
        tier: "sensitive",
    });
    if (!rateCheck.allowed) {
        return {
            error: rateCheck.error || "Rate limit exceeded. Please try again shortly.",
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

    // Reserve quota atomically before queuing
    const reserved = await consumeFeatureQuota(session.user.id, "coverLetter");
    if (!reserved.allowed) {
        return {
            error: reserved.error || "Usage limit reached for Cover Letter Generator.",
            data: null,
        };
    }

    await setAiJobStatus("coverLetter", jobId, {
        status: "queued",
        step: "Job queued in background",
    });

    let dispatch;
    try {
        dispatch = await publishAiTask({
            type: "coverLetter",
            jobId,
            resumeId: resume._id.toString(),
            userId: session.user.id,
        });
    } catch (err) {
        console.error("Failed to queue cover letter task:", err);
        await releaseFeatureQuota(session.user.id, "coverLetter");
        await setAiJobStatus("coverLetter", jobId, {
            status: "failed",
            error: "Failed to queue cover letter generation. Please try again.",
        });
        return {
            error: "Failed to queue cover letter generation. Please try again.",
            data: null,
        };
    }

    if (dispatch.mode === "direct") {
        const res = await processAiTask({
            type: "coverLetter",
            jobId,
            resumeId: resume._id.toString(),
            userId: session.user.id,
        });

        if (!res.success) {
            return {
                error: res.error || "Failed to generate cover letter.",
                data: null,
            };
        }

        revalidatePath("/dashboard");

        const quotaSummary = await getUserQuotaSummary(session.user.id);

        return {
            error: null,
            data: {
                status: "completed" as const,
                jobId,
                remaining: quotaSummary.coverLetter.remaining,
                limit: quotaSummary.coverLetter.limit,
                result: res.data,
            },
        };
    }

    return {
        error: null,
        data: {
            status: "queued" as const,
            jobId,
            remaining: reserved.remaining,
            limit: reserved.limit,
        },
    };
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

    const rateCheck = await checkActionRateLimit({
        actionName: "generateOutreach",
        userId: session.user.id,
        tier: "sensitive",
    });
    if (!rateCheck.allowed) {
        return {
            error: rateCheck.error || "Rate limit exceeded. Please try again shortly.",
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

    // Reserve quota atomically before queuing
    const reserved = await consumeFeatureQuota(session.user.id, "outreach");
    if (!reserved.allowed) {
        return {
            error: reserved.error || "Usage limit reached for Cold Outreach Generator.",
            data: null,
        };
    }

    await setAiJobStatus("outreach", jobId, {
        status: "queued",
        step: "Job queued in background",
    });

    let dispatch;
    try {
        dispatch = await publishAiTask({
            type: "outreach",
            jobId,
            resumeId: resume._id.toString(),
            userId: session.user.id,
        });
    } catch (err) {
        console.error("Failed to queue outreach task:", err);
        await releaseFeatureQuota(session.user.id, "outreach");
        await setAiJobStatus("outreach", jobId, {
            status: "failed",
            error: "Failed to queue outreach message generation. Please try again.",
        });
        return {
            error: "Failed to queue outreach message generation. Please try again.",
            data: null,
        };
    }

    if (dispatch.mode === "direct") {
        const res = await processAiTask({
            type: "outreach",
            jobId,
            resumeId: resume._id.toString(),
            userId: session.user.id,
        });

        if (!res.success) {
            return {
                error: res.error || "Failed to generate outreach message.",
                data: null,
            };
        }

        revalidatePath("/dashboard");

        const quotaSummary = await getUserQuotaSummary(session.user.id);

        return {
            error: null,
            data: {
                status: "completed" as const,
                jobId,
                remaining: quotaSummary.outreach.remaining,
                limit: quotaSummary.outreach.limit,
                result: res.data,
            },
        };
    }

    return {
        error: null,
        data: {
            status: "queued" as const,
            jobId,
            remaining: reserved.remaining,
            limit: reserved.limit,
        },
    };
}

export async function generateApplicationEmailAction({
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

    const rateCheck = await checkActionRateLimit({
        actionName: "generateApplicationEmail",
        userId: session.user.id,
        tier: "sensitive",
    });
    if (!rateCheck.allowed) {
        return {
            error: rateCheck.error || "Rate limit exceeded. Please try again shortly.",
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

    // Strict requirement 1: A job description is mandatory
    const cleanDescription = stripHtmlTags(job.description || "").trim();
    if (!cleanDescription) {
        return {
            error: "A job description is required to generate an application email. Please add a description to this job application first.",
            data: null,
        };
    }

    // Strict requirement 2: A candidate resume is mandatory for tailored accuracy
    const resume = await resolveResumeForJob(session.user.id, resumeId, jobId);
    if (!resume || !resume.textContent) {
        return {
            error: "No resume found. A resume is required to generate an accurate application email. Please upload a resume first.",
            data: null,
        };
    }

    // Reserve quota atomically before queuing
    const reserved = await consumeFeatureQuota(session.user.id, "applicationEmail");
    if (!reserved.allowed) {
        return {
            error: reserved.error || "Usage limit reached for Job Application Email Generator.",
            data: null,
        };
    }

    await setAiJobStatus("applicationEmail", jobId, {
        status: "queued",
        step: "Job queued in background",
    });

    let dispatch;
    try {
        dispatch = await publishAiTask({
            type: "applicationEmail",
            jobId,
            resumeId: resume._id.toString(),
            userId: session.user.id,
        });
    } catch (err) {
        console.error("Failed to queue application email task:", err);
        await releaseFeatureQuota(session.user.id, "applicationEmail");
        await setAiJobStatus("applicationEmail", jobId, {
            status: "failed",
            error: "Failed to queue application email generation. Please try again.",
        });
        return {
            error: "Failed to queue application email generation. Please try again.",
            data: null,
        };
    }

    if (dispatch.mode === "direct") {
        const res = await processAiTask({
            type: "applicationEmail",
            jobId,
            resumeId: resume._id.toString(),
            userId: session.user.id,
        });

        if (!res.success) {
            return {
                error: res.error || "Failed to generate application email.",
                data: null,
            };
        }

        revalidatePath("/dashboard");

        const quotaSummary = await getUserQuotaSummary(session.user.id);

        return {
            error: null,
            data: {
                status: "completed" as const,
                jobId,
                remaining: quotaSummary.applicationEmail.remaining,
                limit: quotaSummary.applicationEmail.limit,
                result: res.data,
            },
        };
    }

    return {
        error: null,
        data: {
            status: "queued" as const,
            jobId,
            remaining: reserved.remaining,
            limit: reserved.limit,
        },
    };
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
