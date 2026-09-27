import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function Footer() {
    return (
        <footer className="glass-panel !rounded-none border-t border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-2xl py-8 mt-auto transition-colors duration-300">
            <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-8 max-w-7xl mx-auto text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5 font-semibold text-foreground">
                    <div className="p-1 rounded-lg bg-primary/10 border border-primary/20">
                        <Briefcase className="size-3.5 text-primary" />
                    </div>
                    <span>Job Application Tracker</span>
                </div>
                <p className="text-center sm:text-left">
                    © 2026 Job Application Tracker. Designed with Liquid Glass.
                </p>
                <div className="flex items-center gap-5">
                    <Link href="/terms" className="hover:text-foreground transition-colors">
                        Terms of Service
                    </Link>
                    <Link href="/sign-in" className="hover:text-foreground transition-colors">
                        Sign In
                    </Link>
                    <Link href="/sign-up" className="text-primary font-medium hover:underline transition-colors">
                        Get Started
                    </Link>
                </div>
            </div>
        </footer>
    );
}
