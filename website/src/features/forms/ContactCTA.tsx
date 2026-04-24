"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { submitPublicLead } from "@/lib/api/leads";
import { ApiError } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type ContactFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
};

type Props = {
  context?: string;
  propertyId?: string;
};

export default function ContactCTA({ context, propertyId }: Props) {
  const { t } = useLanguage();

  const [form, setForm] = useState<ContactFormState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: context ? t("form.interested_in", { context }) : "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof ContactFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      setError(t("form.error_validation"));
      return;
    }

    setIsSubmitting(true);
    try {
      await submitPublicLead({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email || undefined,
        message: form.message || undefined,
        propertyId: propertyId || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(t("form.error_400"));
      } else {
        setError(t("form.error_generic"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-semibold text-green-800">{t("form.success_title")}</p>
        <p className="mt-1 text-sm text-green-700">{t("form.success_subtitle")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-xs text-gray-400">{t("form.required_note")}</p>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t("form.first_name")}
          required
          value={form.firstName}
          onChange={set("firstName")}
          placeholder={t("form.first_name_placeholder")}
        />
        <Input
          label={t("form.last_name")}
          required
          value={form.lastName}
          onChange={set("lastName")}
          placeholder={t("form.last_name_placeholder")}
        />
      </div>

      <Input
        label={t("form.phone")}
        type="tel"
        required
        value={form.phone}
        onChange={set("phone")}
        placeholder={t("form.phone_placeholder")}
      />

      <Input
        label={t("form.email")}
        type="email"
        value={form.email}
        onChange={set("email")}
        placeholder={t("form.email_placeholder")}
        hint={t("form.optional")}
      />

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700">
          {t("form.message")}
          <span className="ml-1.5 text-xs font-normal text-gray-400">({t("form.optional")})</span>
        </label>
        <textarea
          id="contact-message"
          value={form.message}
          onChange={set("message")}
          rows={3}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t("form.message_placeholder")}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
        {isSubmitting ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
}
