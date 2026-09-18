export interface AtsAnalysis {
    score: number;
    missingKeywords: string[];
    matchedKeywords: string[];
    actionVerbRecommendations: string[];
    summary: string;
    analyzedAt: string | Date;
    resumeName?: string;
}

export type InterviewRoundType =
    | "Screening"
    | "Technical"
    | "System Design"
    | "Behavioral"
    | "Final"
    | "Other";

export type InterviewStatus =
    | "scheduled"
    | "completed"
    | "passed"
    | "rejected"
    | "cancelled";

export interface InterviewRound {
    _id?: string;
    roundType: InterviewRoundType;
    customRoundName?: string;
    scheduledAt: string | Date;
    durationMinutes?: number;
    interviewerNames?: string;
    meetingUrl?: string;
    location?: string;
    notes?: string;
    status: InterviewStatus;
    feedback?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface JobApplication {
    _id: string;
    company: string;
    position: string;
    location?: string;
    status: string;
    notes?: string;
    salary?: string;
    jobUrl?: string;
    order: number;
    columnId?: string;
    tags?: string[];
    description?: string;
    resumeId?: string;
    attachedResumeName?: string;
    atsAnalysis?: AtsAnalysis;
    aiCoverLetter?: string;
    aiOutreachMessage?: string;
    aiApplicationEmail?: string;
    interviews?: InterviewRound[];
    appliedDate?: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface Column {
    _id: string;
    name: string;
    order: number;
    jobApplications: JobApplication[];
}

export interface Board {
    _id: string;
    name: string;
    columns: Column[];
}

export interface Resume {
    _id: string;
    userId: string;
    name: string;
    textContent: string;
    fileData?: string;
    fileSize?: number;
    isDefault: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface FeatureQuota {
    used: number;
    limit: number;
    remaining: number;
}

export interface UserUsageSummary {
    atsScan: FeatureQuota;
    coverLetter: FeatureQuota;
    outreach: FeatureQuota;
    applicationEmail: FeatureQuota;
}

export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
    image?: string;
    isAdmin?: boolean;
    role?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export type AiProviderType =
    | "agentrouter"
    | "openai"
    | "anthropic"
    | "groq"
    | "gemini"
    | "custom"
    | (string & {});

export interface AiConfig {
    _id: string;
    name: string;
    provider: AiProviderType;
    baseUrl?: string;
    apiKey?: string;
    model: string;
    isDefault: boolean;
    isActive: boolean;
    customHeaders?: Record<string, string>;
    description?: string;
    options?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    lastTestedAt?: string | Date;
    lastLatencyMs?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    [key: string]: unknown;
}

export interface AiTestResult {
    success: boolean;
    latencyMs: number;
    message: string;
    modelOutput?: string;
}

export interface AiPromptItem {
    action: string;
    name: string;
    description?: string;
    systemPrompt: string;
    userPromptTemplate: string;
    isCustomized: boolean;
    supportedVariables: { key: string; label: string }[];
    updatedAt?: string | Date;
    [key: string]: unknown;
}

export type MfsPaymentMethod = string;
export type TopUpStatus = "pending" | "approved" | "rejected";

export interface MfsProvider {
    _id: string;
    name: string;
    slug: string;
    accountType: string;
    accountNumber: string;
    instructions: string;
    order: number;
    color?: string;
    isActive: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface PackageCredits {
    atsScan: number;
    coverLetter: number;
    outreach: number;
    applicationEmail: number;
}

export interface TopUpPackage {
    _id: string;
    name: string;
    tierKey: string;
    order: number;
    price: number;
    currency: string;
    description: string;
    badgeText?: string;
    credits: PackageCredits;
    isActive: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface TopUpRequest {
    _id: string;
    userId: string;
    userName: string;
    userEmail: string;
    packageId: string;
    packageName: string;
    order: number;
    amount: number;
    currency: string;
    paymentMethod: MfsPaymentMethod;
    senderNumber: string;
    transactionId: string;
    status: TopUpStatus;
    rejectionReason?: string;
    creditsSnapshot: PackageCredits;
    userNote?: string;
    reviewedBy?: string;
    reviewedAt?: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface AdminMfsSettings {
    key: string;
    bkashNumber: string;
    nagadNumber: string;
    rocketNumber: string;
    upayNumber?: string;
    instructions: string;
    updatedAt?: string | Date;
}

export interface TopUpAnalyticsSummary {
    totalRevenue: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalRequests: number;
    packageDistribution: {
        packageName: string;
        count: number;
        revenue: number;
    }[];
    methodDistribution: {
        method: MfsPaymentMethod;
        count: number;
        revenue: number;
    }[];
}

