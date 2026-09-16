"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import {
    JobApplication,
    consumeFeatureQuota,
    getUserQuotaSummary,
} from "../models";
import { processAiTask, resolveResumeForJob } from "../ai/ai-processor";
import { publishAiTask } from "../upstash/qstash";
import { setAiJobStatus } from "../upstash/redis";

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

    const dispatch = await publishAiTask({
        type: "atsScan",
        jobId,
        resumeId: resume._id.toString(),
        userId: session.user.id,
    });

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

        return {
            error: null,
            data: {
                status: "completed" as const,
                jobId,
                remaining: reserved.remaining,
                limit: reserved.limit,
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

    const dispatch = await publishAiTask({
        type: "coverLetter",
        jobId,
        resumeId: resume._id.toString(),
        userId: session.user.id,
    });

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

        return {
            error: null,
            data: {
                status: "completed" as const,
                jobId,
                remaining: reserved.remaining,
                limit: reserved.limit,
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

    const dispatch = await publishAiTask({
        type: "outreach",
        jobId,
        resumeId: resume._id.toString(),
        userId: session.user.id,
    });

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

        return {
            error: null,
            data: {
                status: "completed" as const,
                jobId,
                remaining: reserved.remaining,
                limit: reserved.limit,
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
