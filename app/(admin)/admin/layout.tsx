import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50">
            <div className="border-b bg-white border-slate-200 sticky top-0 z-10 shadow-xs">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 font-semibold text-slate-900">
                                <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <span className="hidden sm:inline">Admin Console</span>
                            </div>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium text-xs">
                                Admin
                            </Badge>
                        </div>

                        <nav className="flex items-center gap-1">
                            <Link href="/admin">
                                <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-slate-900">
                                    Overview
                                </Button>
                            </Link>
                            <Link href="/admin/users">
                                <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-slate-900">
                                    Users Directory
                                </Button>
                            </Link>
                            <Link href="/admin/ai">
                                <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-slate-900">
                                    AI Management
                                </Button>
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 hover:text-slate-900">
                                <ArrowLeft className="h-3.5 w-3.5" />
                                User Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
