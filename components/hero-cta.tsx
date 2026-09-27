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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link href="/dashboard">
                    <Button size="lg" className="h-11 px-7 text-sm font-semibold rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 gap-2 cursor-pointer glass-shimmer">
                        <LayoutDashboard className="size-4" />
                        Go to your dashboard
                        <ArrowRight className="size-4" />
                    </Button>
                </Link>
                <a href="#features">
                    <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-medium rounded-full glass-card hover:glass-hover border-black/10 dark:border-white/15 text-foreground hover:text-foreground transition-all duration-300">
                        See what&apos;s new
                    </Button>
                </a>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/sign-up">
                <Button size="lg" className="h-11 px-7 text-sm font-semibold rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 gap-2 cursor-pointer glass-shimmer">
                    <Sparkles className="size-4 text-amber-300" />
                    Start tracking for free
                    <ArrowRight className="size-4" />
                </Button>
            </Link>
            <a href="#features">
                <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-medium rounded-full glass-card hover:glass-hover border-black/10 dark:border-white/15 text-foreground hover:text-foreground transition-all duration-300 cursor-pointer">
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
            <Button size="lg" className="h-12 px-8 text-sm font-semibold rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 gap-2 cursor-pointer glass-shimmer">
                {isLoggedIn ? "Open your dashboard" : "Get started — it's free"}
                <ArrowRight className="size-4" />
            </Button>
        </Link>
    );
}
