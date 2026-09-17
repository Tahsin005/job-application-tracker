"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AtsAnalysis, Board, Resume, UserUsageSummary } from "../models/models.types";
import { boardKeys } from "./board-queries";

interface AiMutationResponse {
    status?: "completed" | "queued";
    jobId?: string;
    remaining?: number;
    limit?: number;
    result?: {
        analysis?: AtsAnalysis;
        coverLetter?: string;
        outreachMessage?: string;
        applicationEmail?: string;
    };
}
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
    generateApplicationEmailAction,
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
    type: "atsScan" | "coverLetter" | "outreach" | "applicationEmail" | null,
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
        onSuccess: (data) => {
            const parsed = data as AiMutationResponse | undefined;
            const result = parsed?.result;
            if (parsed?.remaining != null) {
                const remaining = parsed.remaining;
                const limit = parsed.limit;
                queryClient.setQueryData(aiKeys.usage(), (old: UserUsageSummary | undefined) => {
                    if (!old) return old;
                    return {
                        ...old,
                        atsScan: {
                            ...old.atsScan,
                            remaining,
                            used: (limit ?? old.atsScan.limit) - remaining,
                            limit: limit ?? old.atsScan.limit,
                        },
                    };
                });
            }
            if (parsed?.jobId && result?.analysis) {
                queryClient.setQueryData(boardKeys.current(), (oldBoard: Board | undefined) => {
                    if (!oldBoard?.columns) return oldBoard;
                    return {
                        ...oldBoard,
                        columns: oldBoard.columns.map((col) => ({
                            ...col,
                            jobApplications: (col.jobApplications || []).map((j) =>
                                j._id === parsed.jobId
                                    ? { ...j, atsAnalysis: result.analysis }
                                    : j
                            ),
                        })),
                    };
                });
            }
            queryClient.invalidateQueries({ queryKey: boardKeys.all, refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: aiKeys.usage(), refetchType: "all" });
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
        onSuccess: (data) => {
            const parsed = data as AiMutationResponse | undefined;
            const result = parsed?.result;
            if (parsed?.remaining != null) {
                const remaining = parsed.remaining;
                const limit = parsed.limit;
                queryClient.setQueryData(aiKeys.usage(), (old: UserUsageSummary | undefined) => {
                    if (!old) return old;
                    return {
                        ...old,
                        coverLetter: {
                            ...old.coverLetter,
                            remaining,
                            used: (limit ?? old.coverLetter.limit) - remaining,
                            limit: limit ?? old.coverLetter.limit,
                        },
                    };
                });
            }
            if (parsed?.jobId && result?.coverLetter) {
                queryClient.setQueryData(boardKeys.current(), (oldBoard: Board | undefined) => {
                    if (!oldBoard?.columns) return oldBoard;
                    return {
                        ...oldBoard,
                        columns: oldBoard.columns.map((col) => ({
                            ...col,
                            jobApplications: (col.jobApplications || []).map((j) =>
                                j._id === parsed.jobId
                                    ? { ...j, aiCoverLetter: result.coverLetter }
                                    : j
                            ),
                        })),
                    };
                });
            }
            queryClient.invalidateQueries({ queryKey: boardKeys.all, refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: aiKeys.usage(), refetchType: "all" });
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
        onSuccess: (data) => {
            const parsed = data as AiMutationResponse | undefined;
            const result = parsed?.result;
            if (parsed?.remaining != null) {
                const remaining = parsed.remaining;
                const limit = parsed.limit;
                queryClient.setQueryData(aiKeys.usage(), (old: UserUsageSummary | undefined) => {
                    if (!old) return old;
                    return {
                        ...old,
                        outreach: {
                            ...old.outreach,
                            remaining,
                            used: (limit ?? old.outreach.limit) - remaining,
                            limit: limit ?? old.outreach.limit,
                        },
                    };
                });
            }
            if (parsed?.jobId && result?.outreachMessage) {
                queryClient.setQueryData(boardKeys.current(), (oldBoard: Board | undefined) => {
                    if (!oldBoard?.columns) return oldBoard;
                    return {
                        ...oldBoard,
                        columns: oldBoard.columns.map((col) => ({
                            ...col,
                            jobApplications: (col.jobApplications || []).map((j) =>
                                j._id === parsed.jobId
                                    ? { ...j, aiOutreachMessage: result.outreachMessage }
                                    : j
                            ),
                        })),
                    };
                });
            }
            queryClient.invalidateQueries({ queryKey: boardKeys.all, refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: aiKeys.usage(), refetchType: "all" });
        },
    });
}

export function useApplicationEmailMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { jobId: string; resumeId?: string }) => {
            const res = await generateApplicationEmailAction(payload);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: (data) => {
            const parsed = data as AiMutationResponse | undefined;
            const result = parsed?.result;
            if (parsed?.remaining != null) {
                const remaining = parsed.remaining;
                const limit = parsed.limit;
                queryClient.setQueryData(aiKeys.usage(), (old: UserUsageSummary | undefined) => {
                    if (!old) return old;
                    return {
                        ...old,
                        applicationEmail: {
                            ...old.applicationEmail,
                            remaining,
                            used: (limit ?? old.applicationEmail.limit) - remaining,
                            limit: limit ?? old.applicationEmail.limit,
                        },
                    };
                });
            }
            if (parsed?.jobId && result?.applicationEmail) {
                queryClient.setQueryData(boardKeys.current(), (oldBoard: Board | undefined) => {
                    if (!oldBoard?.columns) return oldBoard;
                    return {
                        ...oldBoard,
                        columns: oldBoard.columns.map((col) => ({
                            ...col,
                            jobApplications: (col.jobApplications || []).map((j) =>
                                j._id === parsed.jobId
                                    ? { ...j, aiApplicationEmail: result.applicationEmail }
                                    : j
                            ),
                        })),
                    };
                });
            }
            queryClient.invalidateQueries({ queryKey: boardKeys.all, refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: aiKeys.usage(), refetchType: "all" });
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
