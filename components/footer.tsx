import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t py-6 md:py-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-8 max-w-7xl mx-auto">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left transition-colors">
                    Built by{" "}
                    <a
                        href="https://github.com/Tahsin005"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-4 hover:text-foreground"
                    >
                        Tahsin
                    </a>
                    . The source code is available on{" "}
                    <a
                        href="https://github.com/Tahsin005/job-application-tracker"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-4 hover:text-foreground"
                    >
                        GitHub
                    </a>
                    .
                </p>
            </div>
        </footer>
    );
}
