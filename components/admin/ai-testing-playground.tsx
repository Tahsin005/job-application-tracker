"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    Sparkles,
    Play,
    CheckCircle2,
    XCircle,
    Clock,
    Save,
    RotateCcw,
    Zap,
    ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAdminAiFacade } from "@/lib/facades/useAdminAiFacade";
import { AiProviderType } from "@/lib/models/models.types";

interface ProviderSpec {
    id: AiProviderType;
    name: string;
    description: string;
    docUrl: string;
    docLabel: string;
    baseUrlPlaceholder: string;
    apiKeyPlaceholder: string;
    modelPlaceholder: string;
}

const PROVIDER_SPECS: Record<AiProviderType, ProviderSpec> = {
    agentrouter: {
        id: "agentrouter",
        name: "AgentRouter",
        description: "High-throughput LLM gateway aggregating DeepSeek, Qwen, and open models.",
        docUrl: "https://agentrouter.org",
        docLabel: "agentrouter.org",
        baseUrlPlaceholder: "e.g. https://agentrouter.org/v1",
        apiKeyPlaceholder: "sk-...",
        modelPlaceholder: "e.g. deepseek-v4-flash, deepseek-v3, deepseek-r1",
    },
    openai: {
        id: "openai",
        name: "OpenAI",
        description: "Official OpenAI REST API for GPT-4o, GPT-4o-mini, and o1 reasoning models.",
        docUrl: "https://platform.openai.com/docs/api-reference",
        docLabel: "platform.openai.com",
        baseUrlPlaceholder: "e.g. https://api.openai.com/v1",
        apiKeyPlaceholder: "sk-proj-... or sk-...",
        modelPlaceholder: "e.g. gpt-4o, gpt-4o-mini, o1-mini",
    },
    anthropic: {
        id: "anthropic",
        name: "Anthropic Claude",
        description: "Official Anthropic Messages API for Claude 3.5 Sonnet and Haiku.",
        docUrl: "https://docs.anthropic.com/en/api/messages",
        docLabel: "docs.anthropic.com",
        baseUrlPlaceholder: "e.g. https://api.anthropic.com/v1",
        apiKeyPlaceholder: "sk-ant-api03-...",
        modelPlaceholder: "e.g. claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022",
    },
    gemini: {
        id: "gemini",
        name: "Google Gemini",
        description: "Official Google Gemini Developer API with 1M+ token context.",
        docUrl: "https://ai.google.dev/gemini-api/docs",
        docLabel: "ai.google.dev",
        baseUrlPlaceholder: "e.g. https://generativelanguage.googleapis.com/v1beta",
        apiKeyPlaceholder: "AIzaSy...",
        modelPlaceholder: "e.g. gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-exp",
    },
    groq: {
        id: "groq",
        name: "Groq Cloud",
        description: "LPU Inference Engine serving Llama 3.3 and open models at 500+ tok/sec.",
        docUrl: "https://console.groq.com/docs/models",
        docLabel: "console.groq.com",
        baseUrlPlaceholder: "e.g. https://api.groq.com/openai/v1",
        apiKeyPlaceholder: "gsk_...",
        modelPlaceholder: "e.g. llama-3.3-70b-versatile, llama-3.1-8b-instant",
    },
    custom: {
        id: "custom",
        name: "Custom / Self-Hosted",
        description: "Any OpenAI-compatible server (Local Ollama, vLLM, DeepSeek Direct, Together AI).",
        docUrl: "https://platform.openai.com/docs/api-reference/chat",
        docLabel: "OpenAI Spec",
        baseUrlPlaceholder: "e.g. http://localhost:11434/v1 or https://...",
        apiKeyPlaceholder: "sk-... (or leave empty if local server)",
        modelPlaceholder: "e.g. llama3, mistral, deepseek-r1",
    },
};

