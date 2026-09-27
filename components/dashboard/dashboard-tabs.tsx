"use client";

import { LayoutGrid, TrendingUp, Download, FileSpreadsheet, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth/auth-client";
import { useBoardFacade } from "@/lib/facades/useBoardFacade";

interface DashboardTabsProps {
    className?: string;
}

export default function DashboardTabs({ className = "" }: DashboardTabsProps) {
    const { data: session } = useSession();
    const { exportAsCSV, exportAsJSON, analytics, activeTab, setActiveTab } = useBoardFacade();
    const isAnalytics = activeTab === "analytics";

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-4 mb-6 ${className}`}>
            <div className="flex items-center gap-1 p-1 glass-card rounded-full border border-black/5 dark:border-white/10 w-fit shadow-2xs backdrop-blur-xl">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("board")}
                    className={`h-8 px-4 text-xs font-semibold rounded-full transition-all gap-1.5 cursor-pointer ${
                        !isAnalytics
                            ? "bg-primary text-primary-foreground hover:text-white shadow-xs hover:bg-primary/90"
                            : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                >
                    <LayoutGrid className="size-3.5" />
                    Board View
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("analytics")}
                    className={`h-8 px-4 text-xs font-semibold rounded-full transition-all gap-1.5 cursor-pointer ${
                        isAnalytics
                            ? "bg-primary text-primary-foreground hover:text-white shadow-xs hover:bg-primary/90"
                            : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                >
                    <TrendingUp className="size-3.5" />
                    Analytics & Funnel
                    {analytics.kpi.totalTracked > 0 && (
                        <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold border ${
                            isAnalytics
                                ? "bg-white/20 text-primary-foreground border-white/30"
                                : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                        }`}>
                            {analytics.kpi.totalTracked}
                        </span>
                    )}
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-medium rounded-full glass-card hover:glass-hover border-black/10 dark:border-white/15 text-foreground shadow-2xs cursor-pointer"
                        >
                            <Download className="size-3.5 text-muted-foreground" />
                            Export Data
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-panel border-black/10 dark:border-white/10 shadow-xl p-1.5">
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold tracking-wider uppercase px-2 py-1">
                            Export & Backup
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => exportAsCSV()}
                            className="text-xs cursor-pointer gap-2 py-2 rounded-lg"
                        >
                            <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <div className="flex flex-col">
                                <span className="font-semibold text-foreground">Export as CSV</span>
                                <span className="text-[10px] text-muted-foreground">For Excel, Sheets, Notion</span>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-black/5 dark:bg-white/10" />
                        <DropdownMenuItem
                            onClick={() => exportAsJSON(session?.user)}
                            className="text-xs cursor-pointer gap-2 py-2 rounded-lg"
                        >
                            <FileJson className="size-4 text-indigo-600 dark:text-indigo-400" />
                            <div className="flex flex-col">
                                <span className="font-semibold text-foreground">Export as JSON</span>
                                <span className="text-[10px] text-muted-foreground">Full structured backup</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
