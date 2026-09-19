"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { Edit2, ExternalLink, MoreVertical, Trash2, Sparkles, FileText, Calendar } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
    () => import("./ui/rich-text-editor").then((m) => m.RichTextEditor),
    { ssr: false }
);

const AtsAnalysisModal = dynamic(
    () => import("./ai/ats-analysis-modal").then((m) => m.AtsAnalysisModal),
    { ssr: false }
);

const InterviewsTab = dynamic(
    () => import("./interviews/interviews-tab").then((m) => m.InterviewsTab),
    { ssr: false }
);

import { cn, stripHtmlTags, truncateText } from "@/lib/utils";
import { useBoardFacade } from "@/lib/facades/useBoardFacade";
import {
    updateJobApplicationSchema,
    UpdateJobApplicationInput,
} from "@/lib/validations/job-application";

interface JobApplicationCardProps {
    job: JobApplication;
    columns: Column[];
    dragHandleProps?: React.HTMLAttributes<HTMLElement>;
    isOverlay?: boolean;
}

export default function JobApplicationCard({
    job,
    columns,
    dragHandleProps,
    isOverlay,
}: JobApplicationCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState<"details" | "interviews">("details");
    const [isAtsOpen, setIsAtsOpen] = useState(false);
    const { updateJob, deleteJob, moveJob } = useBoardFacade();

    const now = new Date().getTime();
    const upcomingInterview = job.interviews
        ?.filter(
            (i) => i.status === "scheduled" && new Date(i.scheduledAt).getTime() >= now - 60 * 60 * 1000
        )
        ?.sort(
            (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        )[0];

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpdateJobApplicationInput>({
        resolver: zodResolver(updateJobApplicationSchema),
        defaultValues: {
            company: job.company,
            position: job.position,
            location: job.location || "",
            notes: job.notes || "",
            salary: job.salary || "",
            jobUrl: job.jobUrl || "",
            tags: job.tags?.join(", ") || "",
            description: job.description || "",
        },
    });

    useEffect(() => {
        if (isEditing) {
            reset({
                company: job.company,
                position: job.position,
                location: job.location || "",
                notes: job.notes || "",
                salary: job.salary || "",
                jobUrl: job.jobUrl || "",
                tags: job.tags?.join(", ") || "",
                description: job.description || "",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing, reset]);

    async function onUpdateSubmit(data: UpdateJobApplicationInput) {
        try {
            await updateJob(job._id, data);
            setIsEditing(false);
        } catch {
            // Error handling & toasts are encapsulated in the facade
        }
    }

    async function handleDelete() {
        try {
            await deleteJob(job._id);
        } catch {
            // Handled in facade
        }
    }

    async function handleMove(newColumnId: string) {
        try {
            await moveJob(job._id, newColumnId, 0);
        } catch {
            // Handled in facade
        }
    }

    return (
        <>
            <Card
                className="cursor-pointer transition-shadow hover:shadow-lg bg-white group shadow-sm"
                {...dragHandleProps}
                onClick={() => {
                    setActiveModalTab("details");
                    setIsEditing(true);
                }}
            >
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1">{job.position}</h3>
                            <p className="text-xs text-muted-foreground mb-1.5">
                                {job.company}
                            </p>


                            {upcomingInterview && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveModalTab("interviews");
                                        setIsEditing(true);
                                    }}
                                    className="flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-lg bg-indigo-50/90 border border-indigo-200/80 text-indigo-900 hover:bg-indigo-100/90 transition-colors text-[11px] font-medium cursor-pointer shadow-2xs"
                                    title="Upcoming Interview - Click to view schedule"
                                >
                                    <Calendar className="size-3.5 text-indigo-600 shrink-0" />
                                    <span className="font-semibold text-indigo-950">
                                        {upcomingInterview.roundType}:
                                    </span>
                                    <span className="truncate">
                                        {new Date(upcomingInterview.scheduledAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}{" "}
                                        •{" "}
                                        {new Date(upcomingInterview.scheduledAt).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5 flex-wrap mb-2">
                                {job.atsAnalysis && (
                                    <Badge
                                        variant={
                                            job.atsAnalysis.score >= 75
                                                ? "success"
                                                : job.atsAnalysis.score >= 50
                                                    ? "warning"
                                                    : "danger"
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAtsOpen(true);
                                        }}
                                        className="cursor-pointer gap-1 text-[11px] py-0 px-1.5 hover:opacity-80 transition-opacity"
                                        title="Click to view ATS Score and Recommendations"
                                    >
                                        <Sparkles className="size-3" />
                                        ATS: {job.atsAnalysis.score}%
                                    </Badge>
                                )}
                                {job.attachedResumeName && (
                                    <Badge
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAtsOpen(true);
                                        }}
                                        className="cursor-pointer gap-1 text-[10px] py-0 px-1.5 text-slate-600 bg-slate-50 hover:bg-slate-100"
                                        title="Attached Resume Version"
                                    >
                                        <FileText className="size-3 text-indigo-500" />
                                        <span className="truncate max-w-[120px]">
                                            {job.attachedResumeName}
                                        </span>
                                    </Badge>
                                )}
                                {job.interviews && job.interviews.length > 0 && !upcomingInterview && (
                                    <Badge
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveModalTab("interviews");
                                            setIsEditing(true);
                                        }}
                                        className="cursor-pointer gap-1 text-[10px] py-0 px-1.5 text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                                        title="View Interview Rounds"
                                    >
                                        <Calendar className="size-3 text-indigo-500" />
                                        <span>
                                            {job.interviews.length} Round{job.interviews.length > 1 ? "s" : ""}
                                        </span>
                                    </Badge>
                                )}
                            </div>

                            {job.description && (
                                <p
                                    className="text-xs text-muted-foreground mb-2 truncate max-w-full"
                                    title={stripHtmlTags(job.description)}
                                >
                                    {truncateText(job.description, 85)}
                                </p>
                            )}
                            {job.tags && job.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {job.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {job.jobUrl && (
                                <a
                                    href={job.jobUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>

                        {!isOverlay && (
                            <div className="flex items-start gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAtsOpen(true);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 size-6"
                                    title="AI Intelligence & ATS Match"
                                >
                                    <Sparkles className="size-3.5" />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsAtsOpen(true)}>
                                            <Sparkles className="mr-2 h-4 w-4 text-indigo-600" />
                                            AI & ATS Match
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={() => {
                                                setActiveModalTab("interviews");
                                                setIsEditing(true);
                                            }}
                                        >
                                            <Calendar className="mr-2 h-4 w-4 text-indigo-600" />
                                            Interviews {job.interviews && job.interviews.length > 0 ? `(${job.interviews.length})` : ""}
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={() => {
                                                setActiveModalTab("details");
                                                setIsEditing(true);
                                            }}
                                        >
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Edit Details
                                        </DropdownMenuItem>

                                        {columns.length > 1 && (
                                            <>
                                                {columns
                                                    .filter((c) => c._id !== job.columnId)
                                                    .map((column, key) => (
                                                        <DropdownMenuItem
                                                            key={key}
                                                            onClick={() => handleMove(column._id)}
                                                        >
                                                            Move to {column.name}
                                                        </DropdownMenuItem>
                                                    ))}
                                            </>
                                        )}

                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleDelete()}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {!isOverlay && (
                <>
                    {isAtsOpen && (
                        <AtsAnalysisModal
                            job={job}
                            open={isAtsOpen}
                            onOpenChange={setIsAtsOpen}
                        />
                    )}
                    {isEditing && (
                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                        <DialogContent className="w-[94vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                            <DialogHeader className="p-6 pb-3 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">
                                            {job.company}
                                        </div>
                                        <DialogTitle className="text-xl font-bold text-slate-900">
                                            {job.position}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-slate-500 mt-0.5">
                                            Manage role information, interview stages, and status
                                        </DialogDescription>
                                    </div>
                                </div>


                                <div className="flex items-center gap-1.5 mt-3 p-1 bg-slate-200/70 rounded-xl w-fit text-xs font-medium">
                                    <button
                                        type="button"
                                        onClick={() => setActiveModalTab("details")}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                                            activeModalTab === "details"
                                                ? "bg-white text-slate-900 shadow-xs font-semibold"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                        )}
                                    >
                                        <FileText className="size-3.5" />
                                        <span>Job Details</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveModalTab("interviews")}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                                            activeModalTab === "interviews"
                                                ? "bg-white text-slate-900 shadow-xs font-semibold"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                        )}
                                    >
                                        <Calendar className="size-3.5 text-indigo-600" />
                                        <span>Interviews</span>
                                        {job.interviews && job.interviews.length > 0 && (
                                            <span className="size-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                                                {job.interviews.length}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </DialogHeader>

                            {activeModalTab === "details" ? (
                                <form className="flex flex-col flex-1 overflow-hidden" onSubmit={handleSubmit(onUpdateSubmit)}>
                                    <div className="space-y-4 max-h-[65vh] overflow-y-auto p-6 pt-4 pr-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-company">Company *</Label>
                                                <Input
                                                    id="edit-company"
                                                    {...register("company")}
                                                />
                                                {errors.company && (
                                                    <p className="text-xs text-destructive">{errors.company.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-position">Position *</Label>
                                                <Input
                                                    id="edit-position"
                                                    {...register("position")}
                                                />
                                                {errors.position && (
                                                    <p className="text-xs text-destructive">{errors.position.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-location">Location</Label>
                                                <Input
                                                    id="edit-location"
                                                    {...register("location")}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-salary">Salary</Label>
                                                <Input
                                                    id="edit-salary"
                                                    placeholder="e.g., $100k - $150k"
                                                    {...register("salary")}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-jobUrl">Job URL</Label>
                                            <Input
                                                id="edit-jobUrl"
                                                type="url"
                                                placeholder="https://..."
                                                {...register("jobUrl")}
                                            />
                                            {errors.jobUrl && (
                                                <p className="text-xs text-destructive">{errors.jobUrl.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                                            <Input
                                                id="edit-tags"
                                                placeholder="React, Tailwind, High Pay"
                                                {...register("tags")}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="edit-description">Description</Label>
                                                <span className="text-[11px] text-muted-foreground">Rich text / paste supported</span>
                                            </div>
                                            <Controller
                                                name="description"
                                                control={control}
                                                render={({ field }) => (
                                                    <RichTextEditor
                                                        id="edit-description"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Paste the role details, responsibilities, or requirements..."
                                                    />
                                                )}
                                            />
                                            {errors.description && (
                                                <p className="text-xs text-destructive">{errors.description.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-notes">Notes</Label>
                                            <Textarea
                                                id="edit-notes"
                                                rows={4}
                                                {...register("notes")}
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            ) : (
                                <div className="flex flex-col flex-1 overflow-hidden">
                                    <div className="max-h-[65vh] overflow-y-auto p-6 pt-4">
                                        <InterviewsTab job={job} />
                                    </div>
                                    <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Close
                                        </Button>
                                    </DialogFooter>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                    )}
                </>
            )}
        </>
    );
}