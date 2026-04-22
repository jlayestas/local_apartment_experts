/**
 * Pulse-skeleton placeholder for a PropertyCard.
 * Shown while the listings grid is loading.
 * Dimensions mirror PropertyCard so the layout doesn't shift on load.
 */
export default function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white">
      {/* Image area */}
      <div className="aspect-video w-full animate-pulse bg-gray-200" />

      {/* Content area */}
      <div className="flex flex-col gap-3 p-4">
        {/* Location line */}
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>
        {/* Price */}
        <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
        {/* Specs */}
        <div className="flex gap-3">
          <div className="h-3 w-12 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-12 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-14 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
