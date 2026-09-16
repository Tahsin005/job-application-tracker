import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminAiConfigsAction } from "@/lib/actions/admin-ai";
import { getAdminPromptsAction } from "@/lib/actions/admin-prompts";
import { Cpu, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AiTestingPlayground from "@/components/admin/ai-testing-playground";
import AiConfigsList from "@/components/admin/ai-configs-list";
import AiPromptsManager from "@/components/admin/ai-prompts-manager";

async function AdminAiContent() {
    const [configRes, promptRes] = await Promise.all([
        getAdminAiConfigsAction(),
        getAdminPromptsAction(),
    ]);

    if (configRes.error || !configRes.data) {
        if (configRes.error?.toLowerCase().includes("unauthorized")) {
            redirect("/sign-in");
        }
        if (configRes.error?.toLowerCase().includes("forbidden")) {
            redirect("/dashboard");
        }
        return (
            <Card className="border-red-200 bg-red-50/50 p-6 text-center">
                <p className="text-red-700 font-medium">{configRes.error || "Failed to load AI configurations"}</p>
            </Card>
        );
    }

    const { configs, activeConfig } = configRes.data;
    const prompts = promptRes.data || [];

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    AI Provider & Prompt Management
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Manage AI model endpoints, test credentials in real time, configure default active providers, and customize prompt templates with codebase fallbacks.
                </p>
            </div>


            <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                                <Cpu className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {activeConfig.name}
                                    </h2>
                                    <Badge className="bg-emerald-600 text-white font-medium text-[11px] gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Active Provider
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                                    <span className="font-semibold text-slate-800 uppercase font-mono">
                                        {activeConfig.provider}
                                    </span>
                                    <span>•</span>
                                    <span className="font-mono text-primary font-medium">
                                        {activeConfig.model}
                                    </span>
                                    <span>•</span>
                                    <span className="text-slate-500 truncate max-w-xs font-mono">
                                        {activeConfig.baseUrl}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            {activeConfig.isEnvFallback ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-xs gap-1 font-medium py-1 px-2.5">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Source: .env fallback
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs gap-1 font-medium py-1 px-2.5">
                                    <Shield className="h-3.5 w-3.5" />
                                    Source: Database Configuration
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </Card>


            <AiTestingPlayground />


            <AiConfigsList configs={configs} activeConfig={activeConfig} />


            <AiPromptsManager prompts={prompts} />
        </div>
    );
}

export default function AdminAiPage() {
    return (
        <Suspense
            fallback={
                <div className="space-y-6">
                    <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-md" />
                    <div className="h-28 w-full bg-slate-200 animate-pulse rounded-lg" />
                    <div className="h-72 w-full bg-slate-200 animate-pulse rounded-lg" />
                    <div className="h-64 w-full bg-slate-200 animate-pulse rounded-lg" />
                    <div className="h-80 w-full bg-slate-200 animate-pulse rounded-lg" />
                </div>
            }
        >
            <AdminAiContent />
        </Suspense>
    );
}
