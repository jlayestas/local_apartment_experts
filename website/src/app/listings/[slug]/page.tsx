import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyDetailContent from "@/features/properties/PropertyDetailContent";
import { getPublishedPropertyBySlug, getPublishedProperties } from "@/lib/api/properties";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublishedPropertyBySlug(slug);
  if (!property) return { title: "Property Not Found" };
  return {
    title: property.title,
    description: property.description?.slice(0, 155) ?? undefined,
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;

  const property = await getPublishedPropertyBySlug(slug);
  if (!property) notFound();

  const similarData = await getPublishedProperties({
    propertyType: property.propertyType,
    size: 4,
  });
  const similar = (similarData.content ?? [])
    .filter((p) => p.id !== property.id)
    .slice(0, 3);

  const whatsappHref = property.contactWhatsapp
    ? `https://wa.me/${property.contactWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi, I'm interested in: ${property.title}`
      )}`
    : null;

  const availableLabel = property.availableDate
    ? new Date(property.availableDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const fullAddress = [property.addressLine1, property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ");

  return (
    <PropertyDetailContent
      property={property}
      similar={similar}
      whatsappHref={whatsappHref}
      availableLabel={availableLabel}
      fullAddress={fullAddress}
    />
  );
}
