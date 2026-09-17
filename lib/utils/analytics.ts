import { Column, JobApplication } from "@/lib/models/models.types";

export interface FunnelStage {
    id: string;
    name: string;
    count: number;
    percentageOfTop: number;
    conversionFromPrevious: number | null;
    dropOffRate: number | null;
    jobs: JobApplication[];
    color: string;
    accentColor: string;
    badgeColor: string;
}

export interface PipelineColumnStat {
    id: string;
    name: string;
    order: number;
    count: number;
    percentage: number;
    color: string;
    jobs: JobApplication[];
}

export interface KPIStats {
    totalTracked: number;
    appliedCount: number;
    interviewCount: number;
    offerCount: number;
    rejectedCount: number;
    wishlistCount: number;
    interviewConversionRate: number;
    offerConversionRate: number;
    overallConversionRate: number;
    rejectionRate: number;
    averageAtsScore: number | null;
    analyzedJobsCount: number;
}

export interface TagStat {
    tag: string;
    count: number;
    percentage: number;
}

export interface ActionableInsight {
    id: string;
    type: "success" | "info" | "warning" | "tip";
    title: string;
    description: string;
}

export interface FunnelAnalytics {
    funnelStages: FunnelStage[];
    fullLifecycleStages: FunnelStage[];
    pipelineColumns: PipelineColumnStat[];
    kpi: KPIStats;
    topTags: TagStat[];
    insights: ActionableInsight[];
}

