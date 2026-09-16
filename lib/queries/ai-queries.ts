"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Resume, UserUsageSummary } from "../models/models.types";
import { boardKeys } from "./board-queries";
import {
    getUserResumes,
    createResumeAction,
    setDefaultResumeAction,
    deleteResumeAction,
    attachResumeToJobAction,
} from "../actions/resumes";
import {
    runAtsMatchAction,
    generateCoverLetterAction,
    generateOutreachAction,
    getUserUsageAction,
} from "../actions/ai-intelligence";
import { CreateResumeInput } from "../validations/resume";

export const aiKeys = {
    all: ["ai"] as const,
    resumes: () => [...aiKeys.all, "resumes"] as const,
    usage: () => [...aiKeys.all, "usage"] as const,
    jobStatus: (type: string, jobId: string) => [...aiKeys.all, "jobStatus", type, jobId] as const,
};

export function useAiJobStatusQuery(
    type: "atsScan" | "coverLetter" | "outreach" | null,
    jobId: string | null,
    enabled = false
) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: type && jobId ? aiKeys.jobStatus(type, jobId) : ["ai", "jobStatus", "none"],
        queryFn: async () => {
            if (!type || !jobId) return null;
            const res = await fetch(`/api/ai/job-status?jobId=${jobId}&type=${type}`);
            if (!res.ok) return null;
            const json = await res.json();
            return json.data || null;
        },
        enabled: Boolean(enabled && type && jobId),
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return 1500;
            if (data.status === "completed" || data.status === "failed") {
                queryClient.invalidateQueries({ queryKey: boardKeys.all });
                queryClient.invalidateQueries({ queryKey: aiKeys.usage() });
                return false;
            }
            return 1500;
        },
    });
}

export function useUserResumesQuery() {
    return useQuery({
        queryKey: aiKeys.resumes(),
        queryFn: async () => {
            const res = await getUserResumes();
            if (res.error) throw new Error(res.error);
            return (res.data || []) as Resume[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useUserUsageQuery() {
    return useQuery({
        queryKey: aiKeys.usage(),
        queryFn: async () => {
            const res = await getUserUsageAction();
            if (res.error) throw new Error(res.error);
            return res.data as UserUsageSummary | null;
        },
        staleTime: 1000 * 30, // 30 seconds
    });
}

export function useAtsMatchMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { jobId: string; resumeId?: string }) => {
            const res = await runAtsMatchAction(payload);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
            queryClient.invalidateQueries({ queryKey: aiKeys.usage() });
        },
    });
}

export function useCoverLetterMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { jobId: string; resumeId?: string }) => {
            const res = await generateCoverLetterAction(payload);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
            queryClient.invalidateQueries({ queryKey: aiKeys.usage() });
        },
    });
}

export function useOutreachMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { jobId: string; resumeId?: string }) => {
            const res = await generateOutreachAction(payload);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
            queryClient.invalidateQueries({ queryKey: aiKeys.usage() });
        },
    });
}

export function useCreateResumeMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateResumeInput) => {
            const res = await createResumeAction(input);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: aiKeys.resumes() });
        },
    });
}

export function useSetDefaultResumeMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (resumeId: string) => {
            const res = await setDefaultResumeAction(resumeId);
            if (res.error) throw new Error(res.error);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: aiKeys.resumes() });
        },
    });
}

export function useDeleteResumeMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (resumeId: string) => {
            const res = await deleteResumeAction(resumeId);
            if (res.error) throw new Error(res.error);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: aiKeys.resumes() });
        },
    });
}

export function useAttachResumeMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { jobId: string; resumeId: string }) => {
            const res = await attachResumeToJobAction(payload);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}
