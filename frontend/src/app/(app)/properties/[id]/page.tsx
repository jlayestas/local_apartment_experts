"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  archiveProperty,
  getProperty,
  getPropertyActivity,
  publishProperty,
  unpublishProperty,
} from "@/lib/api/properties";
import type { ActivityEntry } from "@/types/lead";
import { useTranslations } from "@/lib/i18n";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ImagesSection from "./_components/ImagesSection";
import type { PropertyDetail } from "@/types/property";

type Tab = "overview" | "activity";

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800">{value ?? "—"}</dd>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(price: number | null, frequency: string | null, freqMap: Record<string, string>): string {
  if (price == null) return "—";
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
  const freq = frequency ? freqMap[frequency] : "";
  return freq ? `${formatted} ${freq}` : formatted;
}

// ── OverviewTab ───────────────────────────────────────────────────────────────

function OverviewTab({
  property,
  t,
}: {
  property: PropertyDetail;
  t: ReturnType<typeof useTranslations>;
}) {
  const ov = t.properties.detail.overview;
  const pf = t.properties;

  const address = [
    property.addressLine1,
    property.addressLine2,
    property.neighborhood,
    property.city,
    property.state,
    property.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
    {/* Images */}
    <ImagesSection propertyId={property.id} />

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Location */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{ov.location}</h3>
        <dl className="space-y-3">
          <Field label={ov.address} value={address} />
          {property.latitude && property.longitude && (
            <Field label={ov.coordinates} value={`${property.latitude}, ${property.longitude}`} />
          )}
        </dl>
      </section>

      {/* Pricing */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{ov.pricing}</h3>
        <dl className="space-y-3">
          <Field
            label={t.properties.form.price}
            value={formatPrice(property.price, property.priceFrequency, pf.priceFrequency)}
          />
          <Field label={t.properties.form.availableDate} value={formatDate(property.availableDate)} />
        </dl>
      </section>

      {/* Details */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{ov.details}</h3>
        <dl className="space-y-3">
          <Field label={t.properties.form.propertyType} value={pf.propertyType[property.propertyType] ?? property.propertyType} />
          <div className="grid grid-cols-3 gap-3">
            <Field label={ov.beds} value={property.bedrooms ?? "—"} />
            <Field label={ov.baths} value={property.bathrooms ?? "—"} />
            <Field label={ov.sqft} value={property.squareFeet != null ? `${property.squareFeet} m²` : "—"} />
          </div>
          <Field
            label={ov.amenities}
            value={
              property.amenities && property.amenities.length > 0
                ? property.amenities.join(" · ")
                : <span className="text-gray-400 italic">{ov.noAmenities}</span>
            }
          />
        </dl>
      </section>

      {/* Policies */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{ov.policies}</h3>
        <dl className="space-y-3">
          <Field
            label={ov.petPolicy}
            value={property.petPolicy ? pf.petPolicy[property.petPolicy] ?? property.petPolicy : "—"}
          />
          <Field label={ov.parking} value={property.parkingInfo} />
        </dl>
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{ov.contact}</h3>
        <dl className="space-y-3">
          <Field label="Teléfono" value={property.contactPhone} />
          <Field label="WhatsApp" value={property.contactWhatsapp} />
          <Field
            label={ov.agent}
            value={property.listingAgentName ?? <span className="italic text-gray-400">{ov.noAgent}</span>}
          />
        </dl>
      </section>

      {/* Internal notes — full width */}
      {property.description && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-2 md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Descripción</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{property.description}</p>
        </section>
      )}

      {property.internalNotes && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2 md:col-span-2">
          <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wide">{ov.internalNotes}</h3>
          <p className="text-sm text-amber-800 whitespace-pre-wrap">{property.internalNotes}</p>
        </section>
      )}
    </div>
    </div>
  );
}

// ── ActivityTab ───────────────────────────────────────────────────────────────

function ActivityTab({
  propertyId,
  t,
}: {
  propertyId: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    getPropertyActivity(propertyId)
      .then(setEntries)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [propertyId]);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner className="h-6 w-6 text-indigo-500" /></div>;
  }

  if (error) {
    return (
      <p role="alert" className="py-8 text-center text-sm text-red-500">
        {t.common.error}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        {t.leads.detail.activity.empty}
      </p>
    );
  }

  function describeActivity(entry: ActivityEntry): string {
    const type = t.leads.activityType[entry.activityType] ?? entry.activityType;
    const meta = entry.metadata as Record<string, string>;

    if (entry.activityType === "PROPERTY_UPDATED" && meta.fields) {
      return `${type}: ${meta.fields}`;
    }
    return type;
  }

  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <div key={entry.id} className="flex gap-4 rounded-lg px-4 py-3 hover:bg-gray-50">
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-800">{describeActivity(entry)}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {entry.actorName && `${entry.actorName} · `}
              {new Date(entry.createdAt).toLocaleString("es-MX")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── StatusActions ─────────────────────────────────────────────────────────────

function StatusActions({
  property,
  onUpdate,
  t,
}: {
  property: PropertyDetail;
  onUpdate: (p: PropertyDetail) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actions = t.properties.detail.actions;

  async function run(fn: () => Promise<PropertyDetail>) {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await fn();
      onUpdate(updated);
    } catch {
      setError(t.common.error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isLoading && <Spinner className="h-4 w-4 text-indigo-500" />}
      {error && <span className="text-xs text-red-600">{error}</span>}

      {property.status === "DRAFT" && (
        <Button
          size="sm"
          disabled={isLoading}
          onClick={() => run(() => publishProperty(property.id))}
        >
          {actions.publish}
        </Button>
      )}

      {property.status === "PUBLISHED" && (
        <>
          <Button
            size="sm"
            variant="secondary"
            disabled={isLoading}
            onClick={() => run(() => unpublishProperty(property.id))}
          >
            {actions.unpublish}
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={isLoading}
            onClick={() => run(() => archiveProperty(property.id))}
          >
            {actions.archive}
          </Button>
        </>
      )}

      {property.status === "ARCHIVED" && (
        <span className="text-xs text-gray-400 italic">{t.properties.status.ARCHIVED}</span>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<"notFound" | "error" | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    getProperty(id)
      .then(setProperty)
      .catch((err) => {
        setLoadError(err?.status === 404 ? "notFound" : "error");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  if (loadError === "notFound") {
    return (
      <div className="py-24 text-center text-sm text-gray-500">
        {t.properties.detail.notFound}
      </div>
    );
  }

  if (loadError === "error" || !property) {
    return (
      <div role="alert" className="py-24 text-center text-sm text-red-500">
        {t.common.error}
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t.properties.detail.tabs.overview },
    { key: "activity", label: t.properties.detail.tabs.activity },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ← {t.common.back}
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{property.title}</h1>
            <Badge
              variant="propertyStatus"
              value={property.status}
              label={t.properties.status[property.status]}
            />
            {property.featured && (
              property.status === "PUBLISHED" ? (
                <span className="text-yellow-500 text-lg" title={t.properties.form.featured}>★</span>
              ) : (
                <span className="text-gray-400 text-lg" title={t.properties.form.featuredDraft}>★</span>
              )
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {property.neighborhood ? `${property.neighborhood}, ` : ""}{property.city}, {property.state}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/properties/${id}/edit`)}
          >
            {t.common.edit}
          </Button>
          <StatusActions property={property} onUpdate={setProperty} t={t} />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab property={property} t={t} />}
      {activeTab === "activity" && <ActivityTab propertyId={id} t={t} />}
    </div>
  );
}
