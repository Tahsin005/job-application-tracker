export interface AtsAnalysis {
    score: number;
    missingKeywords: string[];
    matchedKeywords: string[];
    actionVerbRecommendations: string[];
    summary: string;
    analyzedAt: string | Date;
    resumeName?: string;
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
