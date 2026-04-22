"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUser, updateUser, resetUserPassword } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { useTranslations } from "@/lib/i18n";
import { useAuthContext } from "@/lib/auth/context";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { UserDetail, UpdateUserPayload } from "@/types/user";
import type { UserRole } from "@/types/auth";

const ROLES: UserRole[] = ["AGENT", "ADMIN"];

const selectClass =
  "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function EditUserPage() {
  const t = useTranslations();
  const uf = t.users.form;
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user: currentUser } = useAuthContext();

  const [original, setOriginal] = useState<UserDetail | null>(null);
  const [form, setForm] = useState<UpdateUserPayload>({});
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    getUser(params.id)
      .then((u) => {
        setOriginal(u);
        setForm({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
          language: u.language,
          active: u.active,
        });
      })
      .catch(() => setOriginal(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  function set(field: keyof UpdateUserPayload) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = field === "active"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.firstName?.trim()) next.firstName = t.common.required;
    if (!form.lastName?.trim())  next.lastName  = t.common.required;
    if (!form.email?.trim())     next.email     = t.common.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMsg(null);

    try {
      await updateUser(params.id, form);
      setSuccessMsg(uf.successUpdate);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors((prev) => ({ ...prev, email: t.users.errors.emailTaken }));
      } else if (err instanceof ApiError && err.status === 422) {
        setSubmitError(err.message);
      } else {
        setSubmitError(t.common.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setErrors((prev) => ({ ...prev, newPassword: uf.passwordHint }));
      return;
    }
    setIsResetting(true);
    setSubmitError(null);
    setSuccessMsg(null);

    try {
      await resetUserPassword(params.id, newPassword);
      setNewPassword("");
      setSuccessMsg(uf.successPasswordReset);
    } catch {
      setSubmitError(t.common.error);
    } finally {
      setIsResetting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  if (!original) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center text-gray-500">
        {t.users.detail.notFound}
      </div>
    );
  }

  const isSelf = currentUser?.email === original.email;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <button onClick={() => router.back()} className="mb-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          ← {t.common.back}
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">{uf.editTitle}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{original.email}</p>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Main form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{uf.sectionInfo}</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label={uf.firstName} value={form.firstName ?? ""} onChange={set("firstName")} error={errors.firstName} required />
            <Input label={uf.lastName}  value={form.lastName ?? ""}  onChange={set("lastName")}  error={errors.lastName}  required />
          </div>
          <Input label={uf.email} type="email" value={form.email ?? ""} onChange={set("email")} error={errors.email} required />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{uf.sectionAccess}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{uf.role}</label>
            <select
              value={form.role ?? "AGENT"}
              onChange={set("role")}
              className={selectClass}
              disabled={isSelf}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{t.users.role[r]}</option>
              ))}
            </select>
            {isSelf && (
              <p className="mt-1 text-xs text-gray-400">{t.users.errors.cannotChangeOwnRole}</p>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.active ?? true}
              onChange={set("active")}
              disabled={isSelf}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
            />
            {uf.active}
          </label>
          {isSelf
            ? <p className="text-xs text-gray-400">{t.users.errors.cannotDeactivateSelf}</p>
            : <p className="text-xs text-gray-400">{uf.activeHint}</p>
          }
        </section>

        {submitError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>{t.common.cancel}</Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? uf.submitting : uf.submitEdit}
          </Button>
        </div>
      </form>

      {/* Password reset */}
      <form onSubmit={handleResetPassword} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4" noValidate>
        <h2 className="font-medium text-gray-900">{uf.resetPassword}</h2>
        <Input
          label={uf.newPassword}
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setErrors((prev) => ({ ...prev, newPassword: "" }));
          }}
          hint={uf.passwordHint}
          error={errors.newPassword}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" isLoading={isResetting}>
            {isResetting ? uf.submitting : uf.resetPassword}
          </Button>
        </div>
      </form>
    </div>
  );
}
