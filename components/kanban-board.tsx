"use client";

import { useState } from "react";
import { Board, Column, JobApplication } from "@/lib/models/models.types";
import {
    Award,
    Calendar,
    CheckCircle2,
    Mic,
    MoreVertical,
    Trash2,
    XCircle,
    FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import CreateJobApplicationDialog from "./create-job-dialog";
import JobApplicationCard from "./job-application-card";
import { useBoardFacade } from "@/lib/facades/useBoardFacade";
import { Search } from "lucide-react";
import { ResumeLibraryDialog } from "./resume/resume-library-dialog";
import { CreditIndicator } from "./ai/credit-indicator";
import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KanbanBoardProps {
    board: Board;
    userId?: string;
}

interface ColConfig {
    color: string;
    icon: React.ReactNode;
}

const COLUMN_CONFIG: Array<ColConfig> = [
    {
        color: "bg-cyan-500",
        icon: <Calendar className="h-4 w-4" />,
    },
    {
        color: "bg-purple-500",
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
        color: "bg-green-500",
        icon: <Mic className="h-4 w-4" />,
    },
    {
        color: "bg-yellow-500",
        icon: <Award className="h-4 w-4" />,
    },
    {
        color: "bg-red-500",
        icon: <XCircle className="h-4 w-4" />,
    },
];

function DroppableColumn({
    column,
    config,
    boardId,
    sortedColumns,
}: {
    column: Column;
    config: ColConfig;
    boardId: string;
    sortedColumns: Column[];
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: column._id,
        data: {
            type: "column",
            columnId: column._id,
        },
    });

    const sortedJobs = [...(column.jobApplications || [])].sort((a, b) => a.order - b.order);
    return (
        <Card className="min-w-[300px] flex-shrink-0 shadow-md p-0">
            <CardHeader
                className={`${config.color} text-white rounded-t-lg pb-3 pt-3`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {config.icon}
                        <CardTitle className="text-white text-base font-semibold">
                            {column.name}
                        </CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white hover:bg-white/20"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Column
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent
                ref={setNodeRef}
                className={`space-y-2 pt-4 bg-gray-50/50 min-h-[400px] rounded-b-lg ${isOver ? "ring-2 ring-blue-500" : ""
                    }`}
            >
                <SortableContext
                    items={sortedJobs.map((job) => job._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {sortedJobs.map((job, key) => (
                        <SortableJobCard
                            key={key}
                            job={{ ...job, columnId: job.columnId || column._id }}
                            columns={sortedColumns}
                        />
                    ))}
                </SortableContext>

                <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
            </CardContent>
        </Card>
    );
}

function SortableJobCard({
    job,
    columns,
}: {
    job: JobApplication;
    columns: Column[];
}) {
    const {
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
        setNodeRef,
    } = useSortable({
        id: job._id,
        data: {
            type: "job",
            job,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <div ref={setNodeRef} style={style}>
            <JobApplicationCard
                job={job}
                columns={columns}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}

export default function KanbanBoard({ board }: KanbanBoardProps) {
    const [isResumeLibraryOpen, setIsResumeLibraryOpen] = useState(false);
    const {
        columns,
        rawColumns,
        moveJob,
        activeId,
        setActiveId,
        searchQuery,
        setSearchQuery,
    } = useBoardFacade(board);

    const sortedColumns = [...(columns || [])].sort((a, b) => a.order - b.order);
    const orderColumns = [...(rawColumns || [])].sort((a, b) => a.order - b.order);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    async function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        setActiveId(null);

        if (!over || !board._id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        let draggedJob: JobApplication | null = null;
        let sourceColumn: Column | null = null;
        let sourceIndex = -1;

        for (const column of orderColumns) {
            const jobs = [...(column.jobApplications || [])].sort((a, b) => a.order - b.order);
            const jobIndex = jobs.findIndex((j) => j._id === activeId);
            if (jobIndex !== -1) {
                draggedJob = jobs[jobIndex];
                sourceColumn = column;
                sourceIndex = jobIndex;
                break;
            }
        }

        if (!draggedJob || !sourceColumn) return;

        // Check if dropped in a column or another job
        const targetColumn = orderColumns.find((col) => col._id === overId);
        const targetJob = orderColumns
            .flatMap((col) => col.jobApplications || [])
            .find((job) => job._id === overId);

        let targetColumnId: string;
        let newOrder: number;

        if (targetColumn) {
            targetColumnId = targetColumn._id;
            const jobsInTarget =
                targetColumn.jobApplications
                    .filter((j) => j._id !== activeId)
                    .sort((a, b) => a.order - b.order) || [];
            newOrder = jobsInTarget.length;
        } else if (targetJob) {
            const targetJobColumn = orderColumns.find((col) =>
                col.jobApplications.some((j) => j._id === targetJob._id)
            );
            targetColumnId = targetJob.columnId || targetJobColumn?._id || "";
            if (!targetColumnId) return;

            const targetColumnObj = orderColumns.find(
                (col) => col._id === targetColumnId
            );

            if (!targetColumnObj) return;

            const allJobsInTargetOriginal =
                [...(targetColumnObj.jobApplications || [])].sort((a, b) => a.order - b.order);

            const allJobsInTargetFiltered =
                allJobsInTargetOriginal.filter((j) => j._id !== activeId) || [];

            const targetIndexInOriginal = allJobsInTargetOriginal.findIndex(
                (j) => j._id === overId
            );

            const targetIndexInFiltered = allJobsInTargetFiltered.findIndex(
                (j) => j._id === overId
            );

            if (targetIndexInFiltered !== -1) {
                if (sourceColumn._id === targetColumnId) {
                    if (sourceIndex < targetIndexInOriginal) {
                        newOrder = targetIndexInFiltered + 1;
                    } else {
                        newOrder = targetIndexInFiltered;
                    }
                } else {
                    newOrder = targetIndexInFiltered;
                }
            } else {
                newOrder = allJobsInTargetFiltered.length;
            }
        } else {
            return;
        }

        if (!targetColumnId) {
            return;
        }

        await moveJob(activeId, targetColumnId, newOrder);
    }

    const activeJob = orderColumns
        .flatMap((col) => col.jobApplications || [])
        .find((job) => job._id === activeId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by company, role, or tag..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-white shadow-xs"
                        />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <CreditIndicator />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsResumeLibraryOpen(true)}
                            className="gap-1.5 bg-white text-slate-700 hover:text-indigo-600 shadow-xs border-slate-200"
                        >
                            <FileText className="size-4 text-indigo-500" />
                            Manage Resumes
                        </Button>
                    </div>
                </div>

                <ResumeLibraryDialog
                    open={isResumeLibraryOpen}
                    onOpenChange={setIsResumeLibraryOpen}
                />

                <div className="flex gap-4 overflow-x-auto pb-4">
                    {sortedColumns.map((col, key) => {
                        const config = COLUMN_CONFIG[key] || {
                            color: "bg-gray-500",
                            icon: <Calendar className="h-4 w-4" />,
                        };
                        return (
                            <DroppableColumn
                                key={key}
                                column={col}
                                config={config}
                                boardId={board._id}
                                sortedColumns={sortedColumns}
                            />
                        );
                    })}
                </div>
            </div>

            <DragOverlay>
                {activeJob ? (
                    <div className="opacity-50">
                        <JobApplicationCard job={activeJob} columns={sortedColumns} isOverlay={true} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
