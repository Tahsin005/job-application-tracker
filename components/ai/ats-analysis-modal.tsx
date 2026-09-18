"use client";

import { useState } from "react";
import { AtsAnalysis, JobApplication } from "@/lib/models/models.types";
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
import { TopUpModal } from "../top-up/top-up-modal";
import {
    Sparkles,
    FileText,
    CheckCircle2,
    AlertCircle,
    Copy,
    Check,
    Send,
    Mail,
    Loader2,
    Briefcase,
    TrendingUp,
    ListCheck,
    RotateCcw,
    Zap,
} from "lucide-react";

function CreditRefillCallout({
    featureName,
    onTopUp,
}: {
    featureName: string;
    onTopUp: () => void;
}) {
    return (
        <div className="p-3.5 rounded-xl bg-linear-to-r from-amber-50 via-orange-50/50 to-amber-50/70 border border-amber-200/90 flex items-center justify-between gap-3 text-left shadow-2xs">
            <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                    <Sparkles className="size-4" />
                </div>
                <div>
                    <p className="text-xs font-bold text-amber-950">
                        Out of {featureName} credits?
                    </p>
                    <p className="text-[11px] text-amber-800/90">
                        Top up instant packs to continue scanning, writing letters, and generating messages.
                    </p>
                </div>
            </div>
            <Button
                size="sm"
                type="button"
                onClick={onTopUp}
                className="bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs h-8 px-3 gap-1.5 shrink-0 shadow-xs cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
            >
                <Zap className="size-3.5 fill-white" />
                Top Up
            </Button>
        </div>
    );
}

