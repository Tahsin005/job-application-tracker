import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-[calc(100vh-4rem)]">
            <AdminHeader />

            <main className="container mx-auto px-3 sm:px-6 py-6 sm:py-8 max-w-7xl">
                {children}
            </main>
        </div>
    );
}
