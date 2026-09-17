"use client";

import { Tag, Lightbulb, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FunnelAnalytics } from "@/lib/utils/analytics";

interface PipelineDistributionProps {
    analytics: FunnelAnalytics;
}

export default function PipelineDistribution({ analytics }: PipelineDistributionProps) {
    const { topTags, insights } = analytics;

    return (
        <div className="space-y-6">


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Card className="border-slate-200 bg-white shadow-xs">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                                <Tag className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900">
                                    Frequent Skills & Tags
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500 mt-0.5">
                                    Most tracked technical competencies and job tags.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {topTags.length === 0 ? (
                            <p className="text-xs text-slate-500 py-6 text-center">
                                No tags added to applications yet. Add tags like &ldquo;React&rdquo; or &ldquo;Remote&rdquo; on job cards to track trends.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {topTags.map((item) => (
                                    <Badge
                                        key={item.tag}
                                        variant="secondary"
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 gap-1.5 border border-slate-200"
                                    >
                                        <span>{item.tag}</span>
                                        <span className="text-[10px] bg-white text-slate-600 px-1.5 py-0.2 rounded-full font-bold shadow-2xs">
                                            {item.count}
                                        </span>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>


                <Card className="border-indigo-100 bg-indigo-50/20 shadow-xs">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
                                <Lightbulb className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900">
                                    Funnel Insights & Tips
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500 mt-0.5">
                                    Automated advice tailored to your current pipeline velocity.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                        {insights.length === 0 ? (
                            <p className="text-xs text-slate-500 py-6 text-center">
                                Add applications and move them through columns to generate personalized funnel advice.
                            </p>
                        ) : (
                            insights.map((insight) => {
                                const icon =
                                    insight.type === "success" ? (
                                        <CheckCircle2 className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    ) : insight.type === "warning" ? (
                                        <AlertCircle className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <Info className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    );

                                return (
                                    <div
                                        key={insight.id}
                                        className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-indigo-100/80 shadow-2xs"
                                    >
                                        {icon}
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900">
                                                {insight.title}
                                            </h4>
                                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                                {insight.description}
                                            </p>
                                        </div>
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
