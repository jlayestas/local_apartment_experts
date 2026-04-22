"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PropertyDetailError({ reset }: Props) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-400">
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-gray-800">
        Unable to load this property
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Something went wrong while fetching this listing. Please try again or browse all available properties.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
        >
          Try Again
        </button>
        <Link
          href="/listings"
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          All Properties
        </Link>
      </div>
    </div>
  );
}
