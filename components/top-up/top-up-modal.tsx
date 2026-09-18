"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTopUpFacade } from "@/lib/facades/useTopUpFacade";
import {
    createTopUpRequestSchema,
    CreateTopUpRequestInput,
} from "@/lib/validations/top-up";
import { TopUpPackage, TopUpRequest } from "@/lib/models/models.types";
import {
    Zap,
    Sparkles,
    Copy,
    Check,
    History,
    CreditCard,
    ArrowRight,
    Clock,
    CheckCircle2,
    XCircle,
    Info,
    Smartphone,
} from "lucide-react";
import { toast } from "sonner";

interface TopUpModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialPackageId?: string;
}

export function TopUpModal({
    open,
    onOpenChange,
    initialPackageId,
}: TopUpModalProps) {
    const {
        packages,
        mfsProviders,
        mfsSettings,
        isLoadingPackages,
        userHistory,
        isLoadingHistory,
        isSubmittingTopUp,
        submitTopUp,
    } = useTopUpFacade();

    const [activeTab, setActiveTab] = useState<"packages" | "payment" | "history">("packages");
    const [selectedPackage, setSelectedPackage] = useState<TopUpPackage | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const activeMfsProviders = (mfsProviders || []).filter((p) => p.isActive);
    const displayProviders =
        activeMfsProviders.length > 0
            ? activeMfsProviders
            : [
                  {
                      _id: "bkash",
                      name: "bKash",
                      slug: "bkash",
                      accountType: "Personal",
                      accountNumber: mfsSettings?.bkashNumber || "01700000000",
                      instructions: "Send Money using bKash Personal account.",
                      order: 1,
                      color: "#E2136E",
                      isActive: true,
                  },
                  {
                      _id: "nagad",
                      name: "Nagad",
                      slug: "nagad",
                      accountType: "Personal",
                      accountNumber: mfsSettings?.nagadNumber || "01800000000",
                      instructions: "Send Money using Nagad Personal account.",
                      order: 2,
                      color: "#F7941D",
                      isActive: true,
                  },
                  {
                      _id: "rocket",
                      name: "Rocket",
                      slug: "rocket",
                      accountType: "Personal",
                      accountNumber: mfsSettings?.rocketNumber || "01900000000",
                      instructions: "Send Money using Rocket Personal account.",
                      order: 3,
                      color: "#8C3494",
                      isActive: true,
                  },
              ];

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateTopUpRequestInput>({
        resolver: zodResolver(createTopUpRequestSchema),
        defaultValues: {
            packageId: initialPackageId || "",
            paymentMethod: displayProviders[0]?.slug || "bkash",
            senderNumber: "",
            transactionId: "",
            userNote: "",
        },
    });

    const selectedPaymentMethod = watch("paymentMethod");

    const handleSelectPackage = (pkg: TopUpPackage) => {
        setSelectedPackage(pkg);
        setValue("packageId", pkg._id);
        setActiveTab("payment");
    };

    const handleCopy = (text: string, fieldName: string) => {
        // Extract raw number if text contains extra notes
        const cleanNumber = text.split(" ")[0].trim();
        navigator.clipboard.writeText(cleanNumber);
        setCopiedField(fieldName);
        toast.success(`Copied ${cleanNumber} to clipboard!`);
        setTimeout(() => setCopiedField(null), 2500);
    };

    const onSubmit = async (values: CreateTopUpRequestInput) => {
        try {
            await submitTopUp(values);
            reset();
            setActiveTab("history");
        } catch {
            // Error handled by facade with toast
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[94vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-slate-200">

                <div className="bg-gradient-to-r from-amber-500/10 via-primary/10 to-indigo-500/10 border-b border-slate-100 p-6">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                                <Zap className="h-4 w-4 fill-white" />
                            </span>
                            <DialogTitle className="text-xl font-bold text-slate-900">
                                AI Credits & Top-Up Store
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-slate-600">
                            Boost your quota for ATS resumes scans, AI cover letters, outreach, and job emails.
                        </DialogDescription>
                    </DialogHeader>


                    <div className="flex items-center gap-1.5 mt-4 p-1 bg-white/80 backdrop-blur rounded-xl border border-slate-200/80 shadow-2xs">
                        <button
                            type="button"
                            onClick={() => setActiveTab("packages")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${activeTab === "packages"
                                    ? "bg-primary text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                                }`}
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Packs & Tiers
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("payment")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${activeTab === "payment"
                                    ? "bg-primary text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                                }`}
                        >
                            <CreditCard className="h-3.5 w-3.5" />
                            MFS Payment
                            {selectedPackage && (
                                <Badge className="bg-amber-400 text-slate-900 hover:bg-amber-400 text-[10px] px-1 py-0 h-4">
                                    Selected
                                </Badge>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("history")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${activeTab === "history"
                                    ? "bg-primary text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                                }`}
                        >
                            <History className="h-3.5 w-3.5" />
                            My History
                            {userHistory.length > 0 && (
                                <span className="h-4 w-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                                    {userHistory.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="p-6">

                    {activeTab === "packages" && (
                        <div className="space-y-4">

                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs">
                                <div className="space-y-0.5">
                                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                        <Badge variant="outline" className="bg-white text-slate-700 text-[10px]">
                                            Free Tier
                                        </Badge>
                                        Default Account Allotment
                                    </span>
                                    <p className="text-slate-500 text-[11px]">
                                        All users get 3 free tries for ATS scans, cover letters, cold outreach, and application emails.
                                    </p>
                                </div>
                                <span className="font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                    ৳ 0 BDT
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Available Top-Up Packs
                                    </h4>
                                    <span className="text-[11px] text-muted-foreground">
                                        Credits stack cumulatively
                                    </span>
                                </div>

                                {isLoadingPackages ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-44 rounded-xl bg-slate-100 animate-pulse" />
                                        ))}
                                    </div>
                                ) : packages.length === 0 ? (
                                    <div className="p-8 text-center border border-dashed rounded-xl text-slate-500">
                                        No active top-up packs found. Please check back later.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {packages.map((pkg) => {
                                            const isCurrentSelected = selectedPackage?._id === pkg._id;
                                            return (
                                                <div
                                                    key={pkg._id}
                                                    className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer ${isCurrentSelected
                                                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                                            : "border-slate-200 bg-white hover:border-slate-300"
                                                        }`}
                                                    onClick={() => handleSelectPackage(pkg)}
                                                >
                                                    {pkg.badgeText && (
                                                        <span className="absolute -top-2.5 right-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                                            {pkg.badgeText}
                                                        </span>
                                                    )}

                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h5 className="font-bold text-slate-900 text-sm">
                                                                {pkg.name}
                                                            </h5>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 line-clamp-2 min-h-8">
                                                            {pkg.description || "Top-up package for AI applications"}
                                                        </p>

                                                        <div className="mt-3 text-xl font-extrabold text-slate-900 flex items-baseline gap-1">
                                                            <span>৳ {pkg.price}</span>
                                                            <span className="text-xs font-semibold text-slate-500">
                                                                {pkg.currency}
                                                            </span>
                                                        </div>


                                                        <div className="mt-3 space-y-1.5 text-xs border-t border-slate-100 pt-2.5">
                                                            <div className="flex items-center justify-between text-slate-600">
                                                                <span>ATS Scans</span>
                                                                <span className="font-bold text-primary">
                                                                    +{pkg.credits.atsScan}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-slate-600">
                                                                <span>Cover Letters</span>
                                                                <span className="font-bold text-indigo-600">
                                                                    +{pkg.credits.coverLetter}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-slate-600">
                                                                <span>Cold Outreach</span>
                                                                <span className="font-bold text-purple-600">
                                                                    +{pkg.credits.outreach}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-slate-600">
                                                                <span>Job Emails</span>
                                                                <span className="font-bold text-sky-600">
                                                                    +{pkg.credits.applicationEmail}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className={`w-full mt-4 text-xs font-semibold ${isCurrentSelected
                                                                ? "bg-primary text-white"
                                                                : "bg-slate-900 hover:bg-slate-800 text-white"
                                                            }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelectPackage(pkg);
                                                        }}
                                                    >
                                                        {isCurrentSelected ? "Selected" : "Choose Pack"}
                                                        <ArrowRight className="h-3 w-3 ml-1" />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    {activeTab === "payment" && (
                        <div className="space-y-5">

                            {selectedPackage ? (
                                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-primary font-semibold uppercase tracking-wider">
                                            Selected Package
                                        </span>
                                        <h5 className="font-bold text-slate-900 text-sm">
                                            {selectedPackage.name}
                                        </h5>
                                        <p className="text-[11px] text-slate-600">
                                            Includes +{selectedPackage.credits.atsScan} ATS, +
                                            {selectedPackage.credits.coverLetter} Cover Letters, +
                                            {selectedPackage.credits.outreach} Outreach, +
                                            {selectedPackage.credits.applicationEmail} Emails
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-primary">
                                            ৳ {selectedPackage.price}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("packages")}
                                            className="block text-[11px] text-slate-500 underline hover:text-slate-800"
                                        >
                                            Change Pack
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-amber-800 text-xs flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 shrink-0 text-amber-600" />
                                        <span>No package selected yet. Please select one to proceed.</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs h-7"
                                        onClick={() => setActiveTab("packages")}
                                    >
                                        View Packs
                                    </Button>
                                </div>
                            )}


                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Step 1: Send Money to Recipient Number
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                    {displayProviders.map((prov) => (
                                        <div
                                            key={prov._id || prov.slug}
                                            className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors"
                                            style={{
                                                borderLeftWidth: "4px",
                                                borderLeftColor: prov.color || "#6366f1",
                                            }}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                                        <span
                                                            className="h-2 w-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: prov.color || "#6366f1" }}
                                                        />
                                                        {prov.name}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] px-1.5 py-0 bg-white font-medium text-slate-600 border-slate-200"
                                                    >
                                                        {prov.accountType || "Personal"}
                                                    </Badge>
                                                </div>
                                                <p className="font-mono font-semibold text-slate-800 mt-2 text-xs">
                                                    {prov.accountNumber}
                                                </p>
                                                {prov.instructions && (
                                                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                                                        {prov.instructions}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="w-full mt-2.5 h-7 text-[11px] text-slate-700 hover:bg-slate-200/60 font-medium"
                                                onClick={() => handleCopy(prov.accountNumber, prov.slug)}
                                            >
                                                {copiedField === prov.slug ? (
                                                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5 mr-1" />
                                                )}
                                                {copiedField === prov.slug ? "Copied" : "Copy Number"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-500 italic mt-1">
                                    {mfsSettings?.instructions ||
                                        "Send money using Personal account. Keep your Transaction ID (TrxID) handy."}
                                </p>
                            </div>


                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Step 2: Submit Verification Details
                                </Label>

                                <div className="space-y-3">

                                    <div className="space-y-1.5">
                                        <Label htmlFor="paymentMethod" className="text-xs">
                                            Payment Method *
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {displayProviders.map((prov) => {
                                                const isSelected = selectedPaymentMethod === prov.slug;
                                                return (
                                                    <button
                                                        key={prov.slug}
                                                        type="button"
                                                        onClick={() => setValue("paymentMethod", prov.slug)}
                                                        className={`py-2 px-3.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                            isSelected
                                                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                                        }`}
                                                    >
                                                        <span
                                                            className="h-2 w-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: prov.color || "#6366f1" }}
                                                        />
                                                        {prov.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>


                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="senderNumber" className="text-xs">
                                                Your Mobile Number *
                                            </Label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                                <Input
                                                    id="senderNumber"
                                                    placeholder="e.g. 01712345678"
                                                    className="pl-9 text-xs"
                                                    {...register("senderNumber")}
                                                />
                                            </div>
                                            {errors.senderNumber && (
                                                <p className="text-[11px] text-destructive">
                                                    {errors.senderNumber.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="transactionId" className="text-xs">
                                                Transaction ID (TrxID) *
                                            </Label>
                                            <Input
                                                id="transactionId"
                                                placeholder="e.g. BZ892KJ1"
                                                className="uppercase font-mono text-xs"
                                                {...register("transactionId")}
                                            />
                                            {errors.transactionId && (
                                                <p className="text-[11px] text-destructive">
                                                    {errors.transactionId.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>


                                    <div className="space-y-1.5">
                                        <Label htmlFor="userNote" className="text-xs text-slate-600">
                                            Additional Note / Reference (Optional)
                                        </Label>
                                        <Textarea
                                            id="userNote"
                                            rows={2}
                                            placeholder="Any note for admin verification..."
                                            className="text-xs"
                                            {...register("userNote")}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmittingTopUp || !selectedPackage}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-10 shadow-xs"
                                >
                                    {isSubmittingTopUp ? "Submitting for Verification..." : "Submit Payment Verification"}
                                </Button>
                            </form>
                        </div>
                    )}


                    {activeTab === "history" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Your Top-Up Submissions
                                </h4>
                                <span className="text-[11px] text-muted-foreground">
                                    Verified manually by administrators
                                </span>
                            </div>

                            {isLoadingHistory ? (
                                <div className="space-y-2">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                                    ))}
                                </div>
                            ) : userHistory.length === 0 ? (
                                <div className="p-8 text-center border border-dashed rounded-xl space-y-2">
                                    <Clock className="h-8 w-8 text-slate-300 mx-auto" />
                                    <p className="text-xs text-slate-600 font-medium">
                                        No past top-up submissions found.
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        When you submit a top-up request, its status and approval will appear here.
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="text-xs mt-2"
                                        onClick={() => setActiveTab("packages")}
                                    >
                                        Explore Packs
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                                    {userHistory.map((req: TopUpRequest) => {
                                        const isApproved = req.status === "approved";
                                        const isRejected = req.status === "rejected";
                                        const isPending = req.status === "pending";

                                        return (
                                            <div
                                                key={req._id}
                                                className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isApproved
                                                        ? "border-emerald-200 bg-emerald-50/40"
                                                        : isRejected
                                                            ? "border-rose-200 bg-rose-50/40"
                                                            : "border-amber-200 bg-amber-50/40"
                                                    }`}
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 text-sm">
                                                            {req.packageName}
                                                        </span>
                                                        <Badge
                                                            className={`text-[10px] font-semibold border ${isApproved
                                                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                                    : isRejected
                                                                        ? "bg-rose-100 text-rose-800 border-rose-300"
                                                                        : "bg-amber-100 text-amber-800 border-amber-300"
                                                                }`}
                                                        >
                                                            {isApproved && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                            {isRejected && <XCircle className="h-3 w-3 mr-1" />}
                                                            {isPending && <Clock className="h-3 w-3 mr-1" />}
                                                            {req.status.toUpperCase()}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                                        <span className="font-medium text-slate-700 capitalize">
                                                            Method: {req.paymentMethod}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="font-mono">TrxID: {req.transactionId}</span>
                                                        <span>•</span>
                                                        <span>
                                                            {req.createdAt
                                                                ? new Date(req.createdAt).toLocaleDateString()
                                                                : "N/A"}
                                                        </span>
                                                    </div>

                                                    {isRejected && req.rejectionReason && (
                                                        <p className="text-[11px] text-rose-600 bg-rose-100/60 p-1.5 rounded mt-1 font-medium">
                                                            Reason: {req.rejectionReason}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="sm:text-right shrink-0">
                                                    <span className="text-sm font-extrabold text-slate-900">
                                                        ৳ {req.amount} {req.currency}
                                                    </span>
                                                    <p className="text-[10px] text-slate-500">
                                                        Sender: {req.senderNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
