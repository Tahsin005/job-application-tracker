"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
    question: string;
    answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
    {
        question: "Is Job Application Tracker really free to use?",
        answer: "Yes! You can organize unlimited job applications on your Kanban board, take rich notes, and manage your resumes completely free. Every new account also comes with complimentary AI credits to run ATS scans and generate tailored cover letters. If you ever need additional AI credits, you can top up on-demand with zero recurring subscription locks.",
    },
    {
        question: "How does the ATS Resume Matcher score my resume?",
        answer: "Our ATS engine analyzes the exact role requirements, required technical competencies, and responsibilities stated in the job description. It benchmarks them directly against your resume text to calculate a 0–100% match score, pinpoint missing keywords, and suggest quantifiable improvements so your application passes automated screening filters.",
    },
    {
        question: "Can I manage different versions of my resume for different roles?",
        answer: "Yes. Most candidates maintain specialized resumes (e.g., Frontend Engineer vs. Full-Stack vs. Tech Lead). You can upload and store multiple PDF resumes in your Resume Library, designate a global default, and link specific versions to individual job applications so you always remember what you submitted.",
    },
    {
        question: "Is my personal data and resume text kept private?",
        answer: "Your privacy is our priority. Your uploaded resumes, application notes, and personal details are strictly private to your authenticated account. We never sell your data, use your resume for public training sets, or share your application history with third parties or employers.",
    },
    {
        question: "How do interview tracking and rounds work?",
        answer: "Every application card includes a dedicated Interview Journey tracker. You can log screening, technical, behavioral, and managerial rounds with dates, interview links, durations, and private notes. You can also monitor your conversion funnel on the Analytics dashboard to see where you're succeeding.",
    },
    {
        question: "What payment options are available if I want more AI credits?",
        answer: "We support flexible, non-expiring credit top-up packages. In addition to standard payment methods, we natively support Bangladeshi Mobile Financial Services (bKash, Nagad, Rocket) with manual transaction ID verification, making it easy and accessible to top up whenever needed.",
    },
];

export function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (idx: number) => {
        setOpenIndex((curr) => (curr === idx ? null : idx));
    };

    return (
        <section id="faq" className="py-20 sm:py-28 bg-white border-t border-slate-100">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold mb-3">
                        <HelpCircle className="size-3.5 text-primary" />
                        <span>Frequently Asked Questions</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
                        Everything you need to know
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
                        Clear answers to common questions about using Job Application Tracker, AI credits, and privacy.
                    </p>
                </div>

                <div className="space-y-3">
                    {FAQ_ITEMS.map((item, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div
                                key={idx}
                                className="rounded-xl border border-slate-200/90 bg-white transition-all hover:border-slate-300 shadow-2xs overflow-hidden"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(idx)}
                                    className="w-full text-left px-5 py-4 sm:px-6 sm:py-4.5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 focus:outline-hidden"
                                    aria-expanded={isOpen}
                                >
                                    <span>{item.question}</span>
                                    <ChevronDown
                                        className={`size-4 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""
                                            }`}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 sm:px-6 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80">
                                        <p className="pt-3">{item.answer}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
