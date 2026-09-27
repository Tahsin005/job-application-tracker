"use client";

export function AmbientBackground() {
    return (
        <div
            className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none"
            aria-hidden="true"
        >

            <div
                className="absolute -top-[12%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[130px] bg-indigo-300/30 dark:bg-indigo-600/20 animate-blob"
            />


            <div
                className="absolute top-[28%] -right-[12%] w-[50vw] h-[50vw] max-w-[680px] max-h-[680px] rounded-full blur-[140px] bg-amber-200/35 dark:bg-amber-500/15 animate-blob"
                style={{ animationDelay: "3s" }}
            />


            <div
                className="absolute -bottom-[16%] left-[18%] w-[55vw] h-[55vw] max-w-[720px] max-h-[720px] rounded-full blur-[150px] bg-sky-200/35 dark:bg-cyan-600/15 animate-blob"
                style={{ animationDelay: "6s" }}
            />


            <div
                className="absolute inset-0 opacity-[0.022] dark:opacity-[0.035] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}

export default AmbientBackground;
