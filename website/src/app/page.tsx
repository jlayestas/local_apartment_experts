import HomePageContent from "@/features/home/HomePageContent";
import { getPublishedProperties } from "@/lib/api/properties";

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getPublishedProperties>>["content"] = [];
  try {
    const featuredData = await getPublishedProperties({ featured: true, size: 3 });
    featured = featuredData.content;
  } catch {
    // Featured section degrades gracefully if the API is unavailable
  }

  return <HomePageContent featured={featured} />;
}
