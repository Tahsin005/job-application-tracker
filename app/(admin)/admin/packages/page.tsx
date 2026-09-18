"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdminTopUpFacade } from "@/lib/facades/useTopUpFacade";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
    upsertTopUpPackageSchema,
    UpsertTopUpPackageInput,
    updateAdminMfsSettingsSchema,
    UpdateAdminMfsSettingsInput,
    upsertMfsProviderSchema,
    UpsertMfsProviderInput,
} from "@/lib/validations/top-up";
import { TopUpPackage, MfsProvider } from "@/lib/models/models.types";
import {
    Plus,
    Edit3,
    Power,
    Sparkles,
    Smartphone,
    Save,
    RefreshCw,
    Layers,
    ArrowUpDown,
    Trash2,
    Palette,
} from "lucide-react";

export default function AdminPackagesPage() {
    const [selectedTab, setSelectedTab] = useState<"packages" | "mfs">("packages");
    const [packageModalOpen, setPackageModalOpen] = useState<boolean>(false);
    const [editingPackage, setEditingPackage] = useState<TopUpPackage | null>(null);

    const [providerModalOpen, setProviderModalOpen] = useState<boolean>(false);
    const [editingProvider, setEditingProvider] = useState<MfsProvider | null>(null);

    const {
        allPackages,
        isLoadingAllPackages,
        refetchAllPackages,
        mfsSettings,
        savePackage,
        isSavingPackage,
        togglePackage,
        isTogglingPackage,
        saveMfsSettings,
        isSavingMfs,
        allMfsProviders,
        isLoadingAllMfsProviders,
        refetchAllMfsProviders,
        saveMfsProvider,
        isSavingMfsProvider,
        toggleMfsProvider,
        isTogglingMfsProvider,
        deleteMfsProvider,
        isDeletingMfsProvider,
    } = useAdminTopUpFacade();

    // Package Form
    const {
        register: registerPkg,
        handleSubmit: handleSubmitPkg,
        reset: resetPkg,
        setValue: setPkgValue,
        formState: { errors: pkgErrors },
    } = useForm<UpsertTopUpPackageInput>({
        resolver: zodResolver(upsertTopUpPackageSchema),
        defaultValues: {
            name: "",
            tierKey: "",
            order: 1,
            price: 150,
            currency: "BDT",
            description: "",
            badgeText: "",
            credits: {
                atsScan: 10,
                coverLetter: 10,
                outreach: 10,
                applicationEmail: 10,
            },
            isActive: true,
        },
    });

    // MFS Settings Form
    const {
        register: registerMfs,
        handleSubmit: handleSubmitMfs,
        formState: { errors: mfsErrors },
    } = useForm<UpdateAdminMfsSettingsInput>({
        resolver: zodResolver(updateAdminMfsSettingsSchema),
        values: {
            bkashNumber: mfsSettings?.bkashNumber ?? "",
            nagadNumber: mfsSettings?.nagadNumber ?? "",
            rocketNumber: mfsSettings?.rocketNumber ?? "",
            upayNumber: mfsSettings?.upayNumber ?? "",
            instructions:
                mfsSettings?.instructions ??
                "Send the exact amount via Personal Send Money. After payment, enter your sender phone number and the Transaction ID (TrxID) below.",
        },
        resetOptions: { keepDefaultValues: true },
    });

    // MFS Provider Form
    const {
        register: registerProv,
        handleSubmit: handleSubmitProv,
        reset: resetProv,
        setValue: setProvValue,
        watch: watchProv,
        formState: { errors: provErrors },
    } = useForm<UpsertMfsProviderInput>({
        resolver: zodResolver(upsertMfsProviderSchema),
        defaultValues: {
            name: "",
            slug: "",
            accountType: "Personal",
            accountNumber: "",
            instructions: "Send money using Personal Send Money. Keep your Transaction ID (TrxID) handy.",
            order: 1,
            color: "#E2136E",
            isActive: true,
        },
    });

    const activeProvColor = watchProv("color") || "#E2136E";

    const openCreatePackageModal = () => {
        setEditingPackage(null);
        resetPkg({
            name: "",
            tierKey: `level${allPackages.length + 1}`,
            order: allPackages.length + 1,
            price: 200,
            currency: "BDT",
            description: "",
            badgeText: "",
            credits: {
                atsScan: 15,
                coverLetter: 15,
                outreach: 15,
                applicationEmail: 15,
            },
            isActive: true,
        });
        setPackageModalOpen(true);
    };

    const openEditPackageModal = (pkg: TopUpPackage) => {
        setEditingPackage(pkg);
        setPkgValue("id", pkg._id);
        setPkgValue("name", pkg.name);
        setPkgValue("tierKey", pkg.tierKey);
        setPkgValue("order", pkg.order || 1);
        setPkgValue("price", pkg.price);
        setPkgValue("currency", pkg.currency || "BDT");
        setPkgValue("description", pkg.description || "");
        setPkgValue("badgeText", pkg.badgeText || "");
        setPkgValue("credits.atsScan", pkg.credits.atsScan);
        setPkgValue("credits.coverLetter", pkg.credits.coverLetter);
        setPkgValue("credits.outreach", pkg.credits.outreach);
        setPkgValue("credits.applicationEmail", pkg.credits.applicationEmail);
        setPkgValue("isActive", pkg.isActive);
        setPackageModalOpen(true);
    };

    const onSubmitPackage = async (values: UpsertTopUpPackageInput) => {
        try {
            await savePackage(values);
            setPackageModalOpen(false);
            refetchAllPackages();
        } catch {
            // Error handled by facade
        }
    };

    const openCreateProviderModal = () => {
        setEditingProvider(null);
        resetProv({
            name: "",
            slug: "",
            accountType: "Personal",
            accountNumber: "",
            instructions: "Send money using Personal Send Money. Keep your Transaction ID (TrxID) handy.",
            order: allMfsProviders.length + 1,
            color: "#E2136E",
            isActive: true,
        });
        setProviderModalOpen(true);
    };

    const openEditProviderModal = (prov: MfsProvider) => {
        setEditingProvider(prov);
        setProvValue("id", prov._id);
        setProvValue("name", prov.name);
        setProvValue("slug", prov.slug);
        setProvValue("accountType", prov.accountType || "Personal");
        setProvValue("accountNumber", prov.accountNumber);
        setProvValue("instructions", prov.instructions || "");
        setProvValue("order", prov.order ?? 1);
        setProvValue("color", prov.color || "#E2136E");
        setProvValue("isActive", prov.isActive ?? true);
        setProviderModalOpen(true);
    };

    const onSubmitProvider = async (values: UpsertMfsProviderInput) => {
        try {
            await saveMfsProvider(values);
            setProviderModalOpen(false);
            refetchAllMfsProviders();
        } catch {
            // Error handled by facade
        }
    };

    const handleToggleProviderStatus = async (providerId: string) => {
        try {
            await toggleMfsProvider(providerId);
            refetchAllMfsProviders();
        } catch {
            // Error handled by facade
        }
    };

    const handleDeleteProvider = async (providerId: string) => {
        if (!confirm("Are you sure you want to delete this payment provider? Candidates won't be able to select it anymore.")) {
            return;
        }
        try {
            await deleteMfsProvider(providerId);
            refetchAllMfsProviders();
        } catch {
            // Error handled by facade
        }
    };

    const onSubmitMfs = async (values: UpdateAdminMfsSettingsInput) => {
        try {
            await saveMfsSettings(values);
        } catch {
            // Error handled by facade
        }
    };

    const handleToggleStatus = async (pkgId: string) => {
        try {
            await togglePackage(pkgId);
            refetchAllPackages();
        } catch {
            // Error handled by facade
        }
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Top-Up Packages & MFS Settings
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Configure AI credit pack pricing, hierarchy order, quota allocations, and recipient payment numbers.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            selectedTab === "packages"
                                ? refetchAllPackages()
                                : refetchAllMfsProviders()
                        }
                        className="gap-1.5 text-xs text-slate-600 hover:text-slate-900"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                    </Button>
                    {selectedTab === "packages" ? (
                        <Button
                            size="sm"
                            onClick={openCreatePackageModal}
                            className="bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs font-semibold shadow-xs"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Create New Pack
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={openCreateProviderModal}
                            className="bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs font-semibold shadow-xs"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add MFS Provider
                        </Button>
                    )}
                </div>
            </div>


            <div className="flex items-center gap-2 border-b border-slate-200">
                <button
                    type="button"
                    onClick={() => setSelectedTab("packages")}
                    className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-all ${selectedTab === "packages"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                >
                    <Layers className="h-4 w-4" />
                    Credit Packs ({allPackages.length})
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTab("mfs")}
                    className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-all ${selectedTab === "mfs"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                >
                    <Smartphone className="h-4 w-4" />
                    Recipient MFS Providers ({allMfsProviders.length}) & Instructions
                </button>
            </div>


            {selectedTab === "packages" && (
                <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-3.5">
                                        <span className="flex items-center gap-1">
                                            <ArrowUpDown className="h-3 w-3" />
                                            Order
                                        </span>
                                    </th>
                                    <th className="px-5 py-3.5">Package Name</th>
                                    <th className="px-5 py-3.5">Tier Key</th>
                                    <th className="px-5 py-3.5">Price (BDT)</th>
                                    <th className="px-5 py-3.5">AI Credits Boost</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoadingAllPackages ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                                            Loading packages...
                                        </td>
                                    </tr>
                                ) : allPackages.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                            No packages configured. Click &quot;Create New Pack&quot; to add one.
                                        </td>
                                    </tr>
                                ) : (
                                    allPackages.map((pkg: TopUpPackage) => (
                                        <tr key={pkg._id} className="hover:bg-slate-50/50 transition-colors">

                                            <td className="px-5 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono font-bold bg-slate-100 text-slate-700 text-xs px-2 py-0.5"
                                                >
                                                    #{pkg.order || 1}
                                                </Badge>
                                            </td>


                                            <td className="px-5 py-4">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-slate-900 text-sm">
                                                            {pkg.name}
                                                        </span>
                                                        {pkg.badgeText && (
                                                            <Badge className="bg-primary text-white text-[10px] px-1.5 py-0">
                                                                {pkg.badgeText}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 max-w-sm line-clamp-1">
                                                        {pkg.description || "No description provided."}
                                                    </p>
                                                </div>
                                            </td>


                                            <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                                                {pkg.tierKey}
                                            </td>


                                            <td className="px-5 py-4">
                                                <span className="font-extrabold text-slate-900 text-sm">
                                                    ৳ {pkg.price} {pkg.currency}
                                                </span>
                                            </td>


                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-1 text-[10px]">
                                                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                                                        ATS: +{pkg.credits.atsScan}
                                                    </span>
                                                    <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-medium">
                                                        Cover: +{pkg.credits.coverLetter}
                                                    </span>
                                                    <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100 font-medium">
                                                        Outreach: +{pkg.credits.outreach}
                                                    </span>
                                                    <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-100 font-medium">
                                                        Email: +{pkg.credits.applicationEmail}
                                                    </span>
                                                </div>
                                            </td>


                                            <td className="px-5 py-4">
                                                <Badge
                                                    className={`text-[10px] font-semibold border ${pkg.isActive
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                                        }`}
                                                >
                                                    {pkg.isActive ? "Active" : "Deactivated"}
                                                </Badge>
                                            </td>


                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => openEditPackageModal(pkg)}
                                                        className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={isTogglingPackage}
                                                        onClick={() => handleToggleStatus(pkg._id)}
                                                        className={`h-7 px-2 text-xs font-medium ${pkg.isActive
                                                            ? "text-rose-600 hover:bg-rose-50"
                                                            : "text-emerald-600 hover:bg-emerald-50"
                                                            }`}
                                                    >
                                                        <Power className="h-3.5 w-3.5 mr-1" />
                                                        {pkg.isActive ? "Disable" : "Enable"}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}


            {selectedTab === "mfs" && (
                <div className="space-y-6">

                    <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Smartphone className="h-5 w-5 text-primary" />
                                    Active MFS Payment Providers
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Configured mobile accounts shown to candidates. Easily add new providers (Cellfin, Upay, etc.), adjust account types, recipient numbers, and display order.
                                </CardDescription>
                            </div>
                            <Button
                                size="sm"
                                onClick={openCreateProviderModal}
                                className="bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs font-semibold shrink-0"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Provider
                            </Button>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-3.5">
                                            <span className="flex items-center gap-1">
                                                <ArrowUpDown className="h-3 w-3" />
                                                Order
                                            </span>
                                        </th>
                                        <th className="px-5 py-3.5">Provider & Identifier</th>
                                        <th className="px-5 py-3.5">Account Type</th>
                                        <th className="px-5 py-3.5">Account Number</th>
                                        <th className="px-5 py-3.5">Candidate Note / Instructions</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoadingAllMfsProviders ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                                                Loading MFS payment providers...
                                            </td>
                                        </tr>
                                    ) : allMfsProviders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                No payment providers configured. Click &quot;Add Provider&quot; above to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        allMfsProviders.map((prov: MfsProvider) => (
                                            <tr key={prov._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono font-bold bg-slate-100 text-slate-700 text-xs px-2 py-0.5"
                                                    >
                                                        #{prov.order ?? 1}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <span
                                                            className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs border border-white"
                                                            style={{ backgroundColor: prov.color || "#6366f1" }}
                                                            title={`Color: ${prov.color || "#6366f1"}`}
                                                        />
                                                        <div>
                                                            <span className="font-bold text-slate-900 text-sm">
                                                                {prov.name}
                                                            </span>
                                                            <p className="text-[11px] font-mono text-slate-400">
                                                                /{prov.slug}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[11px] bg-slate-50 font-medium text-slate-700 border-slate-200"
                                                    >
                                                        {prov.accountType || "Personal"}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 font-mono font-bold text-slate-800 text-xs">
                                                    {prov.accountNumber}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-[11px] text-slate-500 max-w-xs line-clamp-1">
                                                        {prov.instructions || "Standard Send Money instructions."}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <Badge
                                                        className={`text-[10px] font-semibold border ${prov.isActive
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                                            }`}
                                                    >
                                                        {prov.isActive ? "Active" : "Deactivated"}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => openEditProviderModal(prov)}
                                                            className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            disabled={isTogglingMfsProvider}
                                                            onClick={() => handleToggleProviderStatus(prov._id)}
                                                            className={`h-7 px-2 text-xs font-medium ${prov.isActive
                                                                    ? "text-rose-600 hover:bg-rose-50"
                                                                    : "text-emerald-600 hover:bg-emerald-50"
                                                                }`}
                                                        >
                                                            <Power className="h-3.5 w-3.5 mr-1" />
                                                            {prov.isActive ? "Disable" : "Enable"}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            disabled={isDeletingMfsProvider}
                                                            onClick={() => handleDeleteProvider(prov._id)}
                                                            className="h-7 px-2 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                            title="Delete Provider"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>


                    <Card className="border-slate-200 bg-white shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Save className="h-4 w-4 text-primary" />
                                Global Candidate Instructions & Fallback Settings
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Overarching payment guidance shown on the top-up checkout modal alongside the providers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitMfs(onSubmitMfs)} className="space-y-4 max-w-2xl">
                                <div className="space-y-1.5">
                                    <Label htmlFor="instructions" className="text-xs font-semibold">
                                        Payment Instructions Displayed to Candidates *
                                    </Label>
                                    <Textarea
                                        id="instructions"
                                        rows={3}
                                        className="text-xs"
                                        {...registerMfs("instructions")}
                                    />
                                    {mfsErrors.instructions && (
                                        <p className="text-[11px] text-destructive">
                                            {mfsErrors.instructions.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="bkashNumber" className="text-xs font-medium text-slate-600">
                                            Legacy bKash Fallback
                                        </Label>
                                        <Input
                                            id="bkashNumber"
                                            placeholder="017XXXXXXXX"
                                            className="text-xs"
                                            {...registerMfs("bkashNumber")}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="nagadNumber" className="text-xs font-medium text-slate-600">
                                            Legacy Nagad Fallback
                                        </Label>
                                        <Input
                                            id="nagadNumber"
                                            placeholder="018XXXXXXXX"
                                            className="text-xs"
                                            {...registerMfs("nagadNumber")}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="rocketNumber" className="text-xs font-medium text-slate-600">
                                            Legacy Rocket Fallback
                                        </Label>
                                        <Input
                                            id="rocketNumber"
                                            placeholder="019XXXXXXXX"
                                            className="text-xs"
                                            {...registerMfs("rocketNumber")}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSavingMfs}
                                    className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold h-9 gap-1.5"
                                >
                                    <Save className="h-3.5 w-3.5" />
                                    {isSavingMfs ? "Saving Settings..." : "Save Global Instructions"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}


            <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            {editingPackage ? "Edit Top-Up Pack" : "Create New Top-Up Pack"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Define pack hierarchy order, pricing in BDT, and AI credit increments.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitPkg(onSubmitPackage)} className="space-y-4 py-2 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="pkg-name" className="text-xs">
                                    Package Name *
                                </Label>
                                <Input
                                    id="pkg-name"
                                    placeholder="e.g. Level 1 - Starter"
                                    className="text-xs"
                                    {...registerPkg("name")}
                                />
                                {pkgErrors.name && (
                                    <p className="text-[11px] text-destructive">{pkgErrors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="pkg-tierKey" className="text-xs">
                                    Tier Key *
                                </Label>
                                <Input
                                    id="pkg-tierKey"
                                    placeholder="e.g. level1, pro"
                                    className="text-xs font-mono"
                                    {...registerPkg("tierKey")}
                                />
                                {pkgErrors.tierKey && (
                                    <p className="text-[11px] text-destructive">{pkgErrors.tierKey.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="pkg-order" className="text-xs">
                                    Hierarchy Order *
                                </Label>
                                <Input
                                    id="pkg-order"
                                    type="number"
                                    placeholder="1"
                                    className="text-xs font-mono"
                                    {...registerPkg("order")}
                                />
                                {pkgErrors.order && (
                                    <p className="text-[11px] text-destructive">{pkgErrors.order.message}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="pkg-price" className="text-xs">
                                    Price (BDT) *
                                </Label>
                                <Input
                                    id="pkg-price"
                                    type="number"
                                    placeholder="150"
                                    className="text-xs font-mono"
                                    {...registerPkg("price")}
                                />
                                {pkgErrors.price && (
                                    <p className="text-[11px] text-destructive">{pkgErrors.price.message}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="pkg-badge" className="text-xs">
                                    Badge Text
                                </Label>
                                <Input
                                    id="pkg-badge"
                                    placeholder="Most Popular"
                                    className="text-xs"
                                    {...registerPkg("badgeText")}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="pkg-desc" className="text-xs">
                                Description
                            </Label>
                            <Textarea
                                id="pkg-desc"
                                rows={2}
                                placeholder="Summary for candidate users..."
                                className="text-xs"
                                {...registerPkg("description")}
                            />
                        </div>


                        <div className="space-y-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                                Credit Boost Allocations
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-medium text-slate-600">ATS Scans</span>
                                    <Input
                                        type="number"
                                        className="text-xs font-mono"
                                        {...registerPkg("credits.atsScan")}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[11px] font-medium text-slate-600">Cover Letters</span>
                                    <Input
                                        type="number"
                                        className="text-xs font-mono"
                                        {...registerPkg("credits.coverLetter")}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[11px] font-medium text-slate-600">Cold Outreach</span>
                                    <Input
                                        type="number"
                                        className="text-xs font-mono"
                                        {...registerPkg("credits.outreach")}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[11px] font-medium text-slate-600">Job Emails</span>
                                    <Input
                                        type="number"
                                        className="text-xs font-mono"
                                        {...registerPkg("credits.applicationEmail")}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPackageModalOpen(false)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSavingPackage}
                                className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
                            >
                                {isSavingPackage ? "Saving..." : editingPackage ? "Update Pack" : "Create Pack"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


            <Dialog open={providerModalOpen} onOpenChange={setProviderModalOpen}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-primary" />
                            {editingProvider ? "Edit MFS Provider" : "Add New MFS Provider"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Define provider name, slug identifier, account type, recipient number, and custom accent color.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitProv(onSubmitProvider)} className="space-y-4 py-2 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="prov-name" className="text-xs">
                                    Provider Name *
                                </Label>
                                <Input
                                    id="prov-name"
                                    placeholder="e.g. Cellfin, Upay, bKash"
                                    className="text-xs"
                                    {...registerProv("name", {
                                        onChange: (e) => {
                                            if (!editingProvider) {
                                                const autoSlug = e.target.value
                                                    .toLowerCase()
                                                    .trim()
                                                    .replace(/[^a-z0-9]/g, "");
                                                setProvValue("slug", autoSlug);
                                            }
                                        },
                                    })}
                                />
                                {provErrors.name && (
                                    <p className="text-[11px] text-destructive">{provErrors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="prov-slug" className="text-xs">
                                    Identifier Slug *
                                </Label>
                                <Input
                                    id="prov-slug"
                                    placeholder="e.g. cellfin, upay"
                                    className="text-xs font-mono"
                                    {...registerProv("slug")}
                                />
                                {provErrors.slug && (
                                    <p className="text-[11px] text-destructive">{provErrors.slug.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="prov-accountType" className="text-xs">
                                    Account Type *
                                </Label>
                                <Input
                                    id="prov-accountType"
                                    placeholder="e.g. Personal, Agent, Merchant"
                                    className="text-xs"
                                    {...registerProv("accountType")}
                                />
                                {provErrors.accountType && (
                                    <p className="text-[11px] text-destructive">{provErrors.accountType.message}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="prov-order" className="text-xs">
                                    Display Hierarchy Order *
                                </Label>
                                <Input
                                    id="prov-order"
                                    type="number"
                                    placeholder="1"
                                    className="text-xs font-mono"
                                    {...registerProv("order")}
                                />
                                {provErrors.order && (
                                    <p className="text-[11px] text-destructive">{provErrors.order.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="prov-accountNumber" className="text-xs">
                                Recipient Account / Mobile Number *
                            </Label>
                            <Input
                                id="prov-accountNumber"
                                placeholder="e.g. 01700000000 (Personal - Send Money)"
                                className="text-xs font-mono font-semibold"
                                {...registerProv("accountNumber")}
                            />
                            {provErrors.accountNumber && (
                                <p className="text-[11px] text-destructive">{provErrors.accountNumber.message}</p>
                            )}
                        </div>


                        <div className="space-y-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <Palette className="h-3.5 w-3.5 text-primary" />
                                    Brand Accent Color
                                </Label>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-4 w-4 rounded-full border border-slate-300 shadow-2xs"
                                        style={{ backgroundColor: activeProvColor }}
                                    />
                                    <span className="font-mono text-[11px] text-slate-600 uppercase">
                                        {activeProvColor}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {[
                                    { name: "bKash", color: "#E2136E" },
                                    { name: "Nagad", color: "#F7941D" },
                                    { name: "Rocket", color: "#8C3494" },
                                    { name: "Cellfin", color: "#00A651" },
                                    { name: "Upay", color: "#005696" },
                                    { name: "Indigo", color: "#4F46E5" },
                                    { name: "Slate", color: "#0F172A" },
                                ].map((preset) => (
                                    <button
                                        key={preset.color}
                                        type="button"
                                        onClick={() => setProvValue("color", preset.color)}
                                        className={`px-2 py-1 rounded-md text-[10px] font-medium border flex items-center gap-1.5 transition-all ${activeProvColor.toLowerCase() === preset.color.toLowerCase()
                                                ? "border-slate-900 bg-white shadow-xs text-slate-900 ring-1 ring-slate-900"
                                                : "border-slate-200 bg-white/80 text-slate-600 hover:bg-white"
                                            }`}
                                    >
                                        <span
                                            className="h-2 w-2 rounded-full shrink-0"
                                            style={{ backgroundColor: preset.color }}
                                        />
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                            <Input
                                type="text"
                                placeholder="#E2136E"
                                className="text-xs font-mono h-8 mt-1"
                                {...registerProv("color")}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="prov-instructions" className="text-xs">
                                Provider Specific Instructions (Optional)
                            </Label>
                            <Textarea
                                id="prov-instructions"
                                rows={2}
                                placeholder="Send money using Personal Send Money. Keep TrxID handy."
                                className="text-xs"
                                {...registerProv("instructions")}
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="prov-isActive"
                                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                {...registerProv("isActive")}
                            />
                            <Label htmlFor="prov-isActive" className="text-xs font-medium cursor-pointer">
                                Active (Candidates can select and view this provider)
                            </Label>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setProviderModalOpen(false)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSavingMfsProvider}
                                className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
                            >
                                {isSavingMfsProvider
                                    ? "Saving Provider..."
                                    : editingProvider
                                        ? "Update Provider"
                                        : "Create Provider"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
