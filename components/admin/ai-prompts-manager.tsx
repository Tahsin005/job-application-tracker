"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    Terminal,
    Sparkles,
    RotateCcw,
    Save,
    Copy,
    Check,
    FileText,
    Mail,
    ScanText,
    Database,
    Code,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAdminPromptsFacade } from "@/lib/facades/useAdminPromptsFacade";
import { AiPromptItem } from "@/lib/models/models.types";

export default function AiPromptsManager({
    prompts: initialPrompts,
}: {
    prompts: AiPromptItem[];
}) {
    const { isSaving, isResetting, activeActionId, savePrompt, resetPrompt } =
        useAdminPromptsFacade();

    const [activeTab, setActiveTab] = useState<string>(
        initialPrompts[0]?.action || "atsScan"
    );

    // Local form state for each prompt's editable fields
    const [drafts, setDrafts] = useState<
        Record<string, { systemPrompt: string; userPromptTemplate: string }>
    >(() => {
        const initialDrafts: Record<
            string,
            { systemPrompt: string; userPromptTemplate: string }
        > = {};
        for (const p of initialPrompts) {
            initialDrafts[p.action] = {
                systemPrompt: p.systemPrompt,
                userPromptTemplate: p.userPromptTemplate,
            };
        }
        return initialDrafts;
    });

    const [copiedVar, setCopiedVar] = useState<string | null>(null);

    const currentPrompt =
        initialPrompts.find((p) => p.action === activeTab) || initialPrompts[0];

    const currentDraft = drafts[activeTab] || {
        systemPrompt: currentPrompt?.systemPrompt || "",
        userPromptTemplate: currentPrompt?.userPromptTemplate || "",
    };

    const isCurrentDirty =
        currentDraft.systemPrompt !== currentPrompt?.systemPrompt ||
        currentDraft.userPromptTemplate !== currentPrompt?.userPromptTemplate;

    const handleCopyVariable = (variableKey: string) => {
        navigator.clipboard.writeText(variableKey);
        setCopiedVar(variableKey);
        toast.success(`Copied "${variableKey}" to clipboard!`);
        setTimeout(() => setCopiedVar(null), 2000);
    };

    const handleDraftChange = (
        field: "systemPrompt" | "userPromptTemplate",
        value: string
    ) => {
        setDrafts((prev) => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        if (!currentPrompt) return;

        if (!currentDraft.systemPrompt.trim()) {
            toast.error("System prompt cannot be empty.");
            return;
        }

        if (!currentDraft.userPromptTemplate.trim()) {
            toast.error("User prompt template cannot be empty.");
            return;
        }

        await savePrompt({
            action: currentPrompt.action,
            name: currentPrompt.name,
            systemPrompt: currentDraft.systemPrompt.trim(),
            userPromptTemplate: currentDraft.userPromptTemplate.trim(),
            description: currentPrompt.description,
        });
    };

    const handleReset = async () => {
        if (!currentPrompt) return;
        const success = await resetPrompt(currentPrompt.action, currentPrompt.name);
        if (success) {
            // Delete draft key so currentDraft cleanly falls back to refreshed codebase default
            setDrafts((prev) => {
                const next = { ...prev };
                delete next[currentPrompt.action];
                return next;
            });
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case "atsScan":
                return <ScanText className="h-4 w-4 text-emerald-600" />;
            case "coverLetter":
                return <FileText className="h-4 w-4 text-purple-600" />;
            case "outreach":
                return <Mail className="h-4 w-4 text-blue-600" />;
            default:
                return <Sparkles className="h-4 w-4 text-slate-500" />;
        }
    };

    return (
        <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <Terminal className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-900">
                                AI Prompt Templates
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Configure system instructions and prompt templates for each AI action. Overrides are stored in MongoDB with codebase defaults as fallback.
                            </CardDescription>
                        </div>
                    </div>
                </div>


                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2 overflow-x-auto pb-1">
                    {initialPrompts.map((p) => {
                        const isActive = p.action === activeTab;
                        return (
                            <button
                                key={p.action}
                                type="button"
                                onClick={() => setActiveTab(p.action)}
                                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${isActive
                                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20 shadow-2xs font-semibold"
                                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600"
                                    }`}
                            >
                                {getActionIcon(p.action)}
                                <span>{p.name}</span>
                                {p.isCustomized ? (
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none text-[9px] px-1.5 py-0 uppercase font-semibold">
                                        DB Override
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-slate-400 border-slate-200 text-[9px] px-1.5 py-0 uppercase">
                                        Default
                                    </Badge>
                                )}
                            </button>
                        );
                    })}
                </div>
            </CardHeader>

            {currentPrompt && (
                <CardContent className="space-y-4">

                    <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                            <p className="font-semibold text-slate-800">
                                {currentPrompt.name}
                            </p>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                                {currentPrompt.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {currentPrompt.isCustomized ? (
                                <Badge className="bg-blue-600 text-white gap-1 text-[11px] font-medium">
                                    <Database className="h-3 w-3" />
                                    Customized in MongoDB
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 gap-1 text-[11px]">
                                    <Code className="h-3 w-3 text-slate-400" />
                                    Active Codebase Default
                                </Badge>
                            )}
                        </div>
                    </div>


                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                            Supported Template Placeholders (Click to copy):
                        </Label>
                        <div className="flex flex-wrap gap-1.5">
                            {currentPrompt.supportedVariables.map((v) => {
                                const isCopied = copiedVar === v.key;
                                return (
                                    <button
                                        key={v.key}
                                        type="button"
                                        onClick={() => handleCopyVariable(v.key)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors border border-slate-200/80"
                                        title={`Copy ${v.key} (${v.label})`}
                                    >
                                        {isCopied ? (
                                            <Check className="h-3 w-3 text-emerald-600" />
                                        ) : (
                                            <Copy className="h-3 w-3 text-slate-400" />
                                        )}
                                        <span className="font-semibold">{v.key}</span>
                                        <span className="text-[10px] text-slate-400 font-sans">
                                            ({v.label})
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>


                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-slate-800">
                                System Prompt (Persona, Constraints & Output Schema)
                            </Label>
                            <span className="text-[10px] text-slate-400 font-mono">
                                {currentDraft.systemPrompt.length} chars
                            </span>
                        </div>
                        <textarea
                            value={currentDraft.systemPrompt}
                            onChange={(e) => handleDraftChange("systemPrompt", e.target.value)}
                            rows={10}
                            className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:bg-white leading-relaxed resize-y"
                            placeholder="Define the system persona and instructions..."
                        />
                    </div>


                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-slate-800">
                                User Prompt Template (Dynamic Context & Variable Injection)
                            </Label>
                            <span className="text-[10px] text-slate-400 font-mono">
                                {currentDraft.userPromptTemplate.length} chars
                            </span>
                        </div>
                        <textarea
                            value={currentDraft.userPromptTemplate}
                            onChange={(e) => handleDraftChange("userPromptTemplate", e.target.value)}
                            rows={6}
                            className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:bg-white leading-relaxed resize-y"
                            placeholder="Define user template with {{company}}, {{jobTitle}}, etc..."
                        />
                    </div>


                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                            {isCurrentDirty ? (
                                <span className="text-amber-600 font-medium">
                                    ● Unsaved modifications in editor
                                </span>
                            ) : currentPrompt.isCustomized ? (
                                <span className="text-blue-600 font-medium">
                                    ✓ Active custom prompt loaded from MongoDB
                                </span>
                            ) : (
                                <span className="text-slate-400">
                                    Standard codebase default in use
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {currentPrompt.isCustomized && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isResetting && activeActionId === currentPrompt.action}
                                    onClick={handleReset}
                                    className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-9"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    {isResetting && activeActionId === currentPrompt.action
                                        ? "Resetting..."
                                        : "Reset to Default"}
                                </Button>
                            )}

                            <Button
                                type="button"
                                size="sm"
                                disabled={isSaving && activeActionId === currentPrompt.action}
                                onClick={handleSave}
                                className="bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs h-9 min-w-[130px]"
                            >
                                <Save className="h-3.5 w-3.5" />
                                {isSaving && activeActionId === currentPrompt.action
                                    ? "Saving to DB..."
                                    : "Save Prompt"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