interface AtsAnalysisModalProps {
    job: JobApplication;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AtsAnalysisModal({ job, open, onOpenChange }: AtsAnalysisModalProps) {
    const [activeTab, setActiveTab] = useState<
        "ats" | "cover-letter" | "outreach" | "application-email" | "resume"
    >("ats");
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
    const [copiedOutreach, setCopiedOutreach] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const [localApplicationEmail, setLocalApplicationEmail] = useState<string | null>(null);
    const [localCoverLetter, setLocalCoverLetter] = useState<string | null>(null);
    const [localOutreach, setLocalOutreach] = useState<string | null>(null);
    const [localAtsAnalysis, setLocalAtsAnalysis] = useState<AtsAnalysis | null>(null);
    const [userSelectedResumeId, setSelectedResumeId] = useState<string | null>(null);
    const [prevJobId, setPrevJobId] = useState(job._id);

    if (job._id !== prevJobId) {
        setPrevJobId(job._id);
        setLocalApplicationEmail(null);
        setLocalCoverLetter(null);
        setLocalOutreach(null);
        setLocalAtsAnalysis(null);
        setSelectedResumeId(null);
    }

    const {
        resumes,
        defaultResume,
        usage,
        isAnalyzingAts,
        isGeneratingCoverLetter,
        isGeneratingOutreach,
        isGeneratingApplicationEmail,
        runAtsMatch,
        generateCoverLetter,
        generateOutreach,
        generateApplicationEmail,
        attachResume,
    } = useAiResumeFacade();

    const isValidUserSelection =
        userSelectedResumeId && resumes.some((r) => r._id === userSelectedResumeId);
    const selectedResumeId =
        (isValidUserSelection ? userSelectedResumeId : "") ||
        job.resumeId ||
        defaultResume?._id ||
        resumes[0]?._id ||
        "";

    const ats = localAtsAnalysis || job.atsAnalysis;
    const atsScore = ats?.score ?? 0;
    const currentCoverLetter = localCoverLetter || job.aiCoverLetter;
    const currentOutreach = localOutreach || job.aiOutreachMessage;
    const currentEmail = localApplicationEmail || job.aiApplicationEmail;

    // Remaining tries
    const atsRemaining = usage?.atsScan?.remaining ?? 3;
    const coverLetterRemaining = usage?.coverLetter?.remaining ?? 3;
    const outreachRemaining = usage?.outreach?.remaining ?? 3;
    const applicationEmailRemaining = usage?.applicationEmail?.remaining ?? 3;

    // Prerequisites validation for Application Email
    const hasDescription = Boolean(job.description && stripHtmlTags(job.description).trim().length > 0);
    const hasResume = Boolean(selectedResumeId && resumes.length > 0);
    const canGenerateApplicationEmail =
        hasDescription &&
        hasResume &&
        applicationEmailRemaining > 0 &&
        !isGeneratingApplicationEmail;

    async function handleRunAts() {
        if (!selectedResumeId) return;
        try {
            const res = await runAtsMatch(job._id, selectedResumeId);
            if (res?.analysis) {
                setLocalAtsAnalysis(res.analysis);
            }
        } catch {
            // Error toast handled in facade
        }
    }

    async function handleGenerateCoverLetter() {
        if (!selectedResumeId) return;
        try {
            const letter = await generateCoverLetter(job._id, selectedResumeId);
            if (letter) {
                setLocalCoverLetter(letter);
            }
        } catch {
            // Error toast handled in facade
        }
    }

    async function handleGenerateOutreach() {
        if (!selectedResumeId) return;
        try {
            const message = await generateOutreach(job._id, selectedResumeId);
            if (message) {
                setLocalOutreach(message);
            }
        } catch {
            // Error toast handled in facade
        }
    }

    async function handleGenerateApplicationEmail() {
        if (!canGenerateApplicationEmail || !selectedResumeId) return;
        try {
            const email = await generateApplicationEmail(job._id, selectedResumeId);
            if (email) {
                setLocalApplicationEmail(email);
            }
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

    function copyToClipboard(text: string, type: "cover" | "outreach" | "email") {
        navigator.clipboard.writeText(text);
        if (type === "cover") {
            setCopiedCoverLetter(true);
            setTimeout(() => setCopiedCoverLetter(false), 2000);
        } else if (type === "outreach") {
            setCopiedOutreach(true);
            setTimeout(() => setCopiedOutreach(false), 2000);
        } else {
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
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
        <>
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

                        <div className="flex items-center gap-2 shrink-0 pt-1">
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => setIsTopUpOpen(true)}
                                className="gap-1.5 border-amber-300 bg-linear-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 font-semibold shadow-2xs text-xs rounded-full px-3 py-1 cursor-pointer transition-all"
                            >
                                <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
                                <span>Top Up Credits</span>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-4 bg-slate-200/70 p-1.5 rounded-xl text-xs sm:text-sm font-medium">
                        <button
                            type="button"
                            onClick={() => setActiveTab("ats")}
                            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === "ats"
                                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                }`}
                        >
                            <TrendingUp className="size-4 text-indigo-600 shrink-0" />
                            <span>ATS Match</span>
                            {ats && (
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${atsScore >= 75
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
                            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === "cover-letter"
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
                            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === "outreach"
                                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                }`}
                        >
                            <Send className="size-4 text-indigo-600 shrink-0" />
                            <span>Cold Outreach</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("application-email")}
                            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === "application-email"
                                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                }`}
                        >
                            <Mail className="size-4 text-indigo-600 shrink-0" />
                            <span>Application Email</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("resume")}
                            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === "resume"
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
                                    {atsRemaining <= 0 ? (
                                        <div className="mt-4 max-w-md mx-auto">
                                            <CreditRefillCallout
                                                featureName="ATS Matcher"
                                                onTopUp={() => setIsTopUpOpen(true)}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setIsTopUpOpen(true)}
                                            className="text-[11px] text-slate-500 hover:text-amber-700 mt-2 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <span>Running low? Top up packs anytime</span>
                                            <span className="text-amber-600 font-semibold">→</span>
                                        </button>
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

                                        <div className="flex items-center gap-2">
                                            {atsRemaining <= 0 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() => setIsTopUpOpen(true)}
                                                    className="gap-1.5 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold text-xs rounded-full px-3 cursor-pointer"
                                                >
                                                    <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
                                                    Top Up
                                                </Button>
                                            )}
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
                                    </div>

                                    {atsRemaining <= 0 && (
                                        <CreditRefillCallout
                                            featureName="ATS Matcher"
                                            onTopUp={() => setIsTopUpOpen(true)}
                                        />
                                    )}


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
                                <div className="flex items-center gap-2">
                                    {coverLetterRemaining <= 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            type="button"
                                            onClick={() => setIsTopUpOpen(true)}
                                            className="gap-1.5 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold text-xs rounded-full px-3 cursor-pointer"
                                        >
                                            <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
                                            Top Up
                                        </Button>
                                    )}
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
                                        {currentCoverLetter ? "Regenerate" : "Generate Cover Letter"}
                                        <Badge variant="secondary" className="text-[10px] bg-indigo-500 text-white ml-1">
                                            {coverLetterRemaining} left
                                        </Badge>
                                    </Button>
                                </div>
                            </div>

                            {coverLetterRemaining <= 0 ? (
                                <CreditRefillCallout
                                    featureName="Cover Letter"
                                    onTopUp={() => setIsTopUpOpen(true)}
                                />
                            ) : (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsTopUpOpen(true)}
                                        className="text-[11px] text-slate-500 hover:text-amber-700 flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <span>Need more cover letters? Top up anytime</span>
                                        <span className="text-amber-600 font-semibold">→</span>
                                    </button>
                                </div>
                            )}

                            {currentCoverLetter ? (
                                <div className="space-y-3">
                                    <div className="relative p-5 rounded-xl border border-slate-200 bg-white font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-line shadow-xs">
                                        {currentCoverLetter}
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(currentCoverLetter || "", "cover")}
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
                                <div className="flex items-center gap-2">
                                    {outreachRemaining <= 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            type="button"
                                            onClick={() => setIsTopUpOpen(true)}
                                            className="gap-1.5 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold text-xs rounded-full px-3 cursor-pointer"
                                        >
                                            <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
                                            Top Up
                                        </Button>
                                    )}
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
                                        {currentOutreach ? "Regenerate" : "Generate Outreach"}
                                        <Badge variant="secondary" className="text-[10px] bg-indigo-500 text-white ml-1">
                                            {outreachRemaining} left
                                        </Badge>
                                    </Button>
                                </div>
                            </div>

                            {outreachRemaining <= 0 ? (
                                <CreditRefillCallout
                                    featureName="Cold Outreach"
                                    onTopUp={() => setIsTopUpOpen(true)}
                                />
                            ) : (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsTopUpOpen(true)}
                                        className="text-[11px] text-slate-500 hover:text-amber-700 flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <span>Need more outreach messages? Top up anytime</span>
                                        <span className="text-amber-600 font-semibold">→</span>
                                    </button>
                                </div>
                            )}

                            {currentOutreach ? (
                                <div className="space-y-3">
                                    <div className="relative p-5 rounded-xl border border-slate-200 bg-white font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-line shadow-xs">
                                        {currentOutreach}
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(currentOutreach || "", "outreach")}
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


                    {activeTab === "application-email" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Formal Job Application Email
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Custom-crafted submission email with subject line tailored to the job description and your resume achievements.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {applicationEmailRemaining <= 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            type="button"
                                            onClick={() => setIsTopUpOpen(true)}
                                            className="gap-1.5 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold text-xs rounded-full px-3 cursor-pointer"
                                        >
                                            <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
                                            Top Up
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleGenerateApplicationEmail}
                                        disabled={!canGenerateApplicationEmail}
                                        size="sm"
                                        className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {isGeneratingApplicationEmail ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <Mail className="size-3.5" />
                                        )}
                                        {currentEmail ? "Regenerate Email" : "Generate Application Email"}
                                        <Badge variant="secondary" className="text-[10px] bg-indigo-500 text-white ml-1">
                                            {applicationEmailRemaining} left
                                        </Badge>
                                    </Button>
                                </div>
                            </div>

                            {applicationEmailRemaining <= 0 && (
                                <CreditRefillCallout
                                    featureName="Application Email"
                                    onTopUp={() => setIsTopUpOpen(true)}
                                />
                            )}


                            {!hasDescription && (
                                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-xs text-amber-900 flex items-start gap-2.5">
                                    <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold block">Job Description Required</span>
                                        An application email requires a job description so the AI can tailor your pitch directly to the role requirements. Please close this modal and edit the job application to add a description.
                                    </div>
                                </div>
                            )}

                            {!hasResume && (
                                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 text-xs text-rose-900 flex items-start gap-2.5">
                                    <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold block">Resume Required</span>
                                        An application email requires candidate resume details for tailored accuracy. Please upload a resume to your library or select one from the Active Resume dropdown above.
                                    </div>
                                </div>
                            )}

                            {currentEmail ? (
                                <div className="space-y-3">
                                    <div className="relative p-5 rounded-xl border border-slate-200 bg-white font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-line shadow-xs">
                                        {currentEmail}
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(currentEmail || "", "email")}
                                            className="gap-1.5 text-xs"
                                        >
                                            {copiedEmail ? (
                                                <>
                                                    <Check className="size-3.5 text-emerald-600" />
                                                    Copied to Clipboard!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3.5" />
                                                    Copy Application Email
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50">
                                    <Mail className="size-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500">
                                        {hasDescription && hasResume
                                            ? "No application email generated yet. Click above to craft a tailored email draft."
                                            : "Provide both a job description and a candidate resume to generate an accurate application email."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}


                    {activeTab === "resume" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Resume Version for this Application
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
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

                            <div className="space-y-3 pt-2">
                                <span className="text-xs font-semibold text-slate-800 block">
                                    Change Attached Version:
                                </span>
                                <div className="space-y-3">
                                    {resumes.map((r) => (
                                        <div
                                            key={r._id}
                                            onClick={() => setSelectedResumeId(r._id)}
                                            className={`py-3.5 px-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all min-h-[56px] ${selectedResumeId === r._id
                                                ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500 shadow-xs"
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg shrink-0 ${selectedResumeId === r._id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                                                    <FileText className="size-4" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-slate-900">
                                                            {r.name}
                                                        </span>
                                                        {r.isDefault && (
                                                            <Badge variant="outline" className="text-[10px] font-medium bg-slate-50 border-slate-200">
                                                                Default
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {r.updatedAt && (
                                                        <span className="text-[11px] text-slate-400 block">
                                                            Updated {new Date(r.updatedAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedResumeId === r._id && (
                                                <div className="size-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 ml-3">
                                                    <Check className="size-3.5" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end pt-5">
                                    <Button
                                        onClick={handleAttachResume}
                                        disabled={!selectedResumeId || selectedResumeId === job.resumeId}
                                        size="sm"
                                        className="gap-1.5 h-9 px-4 font-medium"
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

        <TopUpModal open={isTopUpOpen} onOpenChange={setIsTopUpOpen} />
        </>
    );
}
