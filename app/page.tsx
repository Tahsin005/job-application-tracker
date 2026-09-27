import { HeroCta, BottomCta } from "@/components/hero-cta";
import { FaqSection } from "@/components/landing/faq-section";
import {
    TrendingUp,
    Sparkles,
    FileText,
    Send,
    CheckCircle2,
    XCircle,
    Layers,
    CalendarCheck,
    FileCheck2,
    Check,
} from "lucide-react";

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Job Application Tracker",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
        "An intelligent, full-stack career platform to organize your job search pipeline, parse resumes, and land offers faster with AI assistance.",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
    featureList: [
        "Visual Kanban Pipeline",
        "ATS Resume Keyword Matcher",
        "Tailored Cover Letter Generator",
        "Smart Multi-Resume Library",
        "Interview Journey Tracker",
        "Recruiter Outreach & Application Emails",
    ],
};

const MARQUEE_ITEMS = [
    "Visual Kanban Pipeline",
    "ATS Resume Keyword Matcher",
    "1-Click Cover Letters",
    "Multi-Resume Library",
    "Interview Journey Tracking",
    "Recruiter Outreach Drafts",
    "Salary Intelligence",
    "Real-Time Conversion Funnel",
];

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col text-foreground selection:bg-primary/20 selection:text-primary relative overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />


            <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
                <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-semibold text-foreground/80 mb-6 shadow-2xs glass-shimmer">
                        <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
                        <span className="tracking-[0.14em] text-[11px]">The AI Career Workspace for Ambitious Job Seekers</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                        Turn application chaos <br className="hidden sm:inline" />
                        into{" "}
                        <span className="bg-gradient-to-r from-primary via-indigo-600 to-purple-600 dark:from-primary dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            job offers
                        </span>
                        .
                    </h1>

                    <p className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
                        Track every opportunity in a fluid visual pipeline, test your resume against ATS filters before applying, and generate tailored cover letters and outreach in seconds.
                    </p>

                    <div className="mt-8 sm:mt-10">
                        <HeroCta />
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground font-medium">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Free starter credits
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill">
                            <span className="size-1.5 rounded-full bg-indigo-500" />
                            No credit card required
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Ready in 30 seconds
                        </span>
                    </div>
                </div>


                <div className="container mx-auto px-4 mt-12 sm:mt-16 max-w-5xl relative z-10">
                    <div className="glass-panel p-3 sm:p-5 shadow-2xl relative overflow-hidden border border-black/5 dark:border-white/10 backdrop-blur-2xl">

                        <div className="flex items-center justify-between pb-3 px-2 mb-3 border-b border-black/5 dark:border-white/10 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-rose-400/80" />
                                <div className="size-3 rounded-full bg-amber-400/80" />
                                <div className="size-3 rounded-full bg-emerald-400/80" />
                                <div className="ml-3 hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md glass-pill font-mono text-[11px] text-muted-foreground">
                                    <span>app.jobtracker.io/board</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-foreground/80">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                <span>Interactive Kanban Pipeline</span>
                            </div>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                            <div className="glass-card p-3 rounded-xl border border-black/5 dark:border-white/10 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-foreground/90 flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-slate-400" /> Wish List
                                        </span>
                                        <span className="text-[10px] font-bold glass-pill px-2 py-0.5 rounded-full text-foreground/70">2</span>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="p-3 glass-card glass-hover rounded-lg border border-black/5 dark:border-white/10 shadow-2xs">
                                            <h4 className="text-xs font-bold text-foreground">Staff Frontend Engineer</h4>
                                            <p className="text-[11px] text-muted-foreground">Linear • Remote</p>
                                            <div className="mt-2.5 flex flex-wrap gap-1">
                                                <span className="text-[9px] font-medium glass-pill px-1.5 py-0.5 rounded text-foreground/80">$160k - $185k</span>
                                                <span className="text-[9px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">Referral</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-[10px] text-muted-foreground italic">Targeting Q4 opening</div>
                            </div>


                            <div className="glass-card p-3 rounded-xl border border-black/5 dark:border-white/10 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-foreground/90 flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-blue-500" /> Applied
                                        </span>
                                        <span className="text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">4</span>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="p-3 glass-card glass-hover rounded-lg border border-black/5 dark:border-white/10 shadow-2xs">
                                            <div className="flex items-start justify-between gap-1">
                                                <div>
                                                    <h4 className="text-xs font-bold text-foreground">Full Stack Architect</h4>
                                                    <p className="text-[11px] text-muted-foreground">Vercel • San Francisco</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                                                    94% Match
                                                </span>
                                            </div>
                                            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                <CheckCircle2 className="size-3 shrink-0" />
                                                <span>Tailored letter submitted</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-[10px] text-muted-foreground italic">Resume: FullStack_v2.pdf</div>
                            </div>


                            <div className="glass-card p-3 rounded-xl border border-black/5 dark:border-white/10 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-foreground/90 flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-amber-500" /> Interviewing
                                        </span>
                                        <span className="text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">2</span>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="p-3 glass-card glass-hover rounded-lg border border-black/5 dark:border-white/10 shadow-2xs">
                                            <div className="flex items-start justify-between gap-1">
                                                <div>
                                                    <h4 className="text-xs font-bold text-foreground">Senior Backend Engineer</h4>
                                                    <p className="text-[11px] text-muted-foreground">Stripe • Remote</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                                                    91% Match
                                                </span>
                                            </div>
                                            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                                                <div className="flex items-center gap-1 font-bold mb-0.5">
                                                    <CalendarCheck className="size-3 text-amber-500 shrink-0" />
                                                    <span>System Design Round</span>
                                                </div>
                                                <p className="opacity-80 text-[9px]">Tomorrow @ 2:00 PM (Google Meet)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-[10px] text-amber-600 dark:text-amber-400 font-medium">Round 2 of 3</div>
                            </div>


                            <div className="glass-card p-3 rounded-xl border border-black/5 dark:border-white/10 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-foreground/90 flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-emerald-500" /> Offered
                                        </span>
                                        <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">1</span>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="p-3 glass-card glass-hover rounded-lg border border-black/5 dark:border-white/10 shadow-2xs">
                                            <div className="flex items-start justify-between gap-1">
                                                <div>
                                                    <h4 className="text-xs font-bold text-foreground">Lead Cloud Architect</h4>
                                                    <p className="text-[11px] text-muted-foreground">Supabase • Remote</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded-full shrink-0">
                                                    $195,000
                                                </span>
                                            </div>
                                            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                                <Sparkles className="size-3 text-emerald-500 shrink-0" />
                                                <span>Offer package in review</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Decision deadline in 5 days</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <div className="w-full overflow-hidden relative py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                <div className="flex w-[300%] animate-marquee gap-4 hover:[animation-play-state:paused]">
                    {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 px-6 py-2.5 rounded-full glass-card border border-black/5 dark:border-white/10 text-xs sm:text-sm font-semibold tracking-wider uppercase text-foreground/80 hover:text-foreground transition-colors backdrop-blur-md shadow-xs"
                        >
                            ✦ {item}
                        </div>
                    ))}
                </div>
            </div>


            <section className="py-20 sm:py-28 relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <div className="text-[11px] font-semibold tracking-[0.18em] text-primary mb-2">
                            Why Traditional Job Hunting Breaks Down
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mt-2">
                            Stop sending generic resumes into a black hole
                        </h2>
                        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                            Spreadsheets get messy, automated ATS algorithms reject generic resumes, and writing custom cover letters eats hours of your day.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">

                        <div className="p-6 sm:p-8 rounded-2xl glass-card border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10">
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm mb-5">
                                <XCircle className="size-5 shrink-0" />
                                <span className="uppercase tracking-wider text-xs">The Frustrating Old Way</span>
                            </div>
                            <ul className="space-y-4 text-xs sm:text-sm text-muted-foreground">
                                <li className="flex items-start gap-2.5">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span><strong className="text-foreground">Spreadsheet Chaos</strong>: Juggling 80+ rows with broken links, outdated status notes, and lost follow-up dates.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span><strong className="text-foreground">Zero Feedback</strong>: Submitting generic resumes that get immediately discarded by automated ATS screening filters.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span><strong className="text-foreground">Writing Fatigue</strong>: Spending 45+ minutes on each application manually crafting cover letters from scratch.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span><strong className="text-foreground">Scattered Interviews</strong>: Losing track of which resume version went to which company and where you left off.</span>
                                </li>
                            </ul>
                        </div>


                        <div className="p-6 sm:p-8 rounded-2xl glass-card border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-lg">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-5">
                                <CheckCircle2 className="size-5 shrink-0" />
                                <span className="uppercase tracking-wider text-xs">The Job Tracker Way</span>
                            </div>
                            <ul className="space-y-4 text-xs sm:text-sm text-foreground/90">
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span><strong className="text-foreground">Visual Pipeline</strong>: Every opportunity clearly organized across drag-and-drop columns with tags and salaries.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span><strong className="text-foreground">ATS Pre-Flight Match</strong>: Instant 0–100% score highlighting matched vs missing technical keywords before you apply.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span><strong className="text-foreground">1-Click Tailored Materials</strong>: Role-specific cover letters, recruiter DMs, and formal application emails in seconds.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span><strong className="text-foreground">Complete Interview Journey</strong>: Dedicated round logs, schedules, and interview prep notes directly on each card.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>


            <section id="features" className="py-20 sm:py-28 relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="text-[11px] font-semibold tracking-[0.18em] text-primary mb-2">
                            Complete Career Toolset
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mt-2">
                            Engineered for every stage of your job hunt
                        </h2>
                        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                            From finding the right roles to signing the offer letter, everything you need is built in.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                        <div className="glass-card glass-hover glass-shimmer p-6 rounded-2xl border border-black/5 dark:border-white/10 flex flex-col justify-between group">
                            <div>
                                <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xs">
                                    <Layers className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-2">
                                    Visual Kanban Board
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    Drag and drop applications across customizable stages. Keep job links, target salary ranges, priority tags, and custom notes organized in one place.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/10 text-xs font-semibold text-primary">
                                Drag & drop • Search & tags • Rich notes
                            </div>
                        </div>


                        <div className="glass-card glass-hover glass-shimmer p-6 rounded-2xl border border-black/5 dark:border-white/10 flex flex-col justify-between group">
                            <div>
                                <div className="size-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xs">
                                    <TrendingUp className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-2">
                                    ATS Keyword Matcher
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    Scan your resume against any job description. Get an objective 0–100% score, spot missing technical skills, and get bullet-point advice to pass automated screeners.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                0–100% score • Keyword gap analysis
                            </div>
                        </div>


                        <div className="glass-card glass-hover glass-shimmer p-6 rounded-2xl border border-black/5 dark:border-white/10 flex flex-col justify-between group">
                            <div>
                                <div className="size-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xs">
                                    <FileText className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-2">
                                    Tailored Cover Letters
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    Generate crisp, role-specific letters that connect your achievements directly to the employer&apos;s stated challenges. Ready to copy with a single click.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/10 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                Role-tailored • 1-click clipboard copy
                            </div>
                        </div>


                        <div className="glass-card glass-hover glass-shimmer p-6 rounded-2xl border border-black/5 dark:border-white/10 flex flex-col justify-between group">
                            <div>
                                <div className="size-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xs">
                                    <Send className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-2">
                                    Recruiter & InMail Outreach
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    Skip the generic templates. Draft personalized messages for LinkedIn recruiters, hiring managers, and peer referrals that start real conversations.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/10 text-xs font-semibold text-sky-600 dark:text-sky-400">
                                High conversion • Personalized pitch
                            </div>
                        </div>


                        <div className="glass-card glass-hover glass-shimmer p-6 rounded-2xl border border-black/5 dark:border-white/10 flex flex-col justify-between group">
                            <div>
                                <div className="size-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xs">
                                    <FileCheck2 className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-2">
                                    Multi-Resume Library
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    Store different resume variations (Frontend, Full-Stack, Team Lead). Upload once and link specific versions to each job application with automatic PDF text parsing.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/10 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                Version control • Automatic text parsing
                            </div>
                        </div>


                        <div className="glass-card glass-hover glass-shimmer p-6 rounded-2xl border border-black/5 dark:border-white/10 flex flex-col justify-between group">
                            <div>
                                <div className="size-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xs">
                                    <CalendarCheck className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-2">
                                    Interview Journey & Funnel
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    Log screening, technical, and behavioral rounds with dates, interviewer feedback, and prep notes. Monitor your conversion funnel to see your progress to offer.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/10 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                Round logging • Funnel analytics
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-20 sm:py-28 relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <div className="text-[11px] font-semibold tracking-[0.18em] text-primary mb-2">
                            Effortless Routine
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-2">
                            How you&apos;ll use it every week
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                            A repeatable, friction-free system to turn applications into interviews.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        <div className="glass-card glass-hover p-6 rounded-2xl border border-black/5 dark:border-white/10 text-center flex flex-col items-center group">
                            <div className="size-10 rounded-full bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                                1
                            </div>
                            <h3 className="text-sm font-bold text-foreground mb-1.5">Add the Role</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Paste the job title, company, salary, and requirements onto your Kanban board in seconds.
                            </p>
                        </div>

                        <div className="glass-card glass-hover p-6 rounded-2xl border border-black/5 dark:border-white/10 text-center flex flex-col items-center group">
                            <div className="size-10 rounded-full bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                                2
                            </div>
                            <h3 className="text-sm font-bold text-foreground mb-1.5">Scan & Tailor</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Check your ATS keyword match score, fix missing skills, and generate your customized cover letter.
                            </p>
                        </div>

                        <div className="glass-card glass-hover p-6 rounded-2xl border border-black/5 dark:border-white/10 text-center flex flex-col items-center group">
                            <div className="size-10 rounded-full bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                                3
                            </div>
                            <h3 className="text-sm font-bold text-foreground mb-1.5">Track to the Offer</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Move your card through interview rounds, record feedback, and close on the offer package.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            <FaqSection />


            <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="glass-panel p-10 sm:p-16 rounded-3xl border border-primary/20 dark:border-white/10 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/15 dark:bg-primary/25 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-foreground/80 mb-6 shadow-2xs">
                                <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
                                <span className="tracking-[0.14em] text-[11px]">Take control of your search</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                                Ready to land your next role faster?
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground mt-4 mb-8 max-w-xl mx-auto leading-relaxed">
                                Join ambitious candidates organizing their applications, beating ATS filters, and closing offers with confidence.
                            </p>

                            <div className="flex items-center justify-center">
                                <BottomCta />
                            </div>

                            <p className="mt-5 text-xs text-muted-foreground">
                                Free forever • No credit card required • Get set up in seconds
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
