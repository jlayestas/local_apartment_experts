"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProperty, updateProperty } from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import { getAssignableUsers } from "@/lib/api/leads";
import { useTranslations } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import AmenityPicker from "@/components/ui/AmenityPicker";
import type { PetPolicy, PriceFrequency, PropertyDetail, PropertyType, UpdatePropertyInput } from "@/types/property";
import type { UserSummary } from "@/types/api";

const PROPERTY_TYPES: PropertyType[] = [
  "APARTMENT", "HOUSE", "STUDIO", "CONDO", "TOWNHOUSE", "COMMERCIAL", "OTHER",
];
const PRICE_FREQUENCIES: PriceFrequency[] = ["MONTHLY", "WEEKLY", "DAILY", "ONCE"];
const PET_POLICIES: PetPolicy[] = ["ALLOWED", "NOT_ALLOWED", "NEGOTIABLE"];

const selectClass =
  "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

type FormState = {
  title: string;
  slug: string;
  description: string;
  internalNotes: string;
  addressLine1: string;
  addressLine2: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  price: string;
  priceFrequency: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  availableDate: string;
  featured: boolean;
  amenities: string[];
  petPolicy: string;
  parkingInfo: string;
  contactPhone: string;
  contactWhatsapp: string;
  listingAgentId: string;
  sourceCompany: string;
  externalReferenceId: string;
  publicSortOrder: string;
};

function toFormState(p: PropertyDetail): FormState {
  return {
    title: p.title,
    slug: p.slug,
    description: p.description ?? "",
    internalNotes: p.internalNotes ?? "",
    addressLine1: p.addressLine1,
    addressLine2: p.addressLine2 ?? "",
    neighborhood: p.neighborhood ?? "",
    city: p.city,
    state: p.state,
    zipCode: p.zipCode ?? "",
    price: p.price != null ? String(p.price) : "",
    priceFrequency: p.priceFrequency ?? "",
    propertyType: p.propertyType,
    bedrooms: p.bedrooms != null ? String(p.bedrooms) : "",
    bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
    squareFeet: p.squareFeet != null ? String(p.squareFeet) : "",
    availableDate: p.availableDate ?? "",
    featured: p.featured,
    amenities: p.amenities ?? [],
    petPolicy: p.petPolicy ?? "",
    parkingInfo: p.parkingInfo ?? "",
    contactPhone: p.contactPhone ?? "",
    contactWhatsapp: p.contactWhatsapp ?? "",
    listingAgentId: p.listingAgentId ?? "",
    sourceCompany: p.sourceCompany ?? "",
    externalReferenceId: p.externalReferenceId ?? "",
    publicSortOrder: p.publicSortOrder != null ? String(p.publicSortOrder) : "",
  };
}

