"use client";

import PageContainer from "@/components/layout/PageContainer";
import ContactCTA from "@/features/forms/ContactCTA";
import WhatsAppButton from "@/features/contact/WhatsAppButton";
import { CONTACT_PHONE, CONTACT_EMAIL } from "@/lib/config/contact";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ContactContent() {
  const { t } = useLanguage();

  const TRUST_ITEMS = [
    t("contact.trust1"),
    t("contact.trust2"),
    t("contact.trust3"),
    t("contact.trust4"),
  ];

  return (
    <div className="py-12 sm:py-16">
      <PageContainer>
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t("contact.title")}
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* Left: inquiry form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-1 text-lg font-semibold text-gray-900">{t("contact.send_message")}</h2>
            <p className="mb-6 text-sm text-gray-500">
              {t("contact.send_subtitle")}
            </p>
            <ContactCTA />
          </div>

          {/* Right: direct contact options */}
          <div className="space-y-6">

            {/* WhatsApp card */}
            <div className="rounded-xl border border-green-100 bg-green-50 p-6">
              <h2 className="mb-1 text-base font-semibold text-gray-900">{t("contact.prefer_text")}</h2>
              <p className="mb-4 text-sm text-gray-600">
                {t("contact.whatsapp_hours")}
              </p>
              <WhatsAppButton className="w-full justify-center" />
            </div>

            {/* Contact details */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">{t("contact.more_ways")}</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-gray-700">
                  <svg className="h-5 w-5 shrink-0 text-teal-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <a href={`tel:${CONTACT_PHONE}`} className="hover:text-teal-600 transition-colors">
                    {CONTACT_PHONE}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <svg className="h-5 w-5 shrink-0 text-teal-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-teal-600 transition-colors">
                    {CONTACT_EMAIL}
                  </a>
                </li>
              </ul>
            </div>

            {/* Trust bullets */}
            <div className="rounded-xl border border-teal-50 bg-teal-50 p-6">
              <h2 className="mb-3 text-base font-semibold text-gray-900">{t("contact.why_us")}</h2>
              <ul className="space-y-2.5 text-sm text-gray-700">
                {TRUST_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </PageContainer>
    </div>
  );
}
