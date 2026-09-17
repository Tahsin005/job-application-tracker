"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroCta() {
    const { data: session } = useSession();
    const isLoggedIn = Boolean(session?.user);

    if (isLoggedIn) {
        return (
            <div className="flex items-center justify-center gap-3">
                <Link href="/dashboard">
                    <Button size="lg" className="h-11 px-7 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-xs">
                        Go to your board <ArrowRight className="ml-2 size-4" />
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up">
                <Button size="lg" className="h-11 px-7 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-xs">
                    Get started free <ArrowRight className="ml-2 size-4" />
                </Button>
            </Link>
            <Link href="/sign-in">
                <Button size="lg" variant="outline" className="h-11 px-7 text-sm font-medium border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                    Sign in
                </Button>
            </Link>
        </div>
    );
}

export function BottomCta() {
    const { data: session } = useSession();
    const isLoggedIn = Boolean(session?.user);

    return (
        <Link href={isLoggedIn ? "/dashboard" : "/sign-up"}>
            <Button size="lg" className="h-11 px-7 text-sm font-medium bg-white text-slate-900 hover:bg-slate-100 shadow-xs">
                {isLoggedIn ? "Go to your board" : "Get started free"} <ArrowRight className="ml-2 size-4" />
            </Button>
        </Link>
    );
}