export default function AiTestingPlayground({
    onSaved,
}: {
    onSaved?: () => void;
}) {
    const {
        isTesting,
        testResult,
        isSaving,
        testConnection,
        saveConfig,
        clearTestResult,
    } = useAdminAiFacade();

    const [provider, setProvider] = useState<AiProviderType>("agentrouter");
    const activeSpec = PROVIDER_SPECS[provider];

    // Completely un-prefilled, fully flexible form inputs
    const [baseUrl, setBaseUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState("");

    // Save dialog state
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [configName, setConfigName] = useState("");
    const [isDefault, setIsDefault] = useState(true);

    const handleSelectProvider = (target: AiProviderType) => {
        setProvider(target);
        clearTestResult();
        // Do NOT prefill anything in input boxes to maintain 100% flexibility
    };

    const handleClearAll = () => {
        clearTestResult();
        setBaseUrl("");
        setApiKey("");
        setModel("");
        setConfigName("");
    };

    const handleTest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!model.trim()) {
            toast.error("Please enter a target model name.");
            return;
        }

        const result = await testConnection({
            provider,
            baseUrl: baseUrl.trim(),
            apiKey: apiKey.trim(),
            model: model.trim(),
        });

        if (result?.success && !configName) {
            setConfigName(`${activeSpec.name} (${model.trim()})`);
        }
    };

    const handleOpenSaveDialog = () => {
        if (!model.trim()) {
            toast.error("Please enter a target model name before saving.");
            return;
        }

        if (!configName) {
            setConfigName(`${activeSpec.name} (${model.trim()})`);
        }
        setSaveDialogOpen(true);
    };

    const handleConfirmSave = async () => {
        if (!configName.trim()) {
            toast.error("Please enter a configuration name.");
            return;
        }

        const success = await saveConfig({
            name: configName.trim(),
            provider,
            baseUrl: baseUrl.trim(),
            apiKey: apiKey.trim(),
            model: model.trim(),
            isDefault,
            isActive: true,
        });

        if (success) {
            setSaveDialogOpen(false);
            if (onSaved) onSaved();
        }
    };

    return (
        <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-900">
                                AI Provider Testing Playground
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Test live latency and save flexible AI credentials directly to MongoDB.
                            </CardDescription>
                        </div>
                    </div>
                </div>


                <div className="pt-3 border-t border-slate-100 mt-2">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Select AI Provider:
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {(Object.keys(PROVIDER_SPECS) as AiProviderType[]).map((key) => {
                            const spec = PROVIDER_SPECS[key];
                            const isSelected = provider === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleSelectProvider(key)}
                                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${isSelected
                                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20 shadow-xs font-semibold"
                                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700"
                                        }`}
                                >
                                    <span className="text-xs font-medium">{spec.name}</span>
                                    {key === "agentrouter" && (
                                        <span className="text-[9px] text-emerald-600 font-bold uppercase mt-1">
                                            Active .env
                                        </span>
                                    )}
                                    {key === "openai" && (
                                        <span className="text-[9px] text-slate-400 font-normal mt-1">
                                            Official API
                                        </span>
                                    )}
                                    {key === "anthropic" && (
                                        <span className="text-[9px] text-purple-600 font-normal mt-1">
                                            Claude 3.5
                                        </span>
                                    )}
                                    {key === "gemini" && (
                                        <span className="text-[9px] text-blue-600 font-normal mt-1">
                                            1M+ Context
                                        </span>
                                    )}
                                    {key === "groq" && (
                                        <span className="text-[9px] text-amber-600 font-normal mt-1">
                                            Fast LPU
                                        </span>
                                    )}
                                    {key === "custom" && (
                                        <span className="text-[9px] text-slate-400 font-normal mt-1">
                                            Ollama / vLLM
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-800">{activeSpec.name}:</span>{" "}
                        {activeSpec.description}
                    </p>
                    <a
                        href={activeSpec.docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium shrink-0"
                    >
                        Official Docs ({activeSpec.docLabel})
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>

                <form onSubmit={handleTest} className="space-y-4">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-800">
                                Base URL
                            </Label>
                            <Input
                                type="text"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                placeholder={activeSpec.baseUrlPlaceholder}
                                className="h-9 text-xs font-mono bg-slate-50/50"
                            />
                            <p className="text-[11px] text-slate-400">
                                Leave blank to use {activeSpec.name}&apos;s default endpoint.
                            </p>
                        </div>


                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-800">
                                API Key
                            </Label>
                            <Input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={activeSpec.apiKeyPlaceholder}
                                className="h-9 text-xs font-mono bg-slate-50/50"
                            />
                            <p className="text-[11px] text-slate-400">
                                Visible text. Optional for local Ollama / offline models.
                            </p>
                        </div>


                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-800">
                                Model Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder={activeSpec.modelPlaceholder}
                                className="h-9 text-xs font-mono bg-slate-50/50"
                                required
                            />
                            <p className="text-[11px] text-slate-400">
                                Exact model identifier to invoke.
                            </p>
                        </div>
                    </div>


                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <span>Testing target:</span>
                            <span className="font-semibold text-slate-700">
                                {activeSpec.name} {model ? `(${model})` : ""}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClearAll}
                                className="gap-1 text-xs text-slate-600 h-9"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Clear
                            </Button>


                            <Button
                                type="submit"
                                size="sm"
                                disabled={isTesting}
                                className="bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs h-9 min-w-[140px]"
                            >
                                {isTesting ? (
                                    <>
                                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                        Testing Connection...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3.5 w-3.5 fill-current" />
                                        Test Connection
                                    </>
                                )}
                            </Button>


                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleOpenSaveDialog}
                                disabled={isSaving}
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 gap-1.5 text-xs h-9 font-medium"
                            >
                                <Save className="h-3.5 w-3.5" />
                                Save to Configs
                            </Button>
                        </div>
                    </div>
                </form>


                {testResult && (
                    <div
                        className={`p-4 rounded-lg border text-xs transition-all ${testResult.success
                                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                                : "bg-red-50/70 border-red-200 text-red-950"
                            }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 font-semibold text-sm">
                                {testResult.success ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                                )}
                                <span>
                                    {testResult.success
                                        ? `${activeSpec.name} Connection Verified`
                                        : `${activeSpec.name} Probe Failed`}
                                </span>
                            </div>

                            {testResult.latencyMs > 0 && (
                                <Badge
                                    variant="outline"
                                    className={`text-xs gap-1 font-mono font-medium ${testResult.success
                                            ? "bg-white text-emerald-700 border-emerald-300"
                                            : "bg-white text-red-700 border-red-300"
                                        }`}
                                >
                                    <Clock className="h-3 w-3" />
                                    {testResult.latencyMs} ms
                                </Badge>
                            )}
                        </div>

                        <p className="mt-2 text-xs leading-relaxed font-mono whitespace-pre-wrap break-all">
                            {testResult.message}
                        </p>

                        {testResult.modelOutput && (
                            <div className="mt-2.5 p-2.5 bg-white/80 rounded border border-emerald-200 text-xs font-mono">
                                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                    Model Response Snippet:
                                </span>
                                <span className="text-emerald-900 font-medium">
                                    {testResult.modelOutput}
                                </span>
                            </div>
                        )}

                        {testResult.success && (
                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-200/60">
                                <span className="text-[11px] text-emerald-800 flex items-center gap-1">
                                    <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                    Ready to be saved as active provider.
                                </span>
                                <Button
                                    size="sm"
                                    onClick={handleOpenSaveDialog}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-3 text-xs gap-1"
                                >
                                    <Save className="h-3.5 w-3.5" />
                                    Save This Provider
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>


            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">
                            Save AI Configuration
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Persist these credentials to your MongoDB database.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">
                                Configuration Name
                            </Label>
                            <Input
                                value={configName}
                                onChange={(e) => setConfigName(e.target.value)}
                                placeholder={`e.g. ${activeSpec.name} (${model})`}
                                className="h-9 text-xs"
                                autoFocus
                            />
                        </div>

                        <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1 font-mono">
                            <div>
                                <span className="text-slate-400">Provider:</span>{" "}
                                <span className="font-semibold text-slate-800">{activeSpec.name}</span>
                            </div>
                            <div>
                                <span className="text-slate-400">Model:</span>{" "}
                                <span className="font-semibold text-slate-800">{model}</span>
                            </div>
                            <div className="truncate">
                                <span className="text-slate-400">Base URL:</span>{" "}
                                <span className="text-slate-600">{baseUrl || "(Default SDK Endpoint)"}</span>
                            </div>
                            <div className="truncate">
                                <span className="text-slate-400">API Key:</span>{" "}
                                <span className="text-slate-600">{apiKey || "(None / Local)"}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="isDefaultModal"
                                checked={isDefault}
                                onChange={(e) => setIsDefault(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="isDefaultModal" className="text-xs font-medium text-slate-800 cursor-pointer">
                                Set as Default Active Provider (used immediately across all platform AI tasks)
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSaveDialogOpen(false)}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleConfirmSave}
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary/90 text-white text-xs gap-1"
                        >
                            {isSaving ? "Saving..." : "Confirm & Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
