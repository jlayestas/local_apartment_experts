"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth/context";
import AppShell from "@/components/layout/AppShell";
import Spinner from "@/components/ui/Spinner";

/**
 * Protected layout — renders the AppShell for authenticated users.
 * Redirects to /login while loading or when no session is present.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spinner className="h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    // Redirect is in flight — render nothing to avoid flash
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
