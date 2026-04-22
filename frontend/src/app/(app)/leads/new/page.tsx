"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createLead, getAssignableUsers } from "@/lib/api/leads";
import { useTranslations } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import FollowUpQuickActions from "@/components/ui/FollowUpQuickActions";
import Button from "@/components/ui/Button";
import type { CreateLeadInput, ContactMethod, LeadSource, UrgencyLevel } from "@/types/lead";
import type { UserSummary } from "@/types/api";

const SOURCES: LeadSource[] = ["WEBSITE", "REFERRAL", "FACEBOOK", "WALKIN", "OTHER"];
const URGENCY_LEVELS: UrgencyLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CONTACT_METHODS: ContactMethod[] = ["EMAIL", "PHONE", "WHATSAPP"];

export default function NewLeadPage() {
  const t = useTranslations();
  const router = useRouter();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultFollowUp = tomorrow.toISOString().slice(0, 10);

  const [form, setForm] = useState<CreateLeadInput>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    message: "",
    languagePreference: "es",
    nextFollowUpDate: defaultFollowUp,
  });
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateLeadInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    getAssignableUsers().then(setUsers).catch(() => {});
  }, []);

  function set(field: keyof CreateLeadInput) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value || undefined }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value || undefined;
    setForm((prev) => ({
      ...prev,
      phone: value,
      ...(sameAsPhone ? { whatsappNumber: value } : {}),
    }));
    setErrors((prev) => ({ ...prev, phone: undefined }));
  }

  function handleSameAsPhoneChange(checked: boolean) {
    setSameAsPhone(checked);
    if (checked) setForm((prev) => ({ ...prev, whatsappNumber: prev.phone }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.firstName?.trim()) next.firstName = t.common.required;
    if (!form.lastName?.trim()) next.lastName = t.common.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const created = await createLead({
        ...form,
        firstName: form.firstName!.trim(),
        lastName: form.lastName!.trim(),
      });
      router.push(`/leads/${created.id}`);
    } catch {
      setSubmitError(t.common.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="mb-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          ← {t.common.back}
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">{t.leads.form.createTitle}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Contact info */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{t.leads.form.sectionContact}</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t.leads.form.firstName}
              value={form.firstName ?? ""}
              onChange={set("firstName")}
              error={errors.firstName}
              required
            />
            <Input
              label={t.leads.form.lastName}
              value={form.lastName ?? ""}
              onChange={set("lastName")}
              error={errors.lastName}
              required
            />
          </div>

          <Input
            label={t.leads.form.email}
            type="email"
            value={form.email ?? ""}
            onChange={set("email")}
          />

          <div className="space-y-2">
            <Input
              label={t.leads.form.phone}
              type="tel"
              value={form.phone ?? ""}
              onChange={handlePhoneChange}
            />
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sameAsPhone}
                onChange={(e) => handleSameAsPhoneChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">{t.leads.form.sameAsPhone}</span>
            </label>
            {!sameAsPhone && (
              <Input
                label={t.leads.form.whatsapp}
                type="tel"
                value={form.whatsappNumber ?? ""}
                onChange={set("whatsappNumber")}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.leads.form.preferredContact}
            </label>
            <select
              value={form.preferredContactMethod ?? ""}
              onChange={set("preferredContactMethod")}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value=""></option>
              {CONTACT_METHODS.map((m) => (
                <option key={m} value={m}>{t.leads.contact[m]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.leads.form.source}
            </label>
            <select
              value={form.source ?? ""}
              onChange={set("source")}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value=""></option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{t.leads.source[s]}</option>
              ))}
            </select>
          </div>

          <Input
            label={t.leads.form.message}
            multiline
            rows={3}
            value={form.message ?? ""}
            onChange={set("message")}
            placeholder={t.leads.form.messagePlaceholder}
          />
        </section>

        {/* Property preferences */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{t.leads.form.sectionProperty}</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t.leads.form.budgetMin}
              type="number"
              min={0}
              value={form.budgetMin ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  budgetMin: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
            <Input
              label={t.leads.form.budgetMax}
              type="number"
              min={0}
              value={form.budgetMax ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  budgetMax: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t.leads.form.bedrooms}
              type="number"
              min={0}
              max={20}
              value={form.bedroomCount ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  bedroomCount: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
            <Input
              label={t.leads.form.bathrooms}
              type="number"
              min={0}
              max={20}
              value={form.bathroomCount ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  bathroomCount: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>

          <DatePicker
            label={t.leads.form.moveIn}
            value={form.moveInDate ?? ""}
            onChange={(v) => setForm((prev) => ({ ...prev, moveInDate: v || undefined }))}
          />
        </section>

        {/* Meta */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{t.leads.form.sectionMeta}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.leads.form.urgency}
              </label>
              <select
                value={form.urgencyLevel ?? ""}
                onChange={set("urgencyLevel")}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value=""></option>
                {URGENCY_LEVELS.map((u) => (
                  <option key={u} value={u}>{t.leads.urgency[u]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.leads.form.assignTo}
              </label>
              <select
                value={form.assignedUserId ?? ""}
                onChange={set("assignedUserId")}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{t.leads.form.unassigned}</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.leads.form.language}
              </label>
              <select
                value={form.languagePreference ?? "es"}
                onChange={set("languagePreference")}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>
            </div>

            <div>
              <DatePicker
                label={t.leads.form.nextFollowUp}
                value={form.nextFollowUpDate ?? ""}
                onChange={(v) => setForm((prev) => ({ ...prev, nextFollowUpDate: v || undefined }))}
              />
              <FollowUpQuickActions
                onSelect={(v) => setForm((prev) => ({ ...prev, nextFollowUpDate: v ?? undefined }))}
                labels={{
                  today: t.leads.form.followUpToday,
                  plus1: t.leads.form.followUpPlus1,
                  plus3: t.leads.form.followUpPlus3,
                  plus7: t.leads.form.followUpPlus7,
                  clear: t.leads.form.followUpClear,
                }}
              />
            </div>
          </div>
        </section>

        {submitError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            {t.common.cancel}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? t.leads.form.submitting : t.leads.form.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}
