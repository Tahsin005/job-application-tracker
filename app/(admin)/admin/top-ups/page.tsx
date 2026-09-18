"use client";

import { useState } from "react";
import { useAdminTopUpFacade } from "@/lib/facades/useTopUpFacade";
import { TopUpAnalyticsCards } from "@/components/admin/top-up-analytics-cards";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Search,
    RefreshCw,
    Check,
    X,
    Copy,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    User as UserIcon,
} from "lucide-react";
import { TopUpRequest } from "@/lib/models/models.types";
import { toast } from "sonner";

export default function AdminTopUpsPage() {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [copiedTrx, setCopiedTrx] = useState<string | null>(null);

    // Reject Dialog State
    const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
    const [selectedRequestToReject, setSelectedRequestToReject] = useState<TopUpRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string>("");

    const {
        requests,
        pagination,
        isLoadingRequests,
        refetchRequests,
        analytics,
        isLoadingAnalytics,
        refetchAnalytics,
        isReviewing,
        reviewRequest,
    } = useAdminTopUpFacade({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm,
        page,
        limit: 10,
    });

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedTrx(text);
            toast.success(`Copied "${text}" to clipboard!`);
            setTimeout(() => setCopiedTrx(null), 2500);
        } catch {
            toast.error("Could not copy the transaction ID.");
        }
    };

    const handleApprove = async (req: TopUpRequest) => {
        try {
            await reviewRequest({ requestId: req._id, action: "approve" });
            refetchRequests();
            refetchAnalytics();
        } catch {
            // Error handled by facade with toast
        }
    };

    const openRejectDialog = (req: TopUpRequest) => {
        setSelectedRequestToReject(req);
        setRejectionReason("Transaction ID not found or payment not received.");
        setRejectDialogOpen(true);
    };

    const handleConfirmReject = async () => {
        if (!selectedRequestToReject) return;
        try {
            await reviewRequest({
                requestId: selectedRequestToReject._id,
                action: "reject",
                rejectionReason,
            });
            setRejectDialogOpen(false);
            setSelectedRequestToReject(null);
            refetchRequests();
            refetchAnalytics();
        } catch {
            // Error handled by facade with toast
        }
    };

    const handleRefresh = () => {
        refetchRequests();
        refetchAnalytics();
        toast.info("Refreshed top-up requests & analytics.");
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Top-Up Requests & Verification
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Inspect manual MFS payments (bKash/Nagad/Rocket), verify TrxIDs, and allocate AI credits to candidate accounts.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-1.5 text-xs text-slate-600 hover:text-slate-900"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                    </Button>
                </div>
            </div>


            <TopUpAnalyticsCards analytics={analytics} isLoading={isLoadingAnalytics} />


            <Card className="border-slate-200 bg-white shadow-xs p-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

                    <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
                        {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                            <button
                                key={st}
                                type="button"
                                onClick={() => {
                                    setStatusFilter(st);
                                    setPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-md capitalize transition-all ${statusFilter === st
                                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                                        : "text-slate-600 hover:text-slate-900"
                                    }`}
                            >
                                {st}
                                {st === "pending" && analytics && analytics.pendingCount > 0 && (
                                    <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                                        {analytics.pendingCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>


                    <div className="relative flex-1 w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search by TrxID, name, email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="pl-9 h-9 text-xs bg-slate-50/60 border-slate-200"
                        />
                    </div>
                </div>
            </Card>


            <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-3.5">Candidate</th>
                                <th className="px-5 py-3.5">Package & Tier</th>
                                <th className="px-5 py-3.5">Payment Details</th>
                                <th className="px-5 py-3.5">Transaction ID</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5">Date</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoadingRequests ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                                        Loading top-up verification requests...
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        <UserIcon className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                        No top-up requests found matching your filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req: TopUpRequest) => {
                                    const isPending = req.status === "pending";
                                    const isApproved = req.status === "approved";
                                    const isRejected = req.status === "rejected";

                                    const isBkash = req.paymentMethod === "bkash";
                                    const isNagad = req.paymentMethod === "nagad";
                                    const isRocket = req.paymentMethod === "rocket";

                                    return (
                                        <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">

                                            <td className="px-5 py-4">
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-slate-900">{req.userName}</p>
                                                    <p className="text-[11px] text-slate-500 font-mono">
                                                        {req.userEmail}
                                                    </p>
                                                </div>
                                            </td>


                                            <td className="px-5 py-4">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-slate-800">
                                                            {req.packageName}
                                                        </span>
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 bg-slate-50 text-slate-600">
                                                            Lvl {req.order || 1}
                                                        </Badge>
                                                    </div>
                                                    <p className="font-bold text-slate-900 text-[11px]">
                                                        ৳ {req.amount} {req.currency}
                                                    </p>
                                                </div>
                                            </td>


                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <Badge
                                                        className={`text-[10px] font-bold capitalize border ${isBkash
                                                                ? "bg-pink-100 text-pink-700 border-pink-200"
                                                                : isNagad
                                                                    ? "bg-orange-100 text-orange-700 border-orange-200"
                                                                    : isRocket
                                                                        ? "bg-purple-100 text-purple-700 border-purple-200"
                                                                        : "bg-slate-100 text-slate-700 border-slate-200"
                                                            }`}
                                                    >
                                                        {req.paymentMethod}
                                                    </Badge>
                                                    <p className="text-[11px] text-slate-600 font-mono">
                                                        From: {req.senderNumber}
                                                    </p>
                                                </div>
                                            </td>


                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                                                    <span>{req.transactionId}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(req.transactionId)}
                                                        className="text-slate-400 hover:text-slate-700 p-0.5"
                                                        title="Copy TrxID"
                                                    >
                                                        {copiedTrx === req.transactionId ? (
                                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                                {req.userNote && (
                                                    <p className="text-[10px] text-slate-400 italic max-w-xs truncate">
                                                        &quot;{req.userNote}&quot;
                                                    </p>
                                                )}
                                            </td>


                                            <td className="px-5 py-4">
                                                <Badge
                                                    className={`text-[10px] font-semibold border ${isApproved
                                                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                            : isRejected
                                                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                                                : "bg-amber-100 text-amber-800 border-amber-200"
                                                        }`}
                                                >
                                                    {isApproved && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                    {isRejected && <XCircle className="h-3 w-3 mr-1" />}
                                                    {isPending && <Clock className="h-3 w-3 mr-1" />}
                                                    {req.status.toUpperCase()}
                                                </Badge>
                                                {isRejected && req.rejectionReason && (
                                                    <p className="text-[10px] text-rose-600 mt-1 max-w-xs line-clamp-1" title={req.rejectionReason}>
                                                        {req.rejectionReason}
                                                    </p>
                                                )}
                                            </td>


                                            <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                                                {req.createdAt
                                                    ? new Date(req.createdAt).toLocaleDateString()
                                                    : "N/A"}
                                            </td>


                                            <td className="px-5 py-4 text-right">
                                                {isPending ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            disabled={isReviewing}
                                                            onClick={() => handleApprove(req)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-[11px] gap-1 font-semibold"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isReviewing}
                                                            onClick={() => openRejectDialog(req)}
                                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 h-7 px-2.5 text-[11px] gap-1 font-semibold"
                                                        >
                                                            <X className="h-3 w-3" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">
                                                        Reviewed by {req.reviewedBy || "Admin"}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>


                {pagination && pagination.totalPages > 1 && (
                    <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Page <span className="font-semibold">{pagination.page}</span> of{" "}
                            <span className="font-semibold">{pagination.totalPages}</span> ({pagination.totalCount} total requests)
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="h-7 text-xs gap-1"
                            >
                                <ChevronLeft className="h-3 w-3" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="h-7 text-xs gap-1"
                            >
                                Next
                                <ChevronRight className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>


            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base text-rose-600 flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Reject Top-Up Request
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Please provide a clear reason for rejecting candidate{" "}
                            <span className="font-semibold text-slate-900">
                                {selectedRequestToReject?.userName}
                            </span>
                            &apos;s submission (TrxID: {selectedRequestToReject?.transactionId}).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <Label htmlFor="rejectionReason" className="text-xs font-semibold">
                            Reason for Rejection *
                        </Label>
                        <Textarea
                            id="rejectionReason"
                            rows={3}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Transaction ID not found or amount does not match."
                            className="text-xs"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRejectDialogOpen(false)}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            disabled={isReviewing || !rejectionReason.trim()}
                            onClick={handleConfirmReject}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                        >
                            {isReviewing ? "Rejecting..." : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
