"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopUpAnalyticsSummary } from "@/lib/models/models.types";
import {
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Smartphone,
    Layers,
} from "lucide-react";

interface TopUpAnalyticsCardsProps {
    analytics?: TopUpAnalyticsSummary | null;
    isLoading?: boolean;
}

export function TopUpAnalyticsCards({
    analytics,
    isLoading,
}: TopUpAnalyticsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!analytics) {
        return null;
    }

    const {
        totalRevenue,
        pendingCount,
        approvedCount,
        rejectedCount,
        packageDistribution = [],
        methodDistribution = [],
    } = analytics;

    return (
        <div className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Total Revenue
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                                ৳ {totalRevenue.toLocaleString()} <span className="text-xs text-slate-500 font-normal">BDT</span>
                            </h3>
                            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                From {approvedCount} approved top-ups
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>


                <Card className={`border-slate-200 bg-white shadow-xs ${pendingCount > 0 ? "border-amber-300 ring-1 ring-amber-200" : ""}`}>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Pending Verification
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                                {pendingCount}
                            </h3>
                            <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {pendingCount === 0 ? "Inbox clear" : "Awaiting review"}
                            </p>
                        </div>
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${pendingCount > 0 ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-amber-50 text-amber-600"}`}>
                            <Clock className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>


                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Approved & Credited
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                                {approvedCount}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-1">
                                Lifetime successful orders
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>


                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Rejected Submissions
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                                {rejectedCount}
                            </h3>
                            <p className="text-[11px] text-rose-500 mt-1">
                                Invalid TrxID / fake claims
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <XCircle className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Card className="border-slate-200 bg-white shadow-xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-indigo-600" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Package Popularity & Revenue
                            </h4>
                        </div>
                        <span className="text-[11px] text-slate-400">Approved purchases</span>
                    </div>
                    <CardContent className="p-4 space-y-2.5">
                        {packageDistribution.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">No top-up data yet.</p>
                        ) : (
                            packageDistribution.map((item) => (
                                <div
                                    key={item.packageName}
                                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                                >
                                    <div className="space-y-0.5">
                                        <span className="font-semibold text-slate-800">{item.packageName}</span>
                                        <p className="text-[11px] text-slate-500">{item.count} orders</p>
                                    </div>
                                    <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                                        ৳ {item.revenue.toLocaleString()} BDT
                                    </span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>


                <Card className="border-slate-200 bg-white shadow-xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-pink-600" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Payment Channel Breakdown
                            </h4>
                        </div>
                        <span className="text-[11px] text-slate-400">MFS Provider Share</span>
                    </div>
                    <CardContent className="p-4 space-y-2.5">
                        {methodDistribution.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">No payment transactions yet.</p>
                        ) : (
                            methodDistribution.map((item) => {
                                const isBkash = item.method === "bkash";
                                const isNagad = item.method === "nagad";
                                const isRocket = item.method === "rocket";

                                return (
                                    <div
                                        key={item.method}
                                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={`text-[11px] font-bold capitalize border ${isBkash
                                                        ? "bg-pink-100 text-pink-700 border-pink-200"
                                                        : isNagad
                                                            ? "bg-orange-100 text-orange-700 border-orange-200"
                                                            : isRocket
                                                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                                                : "bg-slate-100 text-slate-700 border-slate-200"
                                                    }`}
                                            >
                                                {item.method}
                                            </Badge>
                                            <span className="text-[11px] text-slate-500 font-medium">
                                                {item.count} transactions
                                            </span>
                                        </div>
                                        <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                                            ৳ {item.revenue.toLocaleString()} BDT
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
