"use client";

import { useState } from "react";
import type { PropertyImage } from "@/types/property";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Props = {
  images: PropertyImage[];
  title: string;
};

const SLOT_COLORS = [
  "bg-teal-100",
  "bg-blue-100",
  "bg-violet-100",
  "bg-sky-100",
  "bg-slate-100",
];

function PhotoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M21 21H3a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5h18a1.5 1.5 0 011.5 1.5v13.5A1.5 1.5 0 0121 21z" />
    </svg>
  );
}

export default function PropertyGallery({ images, title }: Props) {
  const { t } = useLanguage();
  const hasImages = images.length > 0;
  const total = hasImages ? Math.min(images.length, 5) : 0;
  const [selected, setSelected] = useState(0);

  const mainSrc = hasImages ? (images[selected]?.imageUrl ?? null) : null;

  if (!hasImages) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <PhotoIcon className="h-14 w-14" />
          <span className="text-xs text-gray-400">{t("gallery.no_photos")}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile: single image + prev / next + dot indicators */}
      <div className="lg:hidden">
        <div className={`relative aspect-video w-full overflow-hidden rounded-xl ${mainSrc ? "bg-gray-100" : SLOT_COLORS[selected % SLOT_COLORS.length]}`}>
          {mainSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainSrc}
                alt={t("gallery.alt", { title, current: selected + 1, total })}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const placeholder = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement | null;
                  if (placeholder) placeholder.style.display = "flex";
                }}
              />
              <div className="hidden h-full items-center justify-center text-gray-300">
                <PhotoIcon className="h-14 w-14" />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <PhotoIcon className="h-14 w-14" />
            </div>
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => setSelected((s) => Math.max(0, s - 1))}
                disabled={selected === 0}
                aria-label={t("gallery.prev")}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow backdrop-blur-sm transition hover:bg-white disabled:opacity-30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setSelected((s) => Math.min(total - 1, s + 1))}
                disabled={selected === total - 1}
                aria-label={t("gallery.next")}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow backdrop-blur-sm transition hover:bg-white disabled:opacity-30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                {Array.from({ length: total }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelected(i)}
                    aria-label={t("gallery.go_to", { n: i + 1 })}
                    className={`rounded-full transition-all ${
                      i === selected ? "h-1.5 w-4 bg-white" : "h-1.5 w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>

              <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm tabular-nums">
                {selected + 1} / {total}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Desktop: main + thumbnail column */}
      <div className="hidden h-[420px] gap-2.5 lg:flex">
        <div
          className={`relative flex-1 overflow-hidden rounded-xl ${
            !mainSrc ? SLOT_COLORS[selected % SLOT_COLORS.length] : "bg-gray-100"
          }`}
        >
          {mainSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainSrc}
                alt={t("gallery.alt", { title, current: selected + 1, total })}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const placeholder = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement | null;
                  if (placeholder) placeholder.style.display = "flex";
                }}
              />
              <div className="hidden h-full items-center justify-center text-gray-300">
                <PhotoIcon className="h-16 w-16" />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <PhotoIcon className="h-16 w-16" />
            </div>
          )}
          {total > 1 && (
            <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm tabular-nums">
              {selected + 1} / {total}
            </span>
          )}
        </div>

        {/* Thumbnail strip */}
        <div className="flex w-[108px] flex-col gap-2 overflow-y-auto">
          {Array.from({ length: total }).map((_, i) => {
            const src = hasImages ? (images[i]?.imageUrl ?? null) : null;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                aria-label={t("gallery.view", { n: i + 1 })}
                className={`relative h-[76px] w-full flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  i === selected ? "border-teal-500" : "border-transparent hover:border-gray-200"
                } ${!src ? SLOT_COLORS[i % SLOT_COLORS.length] : "bg-gray-100"}`}
              >
                {src ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={t("gallery.view", { n: i + 1 })}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        const placeholder = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement | null;
                        if (placeholder) placeholder.style.display = "flex";
                      }}
                    />
                    <div className="hidden h-full items-center justify-center text-gray-300">
                      <PhotoIcon className="h-5 w-5" />
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <PhotoIcon className="h-5 w-5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
