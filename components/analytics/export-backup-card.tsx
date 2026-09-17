"use client";

import { Download, FileSpreadsheet, FileJson, ShieldCheck, CheckCircle2, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/auth-client";
import { useBoardFacade } from "@/lib/facades/useBoardFacade";

export default function ExportBackupCard() {
    const { data: session } = useSession();
    const { exportAsCSV, exportAsJSON, analytics } = useBoardFacade();
    const totalJobs = analytics.kpi.totalTracked;

    return (
        <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                        <Database className="size-4" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Export & Backup Station
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 mt-0.5">
                            Backup your entire job search dataset or export to spreadsheets for custom analysis.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                                        <FileSpreadsheet className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900">
                                            Spreadsheet CSV
                                        </h3>
                                        <span className="text-[11px] text-slate-500">
                                            Excel, Google Sheets, Notion
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    .CSV
                                </span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed mt-2">
                                Tabular export containing company, role, location, salary, stage, applied date, tags, ATS score, and notes. Includes UTF-8 BOM encoding for seamless spreadsheet opening.
                            </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                {totalJobs} job application{totalJobs === 1 ? "" : "s"}
                            </span>
                            <Button
                                onClick={() => exportAsCSV()}
                                size="sm"
                                disabled={totalJobs === 0}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs shadow-xs font-semibold"
                            >
                                <Download className="size-3.5" />
                                Download CSV
                            </Button>
                        </div>
                    </div>


                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                                        <FileJson className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900">
                                            Full JSON Backup
                                        </h3>
                                        <span className="text-[11px] text-slate-500">
                                            Loss-free data archive
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                                    .JSON
                                </span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed mt-2">
                                Complete loss-free JSON payload including board column structures, ATS keyword match telemetry, generated AI cover letters, cold outreach messages, and full metadata.
                            </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Full system backup
                            </span>
                            <Button
                                onClick={() => exportAsJSON(session?.user)}
                                size="sm"
                                disabled={totalJobs === 0}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs shadow-xs font-semibold"
                            >
                                <Download className="size-3.5" />
                                Download JSON
                            </Button>
                        </div>
                    </div>
                </div>


                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        <span>Exports are generated client-side from your cached state. Your data stays private.</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        RFC 4180 & UTF-8 Verified
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
