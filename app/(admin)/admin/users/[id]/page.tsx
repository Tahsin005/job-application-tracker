import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminUserDetailsAction } from "@/lib/actions/admin";
import { getUserTopUpHistoryForAdminAction } from "@/lib/actions/admin-top-up";
import { ArrowLeft, Briefcase, FileText, Calendar, ShieldCheck, BarChart3, DollarSign, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import QuotaEditorCard from "@/components/admin/quota-editor-card";
import { TopUpRequest } from "@/lib/models/models.types";

interface RecentApplication {
    id: string;
    company: string;
    position: string;
    status: string;
    salary: string | null;
    updatedAt: Date | string;
}

interface StoredResume {
    id: string;
    name: string;
    isDefault: boolean;
    createdAt: Date | string;
}

interface UserDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

async function UserDetailContent({ params }: UserDetailPageProps) {
    const { id } = await params;
    const [res, topUpRes] = await Promise.all([
        getAdminUserDetailsAction(id),
        getUserTopUpHistoryForAdminAction(id),
    ]);

    if (res.error || !res.data) {
        if (res.error?.toLowerCase().includes("unauthorized")) {
            redirect("/sign-in");
        }
        if (res.error?.toLowerCase().includes("forbidden")) {
            redirect("/dashboard");
        }
        notFound();
    }

    const { user, usage, stats } = res.data;
    const topUpHistory = topUpRes.data?.requests || [];
    const totalSpend = topUpRes.data?.totalSpend || 0;

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">
                <Link href="/admin/users">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 hover:text-slate-900">
                        <ArrowLeft className="h-4 w-4" />
                        Back to User Directory
                    </Button>
                </Link>

                <Badge
                    variant="outline"
                    className={
                        user.isAdmin
                            ? "bg-red-50 text-red-700 border-red-200 font-semibold text-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 text-xs"
                    }
                >
                    {user.isAdmin ? "Administrator" : "Candidate User"}
                </Badge>
            </div>


            <Card className="border-slate-200 bg-white shadow-xs">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-slate-100">
                                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                                    {user.isAdmin && (
                                        <Badge className="bg-red-50 text-red-700 border-red-200 border text-[11px] font-semibold gap-1">
                                            <ShieldCheck className="h-3 w-3" />
                                            Admin
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                                    <span className="flex items-center gap-1 font-mono">ID: {user.id}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalApplications}</h3>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Briefcase className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resumes</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalResumes}</h3>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ATS Scans Remaining</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {Math.max(0, usage.atsScanLimit - usage.atsScanCount)}
                            </h3>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Generations Remaining</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {Math.max(0, usage.coverLetterLimit - usage.coverLetterCount) +
                                    Math.max(0, usage.outreachLimit - usage.outreachCount) +
                                    Math.max(0, (usage.applicationEmailLimit ?? 3) - (usage.applicationEmailCount ?? 0))}
                            </h3>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>


            {stats.totalApplications > 0 && (
                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-900">
                            Application Pipeline Breakdown
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Distribution of job applications across board columns.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(stats.statusCounts).map(([status, count]) => (
                                <div
                                    key={status}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                                >
                                    <span className="font-semibold text-slate-700 capitalize">{status}:</span>
                                    <span className="font-bold text-primary">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}


            <QuotaEditorCard
                userId={user.id}
                userName={user.name}
                initialUsage={usage}
            />


            <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Top-Up Payments & Lifetime Spend
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs mt-0.5">
                            Historical MFS payment submissions and quota boosts for this candidate.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs px-3 py-1">
                        Lifetime Spend: ৳ {totalSpend.toLocaleString()} BDT
                    </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                    {topUpHistory.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-3 text-center border border-dashed rounded-lg">
                            This candidate has not purchased any top-up packs yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="py-2.5 px-3">Pack & Hierarchy</th>
                                        <th className="py-2.5 px-3">Amount</th>
                                        <th className="py-2.5 px-3">Method & Sender</th>
                                        <th className="py-2.5 px-3">Transaction ID</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {topUpHistory.map((th: TopUpRequest) => {
                                        const isApproved = th.status === "approved";
                                        const isRejected = th.status === "rejected";
                                        const isPending = th.status === "pending";

                                        return (
                                            <tr key={th._id} className="hover:bg-slate-50/50">
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-slate-800">{th.packageName}</span>
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 bg-slate-50">
                                                            Lvl {th.order || 1}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 font-bold text-slate-900">
                                                    ৳ {th.amount} {th.currency}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="capitalize font-medium text-slate-800">{th.paymentMethod}</span>
                                                    <span className="text-[11px] text-slate-400 block font-mono">{th.senderNumber}</span>
                                                </td>
                                                <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                                    {th.transactionId}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <Badge
                                                        className={`text-[10px] font-semibold border ${isApproved
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : isRejected
                                                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                                            }`}
                                                    >
                                                        {isApproved && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                        {isRejected && <XCircle className="h-3 w-3 mr-1" />}
                                                        {isPending && <Clock className="h-3 w-3 mr-1" />}
                                                        {th.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-3 text-right text-slate-500 whitespace-nowrap">
                                                    {th.createdAt ? new Date(th.createdAt).toLocaleDateString() : "N/A"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                            <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                            Latest tracked positions by this candidate.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {stats.recentApplications.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2">No applications tracked yet.</p>
                        ) : (
                            stats.recentApplications.map((job: RecentApplication) => (
                                <div
                                    key={job.id}
                                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-800">{job.position}</p>
                                        <p className="text-slate-500 text-[11px]">{job.company}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[11px] capitalize bg-white text-slate-700">
                                        {job.status}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>


                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-purple-600" />
                            <CardTitle className="text-base font-semibold">Stored Resumes</CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                            Uploaded candidate resumes for AI tailoring.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {stats.resumes.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2">No resumes uploaded yet.</p>
                        ) : (
                            stats.resumes.map((resume: StoredResume) => (
                                <div
                                    key={resume.id}
                                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-400" />
                                        <p className="font-semibold text-slate-800">{resume.name}</p>
                                    </div>
                                    {resume.isDefault && (
                                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                                            Default
                                        </Badge>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function UserDetailPage(props: UserDetailPageProps) {
    return (
        <Suspense
            fallback={
                <div className="space-y-6">
                    <div className="h-8 w-40 bg-slate-200 animate-pulse rounded-md" />
                    <div className="h-28 w-full bg-slate-200 animate-pulse rounded-lg" />
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="h-20 bg-slate-200 animate-pulse rounded-lg" />
                        <div className="h-20 bg-slate-200 animate-pulse rounded-lg" />
                        <div className="h-20 bg-slate-200 animate-pulse rounded-lg" />
                        <div className="h-20 bg-slate-200 animate-pulse rounded-lg" />
                    </div>
                </div>
            }
        >
            <UserDetailContent {...props} />
        </Suspense>
    );
}