/** Returns undefined (leave unchanged) for blank strings; otherwise returns the value. */
function opt(value: string): string | undefined {
  return value.trim() || undefined;
}

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const pf = t.properties.form;

  const [form, setForm] = useState<FormState | null>(null);
  const [slugLocked, setSlugLocked] = useState(false);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProperty(id), getAssignableUsers()])
      .then(([property, assignable]) => {
        setForm(toFormState(property));
        setSlugLocked(property.publishedAt != null);
        setUsers(assignable);
      })
      .catch(() => setForm(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  function set(field: keyof FormState) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      setForm((prev) => prev ? { ...prev, [field]: e.target.value } : prev);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function validate(): boolean {
    if (!form) return false;
    const next: typeof errors = {};
    if (!form.title.trim()) next.title = t.common.required;
    if (!form.addressLine1.trim()) next.addressLine1 = t.common.required;
    if (!form.city.trim()) next.city = t.common.required;
    if (!form.state.trim()) next.state = t.common.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const payload: UpdatePropertyInput = {
      title: form.title.trim(),
      slug: opt(form.slug),
      description: opt(form.description),
      internalNotes: opt(form.internalNotes),
      addressLine1: form.addressLine1.trim(),
      addressLine2: opt(form.addressLine2),
      neighborhood: opt(form.neighborhood),
      city: form.city.trim(),
      state: form.state.trim(),
      zipCode: opt(form.zipCode),
      price: form.price ? Number(form.price) : undefined,
      priceFrequency: opt(form.priceFrequency) as PriceFrequency | undefined,
      propertyType: form.propertyType as PropertyType,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      squareFeet: form.squareFeet ? Number(form.squareFeet) : undefined,
      availableDate: opt(form.availableDate),
      featured: form.featured,
      amenities: form.amenities.length > 0 ? form.amenities : undefined,
      petPolicy: opt(form.petPolicy) as PetPolicy | undefined,
      parkingInfo: opt(form.parkingInfo),
      contactPhone: opt(form.contactPhone),
      contactWhatsapp: opt(form.contactWhatsapp),
      listingAgentId: opt(form.listingAgentId),
      sourceCompany: opt(form.sourceCompany),
      externalReferenceId: opt(form.externalReferenceId),
      publicSortOrder: form.publicSortOrder.trim() !== "" ? Number(form.publicSortOrder) : undefined,
    };

    try {
      await updateProperty(id, payload);
      router.push(`/properties/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrors((prev) => ({ ...prev, slug: pf.slugConflict }));
      } else {
        setSubmitError(t.common.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="py-24 text-center text-sm text-gray-500">
        {t.properties.detail.notFound}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <button onClick={() => router.back()} className="mb-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          ← {t.common.back}
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">{pf.editTitle}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* Content */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{pf.sectionContent}</h2>
          <Input label={pf.title} value={form.title} onChange={set("title")} error={errors.title} required />
          {slugLocked ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{pf.slug}</label>
              <input
                type="text"
                value={form.slug}
                disabled
                className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-amber-600">{pf.slugLocked}</p>
            </div>
          ) : (
            <Input label={pf.slug} value={form.slug} onChange={set("slug")} hint={pf.slugHint} error={errors.slug} />
          )}
          <Input label={pf.description} multiline rows={4} value={form.description} onChange={set("description")} />
          <Input label={pf.internalNotes} multiline rows={2} value={form.internalNotes} onChange={set("internalNotes")} />
        </section>

        {/* Location */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{pf.sectionLocation}</h2>
          <Input label={pf.addressLine1} value={form.addressLine1} onChange={set("addressLine1")} error={errors.addressLine1} required />
          <Input label={pf.addressLine2} value={form.addressLine2} onChange={set("addressLine2")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={pf.neighborhood} value={form.neighborhood} onChange={set("neighborhood")} />
            <Input label={pf.zipCode} value={form.zipCode} onChange={set("zipCode")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={pf.city} value={form.city} onChange={set("city")} error={errors.city} required />
            <Input label={pf.state} value={form.state} onChange={set("state")} error={errors.state} required />
          </div>
        </section>

        {/* Pricing */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{pf.sectionPricing}</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label={pf.price} type="number" min={0} value={form.price} onChange={set("price")} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{pf.priceFrequency}</label>
              <select value={form.priceFrequency} onChange={set("priceFrequency")} className={selectClass}>
                <option value=""></option>
                {PRICE_FREQUENCIES.map((f) => (
                  <option key={f} value={f}>{t.properties.priceFrequency[f]}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{pf.sectionDetails}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{pf.propertyType}</label>
            <select value={form.propertyType} onChange={set("propertyType")} className={selectClass}>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>{t.properties.propertyType[type]}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label={pf.bedrooms} type="number" min={0} max={99} value={form.bedrooms} onChange={set("bedrooms")} />
            <Input label={pf.bathrooms} type="number" min={0} max={99} value={form.bathrooms} onChange={set("bathrooms")} />
            <Input label={pf.squareFeet} type="number" min={0} value={form.squareFeet} onChange={set("squareFeet")} />
          </div>
          <DatePicker label={pf.availableDate} value={form.availableDate ?? ""} onChange={(v) => setForm((prev) => prev ? { ...prev, availableDate: v } : prev)} />
          <div className="space-y-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((prev) => prev ? { ...prev, featured: e.target.checked } : prev)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              {pf.featured}
            </label>
            <p className="text-xs text-gray-500">{pf.featuredHint}</p>
          </div>
          <div className="space-y-1">
            <Input
              label={pf.publicSortOrder}
              type="number"
              value={form.publicSortOrder}
              onChange={set("publicSortOrder")}
            />
            <p className="text-xs text-gray-500">{pf.publicSortOrderHint}</p>
          </div>
        </section>

        {/* Policies */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{pf.sectionPolicies}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{pf.amenities}</label>
            <AmenityPicker
              selected={form.amenities}
              onChange={(amenities) => setForm((prev) => prev ? { ...prev, amenities } : prev)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{pf.petPolicy}</label>
            <select value={form.petPolicy} onChange={set("petPolicy")} className={selectClass}>
              <option value=""></option>
              {PET_POLICIES.map((p) => (
                <option key={p} value={p}>{t.properties.petPolicy[p]}</option>
              ))}
            </select>
          </div>
          <Input label={pf.parkingInfo} multiline rows={2} value={form.parkingInfo} onChange={set("parkingInfo")} />
        </section>

        {/* Contact */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{pf.sectionContact}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{pf.listingAgent}</label>
            <select value={form.listingAgentId} onChange={set("listingAgentId")} className={selectClass}>
              <option value="">{pf.noAgent}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={pf.contactPhone} type="tel" value={form.contactPhone} onChange={set("contactPhone")} />
            <Input label={pf.contactWhatsapp} type="tel" value={form.contactWhatsapp} onChange={set("contactWhatsapp")} />
          </div>
        </section>

        {/* Sourcing */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-medium text-gray-900">{pf.sectionSourcing}</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label={pf.sourceCompany} value={form.sourceCompany} onChange={set("sourceCompany")} />
            <Input label={pf.externalReferenceId} value={form.externalReferenceId} onChange={set("externalReferenceId")} />
          </div>
        </section>

        {submitError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            {t.common.cancel}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? pf.submitting : pf.submitEdit}
          </Button>
        </div>
      </form>
    </div>
  );
}
