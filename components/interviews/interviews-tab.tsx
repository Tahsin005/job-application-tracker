"use client";

import React, { useState } from "react";
import { JobApplication, InterviewRound, InterviewStatus } from "@/lib/models/models.types";
import { useBoardFacade } from "@/lib/facades/useBoardFacade";
import { InterviewRoundBadge, InterviewStatusBadge, ROUND_CONFIG } from "./interview-round-badge";
import { InterviewRoundForm } from "./interview-round-form";
import { InterviewRoundInput } from "@/lib/validations/job-application";
import {
    createGoogleCalendarUrl,
    generateIcsContent,
    downloadIcsFile,
    getInterviewCalendarPayload,
} from "@/lib/utils/calendar";
import { Button } from "../ui/button";
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    UserCheck,
    Video,
    ExternalLink,
    Download,
    Edit2,
    Trash2,
    CheckCircle2,
    MoreHorizontal,
    CalendarPlus,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InterviewsTabProps {
    job: JobApplication;
}

export function InterviewsTab({ job }: InterviewsTabProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRound, setEditingRound] = useState<InterviewRound | null>(null);
    const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

    const { addInterview, updateInterview, deleteInterview, isMutating } = useBoardFacade();

    const interviews = (job.interviews || []).slice().sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

    // Find next upcoming interview
    const now = new Date().getTime();
    const upcomingInterviews = interviews.filter(
        (i) => i.status === "scheduled" && new Date(i.scheduledAt).getTime() >= now - 60 * 60 * 1000
    );
    const nextUpcoming = upcomingInterviews[0];

    const handleOpenCreateForm = () => {
        setEditingRound(null);
        setIsFormOpen(true);
    };

    const handleOpenEditForm = (round: InterviewRound) => {
        setEditingRound(round);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data: InterviewRoundInput) => {
        try {
            if (editingRound?._id) {
                await updateInterview(job._id, editingRound._id, data);
            } else {
                await addInterview(job._id, data);
            }
            setIsFormOpen(false);
            setEditingRound(null);
        } catch {
            // Facade handles toast
        }
    };

    const handleDelete = async (roundId: string) => {
        if (confirm("Are you sure you want to remove this interview round?")) {
            await deleteInterview(job._id, roundId);
        }
    };

    const handleStatusChange = async (round: InterviewRound, newStatus: InterviewStatus) => {
        if (!round._id) return;
        await updateInterview(job._id, round._id, {
            status: newStatus,
        });
    };

    const handleAddToGoogleCalendar = (round: InterviewRound) => {
        const payload = getInterviewCalendarPayload(round, {
            company: job.company,
            position: job.position,
            location: job.location,
        });
        const url = createGoogleCalendarUrl(payload);
        window.open(url, "_blank", "noopener,noreferrer");
        toast.success("Opening Google Calendar in new tab...");
    };

    const handleDownloadIcs = (round: InterviewRound) => {
        const payload = getInterviewCalendarPayload(round, {
            company: job.company,
            position: job.position,
            location: job.location,
        });
        const ics = generateIcsContent(payload);
        const filename = `${job.company.replace(/\s+/g, "_")}_${round.roundType}_Interview.ics`;
        downloadIcsFile(filename, ics);
        toast.success("Downloaded .ics calendar file!");
    };

    const handleExportAllIcs = () => {
        if (interviews.length === 0) return;
        const payloads = interviews.map((round) =>
            getInterviewCalendarPayload(round, {
                company: job.company,
                position: job.position,
                location: job.location,
            })
        );
        const ics = generateIcsContent(payloads);
        const filename = `${job.company.replace(/\s+/g, "_")}_All_Interviews.ics`;
        downloadIcsFile(filename, ics);
        toast.success(`Exported ${interviews.length} interview round${interviews.length > 1 ? "s" : ""} to .ics!`);
    };

    const toggleNotes = (id: string) => {
        setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const formatInterviewDate = (dateVal: string | Date) => {
        const d = new Date(dateVal);
        return d.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatInterviewTime = (dateVal: string | Date) => {
        const d = new Date(dateVal);
        return d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getRelativeTime = (dateVal: string | Date) => {
        const d = new Date(dateVal).getTime();
        const diffHours = (d - now) / (1000 * 60 * 60);

        if (diffHours < -24) {
            const daysAgo = Math.round(Math.abs(diffHours) / 24);
            return `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
        }
        if (diffHours < 0) {
            return "Earlier today";
        }
        if (diffHours <= 24) {
            return "Tomorrow";
        }
        const daysAhead = Math.round(diffHours / 24);
        return `In ${daysAhead} days`;
    };

    return (
        <div className="space-y-4">

            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                        Interview Schedule & Pipeline
                    </h4>
                    <p className="text-xs text-slate-500">
                        Track multi-stage rounds, sync with calendars, and organize interview prep.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {interviews.length > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleExportAllIcs}
                            className="text-xs gap-1.5 h-8 text-slate-700"
                            title="Export all interview rounds to an .ics calendar file"
                        >
                            <Download className="size-3.5 text-indigo-600" />
                            <span>Export .ics</span>
                        </Button>
                    )}

                    {!isFormOpen && (
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleOpenCreateForm}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 h-8 font-medium shadow-xs"
                        >
                            <Plus className="size-3.5 stroke-[2.5]" />
                            <span>Schedule Round</span>
                        </Button>
                    )}
                </div>
            </div>


            {isFormOpen && (
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                        <div className="flex items-center gap-2">
                            <CalendarPlus className="size-4 text-indigo-600" />
                            <h5 className="text-xs font-semibold text-slate-900">
                                {editingRound ? "Edit Interview Round" : "Schedule New Interview Round"}
                            </h5>
                        </div>
                    </div>

                    <InterviewRoundForm
                        initialData={editingRound}
                        onSubmit={handleFormSubmit}
                        onCancel={() => {
                            setIsFormOpen(false);
                            setEditingRound(null);
                        }}
                        isSubmitting={isMutating}
                    />
                </div>
            )}


            {nextUpcoming && !isFormOpen && (
                <div className="p-3.5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="size-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Clock className="size-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold text-blue-950">
                                        Next Up: {nextUpcoming.customRoundName || `${nextUpcoming.roundType} Round`}
                                    </span>
                                    <span className="text-[11px] font-medium px-2 py-0.2 rounded-full bg-blue-100 text-blue-800">
                                        {getRelativeTime(nextUpcoming.scheduledAt)}
                                    </span>
                                </div>
                                <p className="text-xs text-blue-900/80 mt-0.5">
                                    {formatInterviewDate(nextUpcoming.scheduledAt)} at{" "}
                                    {formatInterviewTime(nextUpcoming.scheduledAt)} ({nextUpcoming.durationMinutes || 60}m)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            {nextUpcoming.meetingUrl && (
                                <a
                                    href={nextUpcoming.meetingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
                                >
                                    <Video className="size-3.5" />
                                    <span>Join</span>
                                </a>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddToGoogleCalendar(nextUpcoming)}
                                className="h-7 text-[11px] px-2 bg-white gap-1 text-slate-700 hover:text-indigo-600"
                                title="Add next interview to Google Calendar"
                            >
                                <CalendarIcon className="size-3" />
                                <span>G-Cal</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}


            {interviews.length > 0 && (
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Round Progression ({interviews.length} Total)
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {interviews.map((round, idx) => {
                            const config = ROUND_CONFIG[round.roundType] || ROUND_CONFIG.Other;
                            const Icon = config.icon;

                            return (
                                <React.Fragment key={round._id || idx}>
                                    <div
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium bg-white",
                                            round.status === "passed"
                                                ? "border-emerald-300 text-emerald-800 bg-emerald-50/50"
                                                : round.status === "completed"
                                                    ? "border-slate-300 text-slate-700"
                                                    : "border-indigo-300 text-indigo-900 bg-indigo-50/30"
                                        )}
                                    >
                                        <span className="size-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                            {idx + 1}
                                        </span>
                                        <Icon className="size-3.5 shrink-0" />
                                        <span>{round.customRoundName || round.roundType}</span>
                                    </div>
                                    {idx < interviews.length - 1 && (
                                        <span className="text-slate-300 font-bold text-xs">→</span>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}


            {interviews.length > 0 ? (
                <div className="space-y-2.5">
                    {interviews.map((round, index) => {
                        const roundKey = round._id || index.toString();
                        const isNotesOpen = expandedNotes[roundKey] ?? false;

                        return (
                            <div
                                key={roundKey}
                                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-2.5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-slate-400">
                                                #{index + 1}
                                            </span>
                                            <InterviewRoundBadge roundType={round.roundType} />
                                            {round.customRoundName && (
                                                <span className="text-xs font-semibold text-slate-800">
                                                    {round.customRoundName}
                                                </span>
                                            )}
                                            <InterviewStatusBadge status={round.status} />
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap pt-0.5">
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="size-3.5 text-slate-400" />
                                                <span>{formatInterviewDate(round.scheduledAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="size-3.5 text-slate-400" />
                                                <span>
                                                    {formatInterviewTime(round.scheduledAt)} ({round.durationMinutes || 60}m)
                                                </span>
                                            </div>
                                            {round.interviewerNames && (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <UserCheck className="size-3.5 text-slate-400" />
                                                    <span>{round.interviewerNames}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="flex items-center gap-1 shrink-0">

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAddToGoogleCalendar(round)}
                                            className="h-8 px-2 text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 gap-1"
                                            title="Add to Google Calendar"
                                        >
                                            <CalendarIcon className="size-3.5" />
                                            <span className="hidden sm:inline">Google Cal</span>
                                        </Button>


                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => handleDownloadIcs(round)}
                                            className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                                            title="Download .ics Calendar File (Apple / Outlook)"
                                        >
                                            <Download className="size-3.5" />
                                        </Button>


                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-xs" className="h-8 w-8 text-slate-500">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenEditForm(round)}>
                                                    <Edit2 className="mr-2 size-3.5 text-slate-500" />
                                                    Edit Round
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusChange(round, "passed")}
                                                    disabled={round.status === "passed"}
                                                >
                                                    <CheckCircle2 className="mr-2 size-3.5 text-emerald-600" />
                                                    Mark as Passed
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusChange(round, "completed")}
                                                    disabled={round.status === "completed"}
                                                >
                                                    <CheckCircle2 className="mr-2 size-3.5 text-slate-500" />
                                                    Mark as Completed
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => round._id && handleDelete(round._id)}
                                                >
                                                    <Trash2 className="mr-2 size-3.5" />
                                                    Delete Round
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>


                                {(round.meetingUrl || round.location) && (
                                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap">
                                        {round.meetingUrl && (
                                            <a
                                                href={round.meetingUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                                            >
                                                <Video className="size-3.5" />
                                                <span>Meeting Link</span>
                                                <ExternalLink className="size-3" />
                                            </a>
                                        )}
                                        {round.location && (
                                            <span className="text-xs text-slate-500">
                                                • {round.location}
                                            </span>
                                        )}
                                    </div>
                                )}


                                {(round.notes || round.feedback) && (
                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleNotes(roundKey)}
                                            className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
                                        >
                                            <span>
                                                {isNotesOpen ? "Hide" : "View"} Preparation Notes & Feedback
                                            </span>
                                            {isNotesOpen ? (
                                                <ChevronUp className="size-3" />
                                            ) : (
                                                <ChevronDown className="size-3" />
                                            )}
                                        </button>

                                        {isNotesOpen && (
                                            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                                                {round.notes && (
                                                    <div>
                                                        <span className="font-semibold text-slate-800 block text-[11px]">
                                                            Prep Notes:
                                                        </span>
                                                        <p className="whitespace-pre-wrap">{round.notes}</p>
                                                    </div>
                                                )}
                                                {round.feedback && (
                                                    <div className="pt-1.5 border-t border-slate-200">
                                                        <span className="font-semibold text-emerald-800 block text-[11px]">
                                                            Feedback & Reflections:
                                                        </span>
                                                        <p className="whitespace-pre-wrap">{round.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                !isFormOpen && (
                    <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                            <CalendarIcon className="size-6" />
                        </div>
                        <div className="max-w-xs mx-auto">
                            <h5 className="text-sm font-semibold text-slate-900">
                                No interviews scheduled yet
                            </h5>
                            <p className="text-xs text-slate-500 mt-1">
                                Track screening calls, coding rounds, and final interviews with one-click Google Calendar & .ics sync.
                            </p>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleOpenCreateForm}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 font-medium shadow-xs"
                        >
                            <Plus className="size-3.5 stroke-[2.5]" />
                            <span>Schedule First Round</span>
                        </Button>
                    </div>
                )
            )}
        </div>
    );
}
