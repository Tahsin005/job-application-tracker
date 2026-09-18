import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50">
            <AdminHeader />

            <main className="container mx-auto p-4 sm:p-6">
                {children}
            </main>
        </div>
    );
}
