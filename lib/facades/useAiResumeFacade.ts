"use client";

import { toast } from "sonner";
import {
    useUserResumesQuery,
    useUserUsageQuery,
    useAtsMatchMutation,
    useCoverLetterMutation,
    useOutreachMutation,
    useCreateResumeMutation,
    useSetDefaultResumeMutation,
    useDeleteResumeMutation,
    useAttachResumeMutation,
} from "../queries/ai-queries";
import { CreateResumeInput } from "../validations/resume";
import { parsePdfResumeAction } from "../actions/resumes";

export function useAiResumeFacade() {
    const { data: resumes = [], isLoading: isLoadingResumes } = useUserResumesQuery();
    const { data: usage, isLoading: isLoadingUsage } = useUserUsageQuery();

    const atsMatchMutation = useAtsMatchMutation();
    const coverLetterMutation = useCoverLetterMutation();
    const outreachMutation = useOutreachMutation();
    const createResumeMutation = useCreateResumeMutation();
    const setDefaultResumeMutation = useSetDefaultResumeMutation();
    const deleteResumeMutation = useDeleteResumeMutation();
    const attachResumeMutation = useAttachResumeMutation();

    const defaultResume = resumes.find((r) => r.isDefault) || resumes[0] || null;

    async function runAtsMatch(jobId: string, resumeId?: string) {
        const toastId = toast.loading("Analyzing ATS Match with GLM-5.3...");
        try {
            const result = await atsMatchMutation.mutateAsync({ jobId, resumeId });
            const score = result?.analysis?.score ?? 0;
            toast.success(`ATS Match complete! Score: ${score}% (${result?.remaining ?? 0} tries left)`, {
                id: toastId,
            });
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to run ATS match.";
            toast.error(message, { id: toastId });
            throw err;
        }
    }

    async function generateCoverLetter(jobId: string, resumeId?: string) {
        const toastId = toast.loading("Generating tailored cover letter...");
        try {
            const result = await coverLetterMutation.mutateAsync({ jobId, resumeId });
            toast.success(`Cover letter generated! (${result?.remaining ?? 0} tries left)`, {
                id: toastId,
            });
            return result?.coverLetter;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to generate cover letter.";
            toast.error(message, { id: toastId });
            throw err;
        }
    }

    async function generateOutreach(jobId: string, resumeId?: string) {
        const toastId = toast.loading("Crafting recruiter outreach message...");
        try {
            const result = await outreachMutation.mutateAsync({ jobId, resumeId });
            toast.success(`Outreach message generated! (${result?.remaining ?? 0} tries left)`, {
                id: toastId,
            });
            return result?.outreachMessage;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to generate outreach message.";
            toast.error(message, { id: toastId });
            throw err;
        }
    }

    async function createResume(input: CreateResumeInput) {
        const toastId = toast.loading("Saving resume to library...");
        try {
            const res = await createResumeMutation.mutateAsync(input);
            toast.success("Resume saved successfully!", { id: toastId });
            return res;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to save resume.";
            toast.error(message, { id: toastId });
            throw err;
        }
    }

    async function setDefaultResume(resumeId: string) {
        const toastId = toast.loading("Updating default resume...");
        try {
            await setDefaultResumeMutation.mutateAsync(resumeId);
            toast.success("Default resume updated!", { id: toastId });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to set default resume.";
            toast.error(message, { id: toastId });
            throw err;
        }
    }

    async function deleteResume(resumeId: string) {
        const toastId = toast.loading("Deleting resume...");
        try {
            await deleteResumeMutation.mutateAsync(resumeId);
            toast.success("Resume deleted.", { id: toastId });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to delete resume.";
            toast.error(message, { id: toastId });
            throw err;
        }
    }

    async function attachResume(jobId: string, resumeId: string) {
        const toastId = toast.loading("Attaching resume version to job...");
        try {
            const res = await attachResumeMutation.mutateAsync({ jobId, resumeId });
            toast.success("Resume attached to application!", { id: toastId });
            return res;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to attach resume.";
            toast.error(message, { id: toastId });
            throw err;
        }
    }

    async function extractPdfText(file: File) {
        const toastId = toast.loading(`Parsing "${file.name}"...`);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await parsePdfResumeAction(formData);
            if (res.error || !res.data) {
                throw new Error(res.error || "Failed to extract PDF text");
            }
            toast.success("PDF parsed successfully!", { id: toastId });
            return res.data;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "PDF extraction failed.";
            toast.error(message, { id: toastId });
            throw err;
        }
    }

    return {
        resumes,
        defaultResume,
        isLoadingResumes,
        usage,
        isLoadingUsage,
        isAnalyzingAts: atsMatchMutation.isPending,
        isGeneratingCoverLetter: coverLetterMutation.isPending,
        isGeneratingOutreach: outreachMutation.isPending,
        isSavingResume: createResumeMutation.isPending,
        runAtsMatch,
        generateCoverLetter,
        generateOutreach,
        createResume,
        setDefaultResume,
        deleteResume,
        attachResume,
        extractPdfText,
    };
}
