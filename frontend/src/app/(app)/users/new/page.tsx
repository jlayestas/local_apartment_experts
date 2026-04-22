"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { useTranslations } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { CreateUserPayload } from "@/types/user";
import type { UserRole } from "@/types/auth";

const ROLES: UserRole[] = ["AGENT", "ADMIN"];

const selectClass =
  "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function NewUserPage() {
  const t = useTranslations();
  const uf = t.users.form;
  const router = useRouter();

  const [form, setForm] = useState<CreateUserPayload>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "AGENT",
    language: "es",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserPayload, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function set(field: keyof CreateUserPayload) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.firstName.trim()) next.firstName = t.common.required;
    if (!form.lastName.trim())  next.lastName  = t.common.required;
    if (!form.email.trim())     next.email     = t.common.required;
    if (!form.password.trim())  next.password  = t.common.required;
    else if (form.password.length < 8) next.password = t.users.form.passwordHint;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createUser({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim() });
      router.push("/users");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors((prev) => ({ ...prev, email: t.users.errors.emailTaken }));
      } else {
        setSubmitError(t.common.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <button onClick={() => router.back()} className="mb-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          ← {t.common.back}
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">{uf.createTitle}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{uf.sectionInfo}</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label={uf.firstName} value={form.firstName} onChange={set("firstName")} error={errors.firstName} required />
            <Input label={uf.lastName}  value={form.lastName}  onChange={set("lastName")}  error={errors.lastName}  required />
          </div>
          <Input label={uf.email} type="email" value={form.email} onChange={set("email")} error={errors.email} required />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{uf.sectionAccess}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{uf.role}</label>
            <select value={form.role} onChange={set("role")} className={selectClass}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{t.users.role[r]}</option>
              ))}
            </select>
          </div>

          <Input
            label={uf.password}
            type="password"
            value={form.password}
            onChange={set("password")}
            hint={uf.passwordHint}
            error={errors.password}
            required
          />
        </section>

        {submitError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>{t.common.cancel}</Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? uf.submitting : uf.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}
