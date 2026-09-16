"use client";

import { useState } from "react";
import { JobApplication } from "@/lib/models/models.types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { stripHtmlTags } from "@/lib/utils";
import { useAiResumeFacade } from "@/lib/facades/useAiResumeFacade";
import {
    Sparkles,
    FileText,
    CheckCircle2,
    AlertCircle,
    Copy,
    Check,
    Send,
    Loader2,
    Briefcase,
    TrendingUp,
    ListCheck,
    RotateCcw,
} from "lucide-react";

interface AtsAnalysisModalProps {
    job: JobApplication;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AtsAnalysisModal({ job, open, onOpenChange }: AtsAnalysisModalProps) {
    const [activeTab, setActiveTab] = useState<"ats" | "cover-letter" | "outreach" | "resume">("ats");
    const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
    const [copiedOutreach, setCopiedOutreach] = useState(false);

    const {
        resumes,
        defaultResume,
        usage,
        isAnalyzingAts,
        isGeneratingCoverLetter,
        isGeneratingOutreach,
        runAtsMatch,
        generateCoverLetter,
        generateOutreach,
        attachResume,
    } = useAiResumeFacade();

    const [selectedResumeId, setSelectedResumeId] = useState<string>(
        job.resumeId || defaultResume?._id || ""
    );

    const ats = job.atsAnalysis;
    const atsScore = ats?.score ?? 0;

    // Remaining tries
    const atsRemaining = usage?.atsScan?.remaining ?? 3;
    const coverLetterRemaining = usage?.coverLetter?.remaining ?? 3;
    const outreachRemaining = usage?.outreach?.remaining ?? 3;

    async function handleRunAts() {
        if (!selectedResumeId) return;
        try {
            await runAtsMatch(job._id, selectedResumeId);
        } catch {
            // Error toast handled in facade
        }
    }

    async function handleGenerateCoverLetter() {
        if (!selectedResumeId) return;
        try {
            await generateCoverLetter(job._id, selectedResumeId);
        } catch {
            // Error toast handled in facade
        }
    }

    async function handleGenerateOutreach() {
        if (!selectedResumeId) return;
        try {
            await generateOutreach(job._id, selectedResumeId);
        } catch {
            // Error toast handled in facade
        }
    }

    async function handleAttachResume() {
        if (!selectedResumeId) return;
        try {
            await attachResume(job._id, selectedResumeId);
        } catch {
            // Error toast handled in facade
        }
    }

    function copyToClipboard(text: string, type: "cover" | "outreach") {
        navigator.clipboard.writeText(text);
        if (type === "cover") {
            setCopiedCoverLetter(true);
            setTimeout(() => setCopiedCoverLetter(false), 2000);
        } else {
            setCopiedOutreach(true);
            setTimeout(() => setCopiedOutreach(false), 2000);
        }
    }

    // Circular gauge properties
    const strokeDasharray = 2 * Math.PI * 42;
    const strokeDashoffset = strokeDasharray - (strokeDasharray * atsScore) / 100;
    const scoreColor =
        atsScore >= 75
            ? "text-emerald-500 stroke-emerald-500"
            : atsScore >= 50
                ? "text-amber-500 stroke-amber-500"
                : "text-rose-500 stroke-rose-500";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[94vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant="outline" className="text-xs bg-white text-slate-700">
                                    <Briefcase className="size-3 mr-1" />
                                    {job.company}
                                </Badge>
                                {job.attachedResumeName && (
                                    <Badge variant="secondary" className="text-[11px] gap-1 bg-indigo-50 text-indigo-700">
                                        <FileText className="size-3" />
                                        {job.attachedResumeName}
                                    </Badge>
                                )}
                            </div>
                            <DialogTitle className="text-xl font-bold text-slate-900">
                                {job.position}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 mt-0.5">
                                AI Intelligence Hub • Powered by AgentRouter AI
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 bg-slate-200/70 p-1.5 rounded-xl text-xs sm:text-sm font-medium">
                        <button
                            type="button"
                            onClick={() => setActiveTab("ats")}
                            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                                activeTab === "ats"
                                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            }`}
                        >
                            <TrendingUp className="size-4 text-indigo-600 shrink-0" />
                            <span>ATS Match</span>
                            {ats && (
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                        atsScore >= 75
                                            ? "bg-emerald-100 text-emerald-700"
                                            : atsScore >= 50
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-rose-100 text-rose-700"
                                    }`}
                                >
                                    {atsScore}%
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("cover-letter")}
                            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                                activeTab === "cover-letter"
                                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            }`}
                        >
                            <Sparkles className="size-4 text-indigo-600 shrink-0" />
                            <span>Cover Letter</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("outreach")}
                            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                                activeTab === "outreach"
                                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            }`}
                        >
                            <Send className="size-4 text-indigo-600 shrink-0" />
                            <span>Cold Outreach</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("resume")}
                            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                                activeTab === "resume"
                                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            }`}
                        >
                            <FileText className="size-4 text-indigo-600 shrink-0" />
                            <span>Attached Resume</span>
                        </button>
                    </div>
                </DialogHeader>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-indigo-950">Active Resume:</span>
                            {resumes.length > 0 ? (
                                <select
                                    value={selectedResumeId}
                                    onChange={(e) => setSelectedResumeId(e.target.value)}
                                    className="text-xs bg-white border border-indigo-200 rounded-md px-2.5 py-1 text-slate-800 font-medium focus:outline-indigo-500"
                                >
                                    {resumes.map((r) => (
                                        <option key={r._id} value={r._id}>
                                            {r.name} {r.isDefault ? "(Default)" : ""}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="text-xs text-rose-600 font-medium">
                                    No resumes in library! Please upload one first.
                                </span>
                            )}
                        </div>

                        {job.description ? (
                            <span className="text-[11px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md font-medium">
                                ✓ Job description provided ({stripHtmlTags(job.description).length} chars)
                            </span>
                        ) : (
                            <span className="text-[11px] text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md font-medium">
                                ⚠ No job description (edit application to add one for deeper matching)
                            </span>
                        )}
                    </div>


                    {activeTab === "ats" && (
                        <div className="space-y-6">
                            {!ats ? (
                                <div className="py-10 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                                    <div className="size-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                                        <TrendingUp className="size-7" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800">
                                        Analyze ATS Resume vs Job Description
                                    </h3>
                                    <p className="text-xs text-slate-500 max-w-md mt-1 mb-5">
                                        Run an automated Applicant Tracking System scan to calculate your match score, missing technical keywords, and metric-driven bullet points.
                                    </p>
                                    <Button
                                        onClick={handleRunAts}
                                        disabled={isAnalyzingAts || resumes.length === 0 || atsRemaining <= 0}
                                        size="lg"
                                        className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                                    >
                                        {isAnalyzingAts ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="size-4" />
                                        )}
                                        Run ATS Match Scan
                                        <Badge
                                            variant="secondary"
                                            className="bg-indigo-500 text-white text-[10px] ml-1.5"
                                        >
                                            {atsRemaining} left
                                        </Badge>
                                    </Button>
                                    {atsRemaining <= 0 && (
                                        <p className="text-xs text-rose-500 mt-2">
                                            Limit of 3 tries reached for ATS Matcher.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">

                                    <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center justify-between gap-6 flex-wrap">
                                        <div className="flex items-center gap-5">

                                            <div className="relative size-24 shrink-0 flex items-center justify-center">
                                                <svg className="size-24 -rotate-90">
                                                    <circle
                                                        cx="48"
                                                        cy="48"
                                                        r="42"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        fill="transparent"
                                                        className="text-slate-100"
                                                    />
                                                    <circle
                                                        cx="48"
                                                        cy="48"
                                                        r="42"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        strokeDasharray={strokeDasharray}
                                                        strokeDashoffset={strokeDashoffset}
                                                        strokeLinecap="round"
                                                        fill="transparent"
                                                        className={`${scoreColor} transition-all duration-1000 ease-out`}
                                                    />
                                                </svg>
                                                <div className="absolute flex flex-col items-center justify-center text-center">
                                                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                                                        {atsScore}%
                                                    </span>
                                                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Match
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base font-bold text-slate-900">
                                                        {atsScore >= 75
                                                            ? "Strong ATS Match 🎉"
                                                            : atsScore >= 50
                                                                ? "Moderate Alignment ⚖️"
                                                                : "Requires Optimization ⚠️"}
                                                    </h3>
                                                    {ats.resumeName && (
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {ats.resumeName}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1 max-w-md">
                                                    {ats.summary}
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRunAts}
                                            disabled={isAnalyzingAts || atsRemaining <= 0}
                                            className="gap-1.5 text-xs text-slate-700"
                                        >
                                            {isAnalyzingAts ? (
                                                <Loader2 className="size-3.5 animate-spin" />
                                            ) : (
                                                <RotateCcw className="size-3.5" />
                                            )}
                                            Re-run Scan ({atsRemaining} tries left)
                                        </Button>
                                    </div>


                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                                            <div className="flex items-center gap-2 mb-2.5">
                                                <CheckCircle2 className="size-4 text-emerald-600" />
                                                <h4 className="text-xs font-bold text-emerald-950 tracking-wider">
                                                    Matched Skills & Keywords ({ats.matchedKeywords?.length || 0})
                                                </h4>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {ats.matchedKeywords?.length ? (
                                                    ats.matchedKeywords.map((kw, i) => (
                                                        <Badge
                                                            key={i}
                                                            variant="success"
                                                            className="text-xs font-normal"
                                                        >
                                                            ✓ {kw}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        No direct keyword matches found.
                                                    </span>
                                                )}
                                            </div>
                                        </div>


                                        <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30">
                                            <div className="flex items-center gap-2 mb-2.5">
                                                <AlertCircle className="size-4 text-rose-600" />
                                                <h4 className="text-xs font-bold text-rose-950 tracking-wider">
                                                    Missing Target Keywords ({ats.missingKeywords?.length || 0})
                                                </h4>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {ats.missingKeywords?.length ? (
                                                    ats.missingKeywords.map((kw, i) => (
                                                        <Badge
                                                            key={i}
                                                            variant="danger"
                                                            className="text-xs font-normal"
                                                        >
                                                            + {kw}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        No critical keywords missing!
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>


                                    {ats.actionVerbRecommendations?.length > 0 && (
                                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                                            <div className="flex items-center gap-2 mb-3">
                                                <ListCheck className="size-4 text-indigo-600" />
                                                <h4 className="text-xs font-bold text-slate-900 tracking-wider">
                                                    Action Verb & Quantifiable Metrics Recommendations
                                                </h4>
                                            </div>
                                            <ul className="space-y-2">
                                                {ats.actionVerbRecommendations.map((rec, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-xs text-slate-700 flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-100"
                                                    >
                                                        <span className="size-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                            {i + 1}
                                                        </span>
                                                        <span>{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}


                    {activeTab === "cover-letter" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Tailored 3-Paragraph Cover Letter
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Personalized for {job.company} based on your resume achievements and the job description.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleGenerateCoverLetter}
                                    disabled={isGeneratingCoverLetter || coverLetterRemaining <= 0 || !selectedResumeId}
                                    size="sm"
                                    className="gap-1.5 bg-indigo-600 text-white"
                                >
                                    {isGeneratingCoverLetter ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="size-3.5" />
                                    )}
                                    {job.aiCoverLetter ? "Regenerate" : "Generate Cover Letter"}
                                    <Badge variant="secondary" className="text-[10px] bg-indigo-500 text-white ml-1">
                                        {coverLetterRemaining} left
                                    </Badge>
                                </Button>
                            </div>

                            {job.aiCoverLetter ? (
                                <div className="space-y-3">
                                    <div className="relative p-5 rounded-xl border border-slate-200 bg-white font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-line shadow-xs">
                                        {job.aiCoverLetter}
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(job.aiCoverLetter || "", "cover")}
                                            className="gap-1.5 text-xs"
                                        >
                                            {copiedCoverLetter ? (
                                                <>
                                                    <Check className="size-3.5 text-emerald-600" />
                                                    Copied to Clipboard!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3.5" />
                                                    Copy Cover Letter
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50">
                                    <FileText className="size-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500">
                                        No cover letter generated yet. Click above to generate a tailored letter.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}


                    {activeTab === "outreach" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        LinkedIn & Recruiter Cold Outreach Message
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Concise, high-impact message to message the hiring team at {job.company}.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleGenerateOutreach}
                                    disabled={isGeneratingOutreach || outreachRemaining <= 0 || !selectedResumeId}
                                    size="sm"
                                    className="gap-1.5 bg-indigo-600 text-white"
                                >
                                    {isGeneratingOutreach ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <Send className="size-3.5" />
                                    )}
                                    {job.aiOutreachMessage ? "Regenerate" : "Generate Outreach"}
                                    <Badge variant="secondary" className="text-[10px] bg-indigo-500 text-white ml-1">
                                        {outreachRemaining} left
                                    </Badge>
                                </Button>
                            </div>

                            {job.aiOutreachMessage ? (
                                <div className="space-y-3">
                                    <div className="relative p-5 rounded-xl border border-slate-200 bg-white font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-line shadow-xs">
                                        {job.aiOutreachMessage}
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(job.aiOutreachMessage || "", "outreach")}
                                            className="gap-1.5 text-xs"
                                        >
                                            {copiedOutreach ? (
                                                <>
                                                    <Check className="size-3.5 text-emerald-600" />
                                                    Copied to Clipboard!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3.5" />
                                                    Copy Outreach Message
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50">
                                    <Send className="size-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500">
                                        No outreach message generated yet. Click above to generate a high-converting message.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}


                    {activeTab === "resume" && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Resume Version for this Application
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Track exactly which resume file/version was submitted for {job.company}.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-slate-400 block mb-1">
                                        Currently Linked Resume:
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <FileText className="size-4 text-indigo-600" />
                                        <span className="text-sm font-semibold text-slate-900">
                                            {job.attachedResumeName || "None attached yet"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <span className="text-xs font-semibold text-slate-800">
                                    Change Attached Version:
                                </span>
                                <div className="space-y-2">
                                    {resumes.map((r) => (
                                        <div
                                            key={r._id}
                                            onClick={() => setSelectedResumeId(r._id)}
                                            className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${selectedResumeId === r._id
                                                    ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <FileText className="size-4 text-slate-500" />
                                                <span className="text-xs font-medium text-slate-800">
                                                    {r.name}
                                                </span>
                                                {r.isDefault && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                            {selectedResumeId === r._id && (
                                                <Check className="size-4 text-indigo-600" />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end pt-3">
                                    <Button
                                        onClick={handleAttachResume}
                                        disabled={!selectedResumeId || selectedResumeId === job.resumeId}
                                        size="sm"
                                        className="gap-1.5"
                                    >
                                        <Check className="size-3.5" />
                                        Save Attached Version
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
