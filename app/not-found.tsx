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
        <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-12 sm:py-16 overflow-hidden selection:bg-primary/20 selection:text-primary">
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center relative z-10">

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-foreground/80 mb-6 shadow-2xs">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </span>
                    <span>Error 404 • Lost in Application Pipeline</span>
                </div>


                <div className="relative w-full max-w-md mx-auto mb-8 text-left transition-all duration-300 group">
                    <div
                        className="absolute -top-12 left-1/2 -translate-x-1/2 text-foreground/5 select-none pointer-events-none font-black text-8xl sm:text-9xl tracking-tighter -z-10 font-mono"
                        aria-hidden="true"
                    >
                        404
                    </div>
                </div>


                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-3">
                    This opportunity seems to have{" "}
                    <span className="bg-gradient-to-r from-primary via-indigo-600 to-purple-600 dark:from-primary dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        vanished
                    </span>
                    .
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
                    The page or job application you were hunting for might have been moved, filled, or never made it into the pipeline. Let&apos;s get your career search back on track.
                </p>


                <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md mb-12">
                    <Button
                        onClick={handleGoBack}
                        variant="outline"
                        size="lg"
                        className="rounded-full px-5 h-11 glass-card hover:glass-hover border-black/10 dark:border-white/15 text-foreground font-medium cursor-pointer shadow-2xs gap-2"
                    >
                        <ArrowLeft className="size-4 text-muted-foreground" />
                        <span>Go Back</span>
                    </Button>

                    <Link href="/dashboard">
                        <Button
                            size="lg"
                            className="rounded-full px-6 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer gap-2 glass-shimmer"
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
                            className="rounded-full px-4 h-11 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 font-medium cursor-pointer gap-1.5"
                        >
                            <Home className="size-4 text-muted-foreground" />
                            <span>Home</span>
                        </Button>
                    </Link>
                </div>


                <div className="w-full pt-8 border-t border-black/5 dark:border-white/10">
                    <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4">
                        Quick Destinations
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left w-full">
                        <Link
                            href="/dashboard"
                            className="group p-4 rounded-2xl glass-card glass-hover border border-black/5 dark:border-white/10 flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                                    <Briefcase className="size-4" />
                                </div>
                                <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                    Kanban Pipeline
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 leading-normal">
                                    Manage your active applications across stages.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard"
                            className="group p-4 rounded-2xl glass-card glass-hover border border-black/5 dark:border-white/10 flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                                    <Calendar className="size-4" />
                                </div>
                                <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    Interviews Hub
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 leading-normal">
                                    Track upcoming rounds, prep notes, and dates.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard"
                            className="group p-4 rounded-2xl glass-card glass-hover border border-black/5 dark:border-white/10 flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                                    <Sparkles className="size-4" />
                                </div>
                                <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    AI Resume Match
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 leading-normal">
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
