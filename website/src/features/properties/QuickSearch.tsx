"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function QuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { t } = useLanguage();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/listings?search=${encodeURIComponent(q)}` : "/listings");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
    >
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-gray-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
          </svg>
        </span>
        <input
          type="search"
          name="q"
          aria-label={t("search.aria_label")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 active:bg-teal-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 whitespace-nowrap"
      >
        {t("search.button")}
      </button>
    </form>
  );
}
