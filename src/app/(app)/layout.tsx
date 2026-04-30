import { Sidebar } from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto" style={{ background: "#0A0A14" }}>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
