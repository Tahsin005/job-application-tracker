"use client";

import { useState, useMemo } from "react";
import { PieChart as PieIcon, CheckCircle2 } from "lucide-react";
import { FunnelStage } from "@/lib/utils/analytics";

interface FunnelPieChartProps {
    stages: FunnelStage[];
    overallWinRate: number;
}

const STAGE_COLORS: Record<string, { fill: string; stroke: string; bg: string; text: string }> = {
    applied: { fill: "#6366f1", stroke: "#4f46e5", bg: "bg-indigo-500", text: "text-indigo-600" },
    interview: { fill: "#10b981", stroke: "#059669", bg: "bg-emerald-500", text: "text-emerald-600" },
    offer: { fill: "#f59e0b", stroke: "#d97706", bg: "bg-amber-500", text: "text-amber-600" },
    wishlist: { fill: "#06b6d4", stroke: "#0891b2", bg: "bg-cyan-500", text: "text-cyan-600" },
    "applied-snapshot": { fill: "#8b5cf6", stroke: "#7c3aed", bg: "bg-purple-500", text: "text-purple-600" },
    "interview-snapshot": { fill: "#10b981", stroke: "#059669", bg: "bg-emerald-500", text: "text-emerald-600" },
    "offer-snapshot": { fill: "#f59e0b", stroke: "#d97706", bg: "bg-amber-500", text: "text-amber-600" },
    "rejected-snapshot": { fill: "#f43f5e", stroke: "#e11d48", bg: "bg-rose-500", text: "text-rose-600" },
};

