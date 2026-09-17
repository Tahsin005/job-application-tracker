import { HeroCta, BottomCta } from "@/components/hero-cta";
import {
    Briefcase,
    TrendingUp,
    Sparkles,
    FileText,
    Mail,
    Send,
    Search,
    CheckCircle2,
} from "lucide-react";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-900">

            <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-100 bg-slate-50/60">
                <div className="container mx-auto px-4 text-center max-w-4xl">

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium mb-6 shadow-2xs">
                        <Sparkles className="size-3.5 text-slate-600" />
                        <span>A simpler, smarter way to manage your job hunt</span>
                    </div>


                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                        Keep every application organized. <br className="hidden sm:inline" />
                        Use AI to land the interview.
                    </h1>


                    <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Track your search in a visual pipeline, compare your resume against job requirements, and draft tailored cover letters and application emails in seconds.
                    </p>


                    <div className="mt-8">
                        <HeroCta />
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                        Free forever • No credit card required • Get set up in 30 seconds
                    </p>
                </div>


                <div className="container mx-auto px-4 mt-12 sm:mt-16 max-w-5xl">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm overflow-hidden">

                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <div className="size-2.5 rounded-full bg-slate-300" />
                                <div className="size-2.5 rounded-full bg-slate-300" />
                                <div className="size-2.5 rounded-full bg-slate-300" />
                                <span className="ml-2 font-mono text-[11px] text-slate-400 hidden sm:inline">job-tracker / board</span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-500">Visual Kanban Pipeline</span>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-slate-400" /> Wishlist
                                    </span>
                                    <span className="text-[10px] font-medium bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">2</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="p-3 bg-white rounded-md border border-slate-200 shadow-2xs">
                                        <h4 className="text-xs font-semibold text-slate-800">Frontend Engineer</h4>
                                        <p className="text-[11px] text-slate-500">Linear • Remote</p>
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Remote</span>
                                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">$140k - $160k</span>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-blue-500" /> Applied
                                    </span>
                                    <span className="text-[10px] font-medium bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">3</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="p-3 bg-white rounded-md border border-slate-200 shadow-2xs">
                                        <div className="flex items-start justify-between gap-1">
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-800">Full Stack Developer</h4>
                                                <p className="text-[11px] text-slate-500">Vercel • San Francisco</p>
                                            </div>
                                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">91% Match</span>
                                        </div>
                                        <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                                            <CheckCircle2 className="size-3 text-emerald-600" /> Cover letter sent
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-300">
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-amber-500" /> Interviewing
                                    </span>
                                    <span className="text-[10px] font-medium bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">1</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="p-3 bg-white rounded-md border border-slate-300 shadow-2xs">
                                        <div className="flex items-start justify-between gap-1">
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-900">Senior Backend Engineer</h4>
                                                <p className="text-[11px] text-slate-500">Stripe • Remote</p>
                                            </div>
                                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">96% Match</span>
                                        </div>
                                        <div className="mt-2.5 p-2 bg-slate-50 rounded border border-slate-100 text-[10px] text-slate-600">
                                            <p className="font-medium text-slate-700">AI Application Email Drafted</p>
                                            <p className="text-slate-500 truncate mt-0.5">&quot;Subject: Application for Senior Backend Engineer...&quot;</p>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-emerald-500" /> Offer Received
                                    </span>
                                    <span className="text-[10px] font-medium bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">1</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="p-3 bg-white rounded-md border border-slate-200 shadow-2xs">
                                        <div className="flex items-start justify-between gap-1">
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-800">Software Architect</h4>
                                                <p className="text-[11px] text-slate-500">Notion • New York</p>
                                            </div>
                                            <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">$185,000</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Offer in Review</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-20 bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Built-in Career Assistants
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
                            Four AI tools built for every application
                        </h2>
                        <p className="mt-2.5 text-sm sm:text-base text-slate-600">
                            Stop sending generic resumes into the void. Tailor each submission directly to the role requirements.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
                            <div>
                                <div className="size-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                                    <TrendingUp className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                                    ATS Resume Matcher
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Scan your resume against any job description to see your match score, spot missing technical keywords, and get bullet-point advice to pass automated screenings.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
                                Match score + missing keywords
                            </div>
                        </div>


                        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
                            <div>
                                <div className="size-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                                    <FileText className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                                    Tailored Cover Letters
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Generate a personalized 3-paragraph letter that connects your real accomplishments directly to what the company is hiring for. Copy with one click.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
                                Role-specific achievements
                            </div>
                        </div>


                        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
                            <div>
                                <div className="size-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                                    <Send className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                                    Recruiter Outreach
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Draft concise, professional messages to reach hiring managers and recruiters on LinkedIn, ask for referrals, and get conversations started.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
                                High-converting direct messages
                            </div>
                        </div>


                        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
                            <div>
                                <div className="size-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                                    <Mail className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                                    Application Email Drafts
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Create a complete, formal submission email with a custom subject line and targeted pitch ready to send directly to talent acquisition teams.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
                                Subject line + polished body
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-20 bg-slate-50/70 border-b border-slate-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Practical Workflow
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
                            Everything you need to run an effective search
                        </h2>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <div className="size-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                                <Briefcase className="size-4" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                                Visual Pipeline & Quick Updates
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Move applications naturally between stages with drag-and-drop. Keep track of applied dates, compensation numbers, job links, and interview rounds.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <div className="size-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                                <FileText className="size-4" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                                Versioned Resume Library
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Keep your resume versions in one place. Upload your PDF files once and attach the exact version used for each application so you always know what was sent.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <div className="size-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                                <Search className="size-4" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                                Instant Search & Custom Tags
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Filter your applications by company name, title, or custom tags like &quot;Remote&quot;, &quot;High Priority&quot;, or &quot;Referral&quot; to quickly find what you need.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-20 bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            How it works
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Three simple steps to manage your applications
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        <div className="p-5 rounded-lg border border-slate-200 text-center">
                            <div className="size-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
                                1
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1">Add a Job</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Paste the job title, company, salary, and description into a new card on your board.
                            </p>
                        </div>

                        <div className="p-5 rounded-lg border border-slate-200 text-center">
                            <div className="size-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
                                2
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Your Resume</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Upload your PDF resume once to the library. Text is extracted automatically.
                            </p>
                        </div>

                        <div className="p-5 rounded-lg border border-slate-200 text-center">
                            <div className="size-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
                                3
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1">Tailor & Apply</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Run your ATS keyword match scan, generate a cover letter or application email, and send.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-20 bg-slate-900 text-white">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Take control of your job search today
                    </h2>
                    <p className="text-sm text-slate-300 mt-3 mb-8 leading-relaxed">
                        Organize your applications with clarity and use built-in AI tools to put your best foot forward.
                    </p>
                    <div className="flex items-center justify-center">
                        <BottomCta />
                    </div>
                    <p className="mt-4 text-xs text-slate-400">
                        Free to use • No credit card required • Instant setup
                    </p>
                </div>
            </section>
        </div>
    );
}
