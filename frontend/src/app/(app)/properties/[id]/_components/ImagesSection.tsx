"use client";

import { useEffect, useRef, useState } from "react";
import {
  deletePropertyImage,
  getPropertyImages,
  reorderPropertyImages,
  setPropertyImageCover,
  updatePropertyImageAltText,
  uploadPropertyImage,
} from "@/lib/api/properties";
import { useTranslations } from "@/lib/i18n";
import Spinner from "@/components/ui/Spinner";
import type { PropertyImage } from "@/types/property";

// ── ImageCard ─────────────────────────────────────────────────────────────────

type ImageCardProps = {
  image: PropertyImage;
  total: number;
  index: number;
  onSetCover: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMove: (id: string, direction: "up" | "down") => Promise<void>;
  onUpdateAltText: (id: string, altText: string) => Promise<void>;
  t: ReturnType<typeof useTranslations>;
};

function ImageCard({ image, total, index, onSetCover, onDelete, onMove, onUpdateAltText, t }: ImageCardProps) {
  const img = t.properties.images;
  const [busy, setBusy] = useState<"cover" | "delete" | "move" | null>(null);

  // Alt text inline edit state
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(image.altText ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep draft in sync if image prop updates from outside (e.g. after save)
  const altText = image.altText ?? "";
  useEffect(() => {
    if (!editing) setDraft(altText);
  }, [altText, editing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function wrap(action: "cover" | "delete" | "move", fn: () => Promise<void>) {
    setBusy(action);
    try { await fn(); } finally { setBusy(null); }
  }

  async function handleSaveAltText() {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onUpdateAltText(image.id, draft);
      setEditing(false);
    } catch {
      setSaveError(img.altTextError);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancelEdit() {
    setDraft(image.altText ?? "");
    setSaveError(null);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); handleSaveAltText(); }
    if (e.key === "Escape") handleCancelEdit();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      {/* Image + overlay */}
      <div className="group relative aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.imageUrl}
          alt={image.altText ?? ""}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Cover badge */}
        {image.cover && (
          <span className="absolute top-2 left-2 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white shadow">
            {img.cover}
          </span>
        )}

        {/* Overlay actions — visible on hover */}
        <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          {/* Top: reorder arrows */}
          <div className="flex justify-end gap-1">
            <button
              title="Mover izquierda"
              disabled={index === 0 || busy !== null}
              onClick={() => wrap("move", () => onMove(image.id, "up"))}
              className="rounded bg-white/80 px-1.5 py-0.5 text-xs font-bold text-gray-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <button
              title="Mover derecha"
              disabled={index === total - 1 || busy !== null}
              onClick={() => wrap("move", () => onMove(image.id, "down"))}
              className="rounded bg-white/80 px-1.5 py-0.5 text-xs font-bold text-gray-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>

          {/* Bottom: cover + delete */}
          <div className="flex gap-1">
            {!image.cover && (
              <button
                disabled={busy !== null}
                onClick={() => wrap("cover", () => onSetCover(image.id))}
                className="flex-1 rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-800 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy === "cover" ? <Spinner className="h-3 w-3 mx-auto text-indigo-500" /> : img.setCover}
              </button>
            )}
            <button
              disabled={busy !== null}
              onClick={() => {
                if (!confirm(img.removeConfirm)) return;
                wrap("delete", () => onDelete(image.id));
              }}
              className="rounded bg-red-500/90 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy === "delete" ? <Spinner className="h-3 w-3 mx-auto text-white" /> : img.remove}
            </button>
          </div>
        </div>
      </div>

      {/* Alt text row */}
      <div className="px-2 pt-1.5 pb-2 bg-white border-t border-gray-100">
        {editing ? (
          <div className="space-y-1">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setSaveError(null); }}
              onKeyDown={handleKeyDown}
              placeholder={img.altTextPlaceholder}
              maxLength={300}
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {saveError && (
              <p className="text-xs text-red-600">{saveError}</p>
            )}
            <div className="flex gap-1">
              <button
                onClick={handleSaveAltText}
                disabled={isSaving}
                className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <Spinner className="h-3 w-3 text-white" /> : t.common.save}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="rounded px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setDraft(image.altText ?? ""); setEditing(true); }}
            title={t.common.edit}
            className="w-full text-left group/alt flex items-center gap-1 min-h-[1.5rem]"
          >
            <span className={`flex-1 truncate text-xs ${image.altText ? "text-gray-600" : "text-gray-400 italic"}`}>
              {image.altText || img.altTextEmpty}
            </span>
            <span className="shrink-0 text-gray-300 opacity-0 group-hover/alt:opacity-100 transition-opacity text-xs">
              ✎
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── UploadZone ────────────────────────────────────────────────────────────────

type UploadZoneProps = {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  t: ReturnType<typeof useTranslations>;
};

function UploadZone({ onUpload, isUploading, t }: UploadZoneProps) {
  const img = t.properties.images;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    onUpload(files[0]);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !isUploading && inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors aspect-video
        ${isDragging ? "border-indigo-400 bg-indigo-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}
        ${isUploading ? "cursor-default" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={isUploading}
      />
      {isUploading ? (
        <Spinner className="h-6 w-6 text-indigo-500" />
      ) : (
        <>
          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 1.07 11.09" />
          </svg>
          <p className="text-xs font-medium text-gray-500">{img.upload}</p>
          <p className="text-[11px] text-gray-400">{img.dropHint}</p>
        </>
      )}
    </div>
  );
}

// ── ImagesSection ─────────────────────────────────────────────────────────────

export default function ImagesSection({ propertyId }: { propertyId: string }) {
  const t = useTranslations();
  const img = t.properties.images;

  const [images, setImages] = useState<PropertyImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPropertyImages(propertyId)
      .then(setImages)
      .finally(() => setIsLoading(false));
  }, [propertyId]);

  async function handleUpload(file: File) {
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await uploadPropertyImage(propertyId, file);
      setImages((prev) => [...prev, uploaded]);
    } catch {
      setError(img.uploadError);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSetCover(imageId: string) {
    try {
      const updated = await setPropertyImageCover(propertyId, imageId);
      setImages((prev) =>
        prev.map((i) => ({ ...i, cover: i.id === updated.id }))
      );
    } catch {
      setError(img.deleteError);
    }
  }

  async function handleDelete(imageId: string) {
    try {
      await deletePropertyImage(propertyId, imageId);
      setImages((prev) => prev.filter((i) => i.id !== imageId));
    } catch {
      setError(img.deleteError);
    }
  }

  async function handleMove(imageId: string, direction: "up" | "down") {
    const idx = images.findIndex((i) => i.id === imageId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;

    const reordered = [...images];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

    // Optimistic update
    setImages(reordered);

    try {
      const result = await reorderPropertyImages(
        propertyId,
        reordered.map((i) => i.id)
      );
      setImages(result);
    } catch {
      // Roll back on failure
      setImages(images);
      setError(img.reorderError);
    }
  }

  async function handleUpdateAltText(imageId: string, altText: string) {
    const updated = await updatePropertyImageAltText(propertyId, imageId, altText);
    setImages((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-6 w-6 text-indigo-500" />
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {img.sectionTitle}
          {images.length > 0 && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
              {images.length}
            </span>
          )}
        </h3>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, idx) => (
          <ImageCard
            key={image.id}
            image={image}
            total={images.length}
            index={idx}
            onSetCover={handleSetCover}
            onDelete={handleDelete}
            onMove={handleMove}
            onUpdateAltText={handleUpdateAltText}
            t={t}
          />
        ))}

        {/* Upload slot */}
        <UploadZone onUpload={handleUpload} isUploading={isUploading} t={t} />
      </div>

      {images.length === 0 && !isUploading && (
        <p className="text-center text-xs text-gray-400 -mt-2">{img.empty}</p>
      )}
    </section>
  );
}
