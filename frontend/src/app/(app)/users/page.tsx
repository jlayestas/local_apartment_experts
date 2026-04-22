"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { listUsers, updateUser } from "@/lib/api/users";
import { useTranslations } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { UserDetail } from "@/types/user";

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; users: UserDetail[] };

export default function UsersPage() {
  const t = useTranslations();
  const u = t.users;
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setState({ status: "loading" });
    listUsers()
      .then((users) => setState({ status: "ready", users }))
      .catch(() => setState({ status: "error" }));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(user: UserDetail) {
    setTogglingId(user.id);
    try {
      const updated = await updateUser(user.id, { active: !user.active });
      setState((prev) =>
        prev.status === "ready"
          ? { status: "ready", users: prev.users.map((u) => u.id === updated.id ? updated : u) }
          : prev
      );
    } finally {
      setTogglingId(null);
    }
  }

  if (state.status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">{u.title}</h1>
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm text-red-700">{t.common.error}</p>
          <Button variant="secondary" size="sm" onClick={load}>{t.common.retry}</Button>
        </div>
      </div>
    );
  }

  const { users } = state;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{u.title}</h1>
        <Link href="/users/new">
          <Button>{u.newUser}</Button>
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {users.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-gray-400">{u.noUsers}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {[u.table.name, u.table.email, u.table.role, u.table.status, u.table.lastLogin, t.common.actions].map((col) => (
                  <th key={col} className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {u.role[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {user.active ? u.status.active : u.status.inactive}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString("es-MX", {
                          day: "numeric", month: "short", year: "numeric",
                        })
                      : u.detail.neverLoggedIn}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/users/${user.id}/edit`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        {t.common.edit}
                      </Link>
                      <button
                        onClick={() => toggleActive(user)}
                        disabled={togglingId === user.id}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-40"
                      >
                        {togglingId === user.id
                          ? "..."
                          : user.active
                          ? u.status.inactive
                          : u.status.active}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
