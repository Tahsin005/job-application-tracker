"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShieldCheck,
    ArrowLeft,
    LayoutDashboard,
    Users,
    CreditCard,
    Layers,
    Sparkles,
    Menu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ADMIN_NAV_ITEMS = [
    {
        label: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        label: "Users Directory",
        href: "/admin/users",
        icon: Users,
        exact: false,
    },
    {
        label: "Top-Up Requests",
        href: "/admin/top-ups",
        icon: CreditCard,
        exact: false,
    },
    {
        label: "Packages & MFS",
        href: "/admin/packages",
        icon: Layers,
        exact: false,
    },
    {
        label: "AI Management",
        href: "/admin/ai",
        icon: Sparkles,
        exact: false,
    },
];

function AdminHeaderContent() {
    const pathname = usePathname();

    const isItemActive = (item: (typeof ADMIN_NAV_ITEMS)[number]) => {
        if (!pathname) return false;
        if (item.exact) {
            return pathname === item.href;
        }
        return pathname.startsWith(item.href);
    };

    return (
        <header className="border-b bg-white border-slate-200 sticky top-0 z-20 shadow-2xs">

            <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 shrink-0">
                    <Link href="/admin" className="flex items-center gap-2.5 group">
                        <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                            Admin Console
                        </span>
                    </Link>
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5"
                    >
                        Admin
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">User Dashboard</span>
                            <span className="sm:hidden">Dashboard</span>
                        </Button>
                    </Link>


                    <div className="md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-600 border-slate-200 hover:bg-slate-50"
                                >
                                    <Menu className="h-4 w-4" />
                                    <span className="sr-only">Toggle Admin Navigation</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Admin Navigation
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {ADMIN_NAV_ITEMS.map((item) => {
                                    const active = isItemActive(item);
                                    const Icon = item.icon;
                                    return (
                                        <DropdownMenuItem key={item.href} asChild>
                                            <Link
                                                href={item.href}
                                                className={`flex items-center gap-2 text-xs py-2 px-2.5 rounded-md cursor-pointer ${active
                                                        ? "bg-red-50 text-red-700 font-bold"
                                                        : "text-slate-700 hover:text-slate-900"
                                                    }`}
                                            >
                                                <Icon
                                                    className={`h-4 w-4 shrink-0 ${active ? "text-red-600" : "text-slate-400"
                                                        }`}
                                                />
                                                <span>{item.label}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>


            <div className="border-t border-slate-100 bg-slate-50/60">
                <div className="container mx-auto px-4">
                    <nav
                        className="flex items-center gap-1.5 py-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
                        aria-label="Admin Navigation Tabs"
                    >
                        {ADMIN_NAV_ITEMS.map((item) => {
                            const active = isItemActive(item);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${active
                                            ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                                        }`}
                                >
                                    <Icon
                                        className={`h-3.5 w-3.5 shrink-0 ${active ? "text-red-600" : "text-slate-400"
                                            }`}
                                    />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
}

function AdminHeaderSkeleton() {
    return (
        <header className="border-b bg-white border-slate-200 sticky top-0 z-20 shadow-2xs">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                        Admin Console
                    </span>
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5"
                    >
                        Admin
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">User Dashboard</span>
                            <span className="sm:hidden">Dashboard</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/60">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-1.5 py-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {ADMIN_NAV_ITEMS.map((item) => (
                            <div
                                key={item.href}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 whitespace-nowrap"
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}

export function AdminHeader() {
    return (
        <Suspense fallback={<AdminHeaderSkeleton />}>
            <AdminHeaderContent />
        </Suspense>
    );
}
