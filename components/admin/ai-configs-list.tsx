"use client";

import { useState } from "react";
import {
    Star,
    Check,
    Trash2,
    Clock,
    Cpu,
    Globe,
    Key,
    AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAdminAiFacade } from "@/lib/facades/useAdminAiFacade";

interface ConfigItem {
    id: string;
    name: string;
    provider: string;
    baseUrl: string;
    apiKey?: string;
    maskedApiKey: string;
    model: string;
    isDefault: boolean;
    isActive: boolean;
    description?: string;
    lastTestedAt?: string | null;
    lastLatencyMs?: number | null;
    createdAt: string;
}

interface ActiveConfigSummary {
    name: string;
    provider: string;
    baseUrl: string;
    model: string;
    isEnvFallback: boolean;
    configId?: string;
}

export default function AiConfigsList({
    configs,
    activeConfig,
}: {
    configs: ConfigItem[];
    activeConfig: ActiveConfigSummary;
}) {
    const { actionLoadingId, setDefaultConfig, deleteConfig } = useAdminAiFacade();
    const [deleteCandidate, setDeleteCandidate] = useState<ConfigItem | null>(null);

    const handleSetDefault = async (id: string, name: string) => {
        await setDefaultConfig(id, name);
    };

    const handleDelete = async () => {
        if (!deleteCandidate) return;
        const success = await deleteConfig(deleteCandidate.id, deleteCandidate.name);
        if (success) {
            setDeleteCandidate(null);
        }
    };

    return (
        <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                            Saved AI Configurations
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Active provider configs stored in MongoDB. The active default is used by all AI worker operations.
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200 text-xs">
                            {configs.length} Configured
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {activeConfig.isEnvFallback && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Fallback to .env Variables Active</p>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                                No database configuration is currently marked as default. The system is operating using environment variables ({activeConfig.model} via {activeConfig.provider}). Use the testing playground above to test and save a provider to MongoDB.
                            </p>
                        </div>
                    </div>
                )}

                {configs.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 border border-dashed border-slate-200 rounded-lg">
                        <Cpu className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-medium text-slate-700 text-sm">No Database Configurations Found</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            Use the Playground above to test connection with your API key, then click &quot;Save to Configs&quot;.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {configs.map((c) => {
                            const isCurrent = c.isDefault;
                            const isLoading = actionLoadingId === c.id;

                            return (
                                <div
                                    key={c.id}
                                    className={`p-4 rounded-xl border transition-all ${isCurrent
                                            ? "border-primary/40 bg-blue-50/20 shadow-xs ring-1 ring-primary/20"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-slate-900 text-sm">
                                                    {c.name}
                                                </h3>

                                                {isCurrent && (
                                                    <Badge className="bg-primary text-white hover:bg-primary/90 text-[11px] font-semibold gap-1">
                                                        <Star className="h-3 w-3 fill-white" />
                                                        Active Default
                                                    </Badge>
                                                )}

                                                <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200 text-[10px] uppercase font-semibold">
                                                    {c.provider}
                                                </Badge>
                                            </div>


                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Cpu className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span className="font-mono text-slate-800 font-medium truncate">
                                                        {c.model}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span className="font-mono text-slate-500 truncate" title={c.baseUrl}>
                                                        {c.baseUrl}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Key className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span className="font-mono text-slate-600 truncate" title={c.apiKey || c.maskedApiKey}>
                                                        {c.apiKey || c.maskedApiKey}
                                                    </span>
                                                </div>
                                            </div>

                                            {c.lastTestedAt && (
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Tested {new Date(c.lastTestedAt).toLocaleDateString()}
                                                    </span>
                                                    {c.lastLatencyMs && (
                                                        <span>• {c.lastLatencyMs}ms latency</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>


                                        <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
                                            {!isCurrent && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isLoading}
                                                    onClick={() => handleSetDefault(c.id, c.name)}
                                                    className="text-xs text-primary border-primary/20 hover:bg-primary/5 h-8 gap-1 font-medium"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    Make Default
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={isLoading}
                                                onClick={() => setDeleteCandidate(c)}
                                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>


            <Dialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-slate-900">
                            Delete AI Configuration
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Are you sure you want to remove &quot;{deleteCandidate?.name}&quot;?
                            {deleteCandidate?.isDefault && (
                                <span className="block text-red-600 font-medium mt-1">
                                    Warning: This is the active default provider. Deleting it will re-promote another saved provider or fallback to .env.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteCandidate(null)}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs"
                        >
                            Delete Provider
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
