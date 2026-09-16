"use client";

import { useQueryClient } from "@tanstack/react-query";
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
    aiKeys,
} from "../queries/ai-queries";
import { boardKeys } from "../queries/board-queries";
import { CreateResumeInput } from "../validations/resume";
import { parsePdfResumeAction } from "../actions/resumes";

export function useAiResumeFacade() {
    const queryClient = useQueryClient();
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

    async function pollJobCompletion(
        type: "atsScan" | "coverLetter" | "outreach",
        jobId: string,
        toastId: string | number
    ) {
        const maxPolls = 40; // 40 * 1.5s = 60s
        for (let i = 0; i < maxPolls; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            try {
                const res = await fetch(`/api/ai/job-status?jobId=${jobId}&type=${type}`);
                if (res.ok) {
                    const json = await res.json();
                    const status = json.data;
                    if (status?.status === "completed") {
                        await queryClient.invalidateQueries({ queryKey: boardKeys.all });
                        await queryClient.invalidateQueries({ queryKey: aiKeys.usage() });
                        return status.data;
                    }
                    if (status?.status === "failed") {
                        throw new Error(status.error || "Background processing failed");
                    }
                    if (status?.step) {
                        toast.loading(status.step, { id: toastId });
                    }
                }
            } catch (err) {
                if (i === maxPolls - 1) throw err;
            }
        }
        throw new Error("Background processing timed out. Please refresh in a moment.");
    }

    async function runAtsMatch(jobId: string, resumeId?: string) {
        const toastId = toast.loading("Analyzing ATS match...");
        try {
            const result = await atsMatchMutation.mutateAsync({ jobId, resumeId });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let finalData = (result as any)?.result;

            if (result?.status === "queued") {
                toast.loading("Queued in background. Analyzing...", { id: toastId });
                finalData = await pollJobCompletion("atsScan", jobId, toastId);
            }

            const score = finalData?.analysis?.score ?? 0;
            toast.success(`ATS Match complete! Score: ${score}% (${result?.remaining ?? 0} tries left)`, {
                id: toastId,
            });
            return finalData;
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let finalData = (result as any)?.result;

            if (result?.status === "queued") {
                toast.loading("Queued in background. Generating cover letter...", { id: toastId });
                finalData = await pollJobCompletion("coverLetter", jobId, toastId);
            }

            toast.success(`Cover letter generated! (${result?.remaining ?? 0} tries left)`, {
                id: toastId,
            });
            return finalData?.coverLetter;
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let finalData = (result as any)?.result;

            if (result?.status === "queued") {
                toast.loading("Queued in background. Generating outreach message...", { id: toastId });
                finalData = await pollJobCompletion("outreach", jobId, toastId);
            }

            toast.success(`Outreach message generated! (${result?.remaining ?? 0} tries left)`, {
                id: toastId,
            });
            return finalData?.outreachMessage;
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
