"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Briefcase,
    ArrowLeft,
    Home,
    Sparkles,
    Calendar,
    ArrowRight,
} from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    const handleGoBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-12 sm:py-16 overflow-hidden selection:bg-primary/15 selection:text-primary">
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center relative z-10">

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold mb-6 shadow-2xs">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </span>
                    <span>Error 404 • Lost in Application Pipeline</span>
                </div>


                <div className="relative w-full max-w-md mx-auto mb-8 text-left transition-all duration-300 group">

                    <div
                        className="absolute -top-12 left-1/2 -translate-x-1/2 text-slate-200/70 select-none pointer-events-none font-black text-8xl sm:text-9xl tracking-tighter -z-10 font-mono"
                        aria-hidden="true"
                    >
                        404
                    </div>
                </div>


                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-3">
                    This opportunity seems to have{" "}
                    <span className="bg-linear-to-r from-slate-900 via-indigo-950 to-primary bg-clip-text text-transparent">
                        vanished
                    </span>
                    .
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
                    The page or job application you were hunting for might have been moved, filled, or never made it into the pipeline. Let&apos;s get your career search back on track.
                </p>


                <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md mb-12">
                    <Button
                        onClick={handleGoBack}
                        variant="outline"
                        size="lg"
                        className="rounded-xl px-5 h-11 border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium cursor-pointer shadow-2xs gap-2"
                    >
                        <ArrowLeft className="size-4 text-slate-500" />
                        <span>Go Back</span>
                    </Button>

                    <Link href="/dashboard">
                        <Button
                            size="lg"
                            className="rounded-xl px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md shadow-slate-900/10 cursor-pointer gap-2"
                        >
                            <Briefcase className="size-4" />
                            <span>Go to Board</span>
                            <ArrowRight className="size-4 opacity-70" />
                        </Button>
                    </Link>

                    <Link href="/">
                        <Button
                            variant="ghost"
                            size="lg"
                            className="rounded-xl px-4 h-11 text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium cursor-pointer gap-1.5"
                        >
                            <Home className="size-4 text-slate-500" />
                            <span>Home</span>
                        </Button>
                    </Link>
                </div>


                <div className="w-full pt-8 border-t border-slate-100">
                    <p className="text-xs font-semibold tracking-wider text-slate-400 mb-4">
                        Quick Destinations
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left w-full">
                        <Link
                            href="/dashboard"
                            className="group p-4 rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-xs hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="size-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                                    <Briefcase className="size-4" />
                                </div>
                                <ArrowRight className="size-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    Kanban Pipeline
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 leading-normal">
                                    Manage your active applications across stages.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard"
                            className="group p-4 rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-xs hover:border-emerald-300 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="size-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                                    <Calendar className="size-4" />
                                </div>
                                <ArrowRight className="size-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                    Interviews Hub
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 leading-normal">
                                    Track upcoming rounds, prep notes, and dates.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard"
                            className="group p-4 rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-xs hover:border-amber-300 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="size-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                                    <Sparkles className="size-4" />
                                </div>
                                <ArrowRight className="size-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                                    AI Resume Match
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 leading-normal">
                                    Benchmark ATS keywords and generate cover letters.
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
