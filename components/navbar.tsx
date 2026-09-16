"use client";

import { useSession } from "@/lib/auth/auth-client";
import { Briefcase, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";
import { Skeleton } from "./ui/skeleton";

export default function Navbar() {
    const { data: session, isPending } = useSession();
    return (
        <nav className="border-b border-gray-200 bg-white">
            <div className="container mx-auto flex h-16 items-center px-4 justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-xl font-semibold text-primary"
                >
                    <Briefcase />
                    Job Tracker
                </Link>

                <div className="flex items-center gap-4">
                    {isPending && !session ? (
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-20 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    ) : session?.user ? (
                        <>
                            {Boolean(session.user.isAdmin || session.user.role === "admin") && (
                                <Link href="/admin">
                                    <Button
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5 font-medium"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        Admin
                                    </Button>
                                </Link>
                            )}
                            <Link href="/dashboard">
                                <Button
                                    variant="ghost"
                                    className="text-gray-700 hover:text-black"
                                >
                                    Dashboard
                                </Button>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-8 w-8 rounded-full"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary text-white">
                                                {session.user.name[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium leading-none">
                                                    {session.user.name}
                                                </p>
                                                {Boolean(session.user.isAdmin || session.user.role === "admin") && (
                                                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {session.user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    {Boolean(session.user.isAdmin || session.user.role === "admin") && (
                                        <div className="px-2 py-1.5 border-y border-gray-100">
                                            <Link href="/admin" className="flex items-center gap-2 text-xs font-semibold text-red-600 hover:underline">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                Admin Console
                                            </Link>
                                        </div>
                                    )}
                                    <SignOutButton />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Link href="/sign-in">
                                <Button
                                    variant="ghost"
                                    className="text-gray-700 hover:text-black"
                                >
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button className="bg-primary hover:bg-primary/90">
                                    Start for free
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}