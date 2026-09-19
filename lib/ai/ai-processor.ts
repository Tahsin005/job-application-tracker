import mongoose from "mongoose";
import connectDB from "../db";
import { stripHtmlTags } from "../utils";
import { JobApplication, Resume, releaseFeatureQuota } from "../models";
import {
    analyzeAtsMatch,
    generateCoverLetter,
    generateColdOutreachMessage,
    generateApplicationEmail,
} from "./agentrouter";
import { setAiJobStatus } from "../upstash/redis";
import { AiTaskPayload } from "../upstash/qstash";

export function formatAiErrorMessage(err: unknown, defaultMsg: string): string {
    console.error("AI Processor error:", err);
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

export async function resolveResumeForJob(
    userId: string,
    requestedResumeId?: string,
    jobId?: string
) {
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

export async function processAiTask(payload: AiTaskPayload): Promise<{
    success: boolean;
    error?: string;
    data?: unknown;
}> {
    const { type, jobId, resumeId, userId } = payload;

    try {
        await setAiJobStatus(type, jobId, {
            status: "processing",
            step: "Connecting to database and resolving application...",
            userId,
        });

        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new Error("Job application not found");
        }

        const job = await JobApplication.findOne({
            _id: jobId,
            userId,
        });

        if (!job) {
            throw new Error("Job application not found");
        }

        const resume = await resolveResumeForJob(userId, resumeId, jobId);

        if (!resume || !resume.textContent) {
            throw new Error(
                "No resume found. Please upload a resume first or select one from the library."
            );
        }

        await setAiJobStatus(type, jobId, {
            status: "processing",
            step: "Running AI generation...",
            userId,
        });

        let resultData: unknown = null;

        if (type === "atsScan") {
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

            resultData = {
                analysis: JSON.parse(JSON.stringify(job.atsAnalysis)),
                job: JSON.parse(JSON.stringify(job)),
            };
        } else if (type === "coverLetter") {
            const coverLetter = await generateCoverLetter({
                resumeText: resume.textContent,
                jobTitle: job.position,
                company: job.company,
                jobDescription: stripHtmlTags(job.description),
            });

            job.aiCoverLetter = coverLetter;
            await job.save();

            resultData = {
                coverLetter,
            };
        } else if (type === "outreach") {
            const outreachMessage = await generateColdOutreachMessage({
                resumeText: resume.textContent,
                jobTitle: job.position,
                company: job.company,
                jobDescription: stripHtmlTags(job.description),
            });

            job.aiOutreachMessage = outreachMessage;
            await job.save();

            resultData = {
                outreachMessage,
            };
        } else if (type === "applicationEmail") {
            const cleanDesc = stripHtmlTags(job.description || "").trim();
            if (!cleanDesc) {
                throw new Error(
                    "A job description is required to generate an application email. Please add a description to this job application first."
                );
            }

            const applicationEmail = await generateApplicationEmail({
                resumeText: resume.textContent,
                jobTitle: job.position,
                company: job.company,
                jobDescription: cleanDesc,
            });

            job.aiApplicationEmail = applicationEmail;
            job.markModified("aiApplicationEmail");
            await job.save();

            resultData = {
                applicationEmail,
            };
        }

        await setAiJobStatus(type, jobId, {
            status: "completed",
            step: "Completed",
            data: resultData,
            userId,
        });

        return {
            success: true,
            data: resultData,
        };
    } catch (err: unknown) {
        // Rollback reserved quota on failure
        await releaseFeatureQuota(userId, type);

        const error = formatAiErrorMessage(
            err,
            `Failed to process ${
                type === "atsScan"
                    ? "ATS analysis"
                    : type === "coverLetter"
                        ? "cover letter"
                        : type === "outreach"
                            ? "outreach message"
                            : "application email"
            }.`
        );

        await setAiJobStatus(type, jobId, {
            status: "failed",
            error,
            userId,
        });

        return {
            success: false,
            error,
        };
    }
}