const COLUMN_PALETTE: Record<string, { bg: string; text: string; badge: string }> = {
    wishlist: { bg: "bg-cyan-500", text: "text-cyan-700", badge: "bg-cyan-100 text-cyan-800" },
    applied: { bg: "bg-purple-500", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" },
    interviewing: { bg: "bg-green-500", text: "text-green-700", badge: "bg-green-100 text-green-800" },
    offer: { bg: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-100 text-amber-800" },
    rejected: { bg: "bg-red-500", text: "text-red-700", badge: "bg-red-100 text-red-800" },
};

/**
 * Calculates comprehensive conversion funnel and pipeline analytics.
 */
export function computeBoardAnalytics(columns: Column[] | undefined | null): FunnelAnalytics {
    if (!columns || columns.length === 0) {
        return createEmptyAnalytics();
    }

    const sortedCols = [...columns].sort((a, b) => a.order - b.order);

    // Group jobs by recognized lifecycle stages
    let wishlistJobs: JobApplication[] = [];
    let appliedJobs: JobApplication[] = [];
    let interviewJobs: JobApplication[] = [];
    let offerJobs: JobApplication[] = [];
    let rejectedJobs: JobApplication[] = [];

    const columnStats: PipelineColumnStat[] = [];
    const allJobs: JobApplication[] = [];

    for (const col of sortedCols) {
        const jobs = col.jobApplications || [];
        allJobs.push(...jobs);

        const lowerName = col.name.trim().toLowerCase();
        let stageType = "other";

        if (lowerName.includes("reject") || lowerName.includes("declined") || lowerName.includes("archive")) {
            rejectedJobs = [...rejectedJobs, ...jobs];
            stageType = "rejected";
        } else if (lowerName.includes("wish") || lowerName.includes("saved") || lowerName.includes("plan")) {
            wishlistJobs = [...wishlistJobs, ...jobs];
            stageType = "wishlist";
        } else if (lowerName.includes("interview") || lowerName.includes("screen") || lowerName.includes("round")) {
            interviewJobs = [...interviewJobs, ...jobs];
            stageType = "interviewing";
        } else if (lowerName.includes("offer") || lowerName.includes("accepted")) {
            offerJobs = [...offerJobs, ...jobs];
            stageType = "offer";
        } else if (lowerName.includes("applied") || lowerName.includes("submitted") || lowerName.includes("send")) {
            appliedJobs = [...appliedJobs, ...jobs];
            stageType = "applied";
        } else {
            // Fallback by order if default 5 columns
            if (col.order === 0) wishlistJobs = [...wishlistJobs, ...jobs];
            else if (col.order === 1) appliedJobs = [...appliedJobs, ...jobs];
            else if (col.order === 2) interviewJobs = [...interviewJobs, ...jobs];
            else if (col.order === 3) offerJobs = [...offerJobs, ...jobs];
            else if (col.order === 4) rejectedJobs = [...rejectedJobs, ...jobs];
            else appliedJobs = [...appliedJobs, ...jobs];
        }

        const palette = COLUMN_PALETTE[stageType] || {
            bg: "bg-slate-500",
            text: "text-slate-700",
            badge: "bg-slate-100 text-slate-800",
        };

        columnStats.push({
            id: col._id,
            name: col.name,
            order: col.order,
            count: jobs.length,
            percentage: 0, // will compute after total count
            color: palette.bg,
            jobs,
        });
    }

    const totalTracked = allJobs.length;

    // Compute column percentages
    for (const stat of columnStats) {
        stat.percentage = totalTracked > 0 ? Math.round((stat.count / totalTracked) * 1000) / 10 : 0;
    }

    // Pipeline funnel calculation
    // Cumulative logic:
    // Applied = applications that reached Applied or later stages (Applied + Interviewing + Offer + Rejected)
    // Interviews = applications that reached Interview stage (Interviewing + Offer)
    // Offers = applications that reached Offer
    const cumulativeAppliedJobs = [...appliedJobs, ...interviewJobs, ...offerJobs, ...rejectedJobs];
    const cumulativeInterviewJobs = [...interviewJobs, ...offerJobs];
    const cumulativeOfferJobs = [...offerJobs];

    const appliedCount = cumulativeAppliedJobs.length;
    const interviewCount = cumulativeInterviewJobs.length;
    const offerCount = cumulativeOfferJobs.length;
    const rejectedCount = rejectedJobs.length;
    const wishlistCount = wishlistJobs.length;

    // Conversion rates
    const interviewConversionRate =
        appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 1000) / 10 : 0;

    const offerConversionRate =
        interviewCount > 0 ? Math.round((offerCount / interviewCount) * 1000) / 10 : 0;

    const overallConversionRate =
        appliedCount > 0 ? Math.round((offerCount / appliedCount) * 1000) / 10 : 0;

    const rejectionRate =
        appliedCount > 0 ? Math.round((rejectedCount / appliedCount) * 1000) / 10 : 0;

    // 1. Conversion Funnel: Applied ➔ Interviews ➔ Offers
    const funnelStages: FunnelStage[] = [
        {
            id: "applied",
            name: "Applied",
            count: appliedCount,
            percentageOfTop: 100,
            conversionFromPrevious: null,
            dropOffRate: null,
            jobs: cumulativeAppliedJobs,
            color: "from-blue-600 to-indigo-600",
            accentColor: "text-indigo-600",
            badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        },
        {
            id: "interview",
            name: "Interviews",
            count: interviewCount,
            percentageOfTop: appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 1000) / 10 : 0,
            conversionFromPrevious: interviewConversionRate,
            dropOffRate: appliedCount > 0 ? Math.round((100 - interviewConversionRate) * 10) / 10 : null,
            jobs: cumulativeInterviewJobs,
            color: "from-emerald-500 to-teal-600",
            accentColor: "text-emerald-600",
            badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
        {
            id: "offer",
            name: "Offers",
            count: offerCount,
            percentageOfTop: appliedCount > 0 ? Math.round((offerCount / appliedCount) * 1000) / 10 : 0,
            conversionFromPrevious: offerConversionRate,
            dropOffRate: interviewCount > 0 ? Math.round((100 - offerConversionRate) * 10) / 10 : null,
            jobs: cumulativeOfferJobs,
            color: "from-amber-500 to-yellow-600",
            accentColor: "text-amber-600",
            badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        },
    ];

    // 2. Full 5-stage lifecycle
    const fullLifecycleStages: FunnelStage[] = [
        {
            id: "wishlist",
            name: "Wish List",
            count: wishlistCount,
            percentageOfTop: totalTracked > 0 ? Math.round((wishlistCount / totalTracked) * 1000) / 10 : 0,
            conversionFromPrevious: null,
            dropOffRate: null,
            jobs: wishlistJobs,
            color: "from-cyan-500 to-blue-500",
            accentColor: "text-cyan-600",
            badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
        },
        {
            id: "applied-snapshot",
            name: "Applied",
            count: appliedJobs.length,
            percentageOfTop: totalTracked > 0 ? Math.round((appliedJobs.length / totalTracked) * 1000) / 10 : 0,
            conversionFromPrevious: null,
            dropOffRate: null,
            jobs: appliedJobs,
            color: "from-purple-500 to-indigo-600",
            accentColor: "text-purple-600",
            badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        },
        {
            id: "interview-snapshot",
            name: "Interviewing",
            count: interviewJobs.length,
            percentageOfTop: totalTracked > 0 ? Math.round((interviewJobs.length / totalTracked) * 1000) / 10 : 0,
            conversionFromPrevious: null,
            dropOffRate: null,
            jobs: interviewJobs,
            color: "from-green-500 to-emerald-600",
            accentColor: "text-green-600",
            badgeColor: "bg-green-50 text-green-700 border-green-200",
        },
        {
            id: "offer-snapshot",
            name: "Offer",
            count: offerJobs.length,
            percentageOfTop: totalTracked > 0 ? Math.round((offerJobs.length / totalTracked) * 1000) / 10 : 0,
            conversionFromPrevious: null,
            dropOffRate: null,
            jobs: offerJobs,
            color: "from-yellow-500 to-amber-600",
            accentColor: "text-yellow-600",
            badgeColor: "bg-yellow-50 text-yellow-700 border-yellow-200",
        },
        {
            id: "rejected-snapshot",
            name: "Rejected",
            count: rejectedJobs.length,
            percentageOfTop: totalTracked > 0 ? Math.round((rejectedJobs.length / totalTracked) * 1000) / 10 : 0,
            conversionFromPrevious: null,
            dropOffRate: null,
            jobs: rejectedJobs,
            color: "from-red-500 to-rose-600",
            accentColor: "text-red-600",
            badgeColor: "bg-red-50 text-red-700 border-red-200",
        },
    ];

    // ATS score stats
    const analyzedJobs = allJobs.filter(
        (j) => j.atsAnalysis && typeof j.atsAnalysis.score === "number" && !isNaN(j.atsAnalysis.score)
    );
    const averageAtsScore =
        analyzedJobs.length > 0
            ? Math.round(
                  analyzedJobs.reduce((acc, j) => acc + (j.atsAnalysis?.score || 0), 0) / analyzedJobs.length
              )
            : null;

    // Top tags
    const tagCountMap = new Map<string, number>();
    for (const job of allJobs) {
        if (job.tags && Array.isArray(job.tags)) {
            for (const tag of job.tags) {
                const cleanTag = tag.trim();
                if (cleanTag) {
                    tagCountMap.set(cleanTag, (tagCountMap.get(cleanTag) || 0) + 1);
                }
            }
        }
    }
    const topTags: TagStat[] = Array.from(tagCountMap.entries())
        .map(([tag, count]) => ({
            tag,
            count,
            percentage: totalTracked > 0 ? Math.round((count / totalTracked) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    // Generate actionable insights
    const insights = generateInsights({
        appliedCount,
        interviewCount,
        activeInterviewCount: interviewJobs.length,
        offerCount,
        rejectedCount,
        interviewConversionRate,
        offerConversionRate,
        overallConversionRate,
        averageAtsScore,
        analyzedJobsCount: analyzedJobs.length,
        totalTracked,
        wishlistCount,
    });

    return {
        funnelStages,
        fullLifecycleStages,
        pipelineColumns: columnStats,
        kpi: {
            totalTracked,
            appliedCount,
            interviewCount,
            offerCount,
            rejectedCount,
            wishlistCount,
            interviewConversionRate,
            offerConversionRate,
            overallConversionRate,
            rejectionRate,
            averageAtsScore,
            analyzedJobsCount: analyzedJobs.length,
        },
        topTags,
        insights,
    };
}

function generateInsights(params: {
    appliedCount: number;
    interviewCount: number;
    activeInterviewCount: number;
    offerCount: number;
    rejectedCount: number;
    interviewConversionRate: number;
    offerConversionRate: number;
    overallConversionRate: number;
    averageAtsScore: number | null;
    analyzedJobsCount: number;
    totalTracked: number;
    wishlistCount: number;
}): ActionableInsight[] {
    const list: ActionableInsight[] = [];

    if (params.totalTracked === 0) {
        list.push({
            id: "empty-board",
            type: "info",
            title: "Start Building Your Funnel",
            description:
                "Add your first job applications to track application velocity, conversion rates, and ATS compatibility.",
        });
        return list;
    }

    if (params.offerCount > 0) {
        list.push({
            id: "offers-secured",
            type: "success",
            title: "Offer Stage Activated",
            description: `You have ${params.offerCount} job offer${params.offerCount > 1 ? "s" : ""}! Review total compensation, equity, benefits, and start dates, and use your momentum to negotiate favorably.`,
        });
    }

    if (params.activeInterviewCount > 0) {
        list.push({
            id: "active-interviews",
            type: "success",
            title: "Active Interview Pipeline",
            description: `You have ${params.activeInterviewCount} active role${params.activeInterviewCount > 1 ? "s" : ""} currently in the interview stage. Deep-dive into company technical stacks, prep STAR-method behavioral stories, and send thank-you notes within 24 hours.`,
        });
    } else if (params.interviewCount > 0 && params.offerCount > 0) {
        list.push({
            id: "interviews-converted",
            type: "success",
            title: "Interviews Converted to Offers",
            description: `All ${params.interviewCount} role${params.interviewCount > 1 ? "s" : ""} that entered your interview stage have successfully converted to offers. Outstanding interview performance!`,
        });
    }

    if (params.appliedCount > 0) {
        if (params.interviewConversionRate >= 15) {
            list.push({
                id: "high-interview-rate",
                type: "success",
                title: "Strong Application-to-Interview Conversion",
                description: `Your ${params.interviewConversionRate}% interview rate significantly surpasses the 10–12% tech industry baseline. Your resume and targeting strategy are resonating well with recruiters.`,
            });
        } else if (params.interviewConversionRate > 0) {
            list.push({
                id: "moderate-interview-rate",
                type: "info",
                title: "Interview Conversion Velocity",
                description: `Your interview rate is currently ${params.interviewConversionRate}%. Follow up with recruiters after 7–10 days on roles where you haven't received an initial screening update.`,
            });
        } else {
            list.push({
                id: "pending-interviews",
                type: "info",
                title: "Applications Under Initial Review",
                description: `You have ${params.appliedCount} application${params.appliedCount > 1 ? "s" : ""} submitted. Most hiring teams take 1–2 weeks to review incoming candidate pipelines before scheduling screen calls.`,
            });
        }
    }

    if (params.averageAtsScore !== null) {
        if (params.averageAtsScore >= 75) {
            list.push({
                id: "ats-score-high",
                type: "success",
                title: `Strong ATS Compatibility (${params.averageAtsScore}%)`,
                description: `Your scanned applications show strong keyword alignment with job postings, maximizing your chances of passing automated recruitment filters.`,
            });
        } else {
            list.push({
                id: "ats-score-tuning",
                type: "warning",
                title: `Optimize Resume Keywords (${params.averageAtsScore}%)`,
                description: `Your average ATS match is currently ${params.averageAtsScore}%. Try incorporating more action verbs and exact technical skills from job descriptions to push scores above 80%.`,
            });
        }
    } else {
        list.push({
            id: "run-ats-scan",
            type: "tip",
            title: "Unlock ATS Match Telemetry",
            description:
                "Scan your resume against tracked jobs from the card action menu to discover keyword gaps and compute your ATS compatibility score.",
        });
    }

    if (params.wishlistCount > 0) {
        list.push({
            id: "wishlist-pipeline",
            type: "tip",
            title: "Saved Wishlist Opportunities",
            description: `You have ${params.wishlistCount} role${params.wishlistCount > 1 ? "s" : ""} saved in your Wish List. Set aside time to customize your resume and submit applications to fuel your funnel.`,
        });
    }

    if (params.rejectedCount > 0) {
        list.push({
            id: "resilient-pipeline",
            type: "info",
            title: "Pipeline Persistence",
            description: `${params.rejectedCount} rejection${params.rejectedCount > 1 ? "s" : ""} recorded. Rejections are a natural part of competitive hiring; use each outcome to refine your pitch and target tighter fits.`,
        });
    }

    return list;
}

function createEmptyAnalytics(): FunnelAnalytics {
    return {
        funnelStages: [
            {
                id: "applied",
                name: "Applied",
                count: 0,
                percentageOfTop: 0,
                conversionFromPrevious: null,
                dropOffRate: null,
                jobs: [],
                color: "from-blue-600 to-indigo-600",
                accentColor: "text-indigo-600",
                badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
            },
            {
                id: "interview",
                name: "Interviews",
                count: 0,
                percentageOfTop: 0,
                conversionFromPrevious: 0,
                dropOffRate: null,
                jobs: [],
                color: "from-emerald-500 to-teal-600",
                accentColor: "text-emerald-600",
                badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
            },
            {
                id: "offer",
                name: "Offers",
                count: 0,
                percentageOfTop: 0,
                conversionFromPrevious: 0,
                dropOffRate: null,
                jobs: [],
                color: "from-amber-500 to-yellow-600",
                accentColor: "text-amber-600",
                badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
            },
        ],
        fullLifecycleStages: [],
        pipelineColumns: [],
        kpi: {
            totalTracked: 0,
            appliedCount: 0,
            interviewCount: 0,
            offerCount: 0,
            rejectedCount: 0,
            wishlistCount: 0,
            interviewConversionRate: 0,
            offerConversionRate: 0,
            overallConversionRate: 0,
            rejectionRate: 0,
            averageAtsScore: null,
            analyzedJobsCount: 0,
        },
        topTags: [],
        insights: [],
    };
}
