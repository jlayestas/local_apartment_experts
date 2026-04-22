"use client";

import Link from "next/link";
import type { PropertySummary } from "@/types/property";
import { formatBedsLabel, formatBathsLabel, formatPrice, formatSqft } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Props = {
  property: PropertySummary;
};

export default function PropertyCard({ property }: Props) {
  const { t } = useLanguage();
  const {
    slug, title, city, neighborhood, price, priceFrequency,
    bedrooms, bathrooms, squareFeet, featured, coverImageUrl, propertyType,
  } = property;

  return (
    <Link
      href={`/listings/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
    >
      {/* Cover image */}
      <div className="relative aspect-video bg-gray-100">
        {coverImageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt={title}
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
              loading="lazy"
              onError={(e) => {
                // Hide the broken image and reveal the placeholder sibling
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const placeholder = (e.currentTarget as HTMLImageElement)
                  .nextElementSibling as HTMLElement | null;
                if (placeholder) placeholder.style.display = "flex";
              }}
            />
            <div className="hidden h-full items-center justify-center text-gray-300">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
              </svg>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
            </svg>
          </div>
        )}
        {featured && (
          <span className="absolute left-2 top-2 rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-medium text-white">
            {t("card.featured")}
          </span>
        )}
        {propertyType && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {t(`type.${propertyType}`)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="text-xs text-gray-500">{neighborhood ? `${neighborhood}, ${city}` : city}</p>
          <h3 className="mt-0.5 font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </div>

        <p className="text-lg font-bold text-teal-700">
          {formatPrice(price, priceFrequency, t)}
        </p>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{formatBedsLabel(bedrooms, t)}</span>
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span>{formatBathsLabel(bathrooms, t)}</span>
          {squareFeet && (
            <>
              <span className="text-gray-300" aria-hidden="true">·</span>
              <span>{formatSqft(squareFeet)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
