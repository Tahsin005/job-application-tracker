"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Board, Column, JobApplication } from "../models/models.types";
import {
    getUserBoard,
    createJobApplication,
    updateJobApplication,
    deleteJobApplication,
    addInterviewRound,
    updateInterviewRound,
    deleteInterviewRound,
} from "../actions/job-applications";
import { InterviewRoundInput } from "../validations/job-application";

export const boardKeys = {
    all: ["boards"] as const,
    current: () => [...boardKeys.all, "current"] as const,
    detail: (boardId?: string) => [...boardKeys.all, boardId ?? "current"] as const,
    jobs: (boardId?: string) => [...boardKeys.detail(boardId), "jobs"] as const,
    jobList: (columnId?: string) => ["jobs", columnId ?? "all"] as const,
};

// query for Board
export function useBoardQuery(initialBoard?: Board | null) {
    return useQuery({
        queryKey: boardKeys.current(),
        queryFn: async () => {
            const res = await getUserBoard();
            if (res.error) throw new Error(res.error);
            return res.data as Board | null;
        },
        initialData: initialBoard || undefined,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

// query for Job list in a column
export function useJobListQuery(columnId: string) {
    const { data: board } = useBoardQuery();
    const column = board?.columns.find((col) => col._id === columnId);
    return {
        jobs: column?.jobApplications || [],
        column,
    };
}

// mutations with automatic query invalidation and optimistic updates
export function useCreateJobMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            company: string;
            position: string;
            location?: string;
            notes?: string;
            salary?: string;
            jobUrl?: string;
            columnId: string;
            boardId: string;
            tags?: string[];
            description?: string;
        }) => {
            const res = await createJobApplication(data);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}

export function useUpdateJobMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            updates,
        }: {
            id: string;
            updates: {
                company?: string;
                position?: string;
                location?: string;
                notes?: string;
                salary?: string;
                jobUrl?: string;
                columnId?: string;
                order?: number;
                tags?: string[];
                description?: string;
            };
        }) => {
            const res = await updateJobApplication(id, updates);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}

export function useDeleteJobMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await deleteJobApplication(id);
            if (res.error) throw new Error(res.error);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}

export function useMoveJobMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            jobApplicationId,
            newColumnId,
            newOrder,
        }: {
            jobApplicationId: string;
            newColumnId: string;
            newOrder: number;
        }) => {
            const res = await updateJobApplication(jobApplicationId, {
                columnId: newColumnId,
                order: newOrder,
            });
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onMutate: async ({ jobApplicationId, newColumnId, newOrder }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: boardKeys.all });

            // Snapshot previous value
            const previousBoard = queryClient.getQueryData<Board>(boardKeys.current());

            if (previousBoard && previousBoard.columns) {
                // Optimistically update board columns
                const newColumns: Column[] = previousBoard.columns.map((col) => ({
                    ...col,
                    jobApplications: [...(col.jobApplications || [])],
                }));

                let jobToMove: JobApplication | null = null;
                for (const col of newColumns) {
                    const idx = col.jobApplications.findIndex((j) => j._id === jobApplicationId);
                    if (idx !== -1) {
                        jobToMove = col.jobApplications[idx];
                        col.jobApplications.splice(idx, 1);
                        break;
                    }
                }

                if (jobToMove) {
                    const targetCol = newColumns.find((col) => col._id === newColumnId);
                    if (targetCol) {
                        targetCol.jobApplications.splice(newOrder, 0, {
                            ...jobToMove,
                            columnId: newColumnId,
                            order: newOrder,
                        });
                        targetCol.jobApplications = targetCol.jobApplications.map((job, idx) => ({
                            ...job,
                            order: idx,
                        }));
                    }
                }

                queryClient.setQueryData<Board>(boardKeys.current(), {
                    ...previousBoard,
                    columns: newColumns,
                });
            }

            return { previousBoard };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousBoard) {
                queryClient.setQueryData(boardKeys.current(), context.previousBoard);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}

export function useAddInterviewMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            jobApplicationId,
            roundData,
        }: {
            jobApplicationId: string;
            roundData: InterviewRoundInput;
        }) => {
            const res = await addInterviewRound(jobApplicationId, roundData);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}

export function useUpdateInterviewMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            jobApplicationId,
            roundId,
            updates,
        }: {
            jobApplicationId: string;
            roundId: string;
            updates: Partial<InterviewRoundInput>;
        }) => {
            const res = await updateInterviewRound(jobApplicationId, roundId, updates);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}

export function useDeleteInterviewMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            jobApplicationId,
            roundId,
        }: {
            jobApplicationId: string;
            roundId: string;
        }) => {
            const res = await deleteInterviewRound(jobApplicationId, roundId);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}
