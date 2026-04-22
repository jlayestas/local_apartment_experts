"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CONTACT_PHONE, CONTACT_EMAIL } from "@/lib/config/contact";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const footerLinks = [
    {
      heading: t("footer.properties"),
      links: [
        { href: "/listings",               label: t("footer.all_properties") },
        { href: "/listings?featured=true", label: t("footer.featured")       },
      ],
    },
    {
      heading: t("footer.company"),
      links: [
        { href: "/contact", label: t("nav.contact") },
      ],
    },
  ];

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-600 text-xs font-bold text-white">
                LA
              </span>
              <span className="font-semibold text-gray-900">Local Apartment Experts</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              {t("footer.tagline")}
            </p>
            <div className="space-y-1 pt-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {t("footer.contact_us")}
              </p>
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="block text-sm text-gray-700 hover:text-teal-600 transition-colors"
              >
                {CONTACT_PHONE}
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="block text-sm text-gray-700 hover:text-teal-600 transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                {col.heading}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-teal-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6">
          <p className="text-xs text-gray-400">
            © {year} Local Apartment Experts. {t("footer.rights")}
          </p>
          <p className="text-xs text-gray-400">
            {t("footer.made_in")}
          </p>
        </div>
      </div>
    </footer>
  );
}
