function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

function BoneLighter({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className}`} />;
}

export default function PropertyDetailLoading() {
  return (
    <div className="pb-24 pt-8 sm:pt-10 lg:pb-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Bone className="h-3 w-12" />
          <Bone className="h-3 w-2" />
          <Bone className="h-3 w-20" />
          <Bone className="h-3 w-2" />
          <Bone className="h-3 w-40" />
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr]">
          <Bone className="aspect-[4/3] w-full rounded-xl sm:aspect-[16/10]" />
          <div className="hidden sm:grid grid-rows-2 gap-2">
            <Bone className="w-full rounded-xl" />
            <Bone className="w-full rounded-xl" />
          </div>
        </div>

        {/* Mobile price bar */}
        <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm lg:hidden">
          <div className="space-y-2">
            <Bone className="h-7 w-32" />
            <Bone className="h-3 w-24" />
          </div>
          <Bone className="h-10 w-28 rounded-lg" />
        </div>

        {/* Two-column layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* Left column */}
          <div className="min-w-0 space-y-8">

            {/* Title + badges */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Bone className="h-5 w-20 rounded-full" />
              </div>
              <Bone className="h-8 w-3/4" />
              <Bone className="h-4 w-48" />
            </div>

            {/* Spec tiles */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <BoneLighter key={i} className="h-20 rounded-xl" />
              ))}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Bone className="h-5 w-28" />
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-4/5" />
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Bone className="h-5 w-24" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BoneLighter key={i} className="h-4 rounded" />
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {/* Price */}
              <Bone className="h-8 w-40" />
              <Bone className="h-3 w-24" />
              {/* Form fields */}
              <div className="space-y-3 pt-2">
                <Bone className="h-3 w-24" />
                <div className="grid grid-cols-2 gap-3">
                  <Bone className="h-11 rounded-lg" />
                  <Bone className="h-11 rounded-lg" />
                </div>
                <Bone className="h-11 rounded-lg" />
                <Bone className="h-11 rounded-lg" />
                <BoneLighter className="h-16 rounded-lg" />
                <Bone className="h-11 rounded-lg" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
