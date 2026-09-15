"use client";

import { useState } from "react";
import { Board, Column, JobApplication } from "../models/models.types";
import { updateJobApplication } from "../actions/job-applications";
import { toast } from "sonner";

export function useBoard(initialBoard?: Board | null) {
    const [prevInitialBoard, setPrevInitialBoard] = useState<Board | null | undefined>(initialBoard);
    const [board, setBoard] = useState<Board | null>(initialBoard || null);
    const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
    const [error, setError] = useState<string | null>(null);

    if (initialBoard !== prevInitialBoard) {
        setPrevInitialBoard(initialBoard);
        setBoard(initialBoard || null);
        setColumns(initialBoard?.columns || []);
    }

    async function moveJob(
        jobApplicationId: string,
        newColumnId: string,
        newOrder: number
    ) {
        const previousColumns = [...columns];
        
        setColumns((prev) => {
            const newColumns = prev.map((col) => ({
                ...col,
                jobApplications: [...col.jobApplications],
            }));

            // Find and remove job from the old column

            let jobToMove: JobApplication | null = null;
            let oldColumnId: string | null = null;

            for (const col of newColumns) {
                const jobIndex = col.jobApplications.findIndex(
                    (j) => j._id === jobApplicationId
                );
                if (jobIndex !== -1 && jobIndex !== undefined) {
                    jobToMove = col.jobApplications[jobIndex];
                    oldColumnId = col._id;
                    col.jobApplications = col.jobApplications.filter(
                        (job) => job._id !== jobApplicationId
                    );
                    break;
                }
            }

            if (jobToMove && oldColumnId) {
                const targetColumnIndex = newColumns.findIndex(
                    (col) => col._id === newColumnId
                );
                if (targetColumnIndex !== -1) {
                    const targetColumn = newColumns[targetColumnIndex];
                    const currentJobs = targetColumn.jobApplications || [];

                    const updatedJobs = [...currentJobs];
                    updatedJobs.splice(newOrder, 0, {
                        ...jobToMove,
                        columnId: newColumnId,
                        order: newOrder * 100,
                    });

                    const jobsWithUpdatedOrders = updatedJobs.map((job, idx) => ({
                        ...job,
                        order: idx * 100,
                    }));

                    newColumns[targetColumnIndex] = {
                        ...targetColumn,
                        jobApplications: jobsWithUpdatedOrders,
                    };
                }
            }

            return newColumns;
        });

        setError(null);
        try {
            const result = await updateJobApplication(jobApplicationId, {
                columnId: newColumnId,
                order: newOrder,
            });
            
            if (result.error) {
                setColumns(previousColumns);
                setError(result.error);
                toast.error("Failed to move job application", { description: result.error });
            }
        } catch (err) {
            setColumns(previousColumns);
            const errorMessage = "An unexpected error occurred while moving the application.";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Error", err);
        }
    }

    return { board, columns, error, moveJob };
}
