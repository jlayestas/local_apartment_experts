import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
