"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkles, RefreshCw, PlusCircle, Save, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { updateUserUsageSchema, UpdateUserUsageInput } from "@/lib/validations/admin";
import { useAdminFacade } from "@/lib/facades/useAdminFacade";

interface QuotaEditorCardProps {
    userId: string;
    userName: string;
    initialUsage: {
        atsScanCount: number;
        atsScanLimit: number;
        coverLetterCount: number;
        coverLetterLimit: number;
        outreachCount: number;
        outreachLimit: number;
    };
}

export default function QuotaEditorCard({
    userId,
    userName,
    initialUsage,
}: QuotaEditorCardProps) {
    const { isUpdatingUsage, updateUserUsage } = useAdminFacade();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UpdateUserUsageInput>({
        resolver: zodResolver(updateUserUsageSchema),
        defaultValues: {
            userId,
            atsScanCount: initialUsage.atsScanCount,
            atsScanLimit: initialUsage.atsScanLimit,
            coverLetterCount: initialUsage.coverLetterCount,
            coverLetterLimit: initialUsage.coverLetterLimit,
            outreachCount: initialUsage.outreachCount,
            outreachLimit: initialUsage.outreachLimit,
        },
    });

    const watchedAtsCount = watch("atsScanCount");
    const watchedAtsLimit = watch("atsScanLimit");
    const watchedCoverCount = watch("coverLetterCount");
    const watchedCoverLimit = watch("coverLetterLimit");
    const watchedOutreachCount = watch("outreachCount");
    const watchedOutreachLimit = watch("outreachLimit");

    const handleResetAllCounts = () => {
        setValue("atsScanCount", 0, { shouldValidate: true, shouldDirty: true });
        setValue("coverLetterCount", 0, { shouldValidate: true, shouldDirty: true });
        setValue("outreachCount", 0, { shouldValidate: true, shouldDirty: true });
        toast.info("Reset all used counts to 0 in form. Click 'Save Changes' to apply.");
    };

    const handleAddBonus = (amount = 5) => {
        const safe = (v: unknown) => (Number.isFinite(Number(v)) && v !== "" ? Number(v) : 0);
        setValue("atsScanLimit", safe(watchedAtsLimit) + amount, { shouldValidate: true, shouldDirty: true });
        setValue("coverLetterLimit", safe(watchedCoverLimit) + amount, { shouldValidate: true, shouldDirty: true });
        setValue("outreachLimit", safe(watchedOutreachLimit) + amount, { shouldValidate: true, shouldDirty: true });
        toast.info(`Added +${amount} to all feature limits in form. Click 'Save Changes' to apply.`);
    };

    const onSubmit = async (data: UpdateUserUsageInput) => {
        await updateUserUsage(data);
    };

    return (
        <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-900">
                                AI Feature Quota Management
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Configure usage thresholds and reset feature counts for {userName}.
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResetAllCounts}
                            disabled={isUpdatingUsage}
                            className="text-xs gap-1 text-slate-700 hover:text-slate-900"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset Used
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddBonus(5)}
                            disabled={isUpdatingUsage}
                            className="text-xs gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                        >
                            <PlusCircle className="h-3.5 w-3.5" />
                            +5 Bonus
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="p-6 space-y-6">
                    <input type="hidden" {...register("userId")} />


                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-slate-900">ATS Resume Scanner</span>
                                <Badge variant="outline" className="text-[11px] bg-blue-50 text-blue-700 border-blue-200">
                                    atsScan
                                </Badge>
                            </div>
                            <div className="text-xs text-slate-500">
                                Remaining:{" "}
                                <span className="font-bold text-slate-800">
                                    {Math.max(0, Number(watchedAtsLimit) - Number(watchedAtsCount))}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="atsScanCount" className="text-xs text-slate-600">
                                    Used Attempts
                                </Label>
                                <Input
                                    id="atsScanCount"
                                    type="number"
                                    min={0}
                                    {...register("atsScanCount")}
                                    className="bg-white"
                                />
                                {errors.atsScanCount && (
                                    <p className="text-xs text-red-600">{errors.atsScanCount.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="atsScanLimit" className="text-xs text-slate-600">
                                    Total Limit Allowance
                                </Label>
                                <Input
                                    id="atsScanLimit"
                                    type="number"
                                    min={0}
                                    {...register("atsScanLimit")}
                                    className="bg-white"
                                />
                                {errors.atsScanLimit && (
                                    <p className="text-xs text-red-600">{errors.atsScanLimit.message}</p>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-slate-900">AI Cover Letter Generator</span>
                                <Badge variant="outline" className="text-[11px] bg-indigo-50 text-indigo-700 border-indigo-200">
                                    coverLetter
                                </Badge>
                            </div>
                            <div className="text-xs text-slate-500">
                                Remaining:{" "}
                                <span className="font-bold text-slate-800">
                                    {Math.max(0, Number(watchedCoverLimit) - Number(watchedCoverCount))}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="coverLetterCount" className="text-xs text-slate-600">
                                    Used Attempts
                                </Label>
                                <Input
                                    id="coverLetterCount"
                                    type="number"
                                    min={0}
                                    {...register("coverLetterCount")}
                                    className="bg-white"
                                />
                                {errors.coverLetterCount && (
                                    <p className="text-xs text-red-600">{errors.coverLetterCount.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="coverLetterLimit" className="text-xs text-slate-600">
                                    Total Limit Allowance
                                </Label>
                                <Input
                                    id="coverLetterLimit"
                                    type="number"
                                    min={0}
                                    {...register("coverLetterLimit")}
                                    className="bg-white"
                                />
                                {errors.coverLetterLimit && (
                                    <p className="text-xs text-red-600">{errors.coverLetterLimit.message}</p>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-slate-900">Cold Outreach Generator</span>
                                <Badge variant="outline" className="text-[11px] bg-purple-50 text-purple-700 border-purple-200">
                                    outreach
                                </Badge>
                            </div>
                            <div className="text-xs text-slate-500">
                                Remaining:{" "}
                                <span className="font-bold text-slate-800">
                                    {Math.max(0, Number(watchedOutreachLimit) - Number(watchedOutreachCount))}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="outreachCount" className="text-xs text-slate-600">
                                    Used Attempts
                                </Label>
                                <Input
                                    id="outreachCount"
                                    type="number"
                                    min={0}
                                    {...register("outreachCount")}
                                    className="bg-white"
                                />
                                {errors.outreachCount && (
                                    <p className="text-xs text-red-600">{errors.outreachCount.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="outreachLimit" className="text-xs text-slate-600">
                                    Total Limit Allowance
                                </Label>
                                <Input
                                    id="outreachLimit"
                                    type="number"
                                    min={0}
                                    {...register("outreachLimit")}
                                    className="bg-white"
                                />
                                {errors.outreachLimit && (
                                    <p className="text-xs text-red-600">{errors.outreachLimit.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="border-t border-slate-100 bg-slate-50/30 px-6 py-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                        Changes apply immediately across all client sessions.
                    </span>
                    <Button
                        type="submit"
                        disabled={isUpdatingUsage}
                        className="bg-primary hover:bg-primary/90 text-white gap-2 font-medium"
                    >
                        {isUpdatingUsage ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Saving Quotas...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
