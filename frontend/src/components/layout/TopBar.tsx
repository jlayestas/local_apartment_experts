"use client";

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth/context";
import { logoutUser } from "@/lib/api/auth";
import { useTranslations } from "@/lib/i18n";
import Button from "@/components/ui/Button";

export default function TopBar() {
  const t = useTranslations();
  const { user, logout } = useAuthContext();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      logout();
      router.replace("/login");
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-4 border-b border-gray-200 bg-white px-6">
      {user && (
        <span className="text-sm text-gray-600">
          {user.firstName} {user.lastName}
        </span>
      )}
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        {t.auth.logout}
      </Button>
    </header>
  );
}
