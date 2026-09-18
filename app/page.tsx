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

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-primary/15 selection:text-primary">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />


            <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-slate-100 bg-linear-to-b from-slate-50/90 via-slate-50/40 to-white overflow-hidden">

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-linear-to-b from-primary/5 via-indigo-50/30 to-transparent pointer-events-none blur-3xl -z-10" />

                <div className="container mx-auto px-4 text-center max-w-4xl">

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold mb-6 shadow-2xs">
                        <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
                        <span>The AI Career Workspace for Ambitious Job Seekers</span>
                    </div>


                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                        Turn application chaos <br className="hidden sm:inline" />
                        into <span className="bg-linear-to-r from-slate-900 via-indigo-950 to-primary bg-clip-text text-transparent">job offers</span>.
                    </h1>


                    <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
                        Track every opportunity in a fluid visual pipeline, test your resume against ATS filters before applying, and generate tailored cover letters and outreach in seconds.
                    </p>


                    <div className="mt-8 sm:mt-10">
                        <HeroCta />
                    </div>


                    <p className="mt-4 text-xs text-slate-500 flex items-center justify-center gap-3 font-medium">
                        <span>Free starter credits</span>
                        <span className="text-slate-300">•</span>
                        <span>No credit card required</span>
                        <span className="text-slate-300">•</span>
                        <span>Ready in 30 seconds</span>
                    </p>
                </div>


                <div className="container mx-auto px-4 mt-12 sm:mt-16 max-w-5xl">
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-4 shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5 overflow-hidden">

                        <div className="flex items-center justify-between pb-3 px-2 mb-3 border-b border-slate-100 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-rose-400/80" />
                                <div className="size-3 rounded-full bg-amber-400/80" />
                                <div className="size-3 rounded-full bg-emerald-400/80" />
                                <div className="ml-3 hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono text-[11px]">
                                    <span>app.jobtracker.io/board</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                <span>Interactive Kanban Pipeline</span>
                            </div>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-slate-400" /> Wish List
                                        </span>
                                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">2</span>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="p-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs">
                                            <div className="flex items-start justify-between gap-1">
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900">Staff Frontend Engineer</h4>
                                                    <p className="text-[11px] text-slate-500">Linear • Remote</p>
                                                </div>
                                            </div>
                                            <div className="mt-2.5 flex flex-wrap gap-1">
                                                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">$160k - $185k</span>
                                                <span className="text-[9px] font-medium bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">Referral</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-[10px] text-slate-400 italic">Targeting Q4 opening</div>
                            </div>


                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-blue-500" /> Applied
                                        </span>
                                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">4</span>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="p-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs">
                                            <div className="flex items-start justify-between gap-1">
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900">Full Stack Architect</h4>
                                                    <p className="text-[11px] text-slate-500">Vercel • San Francisco</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                                                    94% Match
                                                </span>
                                            </div>
                                            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
                                                <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                                                <span>Tailored letter submitted</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-[10px] text-slate-400 italic">Resume: FullStack_v2.pdf</div>
                            </div>


                            <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-200/60 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-amber-500" /> Interviewing
                                        </span>
                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">2</span>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="p-3 bg-white rounded-lg border border-amber-200/80 shadow-2xs">
                                            <div className="flex items-start justify-between gap-1">
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900">Senior Backend Engineer</h4>
                                                    <p className="text-[11px] text-slate-500">Stripe • Remote</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                                                    91% Match
                                                </span>
                                            </div>
                                            <div className="mt-2 p-2 bg-amber-50/70 rounded border border-amber-100 text-[10px] text-amber-900 font-medium">
                                                <div className="flex items-center gap-1 text-amber-800 font-bold mb-0.5">
                                                    <CalendarCheck className="size-3 text-amber-600 shrink-0" />
                                                    <span>System Design Round</span>
                                                </div>
                                                <p className="text-amber-700 text-[9px]">Tomorrow @ 2:00 PM (Google Meet)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-[10px] text-amber-700 font-medium">Round 2 of 3</div>
                            </div>


                            <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-200/60 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-emerald-500" /> Offered
                                        </span>
                                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">1</span>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="p-3 bg-white rounded-lg border border-emerald-200/80 shadow-2xs">
                                            <div className="flex items-start justify-between gap-1">
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900">Lead Cloud Architect</h4>
                                                    <p className="text-[11px] text-slate-500">Supabase • Remote</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                                                    $195,000
                                                </span>
                                            </div>
                                            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-800 font-semibold">
                                                <Sparkles className="size-3 text-emerald-600 shrink-0" />
                                                <span>Offer package in review</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-[10px] text-emerald-700 font-medium">Decision deadline in 5 days</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Why Traditional Job Hunting Breaks Down
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mt-2">
                            Stop sending generic resumes into a black hole
                        </h2>
                        <p className="mt-3 text-sm sm:text-base text-slate-600">
                            Spreadsheets get messy, automated ATS algorithms reject generic resumes, and writing custom cover letters eats hours of your day.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">

                        <div className="p-6 sm:p-8 rounded-2xl border border-rose-100 bg-rose-50/30">
                            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-4">
                                <XCircle className="size-5 text-rose-600" />
                                <span>The Frustrating Old Way</span>
                            </div>
                            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                                <li className="flex items-start gap-2.5">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span><strong>Spreadsheet Chaos</strong>: Juggling 80+ rows with broken links, outdated status notes, and lost follow-up dates.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span><strong>Zero Feedback</strong>: Submitting generic resumes that get immediately discarded by automated ATS screening filters.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span><strong>Writing Fatigue</strong>: Spending 45+ minutes on each application manually crafting cover letters from scratch.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span><strong>Scattered Interviews</strong>: Losing track of which resume version went to which company and where you left off.</span>
                                </li>
                            </ul>
                        </div>


                        <div className="p-6 sm:p-8 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
                            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-4">
                                <CheckCircle2 className="size-5 text-emerald-600" />
                                <span>The Job Tracker Way</span>
                            </div>
                            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Visual Pipeline</strong>: Every opportunity clearly organized across drag-and-drop columns with tags and salaries.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>ATS Pre-Flight Match</strong>: Instant 0–100% score highlighting matched vs missing technical keywords before you apply.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>1-Click Tailored Materials</strong>: Role-specific cover letters, recruiter DMs, and formal application emails in seconds.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Complete Interview Journey</strong>: Dedicated round logs, schedules, and interview prep notes directly on each card.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>


            <section id="features" className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Complete Career Toolset
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mt-2">
                            Engineered for every stage of your job hunt
                        </h2>
                        <p className="mt-3 text-sm sm:text-base text-slate-600">
                            From finding the right roles to signing the offer letter, everything you need is built in.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                                    <Layers className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">
                                    Visual Kanban Board
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Drag and drop applications across customizable stages. Keep job links, target salary ranges, priority tags, and custom notes organized in one place.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-semibold text-indigo-600">
                                Drag & drop • Search & tags • Rich notes
                            </div>
                        </div>


                        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                    <TrendingUp className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">
                                    ATS Keyword Matcher
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Scan your resume against any job description. Get an objective 0–100% score, spot missing technical skills, and get bullet-point advice to pass automated screeners.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-600">
                                0–100% score • Keyword gap analysis
                            </div>
                        </div>


                        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                                    <FileText className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">
                                    Tailored Cover Letters
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Generate crisp, role-specific letters that connect your achievements directly to the employer&apos;s stated challenges. Ready to copy with a single click.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-semibold text-amber-600">
                                Role-tailored • 1-click clipboard copy
                            </div>
                        </div>


                        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                    <Send className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">
                                    Recruiter & InMail Outreach
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Skip the generic templates. Draft personalized messages for LinkedIn recruiters, hiring managers, and peer referrals that start real conversations.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-600">
                                High conversion • Personalized pitch
                            </div>
                        </div>


                        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                                    <FileCheck2 className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">
                                    Multi-Resume Library
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Store different resume variations (Frontend, Full-Stack, Team Lead). Upload once and link specific versions to each job application with automatic PDF text parsing.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-semibold text-purple-600">
                                Version control • Automatic text parsing
                            </div>
                        </div>


                        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="size-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                                    <CalendarCheck className="size-5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">
                                    Interview Journey & Funnel
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Log screening, technical, and behavioral rounds with dates, interviewer feedback, and prep notes. Monitor your conversion funnel to see your progress to offer.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-semibold text-rose-600">
                                Round logging • Funnel analytics
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Effortless Routine
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
                            How you&apos;ll use it every week
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-slate-500">
                            A repeatable, friction-free system to turn applications into interviews.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        <div className="p-6 rounded-2xl border border-slate-200 bg-white text-center shadow-2xs flex flex-col items-center">
                            <div className="size-10 rounded-full bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow-xs">
                                1
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Add the Role</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Paste the job title, company, salary, and requirements onto your Kanban board in seconds.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 bg-white text-center shadow-2xs flex flex-col items-center">
                            <div className="size-10 rounded-full bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow-xs">
                                2
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Scan & Tailor</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Check your ATS keyword match score, fix missing skills, and generate your customized cover letter.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 bg-white text-center shadow-2xs flex flex-col items-center">
                            <div className="size-10 rounded-full bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow-xs">
                                3
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Track to the Offer</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Move your card through interview rounds, record feedback, and close on the offer package.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            <FaqSection />


            <section className="py-20 sm:py-28 bg-slate-900 text-white relative overflow-hidden">

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto px-4 max-w-2xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold mb-6">
                        <Sparkles className="size-3.5 text-amber-400 fill-amber-400" />
                        <span>Take control of your search</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Ready to land your next role faster?
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 mt-4 mb-8 leading-relaxed">
                        Join ambitious candidates organizing their applications, beating ATS filters, and closing offers with confidence.
                    </p>

                    <div className="flex items-center justify-center">
                        <BottomCta />
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                        Free forever • No credit card required • Get set up in seconds
                    </p>
                </div>
            </section>
        </div>
    );
}
