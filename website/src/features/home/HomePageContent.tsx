"use client";

import Image from "next/image";
import Link from "next/link";
import Section from "@/components/sections/Section";
import PageContainer from "@/components/layout/PageContainer";
import PropertyCard from "@/features/properties/PropertyCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { PropertySummary } from "@/types/property";

type Props = {
  featured: PropertySummary[];
  whatsappHref: string;
};

const PROPERTY_TYPES = [
  {
    type: "APARTMENT",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    type: "CONDO",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    type: "HOUSE",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    type: "STUDIO",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5l16.5-4.125M12 6.375v13.5M12 6.375L3.75 7.5M12 6.375l8.25-2.125m0 0V6.75m0-2.5v.375c0 .621-.504 1.125-1.125 1.125M3.75 7.5V18a.75.75 0 00.75.75h15a.75.75 0 00.75-.75V5.25" />
      </svg>
    ),
  },
  {
    type: "TOWNHOUSE",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
      </svg>
    ),
  },
];

export default function HomePageContent({ featured, whatsappHref }: Props) {
  const { t } = useLanguage();

  const NEIGHBORHOODS = [
    { key: "brickell",      query: "Brickell",       title: t("home.nbhd_brickell"),          desc: t("home.nbhd_brickell_desc") },
    { key: "wynwood",       query: "Wynwood",         title: t("home.nbhd_wynwood"),           desc: t("home.nbhd_wynwood_desc") },
    { key: "coconut_grove", query: "Coconut Grove",   title: t("home.nbhd_coconut_grove"),     desc: t("home.nbhd_coconut_grove_desc") },
    { key: "coral_gables",  query: "Coral Gables",    title: t("home.nbhd_coral_gables"),      desc: t("home.nbhd_coral_gables_desc") },
    { key: "south_beach",   query: "South Beach",     title: t("home.nbhd_south_beach"),       desc: t("home.nbhd_south_beach_desc") },
    { key: "doral",         query: "Doral",           title: t("home.nbhd_doral"),             desc: t("home.nbhd_doral_desc") },
  ];

  const VALUE_PROPS = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t("home.vp_verified_title"),
      description: t("home.vp_verified_desc"),
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      title: t("home.vp_agents_title"),
      description: t("home.vp_agents_desc"),
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
        </svg>
      ),
      title: t("home.vp_free_title"),
      description: t("home.vp_free_desc"),
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t("home.vp_fast_title"),
      description: t("home.vp_fast_desc"),
    },
  ];

  const STEPS = [
    { number: "01", title: t("home.step1_title"), description: t("home.step1_desc") },
    { number: "02", title: t("home.step2_title"), description: t("home.step2_desc") },
    { number: "03", title: t("home.step3_title"), description: t("home.step3_desc") },
  ];

  return (
    <>
      {/* 1. Hero — split layout: text left, photo right */}
      <section className="relative flex min-h-[620px] overflow-hidden sm:min-h-[700px]">
        {/* Right: Miami photo */}
        <div className="absolute inset-0 lg:left-[45%]">
          <Image
            src="/miami-hero.jpg"
            alt="Miami aerial view"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          {/* Fade edge between photo and text panel on desktop */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent hidden lg:block" />
        </div>

        {/* Mobile overlay so text is readable on small screens */}
        <div className="absolute inset-0 bg-slate-900/75 lg:hidden" />

        {/* Left: text panel */}
        <div className="relative z-10 flex w-full items-center lg:w-[50%]">
          <div className="hidden lg:block absolute inset-0 bg-slate-900" />
          <div className="relative z-10 w-full px-8 py-16 sm:px-12 lg:px-16 xl:px-20">
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              {t("home.eyebrow")}
            </span>

            <h1
              className="mt-2 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl xl:text-6xl"
              style={{ color: "#ffffff" }}
            >
              {t("home.headline")}
            </h1>

            <p className="mt-5 max-w-md text-lg leading-relaxed text-gray-300">
              {t("home.subheadline")}
            </p>

            <div className="mt-8">
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-colors hover:bg-teal-700 active:scale-[0.98]"
              >
                {t("home.browse_properties")}
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
              {[
                t("home.trust_50"),
                t("home.trust_free"),
                t("home.trust_response"),
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value propositions */}
      <Section spacing="md" bg="muted">
        <PageContainer>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t("home.why_title")}
            </h2>
            <p className="mt-3 text-gray-500">{t("home.why_subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((vp) => (
              <div
                key={vp.title}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  {vp.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{vp.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{vp.description}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </Section>

      {/* 3. Neighborhood guide */}
      <Section spacing="md" bg="white">
        <PageContainer>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t("home.neighborhoods_title")}
            </h2>
            <p className="mt-3 text-gray-500">{t("home.neighborhoods_subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NEIGHBORHOODS.map((n) => (
              <Link
                key={n.key}
                href={`/listings?neighborhood=${encodeURIComponent(n.query)}`}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                      {n.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{n.desc}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-teal-600 opacity-0 transition-opacity group-hover:opacity-100">
                    {t("home.neighborhoods_explore")}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-teal-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>
        </PageContainer>
      </Section>

      {/* 4. Featured properties */}
      {featured.length > 0 && (
        <Section spacing="md" bg="muted">
          <PageContainer>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {t("home.featured_title")}
                </h2>
                <p className="mt-1 text-gray-500">{t("home.featured_subtitle")}</p>
              </div>
              <Link
                href="/listings"
                className="hidden shrink-0 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors sm:block"
              >
                {t("home.view_all")}
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/listings"
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                {t("home.view_all_mobile")}
              </Link>
            </div>
          </PageContainer>
        </Section>
      )}

      {/* 5. Property type grid */}
      <Section spacing="md" bg="white">
        <PageContainer>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t("home.types_title")}
            </h2>
            <p className="mt-3 text-gray-500">{t("home.types_subtitle")}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {PROPERTY_TYPES.map(({ type, icon }) => (
              <Link
                key={type}
                href={`/listings?type=${type}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-6 text-center shadow-sm transition-all hover:border-teal-200 hover:bg-teal-50 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">
                  {icon}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700 transition-colors">
                  {t(`type.${type}` as Parameters<typeof t>[0])}
                </span>
              </Link>
            ))}
          </div>
        </PageContainer>
      </Section>

      {/* 6. How it works */}
      <Section spacing="md" bg="muted">
        <PageContainer>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t("home.how_title")}
            </h2>
            <p className="mt-3 text-gray-500">{t("home.how_subtitle")}</p>
          </div>

          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-6 hidden h-px bg-gray-200 sm:block"
              style={{ left: "calc(1/6 * 100%)", right: "calc(1/6 * 100%)" }}
            />

            {STEPS.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center gap-4">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-teal-200 bg-white text-sm font-bold text-teal-600 shadow-sm">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500 max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </Section>

      {/* 7. WhatsApp / Contact CTA */}
      <Section spacing="md" bg="white">
        <PageContainer width="narrow">
          <div className="rounded-2xl bg-teal-600 px-6 py-12 text-center shadow-lg sm:px-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {t("home.cta_title")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-teal-100">
              {t("home.cta_subtitle")}
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-teal-700 shadow-sm transition-colors hover:bg-teal-50 active:scale-[0.98] sm:w-auto"
              >
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t("home.cta_whatsapp")}
              </a>

              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-xl border border-teal-400 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 active:scale-[0.98] sm:w-auto"
              >
                {t("home.cta_message")}
              </Link>
            </div>

            <p className="mt-5 text-xs text-teal-200">
              {t("home.cta_disclaimer")}
            </p>
          </div>
        </PageContainer>
      </Section>
    </>
  );
}
