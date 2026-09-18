import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t py-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-8 max-w-7xl mx-auto text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                    <Briefcase className="size-4 text-primary" />
                    <span>Job Application Tracker</span>
                </div>
                <p className="text-center sm:text-left">
                    © 2026 Job Application Tracker. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                    <Link href="/terms" className="hover:text-foreground transition-colors">
                        Terms of Service
                    </Link>
                    <Link href="/sign-in" className="hover:text-foreground transition-colors">
                        Sign In
                    </Link>
                    <Link href="/sign-up" className="hover:text-foreground transition-colors">
                        Get Started
                    </Link>
                </div>
            </div>
        </footer>
    );
}
