"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLead, updateLead } from "@/lib/api/leads";
import { useTranslations } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import FollowUpQuickActions from "@/components/ui/FollowUpQuickActions";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type {
  ContactMethod,
  LeadDetail,
  LeadSource,
  UrgencyLevel,
  UpdateLeadInput,
} from "@/types/lead";

const SOURCES: LeadSource[] = ["WEBSITE", "REFERRAL", "FACEBOOK", "WALKIN", "OTHER"];
const URGENCY_LEVELS: UrgencyLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CONTACT_METHODS: ContactMethod[] = ["EMAIL", "PHONE", "WHATSAPP"];

// Converts a LeadDetail into the initial form state.
function toFormState(lead: LeadDetail): UpdateLeadInput & { neighborhoodsText: string } {
  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    whatsappNumber: lead.whatsappNumber ?? undefined,
    preferredContactMethod: lead.preferredContactMethod ?? undefined,
    source: lead.source ?? undefined,
    moveInDate: lead.moveInDate ?? undefined,
    budgetMin: lead.budgetMin ?? undefined,
    budgetMax: lead.budgetMax ?? undefined,
    bedroomCount: lead.bedroomCount ?? undefined,
    bathroomCount: lead.bathroomCount ?? undefined,
    message: lead.message ?? undefined,
    languagePreference: lead.languagePreference,
    urgencyLevel: lead.urgencyLevel,
    nextFollowUpDate: lead.nextFollowUpDate ?? undefined,
    lastContactDate: lead.lastContactDate ?? undefined,
    // Neighborhoods are stored as an array but edited as a comma-separated string.
    neighborhoodsText: lead.preferredNeighborhoods.join(", "),
  };
}

type FormState = UpdateLeadInput & { neighborhoodsText: string };

export default function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();

  const [isLoadingLead, setIsLoadingLead] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateLeadInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    getLead(id)
      .then((lead) => {
        setForm(toFormState(lead));
        setSameAsPhone(!lead.whatsappNumber || lead.whatsappNumber === lead.phone);
      })
      .catch(() => setSubmitError(t.common.error))
      .finally(() => setIsLoadingLead(false));
  }, [id, t.common.error]);

  function set(field: keyof FormState) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      setForm((prev) => prev ? { ...prev, [field]: e.target.value || undefined } : prev);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value || undefined;
    setForm((prev) => prev ? {
      ...prev,
      phone: value,
      ...(sameAsPhone ? { whatsappNumber: value } : {}),
    } : prev);
    setErrors((prev) => ({ ...prev, phone: undefined }));
  }

  function handleSameAsPhoneChange(checked: boolean) {
    setSameAsPhone(checked);
    if (checked) setForm((prev) => prev ? { ...prev, whatsappNumber: prev.phone } : prev);
  }

  function setNum(field: "budgetMin" | "budgetMax" | "bedroomCount" | "bathroomCount") {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) =>
        prev ? { ...prev, [field]: e.target.value ? Number(e.target.value) : undefined } : prev
      );
    };
  }

  function validate(): boolean {
    if (!form) return false;
    const next: typeof errors = {};
    if (!form.firstName?.trim()) next.firstName = t.common.required;
    if (!form.lastName?.trim()) next.lastName = t.common.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Convert neighborhoodsText back to a string array, strip empties.
    const preferredNeighborhoods = form.neighborhoodsText
      ? form.neighborhoodsText.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const { neighborhoodsText: _, ...rest } = form;
    const payload: UpdateLeadInput = {
      ...rest,
      firstName: form.firstName?.trim(),
      lastName: form.lastName?.trim(),
      preferredNeighborhoods,
    };

    try {
      await updateLead(id, payload);
      router.push(`/leads/${id}`);
    } catch {
      setSubmitError(t.common.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingLead) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  if (!form) {
    return (
      <p className="py-16 text-center text-sm text-gray-400">{t.leads.detail.notFound}</p>
    );
  }

  const f = t.leads.form;

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
        <h1 className="text-2xl font-semibold text-gray-900">{f.editTitle}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Contact info */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{f.sectionContact}</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={f.firstName}
              value={form.firstName ?? ""}
              onChange={set("firstName")}
              error={errors.firstName}
              required
            />
            <Input
              label={f.lastName}
              value={form.lastName ?? ""}
              onChange={set("lastName")}
              error={errors.lastName}
              required
            />
          </div>

          <Input
            label={f.email}
            type="email"
            value={form.email ?? ""}
            onChange={set("email")}
          />

          <div className="space-y-2">
            <Input
              label={f.phone}
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
                label={f.whatsapp}
                type="tel"
                value={form.whatsappNumber ?? ""}
                onChange={set("whatsappNumber")}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {f.preferredContact}
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
              {f.source}
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
            label={f.message}
            multiline
            rows={3}
            value={form.message ?? ""}
            onChange={set("message")}
            placeholder={f.messagePlaceholder}
          />
        </section>

        {/* Property preferences */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{f.sectionProperty}</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={f.budgetMin}
              type="number"
              min={0}
              value={form.budgetMin ?? ""}
              onChange={setNum("budgetMin")}
            />
            <Input
              label={f.budgetMax}
              type="number"
              min={0}
              value={form.budgetMax ?? ""}
              onChange={setNum("budgetMax")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={f.bedrooms}
              type="number"
              min={0}
              max={20}
              value={form.bedroomCount ?? ""}
              onChange={setNum("bedroomCount")}
            />
            <Input
              label={f.bathrooms}
              type="number"
              min={0}
              max={20}
              value={form.bathroomCount ?? ""}
              onChange={setNum("bathroomCount")}
            />
          </div>

          <DatePicker
            label={f.moveIn}
            value={form.moveInDate ?? ""}
            onChange={(v) => setForm((prev) => prev ? { ...prev, moveInDate: v || undefined } : prev)}
          />

          <Input
            label={f.neighborhoods}
            value={form.neighborhoodsText ?? ""}
            onChange={set("neighborhoodsText")}
            hint={f.neighborhoodsHint}
            placeholder="Polanco, Condesa, Roma Norte"
          />
        </section>

        {/* Meta */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{f.sectionMeta}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.urgency}
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
                {f.language}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <DatePicker
                label={f.nextFollowUp}
                value={form.nextFollowUpDate ?? ""}
                onChange={(v) => setForm((prev) => prev ? { ...prev, nextFollowUpDate: v || undefined } : prev)}
              />
              <FollowUpQuickActions
                onSelect={(v) => setForm((prev) => prev ? { ...prev, nextFollowUpDate: v ?? undefined } : prev)}
                labels={{
                  today: t.leads.form.followUpToday,
                  plus1: t.leads.form.followUpPlus1,
                  plus3: t.leads.form.followUpPlus3,
                  plus7: t.leads.form.followUpPlus7,
                  clear: t.leads.form.followUpClear,
                }}
              />
            </div>
            <DatePicker
              label={f.lastContact}
              value={form.lastContactDate ?? ""}
              onChange={(v) => setForm((prev) => prev ? { ...prev, lastContactDate: v || undefined } : prev)}
            />
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
            {isSubmitting ? f.submitting : f.submitEdit}
          </Button>
        </div>
      </form>
    </div>
  );
}
