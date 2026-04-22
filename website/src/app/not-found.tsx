import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-6xl font-bold text-teal-200">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-800">
        Property not found
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        This listing may have been removed or the link may be incorrect.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/listings"
          className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
        >
          Browse All Properties
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
