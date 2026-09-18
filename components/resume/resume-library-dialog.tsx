"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { useAiResumeFacade } from "@/lib/facades/useAiResumeFacade";
import {
    FileText,
    Upload,
    Check,
    Star,
    Trash2,
    Loader2,
    FileCheck,
    Pencil,
    X,
    AlertCircle,
} from "lucide-react";

interface ResumeLibraryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ResumeLibraryDialog({ open, onOpenChange }: ResumeLibraryDialogProps) {
    const [activeTab, setActiveTab] = useState<"list" | "upload" | "paste">("list");
    const [resumeName, setResumeName] = useState("");
    const [resumeText, setResumeText] = useState("");
    const [fileData, setFileData] = useState("");
    const [fileSize, setFileSize] = useState(0);
    const [isDefault, setIsDefault] = useState(false);
    const [isParsingPdf, setIsParsingPdf] = useState(false);
    const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    const {
        resumes,
        isLoadingResumes,
        isSavingResume,
        isRenamingResume,
        createResume,
        renameResume,
        setDefaultResume,
        deleteResume,
        extractPdfText,
    } = useAiResumeFacade();

    const oldestResume =
        resumes.length > 0
            ? [...resumes].sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              )[0]
            : null;

    function handleStartRename(resume: (typeof resumes)[number]) {
        setEditingResumeId(resume._id);
        setEditingName(resume.name);
    }

    function handleCancelRename() {
        setEditingResumeId(null);
        setEditingName("");
    }

    async function handleSaveRename(resumeId: string) {
        if (!editingName.trim()) return;
        try {
            await renameResume(resumeId, editingName.trim());
            setEditingResumeId(null);
            setEditingName("");
        } catch {
            // Toast handled by facade
        }
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsingPdf(true);
        try {
            const data = await extractPdfText(file);
            setResumeName(data.name.replace(/\.pdf$/i, ""));
            setResumeText(data.textContent);
            setFileData(data.fileData);
            setFileSize(data.size);
        } catch {
            // Toast handled in facade
        } finally {
            setIsParsingPdf(false);
        }
    }

    async function handleSaveResume(e: React.FormEvent) {
        e.preventDefault();
        if (!resumeName.trim() || !resumeText.trim()) return;

        try {
            await createResume({
                name: resumeName.trim(),
                textContent: resumeText.trim(),
                fileData,
                fileSize,
                isDefault,
            });

            // Reset form
            setResumeName("");
            setResumeText("");
            setFileData("");
            setFileSize(0);
            setIsDefault(false);
            setActiveTab("list");
        } catch {
            // Handled in facade
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[92vw] sm:max-w-3xl md:max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                                <FileText className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-semibold text-slate-900">
                                    Resume Library & Version Tracking
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500">
                                    Manage versions of your resume for ATS analysis and job applications
                                </DialogDescription>
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center gap-1.5 mt-4 bg-slate-200/60 p-1 rounded-lg text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveTab("list")}
                            className={`flex-1 py-1.5 font-medium rounded-md transition-all ${activeTab === "list"
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            Saved Resumes ({resumes.length}/3)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("upload")}
                            className={`flex-1 py-1.5 font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${activeTab === "upload"
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Upload className="size-3.5" />
                            Upload PDF
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("paste")}
                            className={`flex-1 py-1.5 font-medium rounded-md transition-all ${activeTab === "paste"
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            Paste Text
                        </button>
                    </div>
                </DialogHeader>

                <div className="p-6 overflow-y-auto flex-1">

                    {activeTab === "list" && (
                        <div className="space-y-3">
                            {isLoadingResumes ? (
                                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                                    <Loader2 className="size-6 animate-spin text-indigo-500" />
                                    <span className="text-xs">Loading resumes...</span>
                                </div>
                            ) : resumes.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                                    <div className="size-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                                        <FileText className="size-6" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-slate-800">
                                        No resumes saved yet
                                    </h4>
                                    <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                                        Upload your master resume or different targeted versions (e.g. Frontend vs Fullstack) to compare against job descriptions.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveTab("upload")}
                                        className="gap-1.5"
                                    >
                                        <Upload className="size-3.5" />
                                        Upload First Resume
                                    </Button>
                                </div>
                            ) : (
                                resumes.map((resume) => (
                                    <div
                                        key={resume._id}
                                        className={`p-4 rounded-xl border transition-all ${resume.isDefault
                                                ? "border-indigo-300 bg-indigo-50/30 shadow-xs"
                                                : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div
                                                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${resume.isDefault
                                                            ? "bg-indigo-600 text-white"
                                                            : "bg-slate-100 text-slate-600"
                                                        }`}
                                                >
                                                    <FileCheck className="size-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    {editingResumeId === resume._id ? (
                                                        <div className="flex items-center gap-1.5 w-full max-w-sm mt-0.5">
                                                            <Input
                                                                value={editingName}
                                                                onChange={(e) => setEditingName(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                        handleSaveRename(resume._id);
                                                                    } else if (e.key === "Escape") {
                                                                        e.preventDefault();
                                                                        handleCancelRename();
                                                                    }
                                                                }}
                                                                disabled={isRenamingResume}
                                                                autoFocus
                                                                className="h-7 text-xs px-2 py-0 font-medium bg-white"
                                                                placeholder="Resume name"
                                                            />
                                                            <Button
                                                                type="button"
                                                                size="icon-xs"
                                                                variant="ghost"
                                                                disabled={isRenamingResume || !editingName.trim()}
                                                                onClick={() => handleSaveRename(resume._id)}
                                                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shrink-0"
                                                                title="Save Name"
                                                            >
                                                                {isRenamingResume ? (
                                                                    <Loader2 className="size-3.5 animate-spin" />
                                                                ) : (
                                                                    <Check className="size-3.5" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="icon-xs"
                                                                variant="ghost"
                                                                disabled={isRenamingResume}
                                                                onClick={handleCancelRename}
                                                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                                                                title="Cancel"
                                                            >
                                                                <X className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="text-sm font-semibold text-slate-900 truncate max-w-[280px]">
                                                                {resume.name}
                                                            </h4>
                                                            {resume.isDefault && (
                                                                <Badge
                                                                    variant="default"
                                                                    className="bg-indigo-600 text-[10px] py-0 px-1.5"
                                                                >
                                                                    Primary Resume
                                                                </Badge>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStartRename(resume)}
                                                                className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-slate-100"
                                                                title="Rename Resume"
                                                            >
                                                                <Pencil className="size-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                        {resume.textContent.slice(0, 140)}...
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                                                        <span>
                                                            {resume.textContent.length.toLocaleString()}{" "}
                                                            chars
                                                        </span>
                                                        {resume.fileSize ? (
                                                            <span>
                                                                • {(resume.fileSize / 1024).toFixed(0)}{" "}
                                                                KB
                                                            </span>
                                                        ) : null}
                                                        <span>
                                                            • Added{" "}
                                                            {new Date(
                                                                resume.createdAt
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                {!resume.isDefault && (
                                                    <Button
                                                        variant="ghost"
                                                        size="xs"
                                                        onClick={() => setDefaultResume(resume._id)}
                                                        className="text-xs gap-1 text-slate-600 hover:text-indigo-600"
                                                        title="Set as Default Resume"
                                                    >
                                                        <Star className="size-3.5" />
                                                        Make Default
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => deleteResume(resume._id)}
                                                    className="text-slate-400 hover:text-rose-600"
                                                    title="Delete Resume"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}


                    {activeTab === "upload" && (
                        <form onSubmit={handleSaveResume} className="space-y-4">
                            {resumes.length >= 3 && oldestResume && (
                                <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
                                    <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="leading-relaxed">
                                        <span className="font-semibold">Maximum capacity reached (3/3).</span>
                                        {" "}Saving a new resume will automatically delete your oldest saved version:{" "}
                                        <span className="font-semibold underline decoration-amber-400 underline-offset-2">
                                            &ldquo;{oldestResume.name}&rdquo;
                                        </span>.
                                    </div>
                                </div>
                            )}
                            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
                                <input
                                    type="file"
                                    id="pdf-upload"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isParsingPdf}
                                />
                                <label
                                    htmlFor="pdf-upload"
                                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                                >
                                    <div className="p-3 bg-white shadow-xs rounded-full border border-slate-200 text-indigo-600">
                                        {isParsingPdf ? (
                                            <Loader2 className="size-6 animate-spin text-indigo-600" />
                                        ) : (
                                            <Upload className="size-6" />
                                        )}
                                    </div>
                                    <div className="text-sm font-medium text-slate-800">
                                        {isParsingPdf
                                            ? "Extracting resume text with unpdf..."
                                            : "Click to select or drop your resume PDF"}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Supported format: PDF up to 10MB
                                    </p>
                                </label>
                            </div>

                            {resumeText && (
                                <div className="space-y-3 pt-2">
                                    <div>
                                        <Label htmlFor="pdf-resume-name" className="text-xs">
                                            Resume Version Name
                                        </Label>
                                        <Input
                                            id="pdf-resume-name"
                                            value={resumeName}
                                            onChange={(e) => setResumeName(e.target.value)}
                                            placeholder="e.g. Frontend_Lead_2026.pdf"
                                            className="mt-1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <Label htmlFor="pdf-extracted-text" className="text-xs">
                                                Extracted Text Preview
                                            </Label>
                                            <span className="text-[11px] text-slate-400">
                                                {resumeText.length.toLocaleString()} characters
                                            </span>
                                        </div>
                                        <Textarea
                                            id="pdf-extracted-text"
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                            rows={6}
                                            className="font-mono text-xs"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <input
                                            type="checkbox"
                                            id="pdf-is-default"
                                            checked={isDefault}
                                            onChange={(e) => setIsDefault(e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <Label
                                            htmlFor="pdf-is-default"
                                            className="text-xs text-slate-700 font-normal cursor-pointer"
                                        >
                                            Set as default resume for new applications
                                        </Label>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setResumeText("");
                                                setResumeName("");
                                            }}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={isSavingResume}
                                            className="gap-1.5"
                                        >
                                            {isSavingResume ? (
                                                <Loader2 className="size-3.5 animate-spin" />
                                            ) : (
                                                <Check className="size-3.5" />
                                            )}
                                            Save to Library
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}


                    {activeTab === "paste" && (
                        <form onSubmit={handleSaveResume} className="space-y-4">
                            {resumes.length >= 3 && oldestResume && (
                                <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
                                    <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="leading-relaxed">
                                        <span className="font-semibold">Maximum capacity reached (3/3).</span>
                                        {" "}Saving a new resume will automatically delete your oldest saved version:{" "}
                                        <span className="font-semibold underline decoration-amber-400 underline-offset-2">
                                            &ldquo;{oldestResume.name}&rdquo;
                                        </span>.
                                    </div>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="paste-resume-name" className="text-xs">
                                    Resume Version Name
                                </Label>
                                <Input
                                    id="paste-resume-name"
                                    value={resumeName}
                                    onChange={(e) => setResumeName(e.target.value)}
                                    placeholder="e.g. Fullstack_Profile_v1"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <Label htmlFor="paste-resume-text" className="text-xs">
                                        Resume Content
                                    </Label>
                                    <span className="text-[11px] text-slate-400">
                                        {resumeText.length.toLocaleString()} characters
                                    </span>
                                </div>
                                <Textarea
                                    id="paste-resume-text"
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    placeholder="Paste your skills, experience, projects, education, and achievements here..."
                                    rows={10}
                                    className="font-mono text-xs"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="paste-is-default"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <Label
                                    htmlFor="paste-is-default"
                                    className="text-xs text-slate-700 font-normal cursor-pointer"
                                >
                                    Set as default resume
                                </Label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveTab("list")}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSavingResume || !resumeText.trim()}
                                    className="gap-1.5"
                                >
                                    {isSavingResume ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <Check className="size-3.5" />
                                    )}
                                    Save Resume
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
