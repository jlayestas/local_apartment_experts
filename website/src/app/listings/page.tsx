import type { Metadata } from "next";
import { getPublishedProperties } from "@/lib/api/properties";
import ListingsClient from "@/features/properties/ListingsClient";

export const metadata: Metadata = {
  title: "Properties",
  description: "Browse all available rental properties in Miami and South Florida.",
};

/**
 * Fetches up to 100 published properties server-side and passes them to
 * ListingsClient, which handles filtering, sorting, and pagination client-side.
 *
 * When the catalog exceeds 100 listings, migrate to URL search-param navigation
 * so filters drive server-side paginated fetches instead.
 */
type Props = {
  searchParams: Promise<{ search?: string }>;
};

export default async function ListingsPage({ searchParams }: Props) {
  const { search } = await searchParams;
  const initialSearch = search?.trim() || undefined;

  const data = await getPublishedProperties({ size: 100 });
  return <ListingsClient initialProperties={data.content} initialSearch={initialSearch} />;
}
