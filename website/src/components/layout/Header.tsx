"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageSwitcher from "@/features/layout/LanguageSwitcher";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const NAV_LINKS = [
    { href: "/listings", label: t("nav.properties") },
    { href: "/contact",  label: t("nav.contact")    },
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-0 sm:px-6">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center py-4 text-base font-semibold tracking-tight text-gray-900 transition-colors hover:text-teal-600"
        >
          <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-md bg-teal-600 text-xs font-bold text-white">
            LA
          </span>
          <span className="hidden sm:inline">Local Apartment Experts</span>
          <span className="sm:hidden">LAE</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors
                  ${active
                    ? "text-teal-600 bg-teal-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              href="/listings"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 active:bg-teal-800"
            >
              {t("nav.find_apartment")}
            </Link>
          </div>
        </nav>

        {/* Mobile: lang switcher + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? t("nav.close_menu") : t("nav.open_menu")}
            aria-expanded={isOpen}
            className="flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            {isOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-5 pt-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors
                  ${active
                    ? "bg-teal-50 text-teal-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/listings"
              className="block w-full rounded-lg bg-teal-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              {t("nav.find_apartment")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
