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
        <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
            <div className="container mx-auto flex h-16 items-center px-3 sm:px-4 justify-between gap-2">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary shrink-0"
                >
                    <Briefcase className="size-5 sm:size-6" />
                    <span>Job Tracker</span>
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
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5 font-medium"
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
                                    className="text-gray-700 hover:text-black"
                                >
                                    Dashboard
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsTopUpOpen(true)}
                                className="gap-1 sm:gap-1.5 border-amber-300/80 bg-linear-to-r from-amber-50 to-orange-50/70 hover:from-amber-100 hover:to-orange-100 text-amber-900 font-semibold shadow-2xs hover:shadow-xs rounded-full px-2.5 sm:px-3 py-1 text-xs cursor-pointer transition-all shrink-0"
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
                                        className="relative h-8 w-8 rounded-full shrink-0"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary text-white text-xs font-bold">
                                                {session.user.name[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium leading-none truncate max-w-[140px]">
                                                    {session.user.name}
                                                </p>
                                                {Boolean(session.user.isAdmin || session.user.role === "admin") && (
                                                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs leading-none text-muted-foreground truncate">
                                                {session.user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <div className="px-2 py-1.5 border-y border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsTopUpOpen(true)}
                                            className="w-full flex items-center gap-2 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded px-2 py-1.5 text-left transition-colors cursor-pointer"
                                        >
                                            <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
                                            <span>Top Up AI Credits</span>
                                        </button>
                                    </div>
                                    <div className="px-2 py-1.5 border-b border-gray-100 flex flex-col gap-0.5 sm:hidden">
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded px-2 py-1.5 transition-colors"
                                        >
                                            <Briefcase className="size-3.5 text-slate-500" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </div>
                                    {Boolean(session.user.isAdmin || session.user.role === "admin") && (
                                        <div className="px-2 py-1.5 border-b border-gray-100">
                                            <Link href="/admin" className="flex items-center gap-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded px-2 py-1.5 transition-colors">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                Admin Console
                                            </Link>
                                        </div>
                                    )}
                                    <SignOutButton />
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
                                    className="text-gray-700 hover:text-black text-xs sm:text-sm px-2.5 sm:px-3"
                                >
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs sm:text-sm px-2.5 sm:px-3">
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