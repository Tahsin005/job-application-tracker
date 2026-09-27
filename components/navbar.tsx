"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { Briefcase, ShieldCheck, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";
import { Skeleton } from "./ui/skeleton";
import dynamic from "next/dynamic";

const TopUpModal = dynamic(
    () => import("./top-up/top-up-modal").then((m) => m.TopUpModal),
    { ssr: false }
);

export default function Navbar() {
    const { data: session, isPending } = useSession();
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-40 w-full glass-panel !rounded-none border-b border-black/5 dark:border-white/10 bg-white/75 dark:bg-black/40 backdrop-blur-2xl transition-colors duration-300">
            <div className="container mx-auto flex h-16 items-center px-3 sm:px-6 justify-between gap-2 max-w-7xl">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-foreground shrink-0 group"
                >
                    <div className="p-1.5 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 group-hover:scale-105 transition-all shadow-2xs">
                        <Briefcase className="size-4.5 sm:size-5 text-primary" />
                    </div>
                    <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
                        Job Tracker
                    </span>
                </Link>

                <div className="flex items-center gap-1.5 sm:gap-3">
                    {isPending && !session ? (
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-16 sm:w-20 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    ) : session?.user ? (
                        <>
                            {Boolean(session.user.isAdmin || session.user.role === "admin") && (
                                <Link href="/admin" className="hidden md:inline-flex">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1.5 font-medium rounded-full"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        Admin
                                    </Button>
                                </Link>
                            )}
                            <Link href="/dashboard" className="hidden sm:inline-flex">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 rounded-full font-medium"
                                >
                                    Dashboard
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsTopUpOpen(true)}
                                className="gap-1 sm:gap-1.5 border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-700 dark:text-amber-400 font-semibold shadow-2xs rounded-full px-2.5 sm:px-3 py-1 text-xs cursor-pointer transition-all shrink-0 glass-shimmer"
                                title="Top up AI Credits"
                            >
                                <Zap className="size-3.5 text-amber-500 fill-amber-400" />
                                <span>Top Up</span>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative h-8 w-8 rounded-full shrink-0 border border-black/10 dark:border-white/15 shadow-2xs hover:scale-105 transition-transform"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                                                {session.user.name[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-56 glass-panel border-black/10 dark:border-white/10 shadow-2xl p-1" align="end">
                                    <DropdownMenuLabel className="font-normal px-2 py-1.5">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold leading-none truncate max-w-[140px] text-foreground">
                                                    {session.user.name}
                                                </p>
                                                {Boolean(session.user.isAdmin || session.user.role === "admin") && (
                                                    <span className="text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-bold uppercase border border-rose-500/20">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs leading-none text-muted-foreground truncate">
                                                {session.user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <div className="px-1 py-1 border-y border-black/5 dark:border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setIsTopUpOpen(true)}
                                            className="w-full flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg px-2 py-1.5 text-left transition-colors cursor-pointer"
                                        >
                                            <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
                                            <span>Top Up AI Credits</span>
                                        </button>
                                    </div>
                                    <div className="px-1 py-1 border-b border-black/5 dark:border-white/10 flex flex-col gap-0.5 sm:hidden">
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-2 text-xs font-medium text-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 rounded-lg px-2 py-1.5 transition-colors"
                                        >
                                            <Briefcase className="size-3.5 text-muted-foreground" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </div>
                                    {Boolean(session.user.isAdmin || session.user.role === "admin") && (
                                        <div className="px-1 py-1 border-b border-black/5 dark:border-white/10">
                                            <Link href="/admin" className="flex items-center gap-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 rounded-lg px-2 py-1.5 transition-colors">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                Admin Console
                                            </Link>
                                        </div>
                                    )}
                                    <div className="p-1">
                                        <SignOutButton />
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {isTopUpOpen && (
                                <TopUpModal open={isTopUpOpen} onOpenChange={setIsTopUpOpen} />
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/sign-in">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-foreground/80 hover:text-foreground text-xs sm:text-sm px-2.5 sm:px-3 rounded-full font-medium hover:bg-black/5 dark:hover:bg-white/10"
                                >
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm px-3.5 sm:px-4 rounded-full font-semibold shadow-xs hover:shadow-md transition-all glass-shimmer">
                                    Start for free
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}