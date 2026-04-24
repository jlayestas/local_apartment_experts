import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />

        {/* pb-20 on mobile reserves space above the fixed bottom nav */}
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Bottom nav — visible on mobile only */}
      <div className="md:hidden">
        <Sidebar mobileNav />
      </div>
    </div>
  );
}
