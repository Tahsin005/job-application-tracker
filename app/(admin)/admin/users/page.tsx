import { Suspense } from "react";
import Link from "next/link";
import { getAdminUsersAction } from "@/lib/actions/admin";
import { Search, ArrowRight, ShieldCheck, User as UserIcon, ChevronLeft, ChevronRight, Briefcase, FileText, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UsersPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
}

async function UsersListContent({
    searchParams,
}: UsersPageProps) {
    const params = await searchParams;
    const page = Math.max(1, Number(params.page) || 1);
    const search = params.search || "";

    const res = await getAdminUsersAction({ page, limit: 10, search });

    if (res.error || !res.data) {
        return (
            <Card className="border-red-200 bg-red-50/50 p-6 text-center">
                <p className="text-red-700 font-medium">{res.error || "Failed to load users"}</p>
            </Card>
        );
    }

    const { users, pagination } = res.data;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        User Directory
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Inspect registered candidates, platform activity, and manage quota limits.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 px-3 py-1 font-medium text-xs">
                        Total Users: {pagination.totalCount}
                    </Badge>
                </div>
            </div>


            <Card className="border-slate-200 bg-white shadow-xs p-3">
                <form method="GET" className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            name="search"
                            defaultValue={search}
                            placeholder="Search by name or email..."
                            className="pl-9 bg-slate-50/50 border-slate-200 text-sm"
                        />
                    </div>
                    <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-white">
                        Search
                    </Button>
                    {search && (
                        <Link href="/admin/users">
                            <Button type="button" variant="outline" size="sm" className="text-slate-600">
                                Clear
                            </Button>
                        </Link>
                    )}
                </form>
            </Card>


            <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">

                <div className="divide-y divide-slate-100 lg:hidden">
                    {users.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                            <UserIcon className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                            No users found matching your criteria.
                        </div>
                    ) : (
                        users.map((u) => (
                            <div key={u.id} className="p-4 sm:p-5 space-y-3.5 hover:bg-slate-50/50 transition-colors">

                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {u.image && <AvatarImage src={u.image} alt={u.name} />}
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {u.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-slate-900 leading-snug">
                                                {u.name}
                                            </p>
                                            <p className="text-xs text-slate-500 break-all">{u.email}</p>
                                        </div>
                                    </div>

                                    <div>
                                        {u.isAdmin ? (
                                            <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 border text-[11px] font-semibold gap-1">
                                                <ShieldCheck className="h-3 w-3" />
                                                Admin
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200 text-[11px]">
                                                User
                                            </Badge>
                                        )}
                                    </div>
                                </div>


                                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Activity</span>
                                        <div className="flex items-center gap-2 mt-0.5 text-slate-700 font-medium text-xs">
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                                {u.jobCount} jobs
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                                {u.resumeCount} resumes
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Joined Date</span>
                                        <div className="flex items-center gap-1 mt-0.5 text-slate-700 font-medium text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                                        </div>
                                    </div>
                                </div>


                                <div className="space-y-1.5">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">AI Quota (Used / Limit)</span>
                                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-medium">
                                            ATS: {u.usage.atsScanUsed}/{u.usage.atsScanLimit}
                                        </span>
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-medium">
                                            Cover: {u.usage.coverLetterUsed}/{u.usage.coverLetterLimit}
                                        </span>
                                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 font-medium">
                                            Outreach: {u.usage.outreachUsed}/{u.usage.outreachLimit}
                                        </span>
                                        <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-100 font-medium">
                                            Email: {u.usage.applicationEmailUsed ?? 0}/{u.usage.applicationEmailLimit ?? 3}
                                        </span>
                                    </div>
                                </div>


                                <div className="pt-1">
                                    <Link href={`/admin/users/${u.id}`} className="block">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-center gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/5 hover:text-primary font-medium h-9"
                                        >
                                            Manage Quota & Stats
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>


                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3.5">User</th>
                                <th className="px-6 py-3.5">Role</th>
                                <th className="px-6 py-3.5">Activity</th>
                                <th className="px-6 py-3.5">AI Usage (Used/Limit)</th>
                                <th className="px-6 py-3.5">Joined Date</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <UserIcon className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    {u.image && <AvatarImage src={u.image} alt={u.name} />}
                                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-slate-900 leading-tight">
                                                        {u.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {u.isAdmin ? (
                                                <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 border text-[11px] font-semibold gap-1">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    Admin
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200 text-[11px]">
                                                    User
                                                </Badge>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                                <span className="flex items-center gap-1" title="Applications tracked">
                                                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                                    {u.jobCount} jobs
                                                </span>
                                                <span className="flex items-center gap-1" title="Resumes uploaded">
                                                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                                                    {u.resumeCount} resumes
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5 text-[11px]">
                                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                                                    ATS: {u.usage.atsScanUsed}/{u.usage.atsScanLimit}
                                                </span>
                                                <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                                                    Cover: {u.usage.coverLetterUsed}/{u.usage.coverLetterLimit}
                                                </span>
                                                <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100">
                                                    Outreach: {u.usage.outreachUsed}/{u.usage.outreachLimit}
                                                </span>
                                                <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-100">
                                                    Email: {u.usage.applicationEmailUsed ?? 0}/{u.usage.applicationEmailLimit ?? 3}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/users/${u.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/5 font-medium"
                                                >
                                                    Manage Quota & Stats
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


                {pagination.totalPages > 1 && (
                    <div className="border-t border-slate-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                        <p className="text-xs text-slate-500">
                            Showing page <span className="font-semibold">{pagination.page}</span> of{" "}
                            <span className="font-semibold">{pagination.totalPages}</span> ({pagination.totalCount} total users)
                        </p>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/admin/users?page=${pagination.page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                                className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
                            >
                                <Button variant="outline" size="sm" disabled={pagination.page <= 1} className="h-8 gap-1 text-xs">
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    Previous
                                </Button>
                            </Link>

                            <Link
                                href={`/admin/users?page=${pagination.page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                                className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                            >
                                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} className="h-8 gap-1 text-xs">
                                    Next
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default function AdminUsersPage(props: UsersPageProps) {
    return (
        <Suspense
            fallback={
                <div className="space-y-6">
                    <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-md" />
                    <div className="h-12 w-full bg-slate-200 animate-pulse rounded-lg" />
                    <div className="h-96 w-full bg-slate-200 animate-pulse rounded-lg" />
                </div>
            }
        >
            <UsersListContent {...props} />
        </Suspense>
    );
}
