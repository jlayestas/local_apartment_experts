"use client";

import PageContainer from "@/components/layout/PageContainer";
import ContactCTA from "@/features/forms/ContactCTA";
import { CONTACT_PHONE, CONTACT_EMAIL, INSTAGRAM_URL } from "@/lib/config/contact";
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

            {/* Instagram card */}
            <div className="rounded-xl border border-pink-100 bg-pink-50 p-6">
              <h2 className="mb-1 text-base font-semibold text-gray-900">{t("contact.prefer_text")}</h2>
              <p className="mb-4 text-sm text-gray-600">
                {t("contact.instagram_desc")}
              </p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                {t("contact.instagram_button")}
              </a>
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
