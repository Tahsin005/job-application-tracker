"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, LayoutDashboard } from "lucide-react";

export function HeroCta() {
    const { data: session } = useSession();
    const isLoggedIn = Boolean(session?.user);

    if (isLoggedIn) {
        return (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/dashboard">
                    <Button size="lg" className="h-11 px-7 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm gap-2">
                        <LayoutDashboard className="size-4" />
                        Go to your dashboard
                        <ArrowRight className="size-4" />
                    </Button>
                </Link>
                <a href="#features">
                    <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-medium border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                        See what&apos;s new
                    </Button>
                </a>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up">
                <Button size="lg" className="h-11 px-7 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm gap-2 cursor-pointer transition-all active:scale-98">
                    <Sparkles className="size-4 text-amber-300" />
                    Start tracking for free
                    <ArrowRight className="size-4" />
                </Button>
            </Link>
            <a href="#features">
                <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-medium border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
                    Explore features
                </Button>
            </a>
        </div>
    );
}

export function BottomCta() {
    const { data: session } = useSession();
    const isLoggedIn = Boolean(session?.user);

    return (
        <Link href={isLoggedIn ? "/dashboard" : "/sign-up"}>
            <Button size="lg" className="h-11 px-8 text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 shadow-md gap-2 cursor-pointer transition-all active:scale-98">
                {isLoggedIn ? "Open your dashboard" : "Get started — it's free"}
                <ArrowRight className="size-4" />
            </Button>
        </Link>
    );
}
