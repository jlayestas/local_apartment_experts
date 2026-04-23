"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CONTACT_PHONE, CONTACT_EMAIL, INSTAGRAM_URL } from "@/lib/config/contact";

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
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              @localapartmentexperts
            </a>
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
