"use client";

import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import PropertyGallery from "@/features/properties/PropertyGallery";
import ContactCTA from "@/features/forms/ContactCTA";
import PropertyCard from "@/features/properties/PropertyCard";
import StickyMobileCTA from "@/features/contact/StickyMobileCTA";
import { formatPrice, formatBedsLabel, formatBathsLabel, formatSqft } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { PropertyDetail, PropertySummary } from "@/types/property";

type Props = {
  property: PropertyDetail;
  similar: PropertySummary[];
  availableLabel: string | null;
  fullAddress: string;
};

// ── Icons ──────────────────────────────────────────────────────────────────────

function BedIcon()      { return <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5V17m0-9.5a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 7.5v9M3 13.5h18M3 17h18" /></svg>; }
function BathIcon()     { return <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5h16.5m-16.5 0a3 3 0 01-3-3V6a3 3 0 013-3h1.5a3 3 0 013 3v.75M3.75 13.5A3.75 3.75 0 007.5 17.25h9a3.75 3.75 0 003.75-3.75M12 20.25v-3" /></svg>; }
function RulerIcon()    { return <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>; }
function CalendarIcon() { return <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>; }
function PinIcon()      { return <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>; }
function CheckIcon()    { return <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>; }
function PawIcon()      { return <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>; }
function CarIcon()      { return <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>; }


function SpecTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-4 text-center">
      <span className="text-teal-400">{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

export default function PropertyDetailContent({ property, similar, availableLabel, fullAddress }: Props) {
  const { t } = useLanguage();

  const typeLabel = t(`type.${property.propertyType}`) ?? property.propertyType;

  const petConfig = property.petPolicy
    ? {
        label: t(`pet.${property.petPolicy}`),
        className:
          property.petPolicy === "ALLOWED"
            ? "border-green-200 bg-green-50 text-green-700"
            : property.petPolicy === "NOT_ALLOWED"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-amber-200 bg-amber-50 text-amber-700",
      }
    : null;

  return (
    <div className="pb-24 pt-8 sm:pt-10 lg:pb-10">
      <PageContainer>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="transition-colors hover:text-teal-600">{t("detail.home")}</Link>
          <span aria-hidden="true" className="select-none">/</span>
          <Link href="/listings" className="transition-colors hover:text-teal-600">{t("detail.properties")}</Link>
          <span aria-hidden="true" className="select-none">/</span>
          <span className="max-w-[200px] truncate text-gray-800 sm:max-w-none">{property.title}</span>
        </nav>

        {/* Image gallery */}
        <PropertyGallery images={property.images ?? []} title={property.title} />

        {/* Mobile: price bar */}
        <div className="mt-5 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm lg:hidden">
          <p className="text-2xl font-bold text-teal-700">
            {formatPrice(property.price, property.priceFrequency, t)}
          </p>
          <p className="mt-0.5 text-sm text-gray-500">
            {typeLabel} · {property.neighborhood ?? property.city}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* Left: detail content */}
          <div className="min-w-0 space-y-8">

            {/* Title + badges + location */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                  {typeLabel}
                </span>
                {property.featured && (
                  <span className="rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-medium text-white">
                    {t("detail.featured")}
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {property.title}
              </h1>
              {fullAddress && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
                  <span className="shrink-0 text-gray-400"><PinIcon /></span>
                  {fullAddress}
                </p>
              )}
            </div>

            {/* Specs bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SpecTile icon={<BedIcon />}  label={t("detail.bedrooms")}  value={formatBedsLabel(property.bedrooms, t)} />
              <SpecTile icon={<BathIcon />} label={t("detail.bathrooms")} value={formatBathsLabel(property.bathrooms, t)} />
              {property.squareFeet != null && (
                <SpecTile icon={<RulerIcon />}   label={t("detail.sqft")}      value={formatSqft(property.squareFeet)} />
              )}
              {availableLabel && (
                <SpecTile icon={<CalendarIcon />} label={t("detail.available")} value={availableLabel} />
              )}
            </div>

            {/* Description */}
            {property.description && (
              <DetailSection title={t("detail.description")}>
                <p className="prose-listing whitespace-pre-line text-gray-600">
                  {property.description}
                </p>
              </DetailSection>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <DetailSection title={t("detail.amenities")}>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((key) => {
                    const label = t(`amenity.${key}` as Parameters<typeof t>[0]) ?? key;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700"
                      >
                        <span className="text-teal-400"><CheckIcon /></span>
                        {label}
                      </span>
                    );
                  })}
                </div>
              </DetailSection>
            )}

            {/* Pet policy */}
            {petConfig && (
              <DetailSection title={t("detail.pet_policy")}>
                <span className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium ${petConfig.className}`}>
                  <PawIcon />
                  {petConfig.label}
                </span>
              </DetailSection>
            )}

            {/* Parking */}
            {property.parkingInfo && (
              <DetailSection title={t("detail.parking")}>
                <p className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5 shrink-0 text-gray-400"><CarIcon /></span>
                  {property.parkingInfo}
                </p>
              </DetailSection>
            )}

            {/* Mobile: inquiry form */}
            <div id="inquiry" className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:hidden">
              <h2 className="mb-1 text-lg font-semibold text-gray-900">{t("detail.interested")}</h2>
              <p className="mb-5 text-sm text-gray-500">{t("detail.agent_reach")}</p>
              <ContactCTA context={property.title} />
            </div>

          </div>

          {/* Right: sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="border-b border-gray-100 pb-4">
                <p className="text-3xl font-bold text-teal-700">
                  {formatPrice(property.price, property.priceFrequency, t)}
                </p>
                <p className="mt-0.5 text-sm text-gray-500">
                  {typeLabel} · {property.neighborhood ?? property.city}
                </p>
              </div>

              <h2 className="mb-1 mt-4 text-base font-semibold text-gray-900">{t("detail.interested")}</h2>
              <p className="mb-5 text-sm text-gray-500">{t("detail.agent_reach")}</p>

              <ContactCTA context={property.title} />

              {property.contactPhone && (
                <p className="mt-4 text-center text-xs text-gray-400">
                  {t("detail.or_call")}{" "}
                  <a
                    href={`tel:${property.contactPhone}`}
                    className="font-medium text-gray-600 transition-colors hover:text-teal-600"
                  >
                    {property.contactPhone}
                  </a>
                </p>
              )}
            </div>
          </aside>
        </div>

        {/* Similar properties */}
        {similar.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-10">
            <h2 className="mb-6 text-xl font-bold text-gray-900">{t("detail.similar")}</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {t("detail.view_all")}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}

      </PageContainer>

      <StickyMobileCTA />
    </div>
  );
}