export default function FunnelPieChart({ stages, overallWinRate }: FunnelPieChartProps) {
    const [chartStyle, setChartStyle] = useState<"pie" | "donut">("pie");
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const totalCount = stages.reduce((acc, s) => acc + s.count, 0);

    // SVG geometry
    const size = 240;
    const center = size / 2;
    const outerRadius = 96;
    const innerRadius = chartStyle === "donut" ? 56 : 0;

    // Filter non-zero stages for pie calculation
    const nonZeroStages = stages.filter((s) => s.count > 0);

    // Calculate slice angles in memoized function
    const slices = useMemo(() => {
        let currentAngle = -Math.PI / 2; // Start from 12 o'clock
        const result = [];

        for (let index = 0; index < stages.length; index++) {
            const stage = stages[index];
            const value = stage.count;
            const fraction = totalCount > 0 ? value / totalCount : 0;
            const angle = fraction * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            if (value > 0) {
                currentAngle = endAngle;
            }

            const colors = STAGE_COLORS[stage.id] || {
                fill: "#64748b",
                stroke: "#475569",
                bg: "bg-slate-500",
                text: "text-slate-600",
            };

            result.push({
                stage,
                index,
                value,
                fraction,
                startAngle,
                endAngle,
                angle,
                colors,
            });
        }

        return result;
    }, [stages, totalCount]);

    const activeStage = hoveredIndex !== null ? stages[hoveredIndex] : null;

    return (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
                        <PieIcon className="size-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">
                            Funnel Distribution {chartStyle === "pie" ? "Pie" : "Donut"} Chart
                        </h4>
                        <p className="text-[11px] text-slate-500">
                            Breakdown of application share across pipeline stages.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">

                    <div className="flex items-center p-0.5 bg-slate-200/70 rounded-lg border border-slate-200 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setChartStyle("pie")}
                            className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${chartStyle === "pie"
                                    ? "bg-white text-indigo-700 shadow-2xs font-bold"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            Pie Chart
                        </button>
                        <button
                            type="button"
                            onClick={() => setChartStyle("donut")}
                            className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${chartStyle === "donut"
                                    ? "bg-white text-indigo-700 shadow-2xs font-bold"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            Donut
                        </button>
                    </div>

                    <div className="text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs w-fit">
                        Overall Win Rate:{" "}
                        <strong className="text-emerald-600 font-bold">
                            {overallWinRate}%
                        </strong>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">

                <div className="md:col-span-5 flex flex-col items-center justify-center">
                    <div className="relative size-[240px]">
                        <svg
                            viewBox={`0 0 ${size} ${size}`}
                            className="size-full select-none overflow-visible"
                        >
                            {totalCount === 0 ? (
                                /* Empty / 0 Jobs State */
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={outerRadius}
                                    fill="#f8fafc"
                                    stroke="#e2e8f0"
                                    strokeWidth="2"
                                    strokeDasharray="4 4"
                                />
                            ) : nonZeroStages.length === 1 ? (
                                /* Single Stage 100% Circle */
                                (() => {
                                    const single = slices.find((s) => s.value > 0);
                                    if (!single) return null;
                                    const isHovered = hoveredIndex === single.index;

                                    if (chartStyle === "donut") {
                                        return (
                                            <circle
                                                cx={center}
                                                cy={center}
                                                r={(outerRadius + innerRadius) / 2}
                                                stroke={single.colors.fill}
                                                strokeWidth={outerRadius - innerRadius}
                                                fill="none"
                                                className={`cursor-pointer transition-all duration-300 ${isHovered ? "filter drop-shadow-md brightness-110" : ""
                                                    }`}
                                                onMouseEnter={() => setHoveredIndex(single.index)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                            />
                                        );
                                    }

                                    return (
                                        <circle
                                            cx={center}
                                            cy={center}
                                            r={isHovered ? outerRadius + 3 : outerRadius}
                                            fill={single.colors.fill}
                                            stroke="#ffffff"
                                            strokeWidth="2"
                                            className={`cursor-pointer transition-all duration-300 ${isHovered ? "filter drop-shadow-md brightness-105" : ""
                                                }`}
                                            onMouseEnter={() => setHoveredIndex(single.index)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        />
                                    );
                                })()
                            ) : (
                                /* Multi-Slice Pie or Donut Arcs */
                                slices.map((slice) => {
                                    if (slice.value === 0) return null;

                                    const isHovered = hoveredIndex === slice.index;
                                    const midAngle = (slice.startAngle + slice.endAngle) / 2;

                                    // Offset translation for exploding slice on hover
                                    const explodeOffset = isHovered ? 5 : 0;
                                    const shiftX = Math.cos(midAngle) * explodeOffset;
                                    const shiftY = Math.sin(midAngle) * explodeOffset;

                                    const rOut = outerRadius;
                                    const x1 = center + shiftX + rOut * Math.cos(slice.startAngle);
                                    const y1 = center + shiftY + rOut * Math.sin(slice.startAngle);
                                    const x2 = center + shiftX + rOut * Math.cos(slice.endAngle);
                                    const y2 = center + shiftY + rOut * Math.sin(slice.endAngle);

                                    const largeArc = slice.angle > Math.PI ? 1 : 0;

                                    let d = "";
                                    if (chartStyle === "pie") {
                                        // Solid Pie Slice meeting at shifted origin
                                        const originX = center + shiftX;
                                        const originY = center + shiftY;
                                        d = `
                                            M ${originX} ${originY}
                                            L ${x1} ${y1}
                                            A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2}
                                            Z
                                        `;
                                    } else {
                                        // Donut Ring Arc
                                        const rIn = innerRadius;
                                        const x3 = center + shiftX + rIn * Math.cos(slice.endAngle);
                                        const y3 = center + shiftY + rIn * Math.sin(slice.endAngle);
                                        const x4 = center + shiftX + rIn * Math.cos(slice.startAngle);
                                        const y4 = center + shiftY + rIn * Math.sin(slice.startAngle);
                                        d = `
                                            M ${x1} ${y1}
                                            A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2}
                                            L ${x3} ${y3}
                                            A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4}
                                            Z
                                        `;
                                    }

                                    return (
                                        <path
                                            key={slice.stage.id}
                                            d={d}
                                            fill={slice.colors.fill}
                                            stroke="#ffffff"
                                            strokeWidth="2"
                                            className={`cursor-pointer transition-all duration-200 ${isHovered
                                                    ? "filter drop-shadow-md brightness-110"
                                                    : "opacity-95 hover:opacity-100"
                                                }`}
                                            onMouseEnter={() => setHoveredIndex(slice.index)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        />
                                    );
                                })
                            )}
                        </svg>


                        {chartStyle === "donut" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {activeStage ? activeStage.count : totalCount}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                                    {activeStage ? activeStage.name : "Total Roles"}
                                </span>
                                {activeStage && (
                                    <span className="text-[10px] font-bold text-indigo-600">
                                        {activeStage.percentageOfTop}% of funnel
                                    </span>
                                )}
                            </div>
                        )}
                    </div>


                    {chartStyle === "pie" && (
                        <div className="mt-3 text-center min-h-[22px]">
                            {activeStage ? (
                                <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs inline-flex items-center gap-1.5">
                                    <span
                                        className="size-2 rounded-full"
                                        style={{ backgroundColor: STAGE_COLORS[activeStage.id]?.fill || "#6366f1" }}
                                    />
                                    <strong>{activeStage.name}:</strong> {activeStage.count} applications ({activeStage.percentageOfTop}%)
                                </span>
                            ) : (
                                <span className="text-[11px] text-slate-400">
                                    Total: {totalCount} applications tracked
                                </span>
                            )}
                        </div>
                    )}
                </div>


                <div className="md:col-span-7 space-y-2.5">
                    {slices.map((slice) => {
                        const isHovered = hoveredIndex === slice.index;
                        const pct = Math.round(slice.fraction * 1000) / 10;

                        return (
                            <div
                                key={slice.stage.id}
                                onMouseEnter={() => setHoveredIndex(slice.index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className={`cursor-pointer rounded-lg p-3 border transition-all duration-200 flex items-center justify-between ${isHovered
                                        ? "bg-white border-indigo-300 shadow-xs ring-1 ring-indigo-200"
                                        : "bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300"
                                    }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span
                                        className="size-3.5 rounded-full flex-shrink-0 shadow-2xs"
                                        style={{ backgroundColor: slice.colors.fill }}
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                            {slice.stage.name}
                                            {slice.stage.conversionFromPrevious !== null && (
                                                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full font-semibold">
                                                    {slice.stage.conversionFromPrevious}% conv.
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-slate-500">
                                            {slice.value} application{slice.value === 1 ? "" : "s"}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-sm font-extrabold text-slate-900">
                                        {pct}%
                                    </span>
                                    <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{
                                                width: `${pct}%`,
                                                backgroundColor: slice.colors.fill,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        Hover over slices or legend cards to inspect stage proportion.
                    </div>
                </div>
            </div>
        </div>
    );
}
