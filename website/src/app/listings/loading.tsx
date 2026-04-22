import PropertyCardSkeleton from "@/features/properties/PropertyCardSkeleton";

export default function ListingsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="h-9 w-72 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
        <div className="h-9 w-36 animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Sidebar + grid */}
      <div className="flex gap-8">
        <div className="hidden lg:block w-64 shrink-0">
          <div className="h-[560px] animate-pulse rounded-xl bg-gray-100" />
        </div>
        <div className="min-w-0 flex-1 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
