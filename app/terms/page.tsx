import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Read the Terms of Service for Job Application Tracker. Understand our candidate data privacy, acceptable use policy, and AI feature guidelines.",
    alternates: {
        canonical: "/terms",
    },
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-primary/15 selection:text-primary py-12 sm:py-20">
            <div className="container mx-auto px-4 max-w-4xl">

                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 text-xs text-slate-600 hover:text-slate-900 -ml-2">
                            <ArrowLeft className="size-3.5" />
                            <span>Back to home</span>
                        </Button>
                    </Link>
                </div>


                <div className="pb-8 border-b border-slate-100 mb-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-4">
                        <Scale className="size-3.5 text-primary" />
                        <span>Legal & Compliance</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                        Terms of Service
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-slate-500">
                        Effective Date: January 1, 2026 • Last updated: September 19, 2026
                    </p>
                </div>


                <article className="prose prose-slate max-w-none text-slate-700 space-y-8 text-sm sm:text-base leading-relaxed">
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            Welcome to <strong>Job Application Tracker</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using our website, Kanban dashboard, resume library, AI tools, or any related services (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with any part of these Terms, you may not access or use the Service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            2. Eligibility & Account Security
                        </h2>
                        <p>
                            To use the Service, you must be at least 16 years of age (or the minimum legal age required in your jurisdiction) and capable of entering into a binding contract. When creating an account, you agree to:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                            <li>Provide accurate, current, and complete registration information.</li>
                            <li>Maintain the confidentiality of your authentication credentials and session tokens.</li>
                            <li>Promptly notify us of any unauthorized access to or security breach of your account.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            3. Candidate Data Ownership & Privacy
                        </h2>
                        <p>
                            You retain full ownership of all content, resumes, job descriptions, interview notes, and application records that you submit or store within the Service (&quot;User Content&quot;).
                        </p>
                        <p>
                            We treat your uploaded resumes and application materials as strictly confidential. We do not sell your personal information or share your resume text with recruiters, employers, or third-party advertisers without your explicit authorization.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            4. Permitted & Acceptable Use
                        </h2>
                        <p>
                            You agree to use the Service exclusively for lawful personal career management purposes. You agree not to:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                            <li>Reverse engineer, decompile, or attempt to extract the source code or underlying algorithms of the Service.</li>
                            <li>Use automated scrapers, bots, or extraction scripts to access the Service without our prior written consent.</li>
                            <li>Abuse, overload, or disrupt our infrastructure or external AI inference gateways.</li>
                            <li>Upload malicious code, viruses, or documents designed to compromise system security.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            5. AI Career Intelligence Disclaimer
                        </h2>
                        <p>
                            Our Service provides artificial intelligence features, including the <strong>ATS Resume Matcher</strong>, <strong>Tailored Cover Letter Generator</strong>, <strong>Recruiter Outreach Generator</strong>, and <strong>Application Email Drafts</strong>:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                            <li><strong>Advisory Nature</strong>: ATS match scores, missing keyword suggestions, and generated texts are provided for informational and preparatory purposes only.</li>
                            <li><strong>No Employment Guarantee</strong>: We do not guarantee job interviews, hiring decisions, or employment offers as a result of using our tools. Hiring decisions are made entirely at the discretion of individual employers.</li>
                            <li><strong>Review Obligation</strong>: You are solely responsible for reviewing, verifying the accuracy of, and customizing any AI-generated text before submitting it to employers.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            6. Credit Packs, Payments & Refunds
                        </h2>
                        <p>
                            Every account receives a complimentary quota of AI usage credits upon registration. Additional credits may be purchased on demand via credit top-up packages:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                            <li><strong>No Recurring Subscriptions</strong>: Credit packs are one-time on-demand purchases with no recurring subscription locks or automatic charges.</li>
                            <li><strong>Mobile Financial Services (MFS)</strong>: Where applicable, manual MFS payments (bKash, Nagad, Rocket) require submitting a valid Transaction ID for administrative verification.</li>
                            <li><strong>Refunds</strong>: Because AI generation incur direct computing and LLM inference expenses, purchased credits that have been consumed or partially utilized are non-refundable.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            7. Disclaimer of Warranties
                        </h2>
                        <p className="uppercase text-xs text-slate-500 font-semibold tracking-wide">
                            The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis.
                        </p>
                        <p>
                            To the maximum extent permitted by applicable law, we disclaim all warranties of any kind, whether express, implied, statutory, or otherwise, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or entirely free of vulnerabilities.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            8. Limitation of Liability
                        </h2>
                        <p>
                            In no event shall Job Application Tracker, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages (including loss of profits, data, employment opportunities, or goodwill) arising out of or related to your use of or inability to use the Service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            9. Modifications to the Service and Terms
                        </h2>
                        <p>
                            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide notice through the Service or via email prior to the new terms taking effect. By continuing to access the Service after revisions become effective, you agree to be bound by the updated Terms.
                        </p>
                    </section>

                    <section className="space-y-3 pt-4 border-t border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            10. Contact Us
                        </h2>
                        <p>
                            If you have any questions or concerns regarding these Terms of Service, please contact our support team at:
                        </p>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 font-mono">
                            Email: support@jobtracker.io
                        </div>
                    </section>
                </article>
            </div>
        </div>
    );
}
