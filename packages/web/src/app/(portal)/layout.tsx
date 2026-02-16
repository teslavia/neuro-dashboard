import { PortalNav } from "@/components/portal-nav";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <PortalNav />
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
