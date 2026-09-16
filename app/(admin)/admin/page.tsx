import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import Link from "next/link";
import { Users, FileText, Briefcase, ShieldCheck, Sparkles, Server, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

async function AdminDashboardContent() {
    const session = await getSession();

    if (!session?.user) {
        redirect("/sign-in");
    }

    if (!session.user.isAdmin && session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const mongooseInstance = await connectDB();
    const db = mongooseInstance.connection.db;

    let userCount = 0;
    let jobCount = 0;
    let resumeCount = 0;

    if (db) {
        userCount = await db.collection("user").countDocuments();
        jobCount = await db.collection("jobapplications").countDocuments();
        resumeCount = await db.collection("resumes").countDocuments();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Admin Overview
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        System telemetry, user role supervision, and application management.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/users">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs">
                            <Users className="h-3.5 w-3.5" />
                            Manage Users
                        </Button>
                    </Link>
                </div>
            </div>


            <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-base">Authenticated Admin Credentials</CardTitle>
                    </div>
                    <CardDescription>
                        You have full administrative privileges over the Job Tracker platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div>
                            <span className="text-slate-500 block text-xs tracking-wider font-semibold">User Name</span>
                            <span className="font-medium text-slate-800">{session.user.name}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-xs tracking-wider font-semibold">Email</span>
                            <span className="font-medium text-slate-800">{session.user.email}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-xs tracking-wider font-semibold">Role Status</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge className="bg-red-600 text-white font-medium hover:bg-red-700">
                                    {session.user.role || "admin"}
                                </Badge>
                                <span className="text-xs text-slate-500">(isAdmin: true)</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/admin/users" className="block group">
                    <Card className="border-slate-200 bg-white shadow-xs group-hover:border-primary/50 group-hover:shadow-sm transition-all">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 tracking-wider group-hover:text-primary transition-colors">
                                    Total Registered Users
                                </p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-2">{userCount}</h3>
                                <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                                    Manage Directory <ArrowRight className="h-3 w-3" />
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Users className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 tracking-wider">Job Applications Tracked</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{jobCount}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Briefcase className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 tracking-wider">Resumes Stored</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{resumeCount}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <FileText className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-md" />
                <div className="h-32 w-full bg-slate-200 animate-pulse rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="h-24 bg-slate-200 animate-pulse rounded-lg" />
                    <div className="h-24 bg-slate-200 animate-pulse rounded-lg" />
                    <div className="h-24 bg-slate-200 animate-pulse rounded-lg" />
                </div>
            </div>
        }>
            <AdminDashboardContent />
        </Suspense>
    );
}
